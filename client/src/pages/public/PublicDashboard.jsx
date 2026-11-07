import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  Users,
  ThumbsUp,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { api } from '../../services/api';
import {
  getStatusColor,
  getStatusLabel,
  getSeverityColor,
  getCategoryLabel
} from '../../utils/helpers';
import HotspotRadar from '../../components/HotspotRadar';
import IncidentHeatmap from '../../components/IncidentHeatmap';
import { useLanguage } from '../../context/LanguageContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { exportIncidentsToCSV, exportWardSummaryToCSV, triggerPrintReport } from '../../utils/exportUtils';

const PublicDashboard = () => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentTitle(
    language === 'mr' ? 'नागरी पारदर्शकता फलक' : 'Civic Transparency Dashboard',
    'PCMC Ward 20 real-time civic transparency, resolution velocity, and department SLA tracking.'
  );

  // Upvoting state
  const [upvotedIds, setUpvotedIds] = useState([]);
  const [upvotingId, setUpvotingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = async (skipCache = false) => {
    try {
      setLoading(true);
      const [statsData, incidentsData] = await Promise.all([
        api.getDashboardStats({ skipCache }),
        api.getIncidents({}, { skipCache })
      ]);
      setStats(statsData);
      setIncidents(incidentsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpvote = async (incidentId) => {
    if (upvotedIds.includes(incidentId) || upvotingId) return;

    setUpvotingId(incidentId);
    try {
      // Optimistic update
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc._id === incidentId) {
            return {
              ...inc,
              reportCount: (inc.reportCount || 1) + 1,
              priorityScore: Math.min(99, (inc.priorityScore || 50) + 3)
            };
          }
          return inc;
        })
      );

      setUpvotedIds((prev) => [...prev, incidentId]);
      await api.upvoteIncident(incidentId);

      setToastMessage({
        id: incidentId,
        text: t?.upvotedSuccess || '+1 recorded! Incident priority escalated for municipal dispatch.'
      });
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.warn('Upvote error:', err);
      setToastMessage({
        id: incidentId,
        isError: true,
        text: err.message || 'Failed to record endorsement. Please try again.'
      });
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setUpvotingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#0b1322] text-slate-900 dark:text-slate-100 transition-colors">
        <RefreshCw className="w-10 h-10 text-[#0f2b5c] dark:text-blue-400 animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {language === 'mr' ? 'नागरी पारदर्शकता डेटा लोड होत आहे' : 'Loading Civic Transparency Data'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {language === 'mr'
            ? 'पीसीएमसी सार्वजनिक रेकॉर्ड आणि विभागांची माहिती संकलित होत आहे...'
            : 'Aggregating public municipal records & performance metrics...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-lg border border-rose-200 dark:border-rose-900 text-center shadow-xs">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unable to Load Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#0f2b5c] hover:bg-[#091a38] text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Top 5 incidents by priority score
  const topIncidents = incidents.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1322] text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-150">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title Section & Ward Export Buttons */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0f2b5c] dark:text-blue-400 text-xs font-semibold mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>{t?.footerPCMC || 'Pimpri-Chinchwad Municipal Corporation (PCMC)'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t?.dashboardTitle || 'City-Wide Civic Transparency Dashboard'}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              {t?.dashboardSub || 'Open civic governance data powered by AI diagnostics, geo-clustering, and accountable departmental resolution tracking.'}
            </p>
          </div>

          {/* Action Export & Refresh Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0f2b5c] dark:text-blue-400 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => exportIncidentsToCSV(incidents, 'PCMC_Ward_Grievance_Audit.csv')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-11 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
              <span>{t?.exportCsv || 'Export CSV Report'}</span>
            </button>
            <button
              type="button"
              onClick={triggerPrintReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-11 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t?.exportPdf || 'Print Ward Audit PDF'}</span>
            </button>
          </div>
        </div>

        {/* Global Toast when Citizen Upvotes */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-lg bg-slate-900 text-white shadow-xl border border-slate-700 flex items-center gap-3 text-xs animate-bounce">
            <Flame className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-semibold">{toastMessage.text}</span>
          </div>
        )}

        {/* Section 1: Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Complaints */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t?.complaintsFiled || 'Total Complaints'}
              </span>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
              {stats?.totalComplaints ? stats.totalComplaints.toLocaleString() : '0'}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-[#0f2b5c] dark:text-blue-400 font-semibold">{t?.pimpriWard || 'PCMC Ward 20'}</span> &bull; All Submissions
            </div>
          </div>

          {/* Card 2: Open Incidents */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t?.openIncidents || 'Open Incidents'}
              </span>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
              {stats?.openIncidents ? stats.openIncidents.toLocaleString() : '0'}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{t?.activeInQueues || 'Active'}</span> in field queues
            </div>
          </div>

          {/* Card 3: Resolved This Month */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t?.resolvedIssues || 'Resolved Issues'}
              </span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
              {stats?.resolvedThisMonth ? stats.resolvedThisMonth.toLocaleString() : '0'}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t?.completedPhoto || 'Photo verified'}</span> resolutions
            </div>
          </div>

          {/* Card 4: Avg Resolution Time */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t?.avgResolutionTime || 'Avg Resolution Time'}
              </span>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
              {stats?.avgResolutionDays ? `${stats.avgResolutionDays} Days` : '0 Days'}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-[#0f2b5c] dark:text-blue-400 font-semibold">{t?.slaTag || 'Direct SLA'}</span> response speed
            </div>
          </div>
        </div>

        {/* Section 1.4: Interactive Geospatial Heatmap & Cluster Map */}
        <IncidentHeatmap
          incidents={incidents}
          isAdminView={false}
          onUpvote={handleUpvote}
          upvotedIds={upvotedIds}
        />

        {/* Section 1.5: Pimpri-Chinchwad Locality Hotspot Radar */}
        <HotspotRadar radius={400} />

        {/* Section 2: Two Column Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Chart 1: Categories Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {language === 'mr' ? 'तक्रारींचे वर्गीकरण' : 'Complaints by Category'}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                  All Time
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Distribution of citizen reported issues across municipal sectors
              </p>
            </div>

            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.complaintsByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats?.complaintsByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#0f2b5c'} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [`${value} complaints`, name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Resolution & Submission Trend */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {language === 'mr' ? '७ दिवसांचा कल' : '7-Day Resolution Velocity'}
                </h3>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                  Live Velocity
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Incoming grievance volume vs. verified resolved municipal tasks
              </p>
            </div>

            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.complaintsTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium capitalize">
                        {value === 'complaints' ? 'Reported' : 'Resolved'}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="complaints"
                    stroke="#0f2b5c"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#0f2b5c' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#047857"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#047857' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section 3: Department Performance Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Departmental SLA Efficiency
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Operational speed and resolution rates across civic divisions
              </p>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Open Incidents</th>
                  <th className="py-3 px-6">Resolved Issues</th>
                  <th className="py-3 px-6">Avg Resolution (Days)</th>
                  <th className="py-3 px-6">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(stats?.departmentPerformance || []).map((dept, idx) => {
                  const total = (dept.open || 0) + (dept.resolved || 0);
                  const resolutionRate = total > 0 ? Math.round((dept.resolved / total) * 100) : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0f2b5c] dark:bg-blue-400"></span>
                        {dept.department}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">
                        <span className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800">
                          {dept.open} active
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">
                        <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                          {dept.resolved} done
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.avgDays}</span> days
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full"
                              style={{ width: `${resolutionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono w-8">
                            {resolutionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Recent Critical & High Priority Incidents with Citizen Upvoting */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>{t?.topIncidentsTitle || 'Top Priority Incidents (AI Triaged)'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Ranked by AI priority scoring. Click <span className="text-[#0f2b5c] dark:text-blue-400 font-semibold">{t?.upvoteBtn || '+1 Affects Me Too'}</span> if this grievance impacts your neighborhood.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded">
              DY Patil Pimpri Area
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topIncidents.map((incident) => {
              const isUpvoted = upvotedIds.includes(incident._id);
              const isProcessing = upvotingId === incident._id;

              return (
                <div
                  key={incident._id}
                  className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Priority Score badge */}
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0f2b5c] dark:text-blue-400 rounded-lg flex flex-col items-center justify-center min-w-[54px] shrink-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Score</span>
                      <span className="text-lg font-bold font-mono">{incident.priorityScore}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {getCategoryLabel(incident.category)}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${getSeverityColor(
                            incident.severity
                          )}`}
                        >
                          {incident.severity}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getStatusColor(
                            incident.status
                          )}`}
                        >
                          {getStatusLabel(incident.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 text-sm font-medium pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{incident.address}</span>
                        {incident.ward && (
                          <span className="text-xs text-slate-400 font-normal">({incident.ward})</span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <strong className="text-slate-800 dark:text-slate-200">{incident.reportCount || 1}</strong> citizens impacted
                        </span>
                        <span>&bull;</span>
                        <span>Department: <strong className="text-slate-700 dark:text-slate-300">{incident.department}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* CITIZEN UPVOTING / +1 ME TOO ACTION */}
                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpvote(incident._id)}
                      disabled={isUpvoted || isProcessing}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-11 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                        isUpvoted
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'text-emerald-600 fill-emerald-600' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{isUpvoted ? 'Upvoted (+1)' : (t?.upvoteBtn || '+1 Affects Me Too')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {topIncidents.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No recent incidents available.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PublicDashboard;
