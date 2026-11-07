import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileQuestion,
  Home,
  PlusCircle,
  Search,
  BarChart3,
  PhoneCall,
  Mail,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const NotFoundPage = () => {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  useDocumentTitle(
    isMr ? '४०४ - पृष्ठ आढळले नाही' : '404 - Page Not Found',
    'The requested municipal address or grievance page could not be located on the PCMC CivicLens server.'
  );

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-12 text-slate-900 dark:text-slate-100">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 text-center space-y-6">
        
        {/* Official 404 Badge & Icon */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 shadow-xs">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-widest mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>HTTP 404 &bull; Official Notice</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isMr ? 'पृष्ठ किंवा दस्तऐवज आढळले नाही' : 'Page or Municipal Route Not Found'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-lg leading-relaxed">
            {isMr
              ? 'तुम्ही शोधत असलेले वेब पृष्ठ, तक्रार नोंदणी मार्ग किंवा प्रशासकीय पत्ता उपलब्ध नाही किंवा दुसऱ्या ठिकाणी हलवला गेला आहे.'
              : 'The requested municipal web address, grievance identifier, or administrative dispatch view could not be located on the PCMC server.'}
          </p>
        </div>

        {/* Quick Nav Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
          <Link
            to="/"
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-start gap-3 group"
          >
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#0f2b5c] dark:text-blue-400 shrink-0">
              <Home className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0f2b5c] dark:group-hover:text-blue-400 transition flex items-center gap-1">
                {isMr ? 'मुख्य सार्वजनिक पोर्टल' : 'Public Home Portal'}
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isMr ? 'पिंपरी-चिंचवड प्रभाग २० स्वागत कक्ष' : 'Return to PCMC Ward 20 landing page'}
              </p>
            </div>
          </Link>

          <Link
            to="/report"
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-start gap-3 group"
          >
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 shrink-0">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition flex items-center gap-1">
                {isMr ? 'नवीन तक्रार नोंदवा' : 'File New Grievance'}
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isMr ? 'खड्डे, कचरा, ड्रेनेज समस्येची नोंद' : 'Submit photo evidence and GPS geotag'}
              </p>
            </div>
          </Link>

          <Link
            to="/track"
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-start gap-3 group"
          >
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#0f2b5c] dark:text-blue-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0f2b5c] dark:group-hover:text-blue-400 transition flex items-center gap-1">
                {isMr ? 'तक्रार स्थिती तपासा' : 'Track Grievance'}
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isMr ? 'ट्रॅकिंग आयडीद्वारे थेट स्थिती पहा' : 'Monitor stage timeline and proof audit'}
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-start gap-3 group"
          >
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition flex items-center gap-1">
                {isMr ? 'नागरी पारदर्शकता फलक' : 'Civic Dashboard'}
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isMr ? 'विभागनिहाय कामाची कार्यक्षमता' : 'Inspect SLA metrics and heatmaps'}
              </p>
            </div>
          </Link>
        </div>

        {/* Municipal Helpline Footer info in card */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-slate-400" />
            <span>Toll-Free Helpline:</span>
            <a href="tel:18002097262" className="font-semibold text-slate-700 dark:text-slate-200 hover:underline">
              1800-209-7262
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>Support:</span>
            <a href="mailto:grievances@pcmcindia.gov.in" className="font-semibold text-slate-700 dark:text-slate-200 hover:underline">
              grievances@pcmcindia.gov.in
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
