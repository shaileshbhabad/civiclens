import { Complaint } from '../models/Complaint.js';
import { Incident } from '../models/Incident.js';

/**
 * Calculate distance between two coordinates in meters using the Haversine formula
 * @param {[number, number]} coord1 - [lng, lat]
 * @param {[number, number]} coord2 - [lng, lat]
 * @returns {number} Distance in meters
 */
export function getDistanceMeters(coord1, coord2) {
  if (!coord1 || !coord2) return Infinity;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  if (isNaN(lon1) || isNaN(lat1) || isNaN(lon2) || isNaN(lat2)) return Infinity;

  const R = 6371e3; // Earth's radius in meters
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * PCMC Prominent Locality Anchor Centers for Hotspot Intelligence
 */
export const PCMC_LOCALITY_ANCHORS = [
  { name: 'Dr. D. Y. Patil College Campus & Tech Corridor', ward: 'Ward 20 (Sant Tukaram Nagar)', coordinates: [73.8159, 18.6231] },
  { name: 'YCM Hospital Emergency & Ambulance Corridor', ward: 'Ward 20 (Sant Tukaram Nagar / YCMH)', coordinates: [73.8208, 18.6220] },
  { name: 'Sant Tukaram Nagar Metro Station & Highway', ward: 'Ward 20 (Sant Tukaram Nagar)', coordinates: [73.8158, 18.6146] },
  { name: 'Vallabh Nagar MSRTC Bus Stand Road', ward: 'Ward 20 (Vallabh Nagar, Pimpri 411018)', coordinates: [73.8190, 18.6185] },
  { name: 'Nehrunagar Chowk & PCMC Sports Complex', ward: 'Ward 19 (Nehrunagar, Pimpri 411018)', coordinates: [73.8230, 18.6280] },
  { name: 'Mahesh Nagar & Pimpri Railway Station Overbridge', ward: 'Ward 21 (Pimpri 411018)', coordinates: [73.8050, 18.6275] },
  { name: 'Kharalwadi Grade Separator & Service Road', ward: 'Ward 20 (Kharalwadi, Pimpri 411018)', coordinates: [73.8110, 18.6210] },
  { name: 'HA Colony Ground & Mumbai-Pune Highway', ward: 'Ward 22 (HA Colony, Pimpri 411018)', coordinates: [73.8080, 18.6190] }
];

/**
 * Find an existing active incident within locality radius to merge with
 * @param {[number, number]} coordinates - [lng, lat]
 * @param {string} category
 * @param {number} maxRadiusMeters - default 150m
 * @returns {Promise<{ incident: Object|null, distance: number }>}
 */
export async function findDuplicateIncident(coordinates, category, maxRadiusMeters = 150) {
  const [lng, lat] = coordinates || [];
  if (isNaN(lng) || isNaN(lat)) return { incident: null, distance: Infinity };

  // Fetch all active open/in-progress incidents
  const activeIncidents = await Incident.find({
    status: { $in: ['open', 'assigned', 'in_progress'] },
    category
  });

  let closestIncident = null;
  let minDistance = Infinity;

  for (const inc of activeIncidents) {
    if (inc.location?.coordinates) {
      const dist = getDistanceMeters(coordinates, inc.location.coordinates);
      if (dist <= maxRadiusMeters && dist < minDistance) {
        minDistance = dist;
        closestIncident = inc;
      }
    }
  }

  return { incident: closestIncident, distance: minDistance };
}

/**
 * Detect Civic Hotspots within Locality Radius
 * @param {number} radiusMeters - locality cluster radius (default 350 meters)
 * @returns {Promise<Array>} Array of analyzed locality hotspots
 */
export async function detectHotspots(radiusMeters = 350) {
  const complaints = await Complaint.find().sort({ createdAt: -1 });

  const hotspotsMap = new Map();

  // Initialize with PCMC key locality anchors
  PCMC_LOCALITY_ANCHORS.forEach((anchor) => {
    hotspotsMap.set(anchor.name, {
      id: anchor.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      locality: anchor.name,
      ward: anchor.ward,
      center: anchor.coordinates,
      radiusMeters,
      complaints: [],
      categories: {},
      criticalCount: 0,
      openCount: 0,
      resolvedCount: 0
    });
  });

  // Assign each complaint to the nearest locality hotspot or create dynamic cluster
  for (const c of complaints) {
    const coords = c.location?.coordinates;
    if (!coords) continue;

    let matchedHotspot = null;
    let shortestDist = Infinity;

    for (const hotspot of hotspotsMap.values()) {
      const dist = getDistanceMeters(coords, hotspot.center);
      if (dist <= radiusMeters && dist < shortestDist) {
        shortestDist = dist;
        matchedHotspot = hotspot;
      }
    }

    // If outside existing anchor radius, group dynamically by address or ward
    if (!matchedHotspot) {
      const localityName = (c.address?.split(',')[0] || c.ward || 'PCMC Locality Cluster').trim();
      if (!hotspotsMap.has(localityName)) {
        hotspotsMap.set(localityName, {
          id: localityName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          locality: `${localityName} Locality Zone`,
          ward: c.ward || 'PCMC Ward Area',
          center: coords,
          radiusMeters,
          complaints: [],
          categories: {},
          criticalCount: 0,
          openCount: 0,
          resolvedCount: 0
        });
      }
      matchedHotspot = hotspotsMap.get(localityName);
    }

    matchedHotspot.complaints.push(c);

    // Track category counts
    const cat = c.category || 'other';
    matchedHotspot.categories[cat] = (matchedHotspot.categories[cat] || 0) + 1;

    // Track severities
    if (c.severity === 'critical' || c.severity === 'high') {
      matchedHotspot.criticalCount += 1;
    }

    // Track status
    if (c.status === 'resolved') {
      matchedHotspot.resolvedCount += 1;
    } else {
      matchedHotspot.openCount += 1;
    }
  }

  // Format and score each hotspot
  const results = [];
  for (const h of hotspotsMap.values()) {
    const total = h.complaints.length;
    if (total === 0) continue; // Skip empty anchors

    // Determine top category
    let topCategory = 'pothole';
    let maxCatCount = 0;
    for (const [cat, count] of Object.entries(h.categories)) {
      if (count > maxCatCount) {
        maxCatCount = count;
        topCategory = cat;
      }
    }

    // Calculate Hotspot Risk Score (0 - 100)
    // Higher open issues + higher critical count = higher risk
    const rawScore = (h.openCount * 18) + (h.criticalCount * 22) + (total * 6);
    const riskScore = Math.min(99, Math.max(25, rawScore));

    let alertLevel = 'LOW';
    if (riskScore >= 75) alertLevel = 'CRITICAL';
    else if (riskScore >= 50) alertLevel = 'HIGH';
    else if (riskScore >= 30) alertLevel = 'MODERATE';

    // Generate actionable municipal recommendation
    let recommendation = `Regular inspection recommended within ${h.radiusMeters}m radius.`;
    if (alertLevel === 'CRITICAL') {
      recommendation = `URGENT: ${h.openCount} open defects in ${h.radiusMeters}m radius. Immediate deployment of municipal field crew required.`;
    } else if (alertLevel === 'HIGH') {
      recommendation = `High recurrence of ${topCategory} reports. Preventive maintenance scheduled for this corridor.`;
    }

    results.push({
      id: h.id,
      locality: h.locality,
      ward: h.ward,
      center: h.center,
      radiusMeters: h.radiusMeters,
      totalComplaints: total,
      openComplaints: h.openCount,
      resolvedComplaints: h.resolvedCount,
      criticalCount: h.criticalCount,
      topCategory,
      riskScore,
      alertLevel,
      recommendation,
      sampleTrackingIds: h.complaints.slice(0, 4).map((c) => c.trackingId)
    });
  }

  // Sort by risk score descending (highest priority hotspots first)
  return results.sort((a, b) => b.riskScore - a.riskScore);
}
