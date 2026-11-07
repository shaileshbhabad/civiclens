import { Incident } from '../models/Incident.js';
import { Complaint } from '../models/Complaint.js';

export const getIncidents = async (req, res) => {
  try {
    const { status, category, severity, department, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (severity && severity !== 'all') {
      filter.severity = severity;
    }
    if (department && department !== 'all') {
      filter.department = department;
    }

    const incidents = await Incident.find(filter)
      .sort({ priorityScore: -1, createdAt: -1 })
      .limit(Number(limit))
      .populate({
        path: 'complaints',
        select: 'trackingId description status category severity address ward createdAt'
      });

    return res.json({ success: true, count: incidents.length, incidents });
  } catch (error) {
    console.error('[getIncidents] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id).populate('complaints');

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    return res.json({ success: true, incident });
  } catch (error) {
    console.error('[getIncidentById] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, assignedTo, resolutionImage } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    if (status) incident.status = status;
    if (note) incident.resolutionNotes = note;
    if (resolutionImage) incident.resolutionImage = resolutionImage;

    if (assignedTo) {
      incident.assignedTo = {
        name: assignedTo.name || 'Assigned Officer',
        email: assignedTo.email || '',
        department: assignedTo.department || incident.department,
        assignedAt: new Date()
      };
      if (incident.status === 'open') incident.status = 'assigned';
    }

    const complaintFilter = {
      $or: [
        { _id: { $in: incident.complaints || [] } },
        { incidentId: incident._id }
      ]
    };

    if (status === 'resolved' || status === 'closed') {
      const effectiveResImg = (resolutionImage || incident.resolutionImage || '').trim();
      incident.status = 'resolved';
      incident.resolutionImage = effectiveResImg;
      incident.resolutionNotes = note || incident.resolutionNotes || 'Resolved by municipal work crew.';
      incident.resolvedAt = new Date();
      // Cascade resolution to all linked complaints instantly!
      await Complaint.updateMany(
        complaintFilter,
        {
          $set: {
            status: 'resolved',
            resolutionNotes: note || incident.resolutionNotes || 'Resolved by municipal work crew.',
            resolutionImage: effectiveResImg,
            resolvedAt: new Date(),
            resolvedBy: {
              name: incident.assignedTo?.name || 'Shailesh Bhabad',
              department: incident.department || 'Roads',
              role: 'admin'
            }
          }
        }
      );
    } else if (status === 'in_progress') {
      incident.status = 'in_progress';
      incident.resolutionImage = '';
      incident.resolutionNotes = note || '';
      incident.resolvedAt = null;
      incident.resolvedBy = null;
      await Complaint.updateMany(
        complaintFilter,
        {
          $set: {
            status: 'in_progress',
            resolutionImage: '',
            resolutionNotes: note || '',
            resolvedAt: null,
            resolvedBy: null
          }
        }
      );
    } else if (status === 'assigned') {
      incident.status = 'assigned';
      incident.resolutionImage = '';
      incident.resolutionNotes = note || '';
      incident.resolvedAt = null;
      incident.resolvedBy = null;
      await Complaint.updateMany(
        complaintFilter,
        {
          $set: {
            status: 'assigned',
            resolutionImage: '',
            resolutionNotes: note || '',
            resolvedAt: null,
            resolvedBy: null
          }
        }
      );
    } else if (status === 'open') {
      incident.status = 'open';
      incident.resolutionImage = '';
      incident.resolutionNotes = note || '';
      incident.resolvedAt = null;
      incident.resolvedBy = null;
      await Complaint.updateMany(
        complaintFilter,
        {
          $set: {
            status: 'verified',
            resolutionImage: '',
            resolutionNotes: note || '',
            resolvedAt: null,
            resolvedBy: null
          }
        }
      );
    }

    await incident.save();
    const updated = await Incident.findById(id).populate('complaints');

    return res.json({
      success: true,
      message: `Incident status updated to ${status}.`,
      incident: updated
    });
  } catch (error) {
    console.error('[updateIncidentStatus] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Citizen Upvoting & "+1 Me Too" on Nearby Grievances
 */
export const upvoteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    let incident = null;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      incident = await Incident.findById(id);
    }
    if (!incident) {
      // Check if id is a complaint _id or trackingId
      const complaint = await Complaint.findOne({
        $or: [
          ...(/^[0-9a-fA-F]{24}$/.test(id) ? [{ _id: id }] : []),
          { trackingId: id.toUpperCase() }
        ]
      });
      if (complaint && complaint.incidentId) {
        incident = await Incident.findById(complaint.incidentId);
      } else if (complaint) {
        complaint.mergedReportsCount = (complaint.mergedReportsCount || 1) + 1;
        await complaint.save();
        return res.json({
          success: true,
          message: 'Upvote recorded (+1 Me Too).',
          complaint
        });
      }
    }

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    incident.reportCount = (incident.reportCount || 1) + 1;
    const count = incident.reportCount;
    const freqWeight = count >= 6 ? 25 : count >= 4 ? 20 : count >= 2 ? 16 : 12;
    const factors = incident.priorityFactors || {
      severityWeight: 25,
      locationWeight: 20,
      frequencyWeight: 12,
      impactWeight: 5,
      historyWeight: 3
    };
    factors.frequencyWeight = freqWeight;
    incident.priorityFactors = factors;
    incident.priorityScore = Math.min(
      99,
      Math.max(20, (factors.severityWeight || 25) + (factors.locationWeight || 20) + freqWeight + (factors.impactWeight || 5) + (factors.historyWeight || 3))
    );
    await incident.save();

    await Complaint.updateMany(
      { incidentId: incident._id },
      { $set: { mergedReportsCount: incident.reportCount } }
    );

    return res.json({
      success: true,
      message: 'Upvote recorded (+1 Me Too). Priority score increased.',
      incident
    });
  } catch (error) {
    console.error('[upvoteIncident] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

