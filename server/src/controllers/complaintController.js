import { Complaint } from '../models/Complaint.js';
import { Incident } from '../models/Incident.js';
import { groqService } from '../services/groqService.js';
import { findDuplicateIncident } from '../services/hotspotService.js';
import { resolutionVerificationService } from '../services/resolutionVerificationService.js';

// Helper to generate unique tracking ID
const generateTrackingId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CL-${year}${month}${day}-${randomPart}`;
};

/**
 * Submit a new complaint
 */
export const createComplaint = async (req, res) => {
  try {
    const {
      description,
      imageUrl,
      category = 'pothole',
      address = 'Dr. D. Y. Patil College Campus, Sant Tukaram Nagar, Pimpri, Pune 411018',
      ward = 'Ward 20 (Sant Tukaram Nagar / Pimpri)',
      zone = 'Zone B (Pimpri Central)',
      coordinates = [73.8159, 18.6231], // [lng, lat] DY Patil Pimpri 411018
      landmark = 'Sant Tukaram Nagar',
      source = 'community_qr'
    } = req.body;

    if (!description || description.trim().length < 5) {
      return res.status(400).json({ error: 'Description must be at least 5 characters long.' });
    }

    const trackingId = generateTrackingId();

    const lng = Number(coordinates[0]);
    const lat = Number(coordinates[1]);

    // Multimodal AI Analysis (Real Vision Image Inspection + Spatial Priority)
    const aiResult = await groqService.analyzeReport(description, category, address, imageUrl, [lng, lat]);

    // Check for existing active report with similar defect within 150m locality radius
    const { incident: matchedIncident, distance } = await findDuplicateIncident(
      [lng, lat],
      aiResult.category || category,
      150
    );

    const getDefaultCategoryImage = (cat = 'pothole') => {
      const c = (cat || '').toLowerCase();
      if (c === 'garbage') return '/images/resolutions/garbage_before.jpg';
      if (c === 'drainage' || c === 'water_leak') return '/images/resolutions/drainage_before.jpg';
      if (c === 'pothole') return '/images/resolutions/pothole_before.jpg';
      return '/images/resolutions/drainage_before.jpg';
    };

    // Create the complaint
    const resolvedCat = (aiResult.category && aiResult.category !== 'none') ? aiResult.category : category;
    const complaint = new Complaint({
      trackingId,
      description: description.trim(),
      imageUrl: imageUrl || getDefaultCategoryImage(resolvedCat),
      category: resolvedCat,
      severity: aiResult.severity && aiResult.severity !== 'none' ? aiResult.severity : 'medium',
      urgency: aiResult.urgency || 'within_24h',
      status: 'submitted',
      source,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      address,
      ward,
      zone,
      landmark,
      ai_analysis: {
        category: resolvedCat,
        severity: aiResult.severity || 'medium',
        urgency: aiResult.urgency || 'within_24h',
        confidence: aiResult.confidence || 0.95,
        imageValid: aiResult.imageValid !== false,
        defectDetected: aiResult.defectDetected !== false,
        visualFeatures: aiResult.visualFeatures || ['Civic defect inspection completed'],
        visualHazardScore: aiResult.visualHazardScore || 70,
        priorityScore: aiResult.priorityScore || 65,
        priorityFactors: aiResult.priorityFactors || {
          severityWeight: 25,
          locationWeight: 20,
          frequencyWeight: 12,
          impactWeight: 5,
          historyWeight: 3
        },
        matchedZone: aiResult.matchedZone || '',
        modelUsed: aiResult.modelUsed || 'qwen/qwen3.8-27b',
        explanation: aiResult.explanation || 'Verified issue via GPS coordinates.'
      }
    });

    // If matched existing incident within locality radius, merge this report into it; else create new incident
    if (matchedIncident) {
      complaint.incidentId = matchedIncident._id;
      complaint.isMerged = true;
      complaint.mergeReason = `Consolidated duplicate report within ${distance}m radius of active ${matchedIncident.category} incident.`;
      complaint.mergedReportsCount = matchedIncident.complaints.length + 1;
      await complaint.save();

      matchedIncident.complaints.push(complaint._id);
      matchedIncident.reportCount = matchedIncident.complaints.length;

      // Dynamically recalculate frequency weight based on clustered report volume
      const count = matchedIncident.reportCount;
      const freqWeight = count >= 6 ? 25 : count >= 4 ? 20 : count >= 2 ? 16 : 12;
      const factors = matchedIncident.priorityFactors || {
        severityWeight: 25,
        locationWeight: 20,
        frequencyWeight: 12,
        impactWeight: 5,
        historyWeight: 3
      };
      factors.frequencyWeight = freqWeight;
      matchedIncident.priorityFactors = factors;
      matchedIncident.priorityScore = Math.min(
        99,
        Math.max(20, (factors.severityWeight || 25) + (factors.locationWeight || 20) + freqWeight + (factors.impactWeight || 5) + (factors.historyWeight || 3))
      );
      matchedIncident.title = `${resolvedCat.toUpperCase()} Cluster (${matchedIncident.reportCount} reports) at ${address.split(',')[0]}`;
      await matchedIncident.save();

      // Synchronize all reports in cluster so citizens see merged status
      await Complaint.updateMany(
        { incidentId: matchedIncident._id },
        {
          $set: {
            isMerged: true,
            mergedReportsCount: matchedIncident.reportCount,
            mergeReason: `Consolidated locality cluster with ${matchedIncident.reportCount} citizen reports in this 150m radius.`
          }
        }
      );
    } else {
      const newIncident = new Incident({
        title: `${resolvedCat.toUpperCase()} reported at ${address.split(',')[0]}`,
        category: resolvedCat,
        severity: aiResult.severity && aiResult.severity !== 'none' ? aiResult.severity : 'medium',
        urgency: aiResult.urgency || 'within_24h',
        priorityScore: aiResult.priorityScore || 65,
        visualFeatures: aiResult.visualFeatures || [],
        defectDetected: aiResult.defectDetected !== false,
        matchedZone: aiResult.matchedZone || '',
        priorityFactors: aiResult.priorityFactors || {
          severityWeight: 25,
          locationWeight: 20,
          frequencyWeight: 12,
          impactWeight: 5,
          historyWeight: 3
        },
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        address,
        ward,
        zone,
        complaints: [complaint._id],
        reportCount: 1,
        department: aiResult.department || 'Roads',
        status: 'open'
      });

      await newIncident.save();
      complaint.incidentId = newIncident._id;
      complaint.mergedReportsCount = 1;
      await complaint.save();
    }

    return res.status(201).json({
      success: true,
      trackingId,
      complaint
    });
  } catch (error) {
    console.error('[createComplaint] Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit complaint.' });
  }
};

/**
 * Get complaint by tracking ID
 */
export const getComplaintByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const trimmed = (trackingId || '').trim();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmed);

    const complaint = await Complaint.findOne({
      $or: [
        { trackingId: trimmed.toUpperCase() },
        ...(isObjectId ? [{ _id: trimmed }] : [])
      ]
    }).populate('incidentId');

    if (!complaint) {
      return res.status(404).json({ error: `Complaint not found with ID ${trackingId}` });
    }

    return res.json({ success: true, complaint });
  } catch (error) {
    console.error('[getComplaintByTrackingId] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all complaints with filters
 */
export const getAllComplaints = async (req, res) => {
  try {
    const { status, category, severity, search, limit = 50, skip = 0 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      if (status === 'in_progress') {
        filter.status = { $in: ['assigned', 'in_progress', 'verified'] };
      } else {
        filter.status = status;
      }
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (severity && severity !== 'all') {
      filter.severity = severity;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { trackingId: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate('incidentId');

    const total = await Complaint.countDocuments(filter);

    return res.json({ success: true, count: complaints.length, total, complaints });
  } catch (error) {
    console.error('[getAllComplaints] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get recent complaints for citizen dashboard
 */
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('incidentId');

    return res.json({ success: true, complaints });
  } catch (error) {
    console.error('[getMyComplaints] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * RESOLVE a complaint (moves from reported to resolved!)
 */
const getMatchedAfterImage = (category = 'pothole', beforeUrl = '') => {
  // STRICT SOCIAL PURPOSE & DATA INTEGRITY:
  // NEVER use pre-seeded images for custom citizen-submitted complaints!
  // Only match pre-seeded demo complaints where the before photo was already from the pre-seeded catalog.
  if (!beforeUrl || typeof beforeUrl !== 'string' || !beforeUrl.startsWith('/images/resolutions/')) {
    return '';
  }
  const cat = (category || '').toLowerCase();
  if (cat === 'garbage' || beforeUrl.includes('garbage')) {
    return '/images/resolutions/garbage_after.jpg';
  }
  if (cat === 'drainage' || cat === 'water_leak' || beforeUrl.includes('drainage')) {
    return '/images/resolutions/drainage_after.jpg';
  }
  if (cat === 'pothole' || beforeUrl.includes('pothole')) {
    return '/images/resolutions/pothole_after.jpg';
  }
  return '';
};

export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resolutionNotes = 'Civic issue inspected and resolved at exact geotagged location by PCMC field crew.',
      resolutionImage,
      resolvedBy = { name: 'Rajesh Kumar', department: 'Roads', role: 'authority' }
    } = req.body;

    // Find by _id or trackingId
    const complaint = await Complaint.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { trackingId: id.toUpperCase() }]
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const matchedAfter = (resolutionImage || getMatchedAfterImage(complaint.category, complaint.imageUrl) || '').trim();

    complaint.status = 'resolved';
    complaint.resolutionNotes = resolutionNotes;
    complaint.resolutionImage = matchedAfter;
    complaint.resolvedAt = new Date();
    complaint.resolvedBy = resolvedBy;
    await complaint.save();

    let adjustedCount = 1;

    // Check if complaint belongs to an incident / merged cluster
    if (complaint.incidentId) {
      // Subsequently adjust ALL merged complaints in this cluster to resolved
      const updateResult = await Complaint.updateMany(
        { incidentId: complaint.incidentId },
        {
          $set: {
            status: 'resolved',
            resolutionNotes,
            resolutionImage: matchedAfter,
            resolvedAt: new Date(),
            resolvedBy
          }
        }
      );
      adjustedCount = updateResult.modifiedCount || 1;

      // Update parent Incident to resolved
      await Incident.findByIdAndUpdate(complaint.incidentId, {
        status: 'resolved',
        resolutionNotes,
        resolutionImage: matchedAfter,
        resolvedAt: new Date(),
        resolvedBy: { name: resolvedBy.name, department: resolvedBy.department }
      });
    }

    return res.json({
      success: true,
      message: `Complaint and all ${adjustedCount} merged cluster reports marked as resolved.`,
      adjustedCount,
      complaint
    });
  } catch (error) {
    console.error('[resolveComplaint] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * General status update (e.g. submitted -> in_progress / assigned / rejected)
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      note,
      resolutionNotes,
      resolutionImage,
      resolvedBy
    } = req.body;

    const complaint = await Complaint.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { trackingId: id.toUpperCase() }]
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const effectiveNote = note || resolutionNotes || (status === 'resolved' ? complaint.resolutionNotes : '');

    // If status is NOT resolved (e.g. moved back to in_progress), completely remove resolution proof
    if (status !== 'resolved') {
      complaint.status = status;
      complaint.resolutionImage = '';
      complaint.resolutionNotes = effectiveNote || '';
      complaint.resolvedAt = null;
      complaint.resolvedBy = null;
    } else {
      complaint.status = 'resolved';
      complaint.resolutionImage = (resolutionImage || getMatchedAfterImage(complaint.category, complaint.imageUrl) || '').trim();
      complaint.resolutionNotes = effectiveNote || 'Civic issue inspected and resolved at exact geotagged location by PCMC field crew.';
      complaint.resolvedAt = new Date();
      if (resolvedBy) complaint.resolvedBy = resolvedBy;
      else if (!complaint.resolvedBy?.name) {
        complaint.resolvedBy = { name: 'Shailesh Bhabad', department: 'Roads & Works', role: 'admin' };
      }
    }
    await complaint.save();

    // If attached to an incident, synchronize the whole cluster instantly!
    if (complaint.incidentId) {
      const clusterUpdate = status === 'resolved' ? {
        status: 'resolved',
        resolutionNotes: complaint.resolutionNotes,
        resolutionImage: complaint.resolutionImage,
        resolvedAt: complaint.resolvedAt,
        resolvedBy: complaint.resolvedBy
      } : {
        status,
        resolutionNotes: effectiveNote || '',
        resolutionImage: '',
        resolvedAt: null,
        resolvedBy: null
      };

      await Complaint.updateMany(
        { incidentId: complaint.incidentId },
        { $set: clusterUpdate }
      );

      await Incident.findByIdAndUpdate(complaint.incidentId, {
        status: status === 'verified' || status === 'submitted' ? 'open' : status,
        resolutionNotes: status === 'resolved' ? complaint.resolutionNotes : (effectiveNote || ''),
        resolutionImage: status === 'resolved' ? complaint.resolutionImage : '',
        resolvedAt: status === 'resolved' ? complaint.resolvedAt : null,
        resolvedBy: status === 'resolved' ? { name: complaint.resolvedBy?.name || 'Shailesh Bhabad', department: 'Municipal Administration' } : null
      });
    }

    const updated = await Complaint.findById(complaint._id).populate('incidentId');

    return res.json({
      success: true,
      message: `Status instantly updated to ${status}.`,
      complaint: updated
    });
  } catch (error) {
    console.error('[updateComplaintStatus] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Process multilingual voice-to-text transcript using Groq
 */
export const processVoiceComplaint = async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    const result = await groqService.processVoiceTranscript(transcript.trim());
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[processVoiceComplaint] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Citizen Dispute & Re-open Issue (Anti-Fake Resolution)
 */
export const reopenComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      disputeReason = 'Citizen reported that the civic issue was not properly fixed on-site.',
      disputeImage = ''
    } = req.body;

    const complaint = await Complaint.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { trackingId: id.toUpperCase() }]
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const nextReopenCount = (complaint.reopenedCount || 0) + 1;

    complaint.status = 'in_progress';
    complaint.resolutionImage = '';
    complaint.resolutionNotes = '';
    complaint.resolvedAt = null;
    complaint.resolvedBy = null;
    complaint.disputed = true;
    complaint.disputeReason = disputeReason;
    if (disputeImage) complaint.disputeImage = disputeImage;
    complaint.reopenedCount = nextReopenCount;
    complaint.reopenedAt = new Date();
    complaint.citizenVerified = false;
    complaint.severity = 'critical';
    complaint.urgency = 'immediate';
    await complaint.save();

    if (complaint.incidentId) {
      await Complaint.updateMany(
        { incidentId: complaint.incidentId },
        {
          $set: {
            status: 'in_progress',
            resolutionImage: '',
            resolutionNotes: '',
            resolvedAt: null,
            resolvedBy: null,
            disputed: true,
            disputeReason,
            ...(disputeImage ? { disputeImage } : {}),
            reopenedCount: nextReopenCount,
            reopenedAt: new Date(),
            citizenVerified: false
          }
        }
      );

      const incident = await Incident.findById(complaint.incidentId);
      if (incident) {
        incident.status = 'in_progress';
        incident.resolutionImage = '';
        incident.resolutionNotes = '';
        incident.resolvedAt = null;
        incident.resolvedBy = null;
        incident.disputed = true;
        incident.disputeReason = disputeReason;
        if (disputeImage) incident.disputeImage = disputeImage;
        incident.reopenedCount = (incident.reopenedCount || 0) + 1;
        incident.reopenedAt = new Date();
        incident.citizenVerified = false;
        incident.severity = 'critical';
        incident.urgency = 'immediate';
        incident.priorityScore = Math.min(100, (incident.priorityScore || 80) + 15);
        await incident.save();
      }
    }

    const updated = await Complaint.findById(complaint._id).populate('incidentId');

    return res.json({
      success: true,
      message: 'Complaint re-opened and escalated with +15 Priority Score boost.',
      complaint: updated
    });
  } catch (error) {
    console.error('[reopenComplaint] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Citizen Satisfaction Verification & Star Rating on Resolved Issue
 */
export const verifyComplaintResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating = 5, feedback = '' } = req.body;

    const complaint = await Complaint.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { trackingId: id.toUpperCase() }]
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    complaint.citizenVerified = true;
    complaint.citizenRating = Math.min(5, Math.max(1, Number(rating) || 5));
    complaint.citizenFeedback = feedback;
    complaint.disputed = false;
    await complaint.save();

    if (complaint.incidentId) {
      await Incident.findByIdAndUpdate(complaint.incidentId, {
        citizenVerified: true,
        citizenRating: complaint.citizenRating,
        disputed: false
      });
    }

    const updated = await Complaint.findById(complaint._id).populate('incidentId');
    return res.json({
      success: true,
      message: 'Resolution verified by citizen.',
      complaint: updated
    });
  } catch (error) {
    console.error('[verifyComplaintResolution] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Real-time AI Duplicate Detection during complaint submission (Before Upload)
 */
const haversineMeters = (coords1, coords2) => {
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const checkDuplicateComplaints = async (req, res) => {
  try {
    const { lat, lng, category, radius = 220 } = req.query;
    const targetLat = parseFloat(lat);
    const targetLng = parseFloat(lng);

    if (isNaN(targetLat) || isNaN(targetLng)) {
      return res.json({ success: true, duplicates: [] });
    }

    const activeComplaints = await Complaint.find({
      status: { $nin: ['rejected', 'resolved'] }
    })
      .populate('incidentId')
      .sort({ createdAt: -1 })
      .limit(100);

    const matches = [];
    const seenIncidents = new Set();

    for (const c of activeComplaints) {
      const coords = c.location?.coordinates;
      if (!coords || coords.length < 2) continue;

      const dist = haversineMeters([targetLng, targetLat], coords);
      const cCat = c.ai_analysis?.category || c.category || 'pothole';
      const sameCategory = !category || category === 'all' || cCat === category;

      // Match if within radius & same category, OR within 80m regardless of category
      if ((sameCategory && dist <= Number(radius)) || dist <= 80) {
        const incId = c.incidentId?._id ? String(c.incidentId._id) : String(c._id);
        if (seenIncidents.has(incId)) continue;
        seenIncidents.add(incId);

        matches.push({
          _id: c._id,
          trackingId: c.trackingId,
          incidentId: c.incidentId?._id || c.incidentId,
          category: cCat,
          severity: c.ai_analysis?.severity || c.severity || 'high',
          status: c.status,
          address: c.address,
          description: c.description,
          imageUrl: c.imageUrl,
          distanceMeters: dist,
          sameCategory,
          reportCount: c.incidentId?.reportCount || c.mergedReportsCount || 1,
          priorityScore: c.incidentId?.priorityScore || 84,
          assignedTo: c.incidentId?.assignedTo?.name || 'PCMC Ward Field Engineer'
        });
      }
    }

    matches.sort((a, b) => {
      if (a.sameCategory !== b.sameCategory) return a.sameCategory ? -1 : 1;
      return a.distanceMeters - b.distanceMeters;
    });

    return res.json({
      success: true,
      duplicates: matches.slice(0, 3)
    });
  } catch (error) {
    console.error('[checkDuplicateComplaints] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Deep Learning & Computer Vision Forensic Resolution Verification
 */
export const verifyResolutionAI = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { trackingId: id.toUpperCase() }]
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const {
      beforeImage = complaint.imageUrl,
      afterImage = complaint.resolutionImage,
      category = complaint.category,
      address = complaint.address,
      description = complaint.description,
      resolutionNotes = complaint.resolutionNotes
    } = req.body;

    const result = await resolutionVerificationService.verifyResolution({
      category,
      beforeImage,
      afterImage,
      address,
      description,
      resolutionNotes
    });

    return res.json({
      success: true,
      verification: result
    });
  } catch (error) {
    console.error('[verifyResolutionAI] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};


