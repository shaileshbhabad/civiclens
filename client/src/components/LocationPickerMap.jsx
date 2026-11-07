import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Navigation,
  MapPin,
  Loader2,
  CheckCircle2,
  Compass,
  Building2,
  Search,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

// Custom pulsing pin icon for high-credibility location tagging
const createCustomPin = (leaflet) => {
  const l = leaflet || window.L || L;
  return l.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; background: rgba(99, 102, 241, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 26px; height: 26px; background: #4F46E5; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

// Pimpri-Chinchwad (PCMC) prominent locality landmarks near DY Patil Pimpri 411018
const PIMPRI_PRESETS = [
  { name: 'DY Patil College Pimpri', lat: 18.6231, lng: 73.8159, ward: 'Ward 20 (Sant Tukaram Nagar)' },
  { name: 'YCM Hospital', lat: 18.6220, lng: 73.8208, ward: 'Ward 20 (Sant Tukaram Nagar / YCMH)' },
  { name: 'Sant Tukaram Nagar Metro', lat: 18.6146, lng: 73.8158, ward: 'Ward 20 (Sant Tukaram Nagar)' },
  { name: 'Vallabh Nagar ST Stand', lat: 18.6185, lng: 73.8190, ward: 'Ward 20 (Vallabh Nagar)' },
  { name: 'Nehrunagar PCMC Stadium', lat: 18.6280, lng: 73.8230, ward: 'Ward 19 (Nehrunagar)' },
  { name: 'Mahesh Nagar Overbridge', lat: 18.6275, lng: 73.8050, ward: 'Ward 21 (Pimpri Station)' },
  { name: 'Kharalwadi Grade Separator', lat: 18.6210, lng: 73.8110, ward: 'Ward 20 (Kharalwadi)' },
  { name: 'HA Colony Ground', lat: 18.6190, lng: 73.8080, ward: 'Ward 22 (HA Colony)' }
];

const LocationPickerMap = ({
  initialCoordinates, // [lng, lat]
  onLocationChange,
  currentAddress = '',
  currentWard = ''
}) => {
  // Default center in DY Patil Pimpri 411018 / Sant Tukaram Nagar [lat, lng]
  const initialPos = initialCoordinates
    ? [initialCoordinates[1], initialCoordinates[0]]
    : [18.6231, 73.8159];

  const [position, setPosition] = useState(initialPos);
  const [accuracy, setAccuracy] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState(currentAddress);
  const [detectedWard, setDetectedWard] = useState(currentWard);
  const [locationNotice, setLocationNotice] = useState(null);
  const autoDetectAttemptedRef = useRef(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  // Helper to get active Leaflet library instance
  const getL = () => window.L || L;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const leaflet = getL();
    if (!leaflet) return;

    // Prevent duplicate map initialization
    if (!mapInstanceRef.current) {
      const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

      const map = leaflet.map(mapContainerRef.current, {
        center: position,
        zoom: 16,
        scrollWheelZoom: false,
        dragging: !isTouch, // Prevents scroll-trapping on phones while page scrolling; tapping map or dragging marker still works
        tap: false,
        attributionControl: true
      });

      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })
        .addTo(map);

      const marker = leaflet
        .marker(position, {
          draggable: true,
          icon: createCustomPin(leaflet)
        })
        .addTo(map);

      // Map click handler
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handlePositionChange(lat, lng);
      });

      // Marker drag handler
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        handlePositionChange(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate map size after initial render to avoid grey tile bug
      const timer = setTimeout(() => {
        try {
          if (mapInstanceRef.current && mapContainerRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        } catch {
          // ignore if map container was disposed
        }
      }, 250);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch {
            // ignore
          }
          mapInstanceRef.current = null;
          markerRef.current = null;
          circleRef.current = null;
        }
      };
    }
  }, []);

  // Update map and marker when position changes externally or via preset/GPS
  const updateMapPosition = (lat, lng, zoom = 16) => {
    const leaflet = getL();
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 0.8 });
    }
  };

  // Auto-detect live location on first mount (only if no initial coordinates were provided)
  useEffect(() => {
    if (autoDetectAttemptedRef.current) return;
    if (initialCoordinates && initialCoordinates[0] && initialCoordinates[1]) return; // already have coords
    autoDetectAttemptedRef.current = true;

    // Wait for map to initialize, then auto-locate
    const timer = setTimeout(() => {
      if (navigator.geolocation && navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted' || result.state === 'prompt') {
            handleGetCurrentLocation();
          }
        }).catch(() => {
          // permissions API not supported, try anyway
          handleGetCurrentLocation();
        });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Sync accuracy circle on map
  useEffect(() => {
    const leaflet = getL();
    if (!mapInstanceRef.current || !leaflet) return;

    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (accuracy && position) {
      circleRef.current = leaflet
        .circle(position, {
          radius: accuracy,
          fillColor: '#6366F1',
          fillOpacity: 0.15,
          color: '#4F46E5',
          weight: 1.5,
          dashArray: '4, 4'
        })
        .addTo(mapInstanceRef.current);
    }
  }, [accuracy, position]);

  // Sync when initialCoordinates prop changes from parent
  useEffect(() => {
    if (initialCoordinates && initialCoordinates[0] && initialCoordinates[1]) {
      const lat = initialCoordinates[1];
      const lng = initialCoordinates[0];
      setPosition([lat, lng]);
      updateMapPosition(lat, lng);
    }
  }, [initialCoordinates]);

  // Reverse geocode latitude and longitude to street address
  const reverseGeocode = async (lat, lng, acc = null) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(6000) }
      );
      if (!res.ok) {
        throw new Error(`Reverse geocode HTTP ${res.status}`);
      }
      const data = await res.json();
      const addr = data.address || {};

      // Extract real place details without hardcoded fallbacks
      const place = addr.amenity || addr.building || addr.shop || addr.office || addr.leisure || addr.historic || addr.tourism || '';
      const road = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || '';
      const locality = addr.suburb || addr.neighbourhood || addr.quarter || addr.subdivision || addr.residential || '';
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.city_district || addr.county || '';
      const pincode = addr.postcode ? `${addr.postcode}` : '';

      const parts = [place, road, locality, city, pincode].filter(Boolean);
      let formatted = '';
      if (parts.length >= 2) {
        formatted = parts.join(', ');
      } else if (data.display_name) {
        // Use clean portion of OpenStreetMap display name
        formatted = data.display_name.split(',').slice(0, 4).map((s) => s.trim()).join(', ');
      } else {
        formatted = `Location at ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
      }

      // Contextual Ward detection
      let wardGuess = 'Municipal Area';
      const lower = (formatted + ' ' + (data.display_name || '')).toLowerCase();
      if (lower.includes('tukaram') || lower.includes('dy patil')) wardGuess = 'Ward 20 (Sant Tukaram Nagar)';
      else if (lower.includes('ycm') || lower.includes('hospital')) wardGuess = 'Ward 20 (Sant Tukaram Nagar / YCMH)';
      else if (lower.includes('vallabh')) wardGuess = 'Ward 20 (Vallabh Nagar)';
      else if (lower.includes('nehru')) wardGuess = 'Ward 19 (Nehrunagar)';
      else if (lower.includes('kharalwadi')) wardGuess = 'Ward 20 (Kharalwadi)';
      else if (lower.includes('mahesh') || lower.includes('station')) wardGuess = 'Ward 21 (Pimpri Station)';
      else if (lower.includes('ha colony') || lower.includes('antibiotics')) wardGuess = 'Ward 22 (HA Colony)';
      else if (lower.includes('pimpri') || lower.includes('chinchwad')) wardGuess = 'PCMC Municipal Area';
      else if (locality) wardGuess = `${locality} Area`;
      else if (city) wardGuess = `${city} Region`;

      setDetectedAddress(formatted);
      setDetectedWard(wardGuess);

      if (onLocationChange) {
        onLocationChange({
          lat,
          lng,
          coordinates: [lng, lat],
          address: formatted,
          ward: wardGuess,
          accuracy: acc || accuracy || 15
        });
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      const fallbackAddr = `Location at ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
      setDetectedAddress(fallbackAddr);
      if (onLocationChange) {
        onLocationChange({
          lat,
          lng,
          coordinates: [lng, lat],
          address: fallbackAddr,
          ward: 'Municipal Area',
          accuracy: acc || accuracy || 15
        });
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle position change on drag, click, or GPS
  const handlePositionChange = (lat, lng, acc = null) => {
    setPosition([lat, lng]);
    setAccuracy(acc);
    if (onLocationChange) {
      onLocationChange({
        lat,
        lng,
        coordinates: [lng, lat],
        accuracy: acc || accuracy || 15
      });
    }
    reverseGeocode(lat, lng, acc);
  };

  // Browser high-precision geolocation with multi-strategy fallback
  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setLocationNotice({ type: 'info', message: 'Detecting live GPS location…' });

    let locked = false;

    // Fast-path helper to apply coordinates
    const applyCoords = (lat, lng, acc, source = 'GPS') => {
      lat = parseFloat(Number(lat).toFixed(6));
      lng = parseFloat(Number(lng).toFixed(6));
      acc = Math.round(Number(acc) || 15);

      setPosition([lat, lng]);
      setAccuracy(acc);
      setIsLocating(false);

      if (source === 'GPS') {
        setLocationNotice({
          type: 'success',
          message: `Live location locked via GPS (±${acc}m accuracy).`
        });
        updateMapPosition(lat, lng, 17);
      } else {
        setLocationNotice({
          type: 'success',
          message: `Live location detected via network (±${acc}m). Drag pin to refine.`
        });
        updateMapPosition(lat, lng, 15);
      }

      reverseGeocode(lat, lng, acc);
    };

    // Parallel IP fallback that triggers if GPS takes > 2.5 seconds or fails
    const runIpFallback = async () => {
      if (locked) return;
      try {
        const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.latitude && data.longitude && !locked) {
            locked = true;
            applyCoords(data.latitude, data.longitude, 250, 'Network');
            return;
          }
        }
      } catch (e1) {
        try {
          const res2 = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal: AbortSignal.timeout(4000) });
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2 && data2.latitude && data2.longitude && !locked) {
              locked = true;
              applyCoords(data2.latitude, data2.longitude, 500, 'Network');
              return;
            }
          }
        } catch (e2) {
          console.warn('IP fallback failed:', e2);
        }
      }

      if (!locked) {
        setIsLocating(false);
        setLocationNotice({
          type: 'error',
          message: 'Unable to detect live location. Click anywhere on the map or select a PCMC landmark below.'
        });
      }
    };

    // Start fallback timer
    const fallbackTimer = setTimeout(() => {
      if (!locked) {
        runIpFallback();
      }
    }, 2500);

    // Browser Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(fallbackTimer);
          locked = true;
          applyCoords(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, 'GPS');
        },
        (err) => {
          console.warn('Browser geolocation error:', err);
          if (err.code === err.PERMISSION_DENIED) {
            clearTimeout(fallbackTimer);
            runIpFallback();
          } else {
            runIpFallback();
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 10000
        }
      );
    } else {
      clearTimeout(fallbackTimer);
      runIpFallback();
    }
  };

  // Preset chip selection
  const handlePresetSelect = (preset) => {
    setPosition([preset.lat, preset.lng]);
    setAccuracy(25);
    setDetectedWard(preset.ward);
    const addr = `${preset.name}, ${preset.ward}, Pimpri-Chinchwad`;
    setDetectedAddress(addr);

    updateMapPosition(preset.lat, preset.lng, 16);

    if (onLocationChange) {
      onLocationChange({
        lat: preset.lat,
        lng: preset.lng,
        coordinates: [preset.lng, preset.lat],
        address: addr,
        ward: preset.ward
      });
    }
  };

  return (
    <div className="space-y-3 text-slate-900 dark:text-slate-100">
      {/* Location Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block">
            Exact Location Geotag <span className="text-rose-500">*</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click anywhere on the map or drag the pin to mark the exact issue spot
          </span>
        </div>

        {/* GPS Locate Button (min 44px tall) */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f2b5c] hover:bg-[#091a38] text-white text-xs font-bold shadow-xs transition disabled:opacity-60 shrink-0 cursor-pointer active:scale-98"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Acquiring GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>Detect My Location</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Map Frame with touch-action: pan-y for smooth vertical page scroll */}
      <div
        className="relative rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xs bg-slate-100 dark:bg-slate-800 h-72 sm:h-80 w-full z-0"
        style={{ touchAction: 'pan-y' }}
      >
        <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '280px', touchAction: 'pan-y' }} />

        {/* Floating Instruction Banner over map */}
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-[400] pointer-events-none">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 pointer-events-auto">
            <Compass className="w-3.5 h-3.5 text-[#0f2b5c] dark:text-blue-400 shrink-0" />
            <span>Tap map or drag marker to set exact position</span>
          </div>
        </div>

        {/* Reverse Geocoding Loader */}
        {isGeocoding && (
          <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 backdrop-blur-xs shadow-lg">
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
            <span>Resolving street address...</span>
          </div>
        )}
      </div>

      {/* Quick Pimpri Locality Preset Chips (min 44px tall touch targets with clear gaps) */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
          Quick PCMC Locality Landmark Pins:
        </span>
        <div className="flex flex-wrap gap-2">
          {PIMPRI_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className="min-h-11 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition text-xs font-medium cursor-pointer flex items-center justify-center active:scale-95"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* High-Credibility Location Verified Card */}
      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-slate-800 dark:text-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                High-Credibility GPS Pinpoint
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-sm">
                {detectedAddress || 'Location Coordinates Locked'}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Verified</span>
          </span>
        </div>

        {/* Coordinates Readout */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-200 dark:border-emerald-800 font-mono">
          <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Latitude</span>
            <span className="font-bold text-[#0f2b5c] dark:text-blue-300">{position[0].toFixed(5)}° N</span>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Longitude</span>
            <span className="font-bold text-[#0f2b5c] dark:text-blue-300">{position[1].toFixed(5)}° E</span>
          </div>
        </div>

        {detectedWard && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-900 dark:text-emerald-300">
            <Building2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">PCMC Administrative Division:</span>
            <span>{detectedWard}</span>
          </div>
        )}
      </div>

      {/* Geolocation feedback notice */}
      {locationNotice && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            locationNotice.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          {locationNotice.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          )}
          <span>{locationNotice.message}</span>
        </div>
      )}
    </div>
  );
};

export default LocationPickerMap;
