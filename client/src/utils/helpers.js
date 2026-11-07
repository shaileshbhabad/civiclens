/**
 * CivicLens Utility Helpers
 */

/**
 * Generate a unique tracking ID in the format: CL-YYYYMMDD-XXXX
 */
export const generateTrackingId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CL-${year}${month}${day}-${randomPart}`;
};

/**
 * Format ISO date string into human-readable date & time
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };

  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date);
};

/**
 * Get Tailwind badge styling classes based on complaint / incident status
 */
export const getStatusColor = (status) => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'submitted':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    case 'analysing':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
    case 'verified':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
    case 'open':
      return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
    case 'assigned':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    case 'in_progress':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

/**
 * Get Tailwind badge styling classes based on issue severity
 */
export const getSeverityColor = (severity) => {
  const normalized = (severity || '').toLowerCase();
  switch (normalized) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800';
    case 'medium':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    case 'low':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

/**
 * Get Tailwind badge styling classes based on urgency level
 */
export const getUrgencyColor = (urgency) => {
  const normalized = (urgency || '').toLowerCase();
  switch (normalized) {
    case 'immediate':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    case 'within_24h':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    case 'within_3d':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
    case 'routine':
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

/**
 * Get the recommended Lucide icon name for a civic issue category
 */
export const getCategoryIcon = (category) => {
  const normalized = (category || '').toLowerCase();
  switch (normalized) {
    case 'pothole':
      return 'AlertTriangle';
    case 'garbage':
      return 'Trash2';
    case 'drainage':
      return 'Waves';
    case 'streetlight':
      return 'Lightbulb';
    case 'water_leak':
      return 'Droplets';
    case 'other':
    default:
      return 'HelpCircle';
  }
};

/**
 * Get user-friendly display label for categories
 */
export const getCategoryLabel = (category, lang = null) => {
  const isMr = lang === 'mr' || (typeof window !== 'undefined' && localStorage.getItem('civiclens_lang') === 'mr');
  const normalized = (category || '').toLowerCase();
  if (isMr) {
    switch (normalized) {
      case 'pothole':
        return 'रस्त्यावरील खड्डा';
      case 'garbage':
        return 'कचरा / घनकचरा';
      case 'drainage':
        return 'ड्रेनेज / सांडपाणी';
      case 'streetlight':
        return 'पथदिवे व विद्युत';
      case 'water_leak':
        return 'पाणी गळती';
      case 'other':
        return 'इतर नागरी समस्या';
      default:
        return capitalize(normalized.replace(/_/g, ' '));
    }
  }
  switch (normalized) {
    case 'pothole':
      return 'Pothole';
    case 'garbage':
      return 'Garbage / Waste';
    case 'drainage':
      return 'Drainage / Sewage';
    case 'streetlight':
      return 'Streetlight';
    case 'water_leak':
      return 'Water Leakage';
    case 'other':
      return 'Other Civic Issue';
    default:
      return capitalize(normalized.replace(/_/g, ' '));
  }
};

/**
 * Get user-friendly display label for complaint and incident statuses
 */
export const getStatusLabel = (status, lang = null) => {
  const isMr = lang === 'mr' || (typeof window !== 'undefined' && localStorage.getItem('civiclens_lang') === 'mr');
  const normalized = (status || '').toLowerCase();
  if (isMr) {
    switch (normalized) {
      case 'submitted':
        return 'नोंदणी झाली';
      case 'analysing':
        return 'एआय विश्लेषण';
      case 'verified':
        return 'पडताळणी पूर्ण';
      case 'open':
        return 'सक्रिय';
      case 'assigned':
        return 'अधिकारी नियुक्त';
      case 'in_progress':
        return 'काम सुरू आहे';
      case 'resolved':
        return 'निवारण झाले';
      case 'rejected':
        return 'नाकारले';
      default:
        return capitalize(normalized.replace(/_/g, ' '));
    }
  }
  switch (normalized) {
    case 'submitted':
      return 'Submitted';
    case 'analysing':
      return 'AI Analysing';
    case 'verified':
      return 'Verified';
    case 'open':
      return 'Open';
    case 'assigned':
      return 'Assigned';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'rejected':
      return 'Rejected';
    default:
      return capitalize(normalized.replace(/_/g, ' '));
  }
};

/**
 * Get user-friendly display label for incident severity
 */
export const getSeverityLabel = (severity, lang = null) => {
  const isMr = lang === 'mr' || (typeof window !== 'undefined' && localStorage.getItem('civiclens_lang') === 'mr');
  const normalized = (severity || '').toLowerCase();
  if (isMr) {
    switch (normalized) {
      case 'critical':
        return 'अतिगंभीर';
      case 'high':
        return 'उच्च';
      case 'medium':
        return 'मध्यम';
      case 'low':
        return 'कमी';
      default:
        return capitalize(normalized);
    }
  }
  return capitalize(normalized);
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
