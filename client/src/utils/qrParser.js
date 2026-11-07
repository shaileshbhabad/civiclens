import { mockAssets } from '../data/mockData';

/**
 * Parses raw scanned QR code text into structured CivicLens asset & location coordinates
 *
 * Supported formats:
 * 1. JSON string: {"qrCode":"QR-PUN-084","lat":18.5204,"lng":73.8567,"address":"...","ward":"..."}
 * 2. URL with params: https://civiclens.in/report?qr=QR-PUN-084&lat=18.5204&lng=73.8567&ward=...
 * 3. URL path: https://civiclens.in/report/QR-PUN-084
 * 4. Geolocation URI: geo:18.5204,73.8567
 * 5. Plain coordinates: 18.5204, 73.8567
 * 6. Asset identifier: QR-PUN-084 (mapped via registered mockAssets database)
 *
 * @param {string} raw
 * @returns {{
 *   success: boolean,
 *   qrCode: string,
 *   coordinates: [number, number], // [longitude, latitude] GeoJSON format
 *   latitude: number,
 *   longitude: number,
 *   address: string,
 *   ward: string,
 *   zone: string,
 *   assetName: string,
 *   department: string,
 *   source: string
 * }}
 */
export function parseQRData(raw) {
  if (!raw || typeof raw !== 'string') {
    return {
      success: false,
      error: 'Invalid QR code content'
    };
  }

  const trimmed = raw.trim();

  // 1. Try parsing JSON format
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const lat = parseFloat(parsed.lat || parsed.latitude);
      const lng = parseFloat(parsed.lng || parsed.longitude || parsed.lon);
      const code = parsed.qrCode || parsed.code || parsed.id || 'QR-TAGGED';

      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          success: true,
          qrCode: code,
          coordinates: [lng, lat],
          latitude: lat,
          longitude: lng,
          address: parsed.address || `Geo-tagged Asset (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          ward: parsed.ward || 'Central Ward',
          zone: parsed.zone || 'Zone A',
          assetName: parsed.name || parsed.assetName || `Placard #${code}`,
          department: parsed.department || 'Municipal Administration',
          source: 'qr_json'
        };
      }
    } catch {
      // Fall through to other parsers
    }
  }

  // 2. Try parsing URL format
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('/report')) {
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://civiclens.in${trimmed}`);
      const params = url.searchParams;

      const lat = parseFloat(params.get('lat') || params.get('latitude'));
      const lng = parseFloat(params.get('lng') || params.get('longitude') || params.get('lon'));
      const qrParam = params.get('qr') || params.get('code') || params.get('id');

      // Check if URL pathname has /report/:qrCode
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const pathCode = pathSegments[0] === 'report' && pathSegments[1] ? decodeURIComponent(pathSegments[1]) : null;
      const detectedCode = qrParam || pathCode;

      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          success: true,
          qrCode: detectedCode || 'QR-URL-TAG',
          coordinates: [lng, lat],
          latitude: lat,
          longitude: lng,
          address: params.get('address') || params.get('name') || `Asset at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          ward: params.get('ward') || 'Assigned Ward',
          zone: params.get('zone') || 'Zone A',
          assetName: params.get('asset') || detectedCode || 'Municipal Asset',
          department: params.get('dept') || params.get('department') || 'Municipal Services',
          source: 'qr_url_params'
        };
      }

      // If URL only had a code, look up that code
      if (detectedCode) {
        const matched = lookupAsset(detectedCode);
        if (matched) return { ...matched, success: true, source: 'qr_url_lookup' };
      }
    } catch {
      // Fall through
    }
  }

  // 3. Try parsing Geolocation URI (geo:lat,lng)
  if (trimmed.toLowerCase().startsWith('geo:')) {
    const geoStr = trimmed.slice(4).split('?')[0];
    const [latStr, lngStr] = geoStr.split(',');
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng)) {
      return {
        success: true,
        qrCode: `GEO-${Math.round(lat * 1000)}`,
        coordinates: [lng, lat],
        latitude: lat,
        longitude: lng,
        address: `Geotagged Location (${lat.toFixed(4)} N, ${lng.toFixed(4)} E)`,
        ward: 'Pune Municipal Ward',
        zone: 'Zone A',
        assetName: 'Geotagged Civic Asset',
        department: 'General Services',
        source: 'qr_geo_uri'
      };
    }
  }

  // 4. Try parsing comma-separated coordinates: "18.5204, 73.8567"
  const coordRegex = /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/;
  const match = trimmed.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return {
        success: true,
        qrCode: `GPS-${Math.round(lat * 1000)}`,
        coordinates: [lng, lat],
        latitude: lat,
        longitude: lng,
        address: `GPS Coordinate Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        ward: 'Pune Municipal Area',
        zone: 'Zone A',
        assetName: 'GPS Tagged Asset',
        department: 'City Corporation',
        source: 'qr_raw_coords'
      };
    }
  }

  // 5. Look up in registered assets database
  const matchedAsset = lookupAsset(trimmed);
  if (matchedAsset) {
    return {
      ...matchedAsset,
      success: true,
      source: 'asset_registry'
    };
  }

  // 6. Fallback: Unregistered QR tag with safe PCMC Pimpri central coordinates
  return {
    success: true,
    qrCode: trimmed.toUpperCase(),
    coordinates: [73.8131, 18.6298], // Default PCMC Pimpri central coordinates
    latitude: 18.6298,
    longitude: 73.8131,
    address: `Asset Placard #${trimmed} (Pimpri-Chinchwad Area)`,
    ward: 'PCMC Ward 20',
    zone: 'Zone B (Pimpri Central)',
    assetName: `Civic Placard #${trimmed}`,
    department: 'PCMC Municipal Operations',
    radiusMeters: 50,
    source: 'qr_tag_fallback'
  };
}

/**
 * Lookup asset by QR Code in the registry
 */
export function lookupAsset(code) {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  const asset = (mockAssets || []).find(
    (a) =>
      a.qrCode.toUpperCase() === normalized ||
      a.qrCode.replace(/[^a-zA-Z0-9]/g, '') === normalized.replace(/[^a-zA-Z0-9]/g, '') ||
      (normalized.startsWith('PCMC') && a.qrCode.includes(normalized))
  );

  if (asset) {
    return {
      qrCode: asset.qrCode,
      coordinates: asset.coordinates, // [lng, lat]
      latitude: asset.coordinates[1],
      longitude: asset.coordinates[0],
      address: asset.address,
      ward: asset.ward,
      zone: asset.zone,
      assetName: asset.name,
      department: asset.department,
      radiusMeters: asset.radiusMeters || 50,
      landmark: asset.landmark || ''
    };
  }
  return null;
}
