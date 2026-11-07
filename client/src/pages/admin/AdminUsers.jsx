import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Building2,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Loader2,
  Search,
  ShieldCheck,
  AlertCircle,
  Check,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AdminUsers = () => {
  useDocumentTitle(
    'Authority Directory',
    'Manage municipal field department officers, assigned zones, and jurisdictional access.'
  );

  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Add Officer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    email: '',
    department: 'Roads',
    zone: 'Zone B (Pimpri)'
  });

  // Edit Officer Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: '',
    name: '',
    email: '',
    department: 'Roads',
    zone: 'Zone B (Pimpri)',
    isActive: true,
    role: 'authority'
  });

  const fetchAuthorities = async () => {
    try {
      setLoading(true);
      const data = await api.getAuthorities();
      setAuthorities(data || []);
    } catch (err) {
      console.error('Error fetching authorities:', err);
      setFeedback({ type: 'error', message: 'Failed to load authorities from database.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorities();
  }, []);

  // Auto-dismiss feedback toast
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Create Officer Handler (Direct MongoDB Persistence)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newOfficer.name.trim() || !newOfficer.email.trim()) return;

    setActionLoading(true);
    try {
      const created = await api.createAuthority(newOfficer);
      setAuthorities([created, ...authorities]);
      setFeedback({
        type: 'success',
        message: `Officer "${newOfficer.name}" registered in database successfully.`
      });
      setShowAddModal(false);
      setNewOfficer({ name: '', email: '', department: 'Roads', zone: 'Zone B (Pimpri)' });
    } catch (err) {
      console.error('Add officer error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to register officer.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (officer) => {
    setEditFormData({
      _id: officer._id,
      name: officer.name || '',
      email: officer.email || '',
      department: officer.department || 'Roads',
      zone: officer.zone || 'Zone B (Pimpri)',
      isActive: officer.isActive !== false,
      role: officer.role || 'authority'
    });
    setShowEditModal(true);
  };

  // Update Officer Handler (Direct MongoDB Persistence)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData._id || !editFormData.name.trim() || !editFormData.email.trim()) return;

    setActionLoading(true);
    try {
      const updated = await api.updateAuthority(editFormData._id, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        department: editFormData.department.trim(),
        zone: editFormData.zone.trim(),
        isActive: editFormData.isActive
      });

      // Update state immediately
      setAuthorities((prev) =>
        prev.map((item) => (item._id === editFormData._id ? { ...item, ...updated } : item))
      );

      setFeedback({
        type: 'success',
        message: `Details for officer "${editFormData.name}" updated in database immediately.`
      });
      setShowEditModal(false);
    } catch (err) {
      console.error('Update officer error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to update officer details.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Officer Handler (Direct MongoDB Persistence)
  const handleDeleteOfficer = async (officer) => {
    if (officer.role === 'admin' || officer.email === 'admin@civiclens.in') {
      alert('System Administrator (Shailesh Bhabad) is the designated root admin and cannot be removed.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently remove officer "${officer.name}" (${officer.email}) from the database?`
    );
    if (!confirmDelete) return;

    setDeletingId(officer._id);
    try {
      await api.deleteAuthority(officer._id);
      setAuthorities((prev) => prev.filter((a) => a._id !== officer._id));
      setFeedback({
        type: 'success',
        message: `Officer "${officer.name}" was permanently removed from database.`
      });
    } catch (err) {
      console.error('Delete officer error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to delete officer from database.' });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter officers by search
  const filteredAuthorities = authorities.filter((auth) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      auth.name?.toLowerCase().includes(q) ||
      auth.email?.toLowerCase().includes(q) ||
      auth.department?.toLowerCase().includes(q) ||
      auth.zone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Toast Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between gap-3 text-xs sm:text-sm font-medium border shadow-xs transition-all duration-300 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Authority User Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage municipal field department officers, assigned zones, and jurisdictional access in MongoDB.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchAuthorities}
            disabled={loading}
            title="Refresh from database"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 min-h-11 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0f2b5c] dark:text-blue-400' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-11 bg-[#0f2b5c] hover:bg-[#091a38] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Authority Officer
          </button>
        </div>
      </div>

      {/* Search Bar & Summary Stats */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by officer name, email, department or zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 min-h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] transition"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-3">
          <span>
            Total Registered: <strong className="text-slate-900 dark:text-white font-bold">{authorities.length}</strong>
          </span>
          <span>•</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            Active in Field: {authorities.filter((a) => a.isActive !== false).length}
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#0f2b5c] dark:text-blue-400 mb-2" />
            <p className="text-xs">Loading database records...</p>
          </div>
        ) : filteredAuthorities.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No authority officers found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try another search term or register a new officer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Officer Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Assigned Zone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAuthorities.map((auth) => {
                  const isRootAdmin = auth.role === 'admin' || auth.email === 'admin@civiclens.in';
                  const isOfficerActive = auth.isActive !== false;

                  return (
                    <tr
                      key={auth._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition"
                    >
                      {/* Name & Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded flex items-center justify-center font-bold text-xs uppercase border ${
                              isRootAdmin
                                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                                : 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-[#0f2b5c] dark:text-blue-300'
                            }`}
                          >
                            {auth.name?.charAt(0) || 'O'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 dark:text-white text-xs">{auth.name}</p>
                              {isRootAdmin && (
                                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                  Super Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                              <ShieldCheck className="w-3 h-3 text-[#0f2b5c] dark:text-blue-400" />
                              ID: {String(auth._id).slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {auth.email}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {auth.department || 'Roads'}
                        </span>
                      </td>

                      {/* Zone */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {auth.zone || 'Zone B (Pimpri)'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border ${
                            isOfficerActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOfficerActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {isOfficerActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(auth)}
                            className="p-2 text-[#0f2b5c] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                            title="Edit officer details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline font-medium">Edit</span>
                          </button>

                          {/* Delete Button */}
                          {isRootAdmin ? (
                            <span
                              className="p-2 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                              title="System administrator cannot be deleted"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDeleteOfficer(auth)}
                              disabled={deletingId === auth._id}
                              className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition border border-rose-200 dark:border-rose-900 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                              title="Delete officer"
                            >
                              {deletingId === auth._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              <span className="hidden sm:inline font-medium">Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Officer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-[#0f2b5c] dark:text-blue-300 rounded border border-blue-200 dark:border-blue-900">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Officer Profile</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                aria-label="Close edit modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-11 min-w-11 flex items-center justify-center p-2 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Officer Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 min-h-11 text-base sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh@civiclens.in"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 min-h-11 text-base sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-3 py-2 min-h-11 text-base sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] font-medium"
                  >
                    <option value="Roads">Roads & Works</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Central Administration (PCMC)">Central Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Municipal Zone
                  </label>
                  <select
                    value={editFormData.zone}
                    onChange={(e) => setEditFormData({ ...editFormData, zone: e.target.value })}
                    className="w-full px-3 py-2 min-h-11 text-base sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] font-medium"
                  >
                    <option value="Zone B (Pimpri)">Zone B (Pimpri)</option>
                    <option value="Zone A (Chinchwad)">Zone A (Chinchwad)</option>
                    <option value="Zone C (Bhosari)">Zone C (Bhosari)</option>
                    <option value="PCMC Headquarters">PCMC Headquarters</option>
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Status
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 min-h-11">
                    <input
                      type="radio"
                      name="isActive"
                      checked={editFormData.isActive === true}
                      onChange={() => setEditFormData({ ...editFormData, isActive: true })}
                      className="text-[#0f2b5c] focus:ring-[#0f2b5c]"
                    />
                    <span>Active (Dispatches Allowed)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 min-h-11">
                    <input
                      type="radio"
                      name="isActive"
                      checked={editFormData.isActive === false}
                      onChange={() => setEditFormData({ ...editFormData, isActive: false })}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Inactive (On Leave / Suspended)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 min-h-11 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-4 py-2.5 min-h-11 bg-[#0f2b5c] hover:bg-[#091a38] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Authority Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-[#0f2b5c] dark:text-blue-300 rounded border border-blue-200 dark:border-blue-900">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Authority Officer</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                aria-label="Close add officer modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-11 min-w-11 flex items-center justify-center p-2 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Officer Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={newOfficer.name}
                  onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                  className="w-full px-3 py-2 min-h-11 text-base sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@civiclens.in"
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                  className="w-full px-3 py-2 min-h-11 text-base sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={newOfficer.department}
                    onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })}
                    className="w-full px-3 py-2 min-h-11 text-base sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c]"
                  >
                    <option value="Roads">Roads & Works</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Parks & Recreation">Parks & Recreation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Municipal Zone
                  </label>
                  <select
                    value={newOfficer.zone}
                    onChange={(e) => setNewOfficer({ ...newOfficer, zone: e.target.value })}
                    className="w-full px-3 py-2 min-h-11 text-base sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c]"
                  >
                    <option value="Zone B (Pimpri)">Zone B (Pimpri)</option>
                    <option value="Zone A (Chinchwad)">Zone A (Chinchwad)</option>
                    <option value="Zone C (Bhosari)">Zone C (Bhosari)</option>
                    <option value="Zone D (Akurdi)">Zone D (Akurdi)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 min-h-11 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-4 py-2.5 min-h-11 bg-[#0f2b5c] hover:bg-[#091a38] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Register Officer in DB</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
