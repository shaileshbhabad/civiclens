import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  getSeverityColor,
  getCategoryLabel
} from '../../utils/helpers';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  Copy,
  Check,
  MapPin,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const CitizenDashboard = () => {
  useDocumentTitle(
    'Citizen Grievance Activity Hub',
    'Track your reported civic grievances, review AI validation, and monitor department remediation.'
  );

  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await api.getMyComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load citizen complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'resolved'
        ? c.status === 'resolved'
        : filterStatus === 'in_progress'
        ? ['submitted', 'analysing', 'verified', 'assigned', 'in_progress', 'open'].includes(c.status)
        : c.status === filterStatus;

    const matchesSearch =
      searchQuery.trim() === '' ||
      c.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) =>
    ['submitted', 'analysing', 'verified', 'assigned', 'in_progress', 'open'].includes(c.status)
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-900 dark:text-slate-100">
      {/* Official Government Header Banner */}
      <div className="bg-[#091a38] text-white rounded-lg p-6 sm:p-7 border border-slate-700 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-950/80 border border-blue-800/80 rounded text-[11px] font-semibold uppercase tracking-wider text-blue-300">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>PCMC Citizen Grievance Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Citizen Activity Hub • {user ? user.name : 'Resident of PCMC Ward 20'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Track filed grievances across your ward, verify automated AI triage, and inspect department remediation updates in real time.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => loadComplaints()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#0f2b5c] hover:bg-slate-100 font-semibold rounded-lg text-xs shadow-xs transition cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-[#0f2b5c]" />
              <span>File New Grievance</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0f2b5c] dark:text-blue-300 border border-blue-200 dark:border-blue-900 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Complaints Filed</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{inProgressCount}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">In Resolution / Verification</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{resolvedCount}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Successfully Resolved</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#0f2b5c] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({complaints.length})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'in_progress'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'resolved'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, street or category..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c]"
          />
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-2 border-[#0f2b5c] dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Loading your reports...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-10 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No complaints found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            {searchQuery
              ? 'No reports matched your search keyword. Try a different term.'
              : 'You have not submitted any complaints matching this filter yet.'}
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f2b5c] text-white font-medium rounded-lg text-xs hover:bg-[#091a38] transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File an Issue Now</span>
          </Link>
        </div>
      ) : (
        <div>
          {/* Desktop Table View (sm and above) */}
          <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th scope="col" className="px-4 py-3">Tracking ID</th>
                    <th scope="col" className="px-4 py-3">Address / Landmark</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Ward</th>
                    <th scope="col" className="px-4 py-3">Target SLA</th>
                    <th scope="col" className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredComplaints.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#0f2b5c] dark:text-blue-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{item.trackingId}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.trackingId)}
                            title="Copy ID"
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {copiedId === item.trackingId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{item.address || 'Pimpri-Chinchwad, Pune'}</p>
                        <span className="text-[11px] text-slate-400 capitalize">{getCategoryLabel(item.ai_analysis?.category || item.category)}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded font-semibold border ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {item.ward || 'Ward 20 (Sant Tukaram)'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        {item.status === 'resolved' ? 'Completed' : (item.ai_analysis?.urgency ? item.ai_analysis.urgency.replace('_', ' ') : 'Within 48h')}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Link
                          to={`/track/${item.trackingId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white rounded-md text-xs font-semibold shadow-2xs transition"
                        >
                          <span>Track</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Cards View (< 640px) */}
          <div className="block sm:hidden space-y-3">
            {filteredComplaints.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-2.5 text-xs"
              >
                {/* Labeled Row: Tracking ID */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Tracking ID</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[#0f2b5c] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                    <span>{item.trackingId}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.trackingId)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer min-h-6 min-w-6 flex items-center justify-center"
                    >
                      {copiedId === item.trackingId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Labeled Row: Address */}
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 shrink-0">Address</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-right leading-tight break-words">
                    {item.address || 'Dr. D. Y. Patil College Campus, Pimpri'}
                  </p>
                </div>

                {/* Labeled Row: Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Status</span>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded font-semibold border ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                {/* Labeled Row: Ward */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Ward</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {item.ward || 'Ward 20 (Sant Tukaram Nagar)'}
                  </span>
                </div>

                {/* Labeled Row: SLA */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Target SLA</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.status === 'resolved' ? 'Resolved' : (item.ai_analysis?.urgency ? item.ai_analysis.urgency.replace('_', ' ') : 'Within 48h')}
                  </span>
                </div>

                {/* Labeled Row: Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/track/${item.trackingId}`}
                    className="w-full min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white font-semibold text-sm rounded-lg shadow-xs transition active:scale-98"
                  >
                    <span>Track Grievance & Live Proof</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
