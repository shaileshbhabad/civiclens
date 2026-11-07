import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  BarChart2,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api } from '../../services/api';
import {
  getStatusColor,
  getSeverityColor,
  getCategoryLabel,
  getStatusLabel
} from '../../utils/helpers';
import HotspotRadar from '../../components/HotspotRadar';
import IncidentHeatmap from '../../components/IncidentHeatmap';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AdminDashboard = () => {
  useDocumentTitle(
    'Admin Command Center',
    'PCMC Ward 20 administrative dispatch, SLA tracking, and priority triage.'
  );

  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, incidentsData] = await Promise.all([
          api.getDashboardStats(),
          api.getIncidents()
        ]);
        setStats(statsData);
        setIncidents(incidentsData || []);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#0f2b5c] dark:text-blue-400 mb-2" />
        <p className="text-sm">Loading dashboard metrics...</p>
      </div>
    );
  }

  const topPriorityIncidents = incidents.slice(0, 5);

  const statCards = [
    {
      title: 'Total Complaints',
      value: stats?.totalComplaints?.toLocaleString() || '0',
      icon: FileText,
      color: 'text-[#0f2b5c] dark:text-blue-400',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      subtitle: 'City-wide citizen submissions'
    },
    {
      title: 'Open Incidents',
      value: stats?.openIncidents?.toLocaleString() || '0',
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      subtitle: 'Requiring action or in-progress'
    },
    {
      title: 'Resolved This Month',
      value: stats?.resolvedThisMonth?.toLocaleString() || '0',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      subtitle: 'Within target municipal SLA'
    },
    {
      title: 'Avg Resolution Days',
      value: stats?.avgResolutionDays ? `${stats.avgResolutionDays}d` : '0d',
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      subtitle: 'Turnaround across departments'
    }
  ];

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time civic intelligence, incident prioritization, and municipal department performance.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#0f2b5c] dark:text-blue-400" />
                Complaints by Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribution across primary civic sectors</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.complaintsByCategory || []}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {(stats?.complaintsByCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#0f2b5c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Trend Line Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0f2b5c] dark:text-blue-400" />
                7-Day Activity Trend
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reported vs resolved complaints</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats?.complaintsTrend || []}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="complaints"
                  name="Reported"
                  stroke="#0f2b5c"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0f2b5c' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
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

      {/* Interactive Geospatial Heatmap & Cluster Map */}
      <IncidentHeatmap incidents={incidents} isAdminView={true} />

      {/* Locality Hotspot Radar */}
      <HotspotRadar defaultRadius={350} />

      {/* Priority Incidents Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Highest Priority Incidents
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Urgent civic issues scored by AI severity, frequency, and community risk
            </p>
          </div>
          <Link
            to="/admin/incidents"
            className="text-xs font-semibold text-[#0f2b5c] dark:text-blue-400 hover:underline flex items-center gap-1 transition"
          >
            View All Incidents
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Location / Address</th>
                <th className="px-6 py-3.5 text-center">Reports</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topPriorityIncidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400 text-sm">
                    No active priority incidents found.
                  </td>
                </tr>
              ) : (
                topPriorityIncidents.map((incident) => {
                  const severityClass = getSeverityColor(incident.severity);
                  const statusClass = getStatusColor(incident.status);

                  return (
                    <tr key={incident._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold text-sm ${
                              incident.priorityScore >= 80
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                : incident.priorityScore >= 60
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            {incident.priorityScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                        {getCategoryLabel(incident.category)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold capitalize border ${severityClass}`}
                        >
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                        {incident.address}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700">
                          {incident.reportCount || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${statusClass}`}
                        >
                          {getStatusLabel(incident.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/incidents/${incident._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs transition"
                        >
                          View
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
