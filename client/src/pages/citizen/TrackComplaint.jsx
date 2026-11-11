import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Gauge,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Link2,
  Radio,
  Zap,
  Info,
  X,
  Star,
  AlertTriangle,
  RotateCcw,
  ThumbsUp,
  Camera,
  Lock,
  ShieldAlert,
  User,
  Eye,
  Sliders,
  Cpu
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  getSeverityColor,
  getUrgencyColor,
  getCategoryLabel
} from '../../utils/helpers';

const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Submitted', description: 'Grievance received' },
  { key: 'analysing', label: 'Analysing', description: 'AI classification' },
  { key: 'verified', label: 'Verified', description: 'Validated by system' },
  { key: 'assigned', label: 'Assigned', description: 'Sent to department' },
  { key: 'resolved', label: 'Resolved', description: 'Resolution confirmed' }
];

const getStepIndex = (status) => {
  const norm = (status || '').toLowerCase();
  switch (norm) {
    case 'submitted':
      return 0;
    case 'analysing':
      return 1;
    case 'verified':
    case 'open':
      return 2;
    case 'assigned':
    case 'in_progress':
      return 3;
    case 'resolved':
      return 4;
    case 'rejected':
      return -1;
    default:
      return 0;
  }
};

const TrackComplaint = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, login } = useAuth();
  const { language } = useLanguage();

  useDocumentTitle(
    trackingId ? `Track Grievance ${trackingId}` : (language === 'mr' ? 'तक्रार स्थिती ट्रॅकिंग' : 'Track Grievance Status'),
    'Real-time municipal tracking, stage verification, and resolution inspection for PCMC Ward 20.'
  );

  const [inputVal, setInputVal] = useState(trackingId || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [statusToast, setStatusToast] = useState(null);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Admin Authorization Required Modal states
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminModalIdentifier, setAdminModalIdentifier] = useState('admin@civiclens.in');
  const [adminModalPassword, setAdminModalPassword] = useState('');
  const [adminModalSubmitting, setAdminModalSubmitting] = useState(false);
  const [loginModalError, setLoginModalError] = useState('');

  // Citizen Dispute & Re-open Issue (Anti-Fake Resolution) states
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputePhotoPreview, setDisputePhotoPreview] = useState(null);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Citizen Satisfaction & Star Rating states
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [citizenRating, setCitizenRating] = useState(5);
  const [citizenFeedback, setCitizenFeedback] = useState('');
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  // Keep ref to previous status to detect live status transitions
  const prevStatusRef = useRef(null);

  // Fetch complaint handler
  const fetchComplaint = async (idToSearch, isSilent = false) => {
    if (!idToSearch || !idToSearch.trim()) return;

    if (!isSilent) {
      setLoading(true);
      setError(null);
    } else {
      setIsLiveSyncing(true);
    }

    try {
      const data = await api.getComplaintByTrackingId(idToSearch.trim());
      
      // Detect live status change
      if (prevStatusRef.current && prevStatusRef.current !== data.status) {
        setStatusToast({
          oldStatus: prevStatusRef.current,
          newStatus: data.status,
          message: `Live Status Transition: Issue updated from "${getStatusLabel(prevStatusRef.current)}" to "${getStatusLabel(data.status)}"!`,
          timestamp: new Date().toLocaleTimeString()
        });
      }

      prevStatusRef.current = data.status;
      setComplaint(data);
      setLastSyncTime(new Date());
      setError(null);
    } catch (err) {
      if (!isSilent) {
        setComplaint(null);
        setError(err.message || 'No complaint found matching this tracking ID.');
      }
    } finally {
      if (!isSilent) setLoading(false);
      setIsLiveSyncing(false);
    }
  };

  // Set up auto-polling when trackingId is present
  useEffect(() => {
    if (trackingId) {
      setInputVal(trackingId);
      prevStatusRef.current = null;
      setShowDisputeForm(false);
      setShowRatingForm(false);
      fetchComplaint(trackingId, false);

      // Instant live polling every 2.5 seconds
      const pollTimer = setInterval(() => {
        fetchComplaint(trackingId, true);
      }, 2500);

      return () => clearInterval(pollTimer);
    } else {
      setComplaint(null);
      setError(null);
      prevStatusRef.current = null;
    }
  }, [trackingId]);

  // Auto-dismiss status toast after 6 seconds
  useEffect(() => {
    if (statusToast) {
      const timer = setTimeout(() => {
        setStatusToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [statusToast]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    navigate(`/track/${inputVal.trim().toUpperCase()}`);
  };

  const handleManualRefresh = () => {
    if (trackingId) {
      fetchComplaint(trackingId, false);
    }
  };

  const handleCopyId = () => {
    if (complaint?.trackingId) {
      navigator.clipboard.writeText(complaint.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle quick admin login from modal
  const handleModalAdminLogin = async (e) => {
    e.preventDefault();
    setLoginModalError('');
    if (!adminModalIdentifier.trim() || !adminModalPassword) {
      setLoginModalError('Please enter both administrator ID and password.');
      return;
    }
    setAdminModalSubmitting(true);
    try {
      const res = await login(adminModalIdentifier.trim(), adminModalPassword);
      if (res?.success) {
        setShowAdminLoginModal(false);
        setAdminModalPassword('');
        setStatusToast({
          oldStatus: complaint?.status,
          newStatus: complaint?.status,
          message: `Welcome, ${res.user?.name || 'Administrator'}! Admin Live Controller unlocked.`,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        setLoginModalError(res?.error || 'Invalid administrator credentials. Access restricted to municipal admin (Shailesh Bhabad).');
      }
    } catch (err) {
      setLoginModalError(err.message || 'Authentication failed. Please verify administrator password.');
    } finally {
      setAdminModalSubmitting(false);
    }
  };

  // Handle field proof photo upload directly from Track Complaint page
  const handleUploadResolutionProof = async (dataUrl) => {
    if (!complaint?.trackingId || !dataUrl) return;

    // STRICT PERMISSION CHECK: Only logged-in admin can upload official resolution proof!
    if (!isAdmin) {
      setShowAdminLoginModal(true);
      return;
    }

    try {
      await api.resolveComplaint(complaint.trackingId, {
        resolutionImage: dataUrl,
        resolutionNotes: complaint.resolutionNotes || `Remediated and verified with on-site photograph at ${complaint.address || 'location'}.`,
        resolvedBy: {
          name: user?.name || 'Shailesh Bhabad',
          department: 'Roads & Municipal Infrastructure',
          role: 'admin'
        }
      });
      setComplaint(prev => ({
        ...prev,
        resolutionImage: dataUrl,
        status: 'resolved'
      }));
      setStatusToast({
        oldStatus: complaint.status,
        newStatus: 'resolved',
        message: '✓ Authentic field resolution proof photo saved & verified by Admin!',
        timestamp: new Date().toLocaleTimeString()
      });
      await fetchComplaint(complaint.trackingId, true);
    } catch (err) {
      console.error('Failed to save resolution proof:', err);
      alert('Failed to save resolution proof: ' + err.message);
    }
  };

  // Admin Fast-Track Status Trigger
  const handleAdminStatusChange = async (targetStatus) => {
    if (!complaint?.trackingId) return;

    // STRICT PERMISSION CHECK: Only logged-in admin can change complaint stages!
    // A normal citizen cannot change the stage of complaint.
    if (!isAdmin) {
      setShowAdminLoginModal(true);
      return;
    }

    setAdminActionLoading(true);
    try {
      if (targetStatus === 'resolved') {
        await api.resolveComplaint(complaint.trackingId, {
          resolutionImage: '',
          resolutionNotes: `Remediated and inspected on-site by field administration at ${complaint.address || 'location'}.`,
          resolvedBy: {
            name: user?.name || 'Shailesh Bhabad',
            department: 'Roads & Municipal Infrastructure',
            role: 'admin'
          }
        });
      } else {
        await api.updateComplaintStatus(
          complaint.trackingId,
          targetStatus,
          `Status transitioned to ${targetStatus} by Municipal Admin (${user?.name || 'Shailesh Bhabad'}).`
        );
        // If transitioning away from resolved, immediately clear resolution evidence
        setComplaint(prev => ({
          ...prev,
          status: targetStatus,
          resolutionImage: '',
          resolutionNotes: '',
          resolvedAt: null
        }));
      }
      // Re-fetch immediately
      await fetchComplaint(complaint.trackingId, true);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating status: ' + err.message);
    } finally {
      setAdminActionLoading(false);
    }
  };

  // Citizen Dispute & Re-open Issue Handler
  const handleDisputePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDisputePhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleReopenIssue = async (e) => {
    e.preventDefault();
    if (!complaint?.trackingId) return;
    const reasonText =
      disputeReason.trim() ||
      'Citizen ground audit: Issue was marked resolved prematurely or repair work is incomplete at site.';

    setDisputeSubmitting(true);
    try {
      const res = await api.reopenComplaint(complaint.trackingId, {
        disputeReason: reasonText,
        disputeImage: disputePhotoPreview || ''
      });
      if (res && res.complaint) {
        setComplaint(res.complaint);
        prevStatusRef.current = res.complaint.status;
      } else {
        setComplaint(prev => ({
          ...prev,
          status: 'in_progress',
          resolutionImage: '',
          resolutionNotes: '',
          resolvedAt: null,
          disputed: true,
          disputeReason: reasonText
        }));
      }
      setShowDisputeForm(false);
      setDisputeReason('');
      setDisputePhotoPreview(null);
      setStatusToast({
        oldStatus: 'resolved',
        newStatus: 'in_progress',
        message: '⚠️ Dispute Recorded! Issue Re-opened & Priority Boosted by +15 points.',
        timestamp: new Date().toLocaleTimeString()
      });
      await fetchComplaint(complaint.trackingId, true);
    } catch (err) {
      alert('Failed to re-open complaint: ' + err.message);
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const handleVerifyResolution = async (e) => {
    e.preventDefault();
    if (!complaint?.trackingId) return;
    setVerifySubmitting(true);
    try {
      const res = await api.verifyComplaintResolution(complaint.trackingId, {
        rating: citizenRating,
        feedback: citizenFeedback.trim() || 'Verified genuine on-site resolution.'
      });
      if (res && res.complaint) {
        setComplaint(res.complaint);
      }
      setShowRatingForm(false);
      setStatusToast({
        oldStatus: 'resolved',
        newStatus: 'resolved',
        message: `✓ Thank you! Citizen Verification (${citizenRating}/5 Stars) recorded on municipal ledger.`,
        timestamp: new Date().toLocaleTimeString()
      });
      await fetchComplaint(complaint.trackingId, true);
    } catch (err) {
      alert('Failed to submit verification: ' + err.message);
    } finally {
      setVerifySubmitting(false);
    }
  };

  const currentStep = complaint ? getStepIndex(complaint.status) : 0;
  const isPastSubmitted = complaint && complaint.status && complaint.status.toLowerCase() !== 'submitted';
  const confidencePercent = complaint?.ai_analysis?.confidence
    ? Math.round(complaint.ai_analysis.confidence * 100)
    : 94;

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-[#0b1322] py-10 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Real-time Status Change Toast Banner */}
        {statusToast && (
          <div className="p-4 bg-emerald-700 text-white rounded-lg shadow-md border border-emerald-600 flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-wide flex items-center gap-2">
                  <span>{statusToast.message}</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                    {statusToast.timestamp}
                  </span>
                </p>
                <p className="text-xs text-emerald-100 mt-0.5">
                  All linked locality records and citizen track views updated simultaneously.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusToast(null)}
              className="p-1.5 hover:bg-white/20 rounded transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Header and Search Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 mb-3 border border-slate-200 dark:border-slate-700 shadow-xs">
              <Search className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Track Complaint Status
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
              Real-time synchronization for civic grievances in PCMC Ward 20, Pimpri.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Enter tracking ID (e.g. CL-20261011-POTH1)"
                  className="w-full px-4 py-2.5 pl-10 text-sm font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className="px-5 py-2.5 bg-[#0f2b5c] hover:bg-[#1e3a8a] disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Track Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick suggestions / Sample Ward Grievances Table & Mobile Cards */}
          {!trackingId && !complaint && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Sample Ward 20 Grievances for Verification
                </span>
                <span className="text-[11px] text-slate-400">Click any issue to track</span>
              </div>

              {/* Desktop Table View (sm and above) */}
              <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="px-3.5 py-2.5">Tracking ID</th>
                      <th scope="col" className="px-3.5 py-2.5">Address</th>
                      <th scope="col" className="px-3.5 py-2.5">Status</th>
                      <th scope="col" className="px-3.5 py-2.5">Ward</th>
                      <th scope="col" className="px-3.5 py-2.5">Target SLA</th>
                      <th scope="col" className="px-3.5 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { id: 'CL-20261011-POTH1', addr: 'Dr. D. Y. Patil College Campus Gate 2', status: 'in_progress', ward: 'Ward 20 (Sant Tukaram)', sla: 'Within 24h' },
                      { id: 'CL-20261011-POTH2', addr: 'Sant Tukaram Nagar Central Road', status: 'verified', ward: 'Ward 20 (Sant Tukaram)', sla: 'Within 48h' },
                      { id: 'CL-20261011-GARB1', addr: 'YCM Hospital External Perimeter', status: 'resolved', ward: 'Ward 20 (Pimpri Central)', sla: 'Completed' }
                    ].map((sample) => (
                      <tr key={sample.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-3.5 py-2.5 font-mono font-bold text-[#0f2b5c] dark:text-blue-400">{sample.id}</td>
                        <td className="px-3.5 py-2.5 text-slate-800 dark:text-slate-200 max-w-xs truncate">{sample.addr}</td>
                        <td className="px-3.5 py-2.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${getStatusColor(sample.status)}`}>
                            {getStatusLabel(sample.status)}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-400">{sample.ward}</td>
                        <td className="px-3.5 py-2.5 font-medium text-slate-700 dark:text-slate-300">{sample.sla}</td>
                        <td className="px-3.5 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/track/${sample.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards (< 640px) */}
              <div className="block sm:hidden space-y-3">
                {[
                  { id: 'CL-20261011-POTH1', addr: 'Dr. D. Y. Patil College Campus Gate 2', status: 'in_progress', ward: 'Ward 20 (Sant Tukaram)', sla: 'Within 24h' },
                  { id: 'CL-20261011-POTH2', addr: 'Sant Tukaram Nagar Central Road', status: 'verified', ward: 'Ward 20 (Sant Tukaram)', sla: 'Within 48h' },
                  { id: 'CL-20261011-GARB1', addr: 'YCM Hospital External Perimeter', status: 'resolved', ward: 'Ward 20 (Pimpri Central)', sla: 'Completed' }
                ].map((sample) => (
                  <div
                    key={sample.id}
                    className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-2 text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Tracking ID</span>
                      <span className="font-mono font-bold text-[#0f2b5c] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                        {sample.id}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">Address</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{sample.addr}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Status</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${getStatusColor(sample.status)}`}>
                        {getStatusLabel(sample.status)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Ward</span>
                      <span className="text-slate-700 dark:text-slate-300">{sample.ward}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Target SLA</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{sample.sla}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => navigate(`/track/${sample.id}`)}
                        className="w-full min-h-11 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-semibold text-xs rounded-lg shadow-xs transition active:scale-98"
                      >
                        <span>Track Live Status & Audit Proof</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading Spinner for full search */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-12 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Retrieving live grievance status...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl shadow-xs border border-rose-200 p-8 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Complaint Not Found</h3>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setError(null);
                  setInputVal('');
                  navigate('/track');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Clear & Search Again
              </button>
              <Link
                to="/report"
                className="px-4 py-2 text-sm font-medium text-white bg-[#0f2b5c] hover:bg-[#091a38] rounded-lg transition"
              >
                Report New Grievance
              </Link>
            </div>
          </div>
        )}

        {/* Mode 2: Result Section */}
        {!loading && complaint && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Top Bar with Tracking ID, Status Badge & Real-Time Sync Indicator */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-6 py-5 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tracking Identifier
                  </span>
                  {/* Live Auto-Sync Indicator */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Live Auto-Sync Active</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                    {complaint.trackingId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    title="Copy tracking ID"
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleManualRefresh}
                    disabled={isLiveSyncing}
                    title="Force refresh now"
                    className="p-1.5 text-slate-400 hover:text-[#0f2b5c] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 text-xs"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLiveSyncing ? 'animate-spin text-[#0f2b5c]' : ''}`} />
                  </button>
                </div>

                {lastSyncTime && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Last synchronized: {lastSyncTime.toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold border shadow-xs ${getStatusColor(
                    complaint.status
                  )}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {getStatusLabel(complaint.status)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Municipal Priority: <strong className="text-slate-800 dark:text-slate-200 font-bold">{complaint.incidentId?.priorityScore || complaint.ai_analysis?.priorityScore || 85}/100</strong>
                </span>
              </div>
            </div>

            {/* Live Status Simulator & Admin Control Toolbar */}
            <div className="bg-[#091a38] text-white px-6 py-3.5 sm:px-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
              <div className="flex flex-wrap items-center gap-2">
                {isAdmin ? (
                  <>
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Admin Live Controller
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{user?.name || 'Administrator'} (Admin Active)</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Live Status Simulator
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Citizen View (Stage Changes Restricted)</span>
                    </span>
                  </>
                )}
                <span className="text-xs text-slate-300 hidden lg:inline">
                  {isAdmin
                    ? '(Click any stage to transition complaint lifecycle)'
                    : '(Only administrators can modify complaint stages. Citizens cannot change stage.)'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAdminLoginModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Admin Log In</span>
                  </button>
                )}

                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { key: 'submitted', label: 'Submitted', color: 'hover:bg-slate-700' },
                    { key: 'analysing', label: 'Analysing', color: 'hover:bg-slate-700' },
                    { key: 'verified', label: 'Verified', color: 'hover:bg-blue-700' },
                    { key: 'assigned', label: 'Assigned', color: 'hover:bg-slate-700' },
                    { key: 'in_progress', label: 'In Progress', color: 'hover:bg-amber-700' },
                    { key: 'resolved', label: 'Resolved', color: 'hover:bg-emerald-700 bg-emerald-600 font-bold' }
                  ].map((s) => {
                    const isActive = complaint.status === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => {
                          if (!isAdmin) {
                            setShowAdminLoginModal(true);
                          } else {
                            handleAdminStatusChange(s.key);
                          }
                        }}
                        disabled={adminActionLoading || (isAdmin && isActive)}
                        title={!isAdmin ? 'Admin login required to change stage' : `Transition to ${s.label}`}
                        className={`text-xs px-2.5 py-1 rounded transition font-medium border border-white/20 flex items-center gap-1 cursor-pointer ${
                          isActive
                            ? 'bg-white text-slate-900 font-bold shadow-xs'
                            : !isAdmin
                            ? 'bg-white/5 text-slate-300 hover:bg-white/15 opacity-70 border-dashed'
                            : `bg-white/10 text-white ${s.color}`
                        }`}
                      >
                        {!isAdmin && <Lock className="w-2.5 h-2.5 text-amber-300/80" />}
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Details Body */}
            <div className="p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              
              {/* Meta Grid: Date, Address, Ward */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-[#0f2b5c] dark:text-blue-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Submitted On</span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatDate(complaint.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Location / Landmark</span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {complaint.address || 'Dr. D. Y. Patil College Campus, Sant Tukaram Nagar, Pimpri 411018'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {complaint.ward || 'Ward 20 (Sant Tukaram Nagar / Pimpri)'} &bull; {complaint.zone || 'Zone B'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Consolidated Locality Cluster Notification */}
              {(complaint.isMerged || (complaint.mergedReportsCount && complaint.mergedReportsCount > 1)) && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start gap-3 shadow-2xs">
                  <div className="p-2 bg-[#0f2b5c] dark:bg-blue-600 text-white rounded shrink-0 mt-0.5 shadow-xs">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        Consolidated Locality Incident Report
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {complaint.mergedReportsCount || 2} Citizen Reports Clustered
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {complaint.mergeReason || `This issue was automatically matched and consolidated with existing reports within a 150m locality radius near DY Patil Pimpri.`}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                      <span>
                        <strong>Subsequent Auto-Adjustment Active:</strong> When field authorities resolve this municipal incident, all linked reports (including your tracking ID) update to resolved synchronously.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description and Image Split */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${complaint.imageUrl ? 'md:col-span-2' : 'md:col-span-3'} space-y-2`}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Complaint Description
                  </h3>
                  <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/70 text-slate-800 text-sm sm:text-base leading-relaxed">
                    {complaint.description || 'No detailed description provided.'}
                  </div>
                  {complaint.source && (
                    <div className="pt-2 text-xs text-slate-500">
                      Channel: <span className="font-medium text-slate-700 capitalize">{complaint.source.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>

                {complaint.imageUrl && (
                  <div className="md:col-span-1 space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                      Attached Evidence Photo
                    </h3>
                    <div className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video md:aspect-square shadow-xs">
                      <img
                        src={complaint.imageUrl}
                        alt="Submitted evidence"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <a
                        href={complaint.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-md text-xs backdrop-blur-xs flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Analysis Diagnostics Section */}
              {(isPastSubmitted || complaint.ai_analysis) && (
                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 rounded-lg p-6 relative overflow-hidden shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-[#0f2b5c] dark:bg-blue-600 text-white rounded shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      CivicLens AI Diagnostics & Triage
                    </h3>
                    <div className="ml-auto flex items-center gap-2">
                      {complaint.ai_analysis?.localModel && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          <span>MobileNetV3 ({Math.round((complaint.ai_analysis.localModel.confidence || 0.9) * 100)}%)</span>
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        Automated Verification
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    {/* Category */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Detected Category</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {getCategoryLabel(complaint.ai_analysis?.category || complaint.category || 'General')}
                      </span>
                    </div>

                    {/* Severity */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Assessed Severity</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${getSeverityColor(
                          complaint.ai_analysis?.severity || complaint.severity || 'medium'
                        )}`}
                      >
                        {(complaint.ai_analysis?.severity || complaint.severity || 'Medium').toUpperCase()}
                      </span>
                    </div>

                    {/* Urgency */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Action Urgency</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${getUrgencyColor(
                          complaint.ai_analysis?.urgency || complaint.urgency || 'within_24h'
                        )}`}
                      >
                        {(complaint.ai_analysis?.urgency || complaint.urgency || 'within_24h').replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Visual Features Identified by Vision AI */}
                  {complaint.ai_analysis?.visualFeatures && complaint.ai_analysis.visualFeatures.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 mb-4 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                        <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{language === 'mr' ? 'एआय व्हिजन द्वारे शोधलेली प्रत्यक्ष लक्षणे:' : 'Physical Defect Features Identified by Vision AI:'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {complaint.ai_analysis.visualFeatures.map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Non-defect warning notice if no defect detected */}
                  {complaint.ai_analysis?.defectDetected === false && (
                    <div className="p-3.5 mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{language === 'mr' ? 'एआय व्हिजन तपासणी: फोटोमध्ये कोणताही सक्रिय नागरी दोष आढळला नाही. ही तक्रार मॅन्युअल पाहणीसाठी पाठवण्यात आली आहे.' : 'Vision AI Inspection: No active civic defect was visually detected in the uploaded photo. Flagged for manual field verification.'}</span>
                    </div>
                  )}

                  {/* Transparent 5-Factor Priority Scoring Breakdown */}
                  {complaint.ai_analysis?.priorityFactors && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-[#0f2b5c] dark:text-blue-400" />
                          <span>{language === 'mr' ? 'पारदर्शक प्राधान्यक्रम गुण विश्लेषण' : 'Transparent Municipal Priority Breakdown'}</span>
                        </span>
                        <span className="font-mono font-bold text-sm text-[#0f2b5c] dark:text-blue-400">
                          {complaint.incidentId?.priorityScore || complaint.ai_analysis?.priorityScore || 75}/100
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center text-[11px]">
                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Severity</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{complaint.ai_analysis.priorityFactors.severityWeight || 25}/35</span>
                        </div>
                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Locality Risk</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{complaint.ai_analysis.priorityFactors.locationWeight || 20}/25</span>
                        </div>
                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Upvotes / Vol</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">{complaint.incidentId?.priorityFactors?.frequencyWeight || complaint.ai_analysis.priorityFactors.frequencyWeight || 12}/25</span>
                        </div>
                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Traffic Route</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{complaint.ai_analysis.priorityFactors.impactWeight || 5}/10</span>
                        </div>
                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">History</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{complaint.ai_analysis.priorityFactors.historyWeight || 3}/5</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confidence Progress */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-[#0f2b5c] dark:text-blue-400" />
                        AI Classifier Confidence
                      </span>
                      <span className="text-[#0f2b5c] dark:text-blue-400 font-bold font-mono">
                        {confidencePercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0f2b5c] dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* AI Explanation Text */}
                  {complaint.ai_analysis?.explanation && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">AI Explanation:</span>
                      {complaint.ai_analysis.explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Visual Before vs. After Resolution Verification Slider (Only visible when status is resolved) */}
              {complaint.status === 'resolved' && (
                <BeforeAfterSlider
                  beforeImage={complaint.imageUrl}
                  afterImage={complaint.resolutionImage}
                  category={complaint.category || complaint.ai_analysis?.category || 'pothole'}
                  address={complaint.address}
                  description={complaint.description}
                  resolutionNotes={complaint.resolutionNotes}
                  resolvedAt={complaint.resolvedAt || complaint.updatedAt}
                  resolvedBy={complaint.resolvedBy}
                  trackingId={complaint.trackingId}
                  onUploadProof={handleUploadResolutionProof}
                  isAdmin={isAdmin}
                  onRequireAdminLogin={() => setShowAdminLoginModal(true)}
                />
              )}

              {/* Disputed & Re-opened Escalation Alert Banner (shown after citizen re-opens an issue) */}
              {complaint.disputed && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-lg p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-rose-600 text-white rounded shadow-xs shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-rose-950 dark:text-rose-200">
                            Re-opened by Citizen (Disputed Resolution)
                          </h4>
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white uppercase tracking-wider">
                            +15 Priority Boost Escalated
                          </span>
                          {complaint.reopenedCount > 0 && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-200 text-amber-900">
                              Re-opened #{complaint.reopenedCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                          Anti-Fake Resolution Audit triggered — Ticket returned to In-Progress queue for immediate municipal re-inspection.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-3.5 border border-rose-200 dark:border-rose-900 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-2">
                    <div>
                      <span className="font-bold text-rose-900 dark:text-rose-300">Citizen Dispute Statement: </span>
                      <span>{complaint.disputeReason}</span>
                    </div>
                    {complaint.disputeImage && (
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                          Citizen Re-inspection Proof Photo:
                        </span>
                        <img
                          src={complaint.disputeImage}
                          alt="Dispute proof"
                          className="h-28 w-44 object-cover rounded border border-rose-200 shadow-2xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Citizen Dispute & "Re-open Issue" (Anti-Fake Resolution) Panel */}
              {complaint.status === 'resolved' && (
                <div className="bg-[#091a38] text-white rounded-lg p-6 border border-slate-800 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>48-Hour Citizen Anti-Fake Resolution Audit Window</span>
                      </div>
                      <h3 className="text-lg font-bold text-white pt-1">
                        Are you satisfied with this on-site municipal resolution?
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                        Inspect the Before vs. After comparison above. If the field work was incomplete or falsely marked resolved, you can dispute and re-open this ticket immediately.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {complaint.citizenVerified ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-sm font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Verified by Citizen ({complaint.citizenRating || 5}★)</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowRatingForm(!showRatingForm);
                            setShowDisputeForm(false);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Satisfied (Rate 1–5 ★)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowDisputeForm(!showDisputeForm);
                          setShowRatingForm(false);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Not Fixed Properly — Re-open Issue</span>
                      </button>
                    </div>
                  </div>

                  {/* Star Rating Form Drawer */}
                  {showRatingForm && (
                    <form
                      onSubmit={handleVerifyResolution}
                      className="mt-5 pt-5 border-t border-white/15 bg-white/5 rounded-xl p-4 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-sm font-bold text-emerald-300">
                          Rate Municipal Field Resolution Quality:
                        </span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setCitizenRating(star)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                star <= citizenRating
                                  ? 'text-amber-400 scale-110'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                          <span className="ml-2 text-xs font-mono font-bold text-amber-300">
                            {citizenRating} / 5 Stars
                          </span>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={citizenFeedback}
                        onChange={(e) => setCitizenFeedback(e.target.value)}
                        placeholder="Optional comment (e.g., Road surface leveled smoothly near DY Patil Gate)..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-400"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowRatingForm(false)}
                          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={verifySubmitting}
                          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer"
                        >
                          {verifySubmitting ? 'Saving...' : 'Confirm & Verify Fix ✓'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Citizen Dispute & Re-open Form Drawer */}
                  {showDisputeForm && (
                    <form
                      onSubmit={handleReopenIssue}
                      className="mt-5 pt-5 border-t border-white/15 bg-rose-950/40 rounded-xl p-4 sm:p-5 border border-rose-500/30 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-rose-200 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>Dispute Fake / Incomplete Resolution & Re-open Ticket</span>
                          </h4>
                          <p className="text-xs text-rose-200/80 mt-0.5">
                            Re-opening this issue automatically boosts its Municipal Priority Score by <strong>+15 points</strong> and flags the Zonal Commissioner.
                          </p>
                        </div>
                      </div>

                      {/* Quick Dispute Reason Chips */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Marked resolved without visiting site',
                          'Temporary patchwork already came off',
                          'Garbage / debris still lying at spot',
                          'Water leakage / blockage still active'
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setDisputeReason(preset)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                              disputeReason === preset
                                ? 'bg-rose-600 text-white border-rose-400 font-bold'
                                : 'bg-slate-900/70 text-slate-300 border-slate-700 hover:border-rose-400'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        required
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Describe why the resolution is unsatisfactory or incomplete..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 cursor-pointer transition">
                            <Camera className="w-3.5 h-3.5 text-rose-400" />
                            <span>Attach Current Site Photo (Optional)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleDisputePhotoUpload}
                              className="hidden"
                            />
                          </label>
                          {disputePhotoPreview && (
                            <img
                              src={disputePhotoPreview}
                              alt="Dispute preview"
                              className="h-9 w-12 object-cover rounded border border-rose-400"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setShowDisputeForm(false)}
                            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={disputeSubmitting}
                            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>
                              {disputeSubmitting
                                ? 'Re-opening & Escalating...'
                                : 'Re-open Issue & Boost Priority (+15)'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Status Timeline Progression */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Complaint Resolution Timeline
                  </h3>
                  <span className="text-xs text-slate-400">
                    Step {Math.min(currentStep + 1, TIMELINE_STEPS.length)} of {TIMELINE_STEPS.length}
                  </span>
                </div>

                {complaint.status === 'rejected' ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Complaint Marked as Rejected</p>
                      <p className="text-xs text-rose-700 mt-0.5">
                        This submission does not meet verification requirements or is duplicate/out of municipal jurisdiction.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
                    <div
                      className="hidden sm:block absolute top-1/2 left-0 h-1 bg-[#0f2b5c] dark:bg-blue-500 -translate-y-1/2 z-0 transition-all duration-700"
                      style={{
                        width: `${(Math.min(currentStep, TIMELINE_STEPS.length - 1) / (TIMELINE_STEPS.length - 1)) * 100}%`
                      }}
                    />

                    {/* Timeline Steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const isCompleted = currentStep > idx || (currentStep === TIMELINE_STEPS.length - 1 && idx === TIMELINE_STEPS.length - 1);
                        const isCurrent = currentStep === idx && currentStep !== TIMELINE_STEPS.length - 1;

                        return (
                          <div
                            key={step.key}
                            className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center p-2 rounded-lg sm:p-0 transition-all"
                          >
                            {/* Circle / Icon Indicator */}
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-xs shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrent
                                  ? 'bg-[#0f2b5c] dark:bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/60'
                                  : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              ) : isCurrent ? (
                                <Clock className="w-4 h-4 text-white animate-spin" />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>

                            {/* Label & Description */}
                            <div className="flex-1 sm:flex-initial">
                              <p
                                className={`text-sm font-semibold ${
                                  isCompleted
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : isCurrent
                                    ? 'text-[#0f2b5c] dark:text-blue-400'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 sm:max-w-[120px] sm:mx-auto">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Actions Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 px-6 py-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Have additional information? Reference ID <strong className="font-mono text-slate-700 dark:text-slate-300">{complaint.trackingId}</strong> with Pimpri Municipal Helpdesk.</span>
              <button
                onClick={() => {
                  setComplaint(null);
                  setInputVal('');
                  navigate('/track');
                }}
                className="text-[#0f2b5c] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                Track Another Grievance
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Admin Authorization Required Modal */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-slate-900 dark:text-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdminLoginModal(false);
                  setLoginModalError('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-2">
                <Lock className="w-3 h-3" />
                <span>Admin Authorization Required</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Municipal Stage Control Restricted
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                As a normal citizen, you can track this complaint and submit re-open disputes. Modifying complaint stages in the <strong>Live Status Simulator</strong> is strictly restricted to the designated municipal administrator (<strong>Shailesh Bhabad</strong>).
              </p>
            </div>

            {loginModalError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{loginModalError}</span>
              </div>
            )}

            {/* Quick Admin Sign-In Form */}
            <form onSubmit={handleModalAdminLogin} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Administrator ID / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={adminModalIdentifier}
                    onChange={(e) => setAdminModalIdentifier(e.target.value)}
                    placeholder="admin@civiclens.in or Shailesh Bhabad"
                    className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-[#0f2b5c] outline-none font-medium text-slate-900 dark:text-slate-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Administrator Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={adminModalPassword}
                    onChange={(e) => setAdminModalPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-[#0f2b5c] outline-none font-medium text-slate-900 dark:text-slate-100 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="submit"
                  disabled={adminModalSubmitting}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#0f2b5c] hover:bg-[#091a38] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  {adminModalSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sign In as Admin</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLoginModal(false);
                    setLoginModalError('');
                  }}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition cursor-pointer"
                >
                  Stay as Citizen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackComplaint;
