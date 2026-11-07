/**
 * Municipal Ward Report Exporter
 * Generates RFC4180 compliant CSV exports and triggers printable PDF audit reports
 * for Pimpri-Chinchwad Municipal Corporation (PCMC) Ward administrations.
 */

// Escape CSV field properly
const escapeCsv = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Download incidents queue as structured CSV
 * @param {Array} incidents
 * @param {string} filename
 */
export const exportIncidentsToCSV = (incidents = [], filename = 'PCMC_Ward20_Incidents_Report.csv') => {
  const headers = [
    'Incident ID',
    'Category',
    'Severity',
    'Urgency',
    'Priority Score',
    'Address',
    'Ward',
    'Department',
    'Assigned Officer',
    'Report Count',
    'Status',
    'Logged Date',
    'Resolved Date',
    'Resolution Notes'
  ];

  const rows = incidents.map((inc) => [
    escapeCsv(inc._id),
    escapeCsv(inc.category),
    escapeCsv(inc.severity),
    escapeCsv(inc.urgency || 'Normal'),
    escapeCsv(inc.priorityScore),
    escapeCsv(inc.address),
    escapeCsv(inc.ward || 'Ward 20 (Sant Tukaram Nagar)'),
    escapeCsv(inc.department || 'Roads & Infrastructure'),
    escapeCsv(typeof inc.assignedTo === 'object' ? inc.assignedTo?.name : inc.assignedTo || 'Unassigned'),
    escapeCsv(inc.reportCount || 1),
    escapeCsv(inc.status),
    escapeCsv(inc.createdAt ? new Date(inc.createdAt).toLocaleString('en-IN') : ''),
    escapeCsv(inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleString('en-IN') : ''),
    escapeCsv(inc.resolutionNotes || '')
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export aggregated ward metrics and department performance to CSV
 * @param {Object} stats
 * @param {string} filename
 */
export const exportWardSummaryToCSV = (stats = {}, filename = 'PCMC_Ward_Summary_Metrics.csv') => {
  const lines = [
    'PIMPRI CHINCHWAD MUNICIPAL CORPORATION - CIVICLENS AUDIT',
    `Generated On: ${new Date().toLocaleString('en-IN')}`,
    '',
    'KEY MUNICIPAL INDICATORS',
    `Total Complaints Filed,${stats.totalComplaints || 0}`,
    `Open Incidents in Queue,${stats.openIncidents || 0}`,
    `Resolved Issues This Month,${stats.resolvedThisMonth || 0}`,
    `Average Resolution Turnaround (Days),${stats.avgResolutionDays || 0}`,
    '',
    'DEPARTMENT PERFORMANCE BREAKDOWN',
    'Department,Open Incidents,Resolved,Avg Turnaround Days'
  ];

  if (stats.departmentPerformance && Array.isArray(stats.departmentPerformance)) {
    stats.departmentPerformance.forEach((dept) => {
      lines.push(`${escapeCsv(dept.department)},${dept.open || 0},${dept.resolved || 0},${dept.avgDays || 0}`);
    });
  }

  lines.push('');
  lines.push('CATEGORY DISTRIBUTION');
  lines.push('Category,Complaints Count');
  if (stats.complaintsByCategory && Array.isArray(stats.complaintsByCategory)) {
    stats.complaintsByCategory.forEach((cat) => {
      lines.push(`${escapeCsv(cat.name)},${cat.value || 0}`);
    });
  }

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Print / Save PDF Trigger
 */
export const triggerPrintReport = () => {
  window.print();
};
