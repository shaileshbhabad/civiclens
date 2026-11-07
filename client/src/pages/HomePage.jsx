import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Search,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck2,
  ArrowRight,
  Landmark,
  FileText,
  MapPin,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import CommunityQRModal from '../components/CommunityQRModal';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const HomePage = () => {
  const { t, lang } = useLanguage();
  const [isCommunityQrOpen, setIsCommunityQrOpen] = useState(false);
  const [liveStats, setLiveStats] = useState(null);

  const isMr = lang === 'mr';

  useDocumentTitle(
    'CivicLens',
    'Official Pimpri-Chinchwad Municipal Corporation portal for citizen grievance redressal, real-time SLA tracking, and civic defect remediation.',
    true
  );

  useEffect(() => {
    api.getDashboardStats()
      .then((data) => setLiveStats(data))
      .catch((err) => console.warn('HomePage stats fetch error:', err));
  }, []);

  const steps = [
    {
      step: '01',
      title: isMr ? 'नागरी तक्रार व छायाचित्र नोंदवा' : 'Evidence Capture & Geotag',
      description: isMr
        ? 'समस्येचे छायाचित्र घ्या, आवश्यक माहिती भरा आणि जीपीएसद्वारे अचूक ठिकाण निश्चित करून अनामिकपणे तक्रार नोंदवा.'
        : 'Snap photo evidence of the civic issue, describe the defect, and submit with automatic GPS location pin.',
      dept: isMr ? 'नागरिक पोर्टल' : 'Citizen Interface'
    },
    {
      step: '02',
      title: isMr ? 'कृत्रिम बुद्धिमत्ता (AI) तपासणी' : 'AI Severity & Deduplication',
      description: isMr
        ? 'दृष्टी AI छायाचित्राची सत्यता तपासते, तीव्रतेचे वर्गीकरण करते आणि एकच तक्रार वारंवार आल्यास एकत्रीकरण करते.'
        : 'Automated vision model analyses severity, weeds out duplicates, and triages urgency rating instantly.',
      dept: isMr ? 'संगणकीय प्रणाली' : 'Automated Verification'
    },
    {
      step: '03',
      title: isMr ? 'विभागीय कार्य आदेश वाटप' : 'Municipal Ward Routing',
      description: isMr
        ? 'तक्रार थेट प्रभाग २० मधील संबंधित रस्ते, आरोग्य किंवा विद्युत विभागाकडे पाठवली जाते आणि SLA वेळ मोजला जातो.'
        : 'Incident routed directly to the designated ward department queue with active SLA resolution timelines.',
      dept: isMr ? 'प्रभाग २० नियंत्रण कक्ष' : 'PCMC Operations'
    },
    {
      step: '04',
      title: isMr ? 'काम पूर्ण व डिजिटल पडताळणी' : 'Verified Resolution Audit',
      description: isMr
        ? 'क्षेत्रीय कर्मचाऱ्यांनी काम पूर्ण केल्यावर दुरुस्तीचे छायाचित्र अपलोड केले जाते व ट्रॅकिंग आयडीद्वारे स्थिती पाहिली जाते.'
        : 'Field crew uploads after-repair photographic proof, verified against original defect before ticket closure.',
      dept: isMr ? 'गुणवत्ता तपासणी' : 'Public Audit'
    }
  ];

  const stats = [
    {
      label: isMr ? 'एकूण नोंदवलेल्या तक्रारी' : 'Total Complaints Registered',
      value: liveStats?.totalComplaints !== undefined ? liveStats.totalComplaints.toString() : '24',
      subtext: isMr ? 'पिंपरी-चिंचवड प्रभाग २०' : 'PCMC Ward 20 Jurisdiction',
      icon: FileCheck2
    },
    {
      label: isMr ? 'सक्रिय निवारण कक्ष' : 'Active In-Progress',
      value: liveStats?.openIncidents !== undefined ? liveStats.openIncidents.toString() : '7',
      subtext: isMr ? 'विभागीय पथकांकडे वर्ग' : 'Assigned to field crews',
      icon: AlertTriangle
    },
    {
      label: isMr ? 'यशस्वी निराकरण' : 'Verified Resolved',
      value: liveStats?.resolvedComplaints !== undefined ? liveStats.resolvedComplaints.toString() : '12',
      subtext: isMr ? 'छायाचित्र पुराव्यासह पूर्ण' : 'With after-repair photo proof',
      icon: CheckCircle2
    },
    {
      label: isMr ? 'सरासरी निराकरण वेळ' : 'Average SLA Turnaround',
      value: `${liveStats?.avgResolutionDays || '2.1'} Days`,
      subtext: isMr ? 'नागरी सनद मानकानुसार' : 'Citizen charter compliant',
      icon: Clock
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#0b1322] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Hero Section */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Official Briefing */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <Landmark className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
                <span>Pimpri-Chinchwad Municipal Corporation &bull; Public Grievance Portal</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {isMr
                  ? 'पिंपरी-चिंचवड प्रभाग २० नागरी तक्रार निवारण व सनियंत्रण प्रणाली'
                  : 'PCMC Ward 20 Civic Grievance & SLA Tracking Portal'}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {isMr
                  ? 'रस्ते खड्डे, कचरा साचणे किंवा पाणीपुरवठ्याची समस्या थेट महापालिकेकडे नोंदवा. छायाचित्र पुरावा, जीपीएस स्थान आणि कृत्रिम बुद्धिमत्ता (AI) तपासणीद्वारे त्वरित निवारण सुनिश्चित केले जाते.'
                  : 'Official portal for reporting municipal defects including road hazards, solid waste overflow, and drainage faults. Powered by automated photographic verification, GPS geotagging, and departmental SLA escalation.'}
              </p>

              {/* Action Buttons: Full width & stacked on mobile (< sm), min 44px height, 12px gap */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/report"
                  className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white text-sm sm:text-base font-semibold border border-[#0f2b5c] transition shadow-xs active:scale-98"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isMr ? 'नवीन तक्रार नोंदवा' : 'File a Civic Grievance'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsCommunityQrOpen(true)}
                  className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm sm:text-base font-semibold border border-slate-300 dark:border-slate-700 transition cursor-pointer shadow-xs active:scale-98"
                >
                  <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>{isMr ? 'परिसर क्यूआर पोस्टर' : 'Locality QR Poster'}</span>
                </button>

                <Link
                  to="/track"
                  className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm sm:text-base font-semibold border border-slate-300 dark:border-slate-700 transition shadow-xs active:scale-98"
                >
                  <Search className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>{isMr ? 'तक्रार स्थिती तपासा' : 'Track Complaint Status'}</span>
                </Link>
              </div>

              {/* Official Compliance Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isMr ? 'पूर्णपणे सुरक्षित व अनामिक' : 'Anonymous & Secure'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{isMr ? 'अचूक जीपीएस जिओटॅगिंग' : 'GPS Verified Location'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{isMr ? 'महापालिका SLA कालमर्यादा' : 'Standard Municipal SLA'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Official Municipal Dispatch Slip */}
            <div className="lg:col-span-5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Municipal Dispatch Record
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    CL-20261011-9A4B
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium uppercase">
                      Incident Summary
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {isMr ? 'रस्त्यावर धोकादायक खड्डा - पिंपरी लिंक रोड' : 'Severe Road Depression & Pothole Hazard'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        Assigned Ward Unit
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        Roads & Works Div #2
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        AI Vision Verification
                      </span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                        96.8% Validated Defect
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      <span>Resolution Progress</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">75% - Field Crew Dispatched</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#0f2b5c] dark:bg-blue-500 h-2 rounded-full w-3/4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Target SLA: 24 Hours</span>
                    <Link
                      to="/track/CL-20261011-POTH1"
                      className="text-[#0f2b5c] dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isMr ? 'तपशील पहा' : 'View Sample Incident'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Citywide Civic Metrics */}
      <section className="py-12 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-[#0f2b5c] dark:text-blue-400">
                Official Redressal Performance
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {isMr ? 'प्रभाग २० तक्रार निवारण आकडेवारी' : 'Ward 20 Civic Metrics & SLA Performance'}
              </h2>
            </div>
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-[#0f2b5c] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{isMr ? 'संपूर्ण डॅशबोर्ड पहा' : 'View Full Public Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      {item.label}
                    </span>
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                    {item.value}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.subtext}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4-Step Municipal Workflow */}
      <section className="py-14 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs uppercase font-bold tracking-wider text-[#0f2b5c] dark:text-blue-400 block mb-1">
              Standard Operating Procedure
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {isMr ? 'नागरी तक्रार निवारण कार्यपद्धती' : 'Standard 4-Step Grievance Redressal Process'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
              {isMr
                ? 'नागरिकांच्या तक्रारीपासून ते प्रभाग अधिकाऱ्यांमार्फत पूर्ण केलेल्या कामाची पडताळणी करण्यापर्यंतची पारदर्शक प्रक्रिया.'
                : 'A transparent municipal audit trail from initial citizen report to photographic resolution sign-off.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-xs font-mono font-bold text-[#0f2b5c] dark:text-blue-400">
                      STEP {s.step}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {s.dept}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locality QR Poster Callout */}
      <section className="py-12 bg-[#091a38] text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                <span>PCMC Locality Outreach</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {isMr ? 'आपल्या सोसायटी किंवा प्रभागासाठी क्यूआर पोस्टर' : 'Locality QR Notice for Residential Societies'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {isMr
                  ? 'आपल्या सोसायटी गेटवर किंवा सार्वजनिक सूचना फलकावर अधिकृत सिव्हिकलेन्स क्यूआर कोड लावा. नागरिक कोणताही अ‍ॅप न उतरवता थेट कॅमेऱ्याने स्कॅन करून तक्रार करू शकतात.'
                  : 'Display an official PCMC CivicLens QR placard on society noticeboards or residential gates. Citizens can scan using any smartphone camera to report issues with automatic GPS geolocation.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsCommunityQrOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <QrCode className="w-4 h-4 text-[#0f2b5c]" />
                <span>{isMr ? 'क्यूआर पोस्टर डाउनलोड करा' : 'Print Ward 20 QR Poster'}</span>
              </button>

              <Link
                to="/report"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f2b5c] hover:bg-[#1e3a8a] text-white text-xs font-semibold border border-blue-500/40 transition"
              >
                <Camera className="w-4 h-4" />
                <span>{isMr ? 'थेट तक्रार करा' : 'Direct Web Form'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community QR Modal */}
      <CommunityQRModal
        isOpen={isCommunityQrOpen}
        onClose={() => setIsCommunityQrOpen(false)}
      />
    </div>
  );
};

export default HomePage;
