import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Building2,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  getStatusColor,
  getSeverityColor,
  getUrgencyColor,
  getCategoryLabel,
  getStatusLabel
} from '../../utils/helpers';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(
    'Department Work Queue',
    'Manage, review, and remediate assigned municipal incidents for PCMC Ward 20.'
  );

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Department normalization
  const userDepartment = useMemo(() => {
    const raw = user?.department || 'Roads';
    if (raw.toLowerCase().includes('road') || raw.toLowerCase().includes('pwd')) return 'Roads';
    if (raw.toLowerCase().includes('sanit') || raw.toLowerCase().includes('waste')) return 'Sanitation';
    if (raw.toLowerCase().includes('water')) return 'Water Supply';
    if (raw.toLowerCase().includes('electr')) return 'Electrical';
    return raw;
  }, [user]);

  const fetchDepartmentIncidents = async () => {
    try {
      setLoading(true);
      const allIncidents = await api.getIncidents({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery
      });

      // Filter by department
      let deptIncidents = (allIncidents || []).filter((inc) => {
        if (!inc.department) return true;
        if (user?.role === 'admin') return true;
        return inc.department.toLowerCase().includes(userDepartment.toLowerCase()) ||
          userDepartment.toLowerCase().includes(inc.department.toLowerCase());
      });

      if (deptIncidents.length === 0 && (allIncidents || []).length > 0 && user?.role !== 'admin') {
        deptIncidents = (allIncidents || []).filter(
          (inc) => inc.category === 'pothole' || inc.department === 'Roads'
        );
      }

      if (severityFilter !== 'all') {
        deptIncidents = deptIncidents.filter(
          (inc) => inc.severity?.toLowerCase() === severityFilter.toLowerCase()
        );
      }

      setIncidents(deptIncidents);
    } catch (err) {
      console.error('Error fetching authority incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentIncidents();
  }, [userDepartment, categoryFilter, severityFilter, statusFilter, searchQuery]);

  const openCount = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed'
  ).length;

  const resolvedCount = incidents.filter(
    (i) => i.status === 'resolved' || i.status === 'closed'
  ).length;

  const statCards = [
    {
      title: 'Department Open Incidents',
      value: openCount,
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      subtitle: 'Active pending remediation'
    },
    {
      title: 'Resolved by Department',
      value: resolvedCount,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
      subtitle: 'Successfully closed items'
    },
    {
      title: 'Avg Resolution Time',
      value: '2.4 days',
      icon: Clock,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      subtitle: 'Department turnaround SLA'
    }
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f2b5c] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded border border-blue-200 dark:border-blue-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {user?.department || `${userDepartment} Department`}
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Field Authority Console</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome, {user?.name || 'Department Officer'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Assigned municipal queue for {user?.department || userDepartment}. Prioritized by citizen urgency.
          </p>
        </div>
        <button
          onClick={fetchDepartmentIncidents}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Queue
        </button>
      </div>

      {/* Stats Row: 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
            Filter Department Queue
          </div>
          {(categoryFilter !== 'all' ||
            severityFilter !== 'all' ||
            statusFilter !== 'all' ||
            searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setSeverityFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-[#0f2b5c] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search location, ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 min-h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="w-full px-3 py-2 min-h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] transition"
            >
              <option value="all">All Categories</option>
              <option value="pothole">Pothole</option>
              <option value="garbage">Garbage</option>
              <option value="drainage">Drainage</option>
              <option value="streetlight">Streetlight</option>
              <option value="water_leak">Water Leak</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Severity Dropdown */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              aria-label="Filter by severity"
              className="w-full px-3 py-2 min-h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] transition"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="w-full px-3 py-2 min-h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] transition"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Department Incidents ({incidents.length})
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">Sorted by Priority Score</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#0f2b5c] dark:text-blue-400 mb-2" />
            <p className="text-xs">Loading department queue...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500">
            <ShieldAlert className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching incidents in department queue</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              All complaints are currently cleared or pending assignment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Urgency</th>
                  <th className="px-5 py-3.5">Address</th>
                  <th className="px-5 py-3.5">Ward</th>
                  <th className="px-5 py-3.5 text-center">Reports</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {incidents.map((incident) => {
                  const severityClass = getSeverityColor(incident.severity);
                  const urgencyClass = getUrgencyColor(incident.urgency);
                  const statusClass = getStatusColor(incident.status);

                  return (
                    <tr
                      key={incident._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded font-black text-xs ${
                            incident.priorityScore >= 80
                              ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                              : incident.priorityScore >= 60
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {incident.priorityScore}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white text-xs">
                        {getCategoryLabel(incident.category)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize border ${severityClass}`}
                        >
                          {incident.severity}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${urgencyClass}`}
                        >
                          {incident.urgency?.replace(/_/g, ' ') || 'routine'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs max-w-[220px] truncate text-slate-800 dark:text-slate-200" title={incident.address}>
                        {incident.address}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {incident.ward || 'Ward 20'}
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700">
                          {incident.reportCount || 1}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusClass}`}
                        >
                          {getStatusLabel(incident.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          to={`/authority/incidents/${incident._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs transition"
                        >
                          Remediate
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
