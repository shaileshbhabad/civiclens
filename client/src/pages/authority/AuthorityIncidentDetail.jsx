import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldAlert,
  Sparkles,
  QrCode,
  Globe,
  CheckCircle2,
  Camera,
  Layers,
  Save,
  Loader2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { api } from '../../services/api';
import {
  formatDate,
  getStatusColor,
  getSeverityColor,
  getUrgencyColor,
  getCategoryLabel,
  getStatusLabel
} from '../../utils/helpers';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AuthorityIncidentDetail = () => {
  const { id } = useParams();

  useDocumentTitle(
    id ? `Field Remediation #${id.slice(-6)}` : 'Field Remediation',
    'Submit field remediation notes and verified photographic proof.'
  );

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Authority Action State
  const [status, setStatus] = useState('in_progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
        const data = await api.getIncidentById(id);
        setIncident(data);
        setStatus(data.status === 'open' ? 'in_progress' : data.status);
        setResolutionNote(data.statusNote || '');
      } catch (err) {
        console.error('Error fetching incident:', err);
        setErrorMessage(err.message || 'Failed to load incident details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIncident();
    }
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);

      await api.updateIncidentStatus(id, status, resolutionNote, {
        resolutionImage: status === 'resolved' ? (proofPreview || incident.resolutionImage || '') : ''
      });

      // Refresh incident
      const updated = await api.getIncidentById(id);
      setIncident(updated);
      setStatus(updated.status);
      setResolutionNote(updated.statusNote || '');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update incident: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#0f2b5c] dark:text-blue-400 mb-2" />
        <p className="text-sm">Loading assigned incident...</p>
      </div>
    );
  }

  if (!incident || errorMessage) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Incident Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{errorMessage || `Unable to load incident ID: ${id}`}</p>
        <Link
          to="/authority/dashboard"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#0f2b5c] text-white rounded-lg text-sm font-semibold hover:bg-[#091a38] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Authority Dashboard
        </Link>
      </div>
    );
  }

  const factors = incident.priorityFactors || {
    severityWeight: 25,
    locationWeight: 20,
    frequencyWeight: 15,
    impactWeight: 10,
    historyWeight: 5
  };

  const factorList = [
    { label: 'Severity Weight', value: factors.severityWeight || 0, max: 30, color: 'bg-red-600' },
    { label: 'Location Risk', value: factors.locationWeight || 0, max: 30, color: 'bg-amber-600' },
    { label: 'Frequency / Velocity', value: factors.frequencyWeight || 0, max: 25, color: 'bg-yellow-600' },
    { label: 'Citizen Impact', value: factors.impactWeight || 0, max: 15, color: 'bg-blue-600' },
    { label: 'Historical Recurrence', value: factors.historyWeight || 0, max: 10, color: 'bg-slate-600' }
  ];

  const primaryExplanation =
    incident.complaints?.[0]?.ai_analysis?.explanation ||
    'AI analysis clustered citizen submissions based on geographic coordinates and visual severity verification.';

  const coordinates = incident.location?.coordinates || [73.8567, 18.5204];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/authority/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Department Queue
        </Link>
        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">Incident ID: {incident._id}</div>
      </div>

      {/* Incident Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0f2b5c] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded border border-blue-200 dark:border-blue-900">
                {getCategoryLabel(incident.category)}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded border ${getStatusColor(
                  incident.status
                )}`}
              >
                {getStatusLabel(incident.status)}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded border capitalize ${getSeverityColor(
                  incident.severity
                )}`}
              >
                {incident.severity} Severity
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded border capitalize ${getUrgencyColor(
                  incident.urgency
                )}`}
              >
                {incident.urgency?.replace(/_/g, ' ')}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              {incident.address}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Ward: <strong className="text-slate-700 dark:text-slate-200">{incident.ward || 'Ward 20'}</strong>
              </span>
              <span>•</span>
              <span>
                Zone: <strong className="text-slate-700 dark:text-slate-200">{incident.zone || 'Zone B (Pimpri)'}</strong>
              </span>
              <span>•</span>
              <span>
                Department: <strong className="text-slate-700 dark:text-slate-200">{incident.department || 'Roads'}</strong>
              </span>
              <span>•</span>
              <span>
                Reported:{' '}
                <strong className="text-slate-700 dark:text-slate-200">{formatDate(incident.createdAt)}</strong>
              </span>
            </div>
          </div>

          {/* Priority Score Display */}
          <div className="shrink-0 flex items-center gap-4 bg-[#091a38] text-white p-4 px-6 rounded-lg border border-slate-700 shadow-sm">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Priority Score
              </div>
              <div className="text-xs text-blue-300">Dispatch Urgency</div>
            </div>
            <div className="text-4xl font-black tracking-tight text-white border-l border-slate-600 pl-4">
              {incident.priorityScore}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incident Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Priority Factors Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
                Priority Factors Analysis
              </h2>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Total: {incident.priorityScore}/100</span>
            </div>

            <div className="space-y-4">
              {factorList.map((factor, idx) => {
                const percentage = Math.min(Math.round((factor.value / factor.max) * 100), 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{factor.label}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {factor.value} / {factor.max} pts
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${factor.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Explanation Card */}
          <div className="bg-[#091a38] text-white p-6 rounded-lg border border-slate-700 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded bg-blue-900/60 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold tracking-tight text-white">AI Prioritization Context</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-200">{primaryExplanation}</p>
          </div>

          {/* Static Map Coordinates */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
              Field Inspection Coordinates
            </h3>

            <div className="relative w-full h-44 bg-slate-50 dark:bg-slate-800/60 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center p-4">
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center justify-center shadow-xs mb-2">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{incident.address}</p>
                <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded border border-slate-200 dark:border-slate-700">
                  <span>Lat: {coordinates[1]?.toFixed(4)}° N</span>
                  <span>•</span>
                  <span>Lng: {coordinates[0]?.toFixed(4)}° E</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Merged Complaints (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Citizen Submissions
                </h2>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/50 text-[#0f2b5c] dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-bold text-xs">
                {incident.complaints?.length || incident.reportCount || 1} Reports Clustered
              </span>
            </div>

            {/* Locality Cluster Notice */}
            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                  150m Locality Cluster Consolidation
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Resolving this incident marks all {incident.complaints?.length || 1} merged citizen complaints as resolved synchronously.
                </p>
              </div>
              {incident.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus('resolved');
                    if (!resolutionNote) setResolutionNote('Field inspection completed and defect remediated by municipal work crew.');
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolve All Reports
                </button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              {(!incident.complaints || incident.complaints.length === 0) ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                  No individual complaint records attached.
                </div>
              ) : (
                incident.complaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {complaint.imageUrl && (
                        <img
                          src={complaint.imageUrl}
                          alt="Citizen Proof"
                          className="w-16 h-16 rounded object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-mono font-bold text-[#0f2b5c] dark:text-blue-400">
                            {complaint.trackingId}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                          >
                            {complaint.source === 'qr' ? (
                              <>
                                <QrCode className="w-3 h-3" /> QR Scan
                              </>
                            ) : (
                              <>
                                <Globe className="w-3 h-3" /> Web Portal
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {complaint.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(complaint.createdAt)}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        Status: {complaint.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Authority Actions Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
          Field Officer Remediation & Proof
        </h2>

        {saveSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Field status successfully updated and timestamped!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] transition"
              >
                <option value="in_progress">In Progress (Work Crew Deployed)</option>
                <option value="resolved">Resolved (Completed & Verified)</option>
              </select>
            </div>

            {/* Proof Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Upload Remediation Proof (Photo)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-11 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer transition">
                  <Camera className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
                  <span>{proofImage ? proofImage.name : 'Select or snap proof photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {proofPreview && (
                  <img
                    src={proofPreview}
                    alt="Proof Preview"
                    className="w-11 h-11 rounded object-cover border border-slate-300 dark:border-slate-600 shrink-0"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Resolution Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Field Action / Resolution Note
            </label>
            <textarea
              rows="3"
              placeholder="Describe work completed (e.g., asphalt patch filled, garbage bin cleared, pipeline sealed)..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[90px] bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] transition"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-11 bg-[#0f2b5c] hover:bg-[#091a38] text-white rounded-lg text-sm sm:text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Field Status...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Submit Field Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthorityIncidentDetail;
