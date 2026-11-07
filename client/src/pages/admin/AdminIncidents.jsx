import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  MapPin,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  Download,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { exportIncidentsToCSV, triggerPrintReport } from '../../utils/exportUtils';
import {
  getStatusColor,
  getSeverityColor,
  getUrgencyColor,
  getCategoryLabel,
  getStatusLabel
} from '../../utils/helpers';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AdminIncidents = () => {
  useDocumentTitle(
    'Municipal Incident Queue',
    'Manage, filter, and dispatch aggregated civic issue clusters across PCMC Ward 20.'
  );

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents({
        category: categoryFilter,
        status: statusFilter,
        search: searchQuery
      });

      let filtered = data || [];
      if (severityFilter !== 'all') {
        filtered = filtered.filter(
          (inc) => inc.severity?.toLowerCase() === severityFilter.toLowerCase()
        );
      }

      setIncidents(filtered);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [categoryFilter, statusFilter, severityFilter, searchQuery]);

  const resetFilters = () => {
    setCategoryFilter('all');
    setSeverityFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Municipal Incident Queue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Prioritized civic issue clusters aggregated from automated citizen reports across PCMC Ward 20.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportIncidentsToCSV(incidents, 'PCMC_Filtered_Incidents.csv')}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-11 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#0f2b5c] dark:text-blue-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={triggerPrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-11 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Print PDF</span>
          </button>
          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-11 bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
            <span>Department Filters & Search</span>
          </div>
          {(categoryFilter !== 'all' ||
            severityFilter !== 'all' ||
            statusFilter !== 'all' ||
            searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#0f2b5c] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search address, ward, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 min-h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-[#0f2b5c] outline-none transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="w-full px-3 py-2 min-h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-[#0f2b5c] outline-none transition"
            >
              <option value="all">All Categories</option>
              <option value="pothole">Pothole & Road</option>
              <option value="garbage">Garbage & Waste</option>
              <option value="drainage">Drainage & Sewage</option>
              <option value="streetlight">Streetlight & Electrical</option>
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
              className="w-full px-3 py-2 min-h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-[#0f2b5c] outline-none transition"
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
              className="w-full px-3 py-2 min-h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-[#0f2b5c] outline-none transition"
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

      {/* Incidents Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Showing {incidents.length} Prioritized Incident{incidents.length === 1 ? '' : 's'}
          </span>
          <span className="text-xs text-slate-400">Sorted by Priority Score (Highest First)</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#0f2b5c] dark:text-blue-400 mb-2" />
            <p className="text-xs">Loading incident queue...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShieldAlert className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No incidents found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Urgency</th>
                  <th className="px-5 py-3.5">Address</th>
                  <th className="px-5 py-3.5">Ward</th>
                  <th className="px-5 py-3.5 text-center">Reports</th>
                  <th className="px-5 py-3.5">Assigned To</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {incidents.map((incident, index) => {
                  const severityClass = getSeverityColor(incident.severity);
                  const urgencyClass = getUrgencyColor(incident.urgency);
                  const statusClass = getStatusColor(incident.status);

                  return (
                    <tr
                      key={incident._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Priority score */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold text-xs ${
                            incident.priorityScore >= 80
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : incident.priorityScore >= 60
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {incident.priorityScore}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white text-xs">
                        {getCategoryLabel(incident.category)}
                      </td>

                      {/* Severity badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize border ${severityClass}`}
                        >
                          {incident.severity}
                        </span>
                      </td>

                      {/* Urgency badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${urgencyClass}`}
                        >
                          {incident.urgency?.replace(/_/g, ' ') || 'routine'}
                        </span>
                      </td>

                      {/* Address */}
                      <td className="px-5 py-4 text-xs max-w-[200px] truncate text-slate-800 dark:text-slate-200" title={incident.address}>
                        {incident.address}
                      </td>

                      {/* Ward */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {incident.ward || 'N/A'}
                      </td>

                      {/* Report Count */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700">
                          {incident.reportCount || 1}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs">
                        {incident.assignedTo ? (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="truncate max-w-[110px]">{incident.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold border ${statusClass}`}
                        >
                          {getStatusLabel(incident.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/incidents/${incident._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs transition"
                        >
                          View
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

export default AdminIncidents;
