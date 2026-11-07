import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  PieChart as PieIcon,
  TrendingUp,
  BarChart3,
  Timer,
  Loader2,
  Download,
  Printer
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../../services/api';
import { exportWardSummaryToCSV, triggerPrintReport } from '../../utils/exportUtils';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AdminAnalytics = () => {
  useDocumentTitle(
    'Municipal Analytics & SLA Audits',
    'Operational performance metrics, department throughput, and resolution velocity.'
  );

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#0f2b5c] dark:text-blue-400 mb-2" />
        <p className="text-sm">Compiling civic analytics and department reports...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Complaints',
      value: stats?.totalComplaints?.toLocaleString() || '0',
      icon: FileText,
      color: 'text-[#0f2b5c] dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      subtitle: 'All-time platform submissions'
    },
    {
      title: 'Open Incidents',
      value: stats?.openIncidents?.toLocaleString() || '0',
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      subtitle: 'Active pending remediation'
    },
    {
      title: 'Resolved This Month',
      value: stats?.resolvedThisMonth?.toLocaleString() || '0',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
      subtitle: 'Target SLA completion'
    },
    {
      title: 'Avg Resolution Days',
      value: stats?.avgResolutionDays ? `${stats.avgResolutionDays}d` : '0d',
      icon: Clock,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      subtitle: 'City turnaround average'
    }
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Municipal Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep-dive operational metrics, department throughput, and civic resolution velocity for PCMC Ward 20.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportWardSummaryToCSV(stats, 'PCMC_Ward_Analytics_Report.csv')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-11 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#0f2b5c] dark:text-blue-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={triggerPrintReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-11 bg-[#0f2b5c] hover:bg-[#091a38] text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF Audit</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className={`p-2 rounded ${card.bgColor} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Category Breakdown (PieChart) & Trend (LineChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Complaints by Category (PieChart) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
              Complaints by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribution across primary civic sectors</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.complaintsByCategory || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {(stats?.complaintsByCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#0f2b5c'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#091a38',
                    borderRadius: '6px',
                    color: '#fff',
                    border: '1px solid #334155',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints Trend (LineChart) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
              7-Day Submissions vs Resolutions Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daily volume of incoming complaints vs cleared items</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats?.complaintsTrend || []}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#64748B', opacity: 0.3 }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#64748B', opacity: 0.3 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#091a38',
                    borderRadius: '6px',
                    color: '#fff',
                    border: '1px solid #334155',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="complaints"
                  name="Incoming Complaints"
                  stroke="#0f2b5c"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0f2b5c' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved Incidents"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10B981' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Department Performance & Resolution Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance (Grouped BarChart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
              Department Workload: Open vs Resolved
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comparison of active backlog versus resolved incidents</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.departmentPerformance || []}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#64748B', opacity: 0.3 }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#64748B', opacity: 0.3 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#091a38',
                    borderRadius: '6px',
                    color: '#fff',
                    border: '1px solid #334155',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar dataKey="open" name="Open Incidents" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved Incidents" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Time by Department (BarChart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
              Average Resolution Days by Department
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Average turnaround time (days) to achieve resolution</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.departmentPerformance || []}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#64748B', opacity: 0.3 }}
                />
                <YAxis
                  unit="d"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#64748B', opacity: 0.3 }}
                />
                <Tooltip
                  formatter={(val) => [`${val} days`, 'Avg Resolution Time']}
                  contentStyle={{
                    backgroundColor: '#091a38',
                    borderRadius: '6px',
                    color: '#fff',
                    border: '1px solid #334155',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="avgDays" name="Avg Days" fill="#0f2b5c" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
