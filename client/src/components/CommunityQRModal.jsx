import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  X,
  Printer,
  Copy,
  Check,
  Landmark
} from 'lucide-react';

const CommunityQRModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportUrl = `${window.location.origin}/report`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] mx-2 sm:mx-0">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0f2b5c] text-white flex items-center justify-center shadow-xs shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">Ward 20 Locality Community QR</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Official PCMC notice for society gates</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-11 min-w-11 p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Poster Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-center">
          {/* Printable Poster Card */}
          <div className="p-4 sm:p-6 rounded-lg border border-slate-700 bg-[#091a38] text-white space-y-3 sm:space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase font-bold">
                PCMC WARD 20 CIVIC NOTICE
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                DIRECT CITIZEN REPORT
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Spot a Civic Grievance?
              </h3>
              <p className="text-xs text-slate-300">
                Scan with any smartphone camera to report road hazards, waste overflow, or drainage faults directly to PCMC.
              </p>
            </div>

            {/* QR Code Graphic */}
            <div className="p-3 bg-white rounded-lg inline-block shadow-md mx-auto">
              <QRCodeSVG
                value={reportUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="space-y-1 pt-1 text-[11px] text-slate-300">
              <p className="font-semibold text-white">
                1. Point Camera &bull; 2. Pin Map Location &bull; 3. AI Routes to Ward Crew
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {reportUrl}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            Mount this official QR notice at residential society entrances, community gates, or municipal bulletin boards.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full sm:flex-1 min-h-11 py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:flex-1 min-h-11 py-2.5 px-3 bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ward Poster</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityQRModal;
