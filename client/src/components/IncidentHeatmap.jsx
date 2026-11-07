import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Flame,
  Layers,
  Filter,
  ExternalLink,
  ThumbsUp,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Sparkles
} from 'lucide-react';
import { getCategoryLabel, getStatusLabel } from '../utils/helpers';

const SEVERITY_COLORS = {
  critical: { hex: '#EF4444', ring: 'rgba(239, 68, 68, 0.35)', label: 'Critical' },
  high: { hex: '#F97316', ring: 'rgba(249, 115, 22, 0.30)', label: 'High' },
  medium: { hex: '#F59E0B', ring: 'rgba(245, 158, 11, 0.28)', label: 'Medium' },
  low: { hex: '#3B82F6', ring: 'rgba(59, 130, 246, 0.25)', label: 'Low' },
  resolved: { hex: '#10B981', ring: 'rgba(16, 185, 129, 0.25)', label: 'Resolved' }
};

const getMatchedThumb = (category = 'pothole', status = 'open') => {
  const isRes = status === 'resolved' || status === 'closed';
  if (category === 'garbage') {
    return isRes ? '/images/resolutions/garbage_after.jpg' : '/images/resolutions/garbage_before.jpg';
  }
  if (category === 'drainage' || category === 'water_leak') {
    return isRes ? '/images/resolutions/drainage_after.jpg' : '/images/resolutions/drainage_before.jpg';
  }
  return isRes ? '/images/resolutions/pothole_after.jpg' : '/images/resolutions/pothole_before.jpg';
};

const IncidentHeatmap = ({
  incidents = [],
  isAdminView = false,
  onUpvote = null,
  upvotedIds = {}
}) => {
  const [viewMode, setViewMode] = useState('combined'); // 'combined' | 'pins' | 'heatmap'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'critical' | 'active' | 'resolved'
  const [selectedIncident, setSelectedIncident] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  const getL = () => window.L || L;

  // Filter incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (filterMode === 'critical') return inc.severity === 'critical' && inc.status !== 'resolved';
    if (filterMode === 'active') return inc.status !== 'resolved' && inc.status !== 'closed';
    if (filterMode === 'resolved') return inc.status === 'resolved' || inc.status === 'closed';
    return true;
  });

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const leaflet = getL();
    if (!leaflet) return;

    if (!mapInstanceRef.current) {
      const map = leaflet.map(mapContainerRef.current, {
        center: [18.6222, 73.8165], // DY Patil Pimpri 411018 & Sant Tukaram Nagar center
        zoom: 14,
        scrollWheelZoom: true
      });

      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        })
        .addTo(map);

      const layerGroup = leaflet.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      layerGroupRef.current = layerGroup;

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
          layerGroupRef.current = null;
        }
      };
    }
  }, []);

  // Render pins and thermal heat zones whenever incidents, viewMode, or filterMode change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    const leaflet = getL();
    if (!map || !layerGroup || !leaflet) return;

    layerGroup.clearLayers();

    filteredIncidents.forEach((inc) => {
      const coords = inc.location?.coordinates;
      if (!coords || coords.length < 2) return;
      const lat = Number(coords[1]);
      const lng = Number(coords[0]);
      if (isNaN(lat) || isNaN(lng)) return;

      const isResolved = inc.status === 'resolved' || inc.status === 'closed';
      const colorKey = isResolved ? 'resolved' : inc.severity || 'medium';
      const palette = SEVERITY_COLORS[colorKey] || SEVERITY_COLORS.medium;
      const reportCount = inc.reportCount || (inc.complaints ? inc.complaints.length : 1) || 1;
      const priority = inc.priorityScore || 75;

      // 1. Render Thermal Heatmap Concentric Rings
      if (viewMode === 'combined' || viewMode === 'heatmap') {
        const outerRadius = Math.max(140, priority * 2.2 + reportCount * 18);
        const innerRadius = outerRadius * 0.52;

        // Outer thermal aura
        leaflet
          .circle([lat, lng], {
            radius: outerRadius,
            color: palette.hex,
            weight: 1,
            opacity: 0.35,
            fillColor: palette.hex,
            fillOpacity: viewMode === 'heatmap' ? 0.32 : 0.18
          })
          .addTo(layerGroup);

        // Inner intense core
        leaflet
          .circle([lat, lng], {
            radius: innerRadius,
            color: palette.hex,
            weight: 0,
            fillColor: palette.hex,
            fillOpacity: viewMode === 'heatmap' ? 0.55 : 0.32
          })
          .addTo(layerGroup);
      }

      // 2. Render Custom Cluster Marker Pin
      if (viewMode === 'combined' || viewMode === 'pins') {
        const isPulsing = (inc.severity === 'critical' || inc.disputed) && !isResolved;
        const iconHtml = `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${
              isPulsing
                ? `<div style="position: absolute; width: 40px; height: 40px; background: ${palette.ring}; border-radius: 50%; animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="position: relative; width: 32px; height: 32px; background: ${
              palette.hex
            }; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 12px; font-family: ui-monospace, monospace;">
              ${isResolved ? '✓' : reportCount}
            </div>
            ${
              inc.disputed
                ? `<div style="position: absolute; top: -4px; right: -4px; background: #BE123C; color: white; font-size: 9px; font-weight: 900; padding: 1px 4px; border-radius: 999px; border: 1.5px solid white;">!</div>`
                : ''
            }
          </div>
        `;

        const customIcon = leaflet.divIcon({
          className: 'civiclens-cluster-pin',
          html: iconHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = leaflet.marker([lat, lng], { icon: customIcon }).addTo(layerGroup);
        marker.on('click', () => {
          setSelectedIncident(inc);
          map.flyTo([lat, lng], 16, { duration: 0.6 });
        });
      }
    });
  }, [filteredIncidents, viewMode, filterMode]);

  const handleSelectHotspot = (inc) => {
    setSelectedIncident(inc);
    const map = mapInstanceRef.current;
    const coords = inc.location?.coordinates;
    if (map && coords && coords.length >= 2) {
      map.flyTo([Number(coords[1]), Number(coords[0])], 16, { duration: 0.6 });
    }
  };

  const resetMapCenter = () => {
    setSelectedIncident(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([18.6222, 73.8165], 14, { duration: 0.6 });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Top Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Interactive Geospatial Heatmap & Cluster Map
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                  <Sparkles className="w-3 h-3" />
                  Live GIS Telemetry (411018)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any numbered cluster pin or thermal ring around DY Patil Campus, Sant Tukaram Nagar & YCM Hospital to inspect live grievance clusters.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Status Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer Mode Toggle */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            {[
              { id: 'combined', label: 'Combined View' },
              { id: 'heatmap', label: 'Thermal Heatmap' },
              { id: 'pins', label: 'Cluster Pins' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setViewMode(m.id)}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  viewMode === m.id
                    ? 'bg-white dark:bg-slate-900 text-[#0f2b5c] dark:text-blue-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Filter Pills */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            {[
              { id: 'all', label: `All (${incidents.length})` },
              { id: 'critical', label: 'Critical' },
              { id: 'active', label: 'Active' },
              { id: 'resolved', label: 'Resolved' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterMode(f.id)}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  filterMode === f.id
                    ? 'bg-[#0f2b5c] dark:bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetMapCenter}
            title="Reset Map View to Pimpri 411018"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split: Left Map Canvas (8 cols) + Right Hotspot Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Map Container */}
        <div className="lg:col-span-8 relative min-h-[380px] sm:min-h-[430px] bg-slate-100">
          <div
            ref={mapContainerRef}
            className="w-full h-[380px] sm:h-[430px] z-10"
          />

          {/* Floating Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block ring-2 ring-red-200 dark:ring-red-950"></span>
              Critical Hotspot
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
              High Severity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Resolved
            </span>
          </div>
        </div>

        {/* Right Side Panel: Selected Pin Detail OR Top Hotspots List */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 sm:p-5 flex flex-col justify-between max-h-[430px] overflow-y-auto">
          {selectedIncident ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Selected Cluster Pin
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Show All Clusters
                </button>
              </div>

              {/* Photo Thumbnail */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-200 shadow-2xs">
                <img
                  src={
                    selectedIncident.status === 'resolved'
                      ? selectedIncident.resolutionImage || getMatchedThumb(selectedIncident.category, 'resolved')
                      : selectedIncident.imageUrl || getMatchedThumb(selectedIncident.category, 'open')
                  }
                  alt={selectedIncident.category}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                    {getCategoryLabel(selectedIncident.category)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#0f2b5c] text-white">
                    Priority {selectedIncident.priorityScore || 85}/100
                  </span>
                </div>
                {selectedIncident.disputed && (
                  <div className="absolute bottom-2 left-2 right-2 bg-rose-600/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Re-opened by Citizen (Disputed Fix)</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {selectedIncident.address}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedIncident.ward || 'Ward 20 (Sant Tukaram Nagar)'} •{' '}
                  <strong className="text-slate-700">
                    {selectedIncident.reportCount || 1} Citizen Reports Merged
                  </strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Current Status</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {getStatusLabel(selectedIncident.status)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Officer</span>
                  <span className="font-bold text-slate-800">
                    {selectedIncident.assignedTo?.name || selectedIncident.department || 'PCMC Field Team'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-col gap-2">
                {isAdminView ? (
                  <Link
                    to={`/admin/incidents/${selectedIncident._id}`}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0f2b5c] hover:bg-[#091a38] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <span>Inspect & Manage Incident</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    {onUpvote && selectedIncident.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => onUpvote(selectedIncident._id)}
                        disabled={
                          Array.isArray(upvotedIds)
                            ? upvotedIds.includes(selectedIncident._id)
                            : !!upvotedIds[selectedIncident._id]
                        }
                        className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          (Array.isArray(upvotedIds)
                            ? upvotedIds.includes(selectedIncident._id)
                            : !!upvotedIds[selectedIncident._id])
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-[#0f2b5c] hover:bg-[#091a38] text-white shadow-xs'
                        }`}
                      >
                        {(Array.isArray(upvotedIds)
                          ? upvotedIds.includes(selectedIncident._id)
                          : !!upvotedIds[selectedIncident._id]) ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Upvoted (+1)</span>
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>+1 Affects Me Too</span>
                          </>
                        )}
                      </button>
                    )}
                    <Link
                      to="/track"
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition"
                    >
                      <span>Track</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Pimpri Clusters ({filteredIncidents.length})
                </h3>
                <span className="text-[11px] text-indigo-600 font-semibold">Click to fly to pin</span>
              </div>

              <div className="space-y-2">
                {filteredIncidents.slice(0, 6).map((inc) => {
                  const isRes = inc.status === 'resolved' || inc.status === 'closed';
                  return (
                    <button
                      key={inc._id}
                      type="button"
                      onClick={() => handleSelectHotspot(inc)}
                      className="w-full text-left p-3 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200/90 hover:border-indigo-300 transition flex items-start gap-3 shadow-2xs cursor-pointer"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-xs font-mono mt-0.5 ${
                          isRes
                            ? 'bg-emerald-500'
                            : inc.severity === 'critical'
                            ? 'bg-red-500'
                            : inc.severity === 'high'
                            ? 'bg-orange-500'
                            : 'bg-amber-500'
                        }`}
                      >
                        {isRes ? '✓' : inc.reportCount || 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {getCategoryLabel(inc.category)}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-indigo-600 shrink-0">
                            Score {inc.priorityScore || 80}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">{inc.address}</p>
                        {inc.disputed && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            ⚠️ Re-opened by Citizen
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentHeatmap;
