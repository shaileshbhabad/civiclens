import React, { useState, useEffect } from 'react';
import {
  Flame,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  ExternalLink,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getCategoryLabel } from '../utils/helpers';

export default function HotspotRadar({ defaultRadius = 350, showTitle = true }) {
  const [radius, setRadius] = useState(defaultRadius);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHotspots = async (selectedRadius) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHotspots(selectedRadius);
      setHotspots(data || []);
    } catch (err) {
      console.error('Failed to load hotspots:', err);
      setError('Could not load locality hotspots at this moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots(radius);
  }, [radius]);

  const getAlertBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
            <Flame className="w-3.5 h-3.5 text-red-600" />
            CRITICAL HOTSPOT
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            HIGH PRIORITY
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-600" />
            MODERATE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            STABLE
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Header */}
      {showTitle && (
        <div className="p-6 border-b border-slate-800 bg-[#091a38] text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 bg-red-500/20 text-red-400 rounded inline-flex">
                  <Flame className="w-4 h-4" />
                </span>
                <h2 className="text-lg font-bold">Locality Hotspot Intelligence Radar</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Spatial clustering engine detecting defect concentrations within customizable locality radii across PCMC.
              </p>
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-2 bg-slate-800/90 p-1 rounded-lg border border-slate-700 self-start md:self-auto">
              <span className="text-xs text-slate-400 font-medium px-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Radius:
              </span>
              {[150, 350, 500].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`px-3 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                    radius === r
                      ? 'bg-[#0f2b5c] text-white border border-blue-400/50 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {r}m
                </button>
              ))}
              <button
                onClick={() => fetchHotspots(radius)}
                title="Refresh radar"
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition ml-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm font-medium">Scanning locality coordinates and defect clusters...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        ) : hotspots.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <MapPin className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700">No active defect hotspots detected</p>
            <p className="text-xs text-slate-500 mt-1">
              No cluster exceeds threshold density in the selected {radius}m locality radius.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotspots.map((spot) => {
              const [lng, lat] = spot.center || [73.7640, 18.6492];
              const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

              return (
                <div
                  key={spot.id}
                  className={`rounded-lg border p-5 transition-all flex flex-col justify-between ${
                    spot.alertLevel === 'CRITICAL'
                      ? 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20'
                      : spot.alertLevel === 'HIGH'
                      ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {spot.ward || 'PCMC Area'}
                      </span>
                      {getAlertBadge(spot.alertLevel)}
                    </div>

                    {/* Locality Title */}
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1 line-clamp-1">
                      {spot.locality}
                    </h3>

                    {/* Radius and Top Defect */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0f2b5c] dark:text-blue-400" />
                        {spot.radiusMeters}m Locality Radius
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Primary: <span className="capitalize">{getCategoryLabel(spot.topCategory)}</span>
                      </span>
                    </div>

                    {/* Risk Score Meter */}
                    <div className="mb-4 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Risk Score</span>
                        <span
                          className={
                            spot.riskScore >= 75
                              ? 'text-red-700 dark:text-red-400'
                              : spot.riskScore >= 50
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-[#0f2b5c] dark:text-blue-400'
                          }
                        >
                          {spot.riskScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            spot.riskScore >= 75
                              ? 'bg-red-600'
                              : spot.riskScore >= 50
                              ? 'bg-amber-500'
                              : 'bg-[#0f2b5c] dark:bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, spot.riskScore)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-2xs">
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{spot.totalComplaints}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-2xs">
                        <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{spot.openComplaints}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active</div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-2xs">
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{spot.resolvedComplaints}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolved</div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 mb-3">
                      <span className="font-semibold block mb-0.5 text-slate-900 dark:text-white">Municipal Recommendation:</span>
                      {spot.recommendation}
                    </div>

                    {/* Sample Tracking IDs */}
                    {spot.sampleTrackingIds?.length > 0 && (
                      <div className="mb-3">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">
                          Reports in this cluster:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {spot.sampleTrackingIds.map((tid) => (
                            <Link
                              key={tid}
                              to={`/track/${tid}`}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 border border-slate-200 transition-colors inline-flex items-center gap-1"
                            >
                              {tid}
                              <ArrowRight className="w-2.5 h-2.5" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-600 hover:text-indigo-600 inline-flex items-center gap-1 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      View on Google Maps
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
