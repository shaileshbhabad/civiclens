import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Sun,
  Moon,
  Landmark,
  ShieldCheck,
  PhoneCall,
  Mail,
  FileText,
  Lock,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState(null); // 'charter' | 'privacy' | 'rti' | 'hyperlink' | null

  const { user, isAuthenticated, logout } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const isMr = lang === 'mr';

  // Automatically close mobile menu and dropdowns on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActivePolicyModal(null);
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: t('navHome'), path: '/' },
    { name: t('navReport'), path: '/report' },
    { name: t('navTrack'), path: '/track' },
    { name: t('navDashboard'), path: '/dashboard' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'authority') return '/authority/dashboard';
    return '/citizen/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b1322] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Official Government Top Bar */}
      <div className="bg-[#091a38] text-slate-200 text-[11px] py-1 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center sm:justify-between">
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-semibold tracking-wider text-slate-300 uppercase">
              {isMr ? 'महाराष्ट्र शासन • पिंपरी-चिंचवड महानगरपालिका' : 'Government of Maharashtra • PCMC Municipal Corporation'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="hidden sm:inline">
              {isMr ? 'प्रभाग २० नागरी निवारण कक्ष' : 'Ward 20 Civic Redressal Cell'}
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <a
              href="tel:18002097262"
              className="text-amber-300 font-medium hover:underline flex items-center gap-1.5 cursor-pointer py-1 text-xs sm:text-[11px]"
              title="Call PCMC Civic Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isMr ? 'हेल्पलाईन: १८००-२०९-७२६२' : 'Helpline: 1800-209-7262'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-150 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Clickable Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink" title="CivicLens Home">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0f2b5c] text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-[#1e3a8a] transition shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base sm:text-lg leading-tight tracking-tight text-slate-900 dark:text-white group-hover:text-[#0f2b5c] dark:group-hover:text-blue-400 transition truncate">
                  CivicLens
                </span>
                <span className="hidden sm:block text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase truncate">
                  {isMr ? 'पिंपरी-चिंचवड नागरी पोर्टल' : 'PCMC Citizen Public Portal'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right side Desktop: Language Switcher + Theme Switcher + Login / User menu */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    lang === 'en'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage('mr')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    lang === 'mr'
                      ? 'bg-[#0f2b5c] dark:bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  मराठी
                </button>
              </div>

              {/* Theme Switcher Button */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    <span>Dark</span>
                  </>
                )}
              </button>

              {/* User Dropdown or Admin Login */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 shadow-xs transition cursor-pointer"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#0f2b5c] text-white flex items-center justify-center font-bold text-xs">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[110px]">
                        {user?.name}
                      </p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0f2b5c] hover:bg-[#1e3a8a] rounded-lg border border-[#0f2b5c] transition shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </Link>
              )}
            </div>

            {/* Mobile header controls: Language + Theme + Hamburger all in ONE row with min 44x44px touch targets */}
            <div className="flex md:hidden items-center gap-2 shrink-0">
              {/* Compact Mobile Language Switcher */}
              <button
                type="button"
                onClick={() => changeLanguage(lang === 'en' ? 'mr' : 'en')}
                title={lang === 'en' ? 'मराठीत बदला' : 'Switch to English'}
                aria-label="Toggle Language"
                className="min-h-11 min-w-11 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#0f2b5c] dark:text-blue-400 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition"
              >
                {lang === 'en' ? 'मराठी' : 'EN'}
              </button>

              {/* Compact Mobile Theme Switcher */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
                className="min-h-11 min-w-11 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-h-11 min-w-11 p-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer active:scale-95"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown with overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-2xs md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="relative z-40 md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
              {/* Mobile Language and Theme Row */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">भाषा / Language:</span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1 rounded-md transition ${lang === 'en' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('mr')}
                    className={`px-3 py-1 rounded-md transition ${lang === 'mr' ? 'bg-[#0f2b5c] dark:bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    मराठी
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2.5 rounded-md text-sm font-medium transition ${
                        active
                          ? 'bg-slate-100 dark:bg-slate-800 text-[#0f2b5c] dark:text-blue-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Quick Helpline Contact */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">PCMC Helpline:</span>
                  <a href="tel:18002097262" className="text-amber-700 dark:text-amber-400 font-bold hover:underline">
                    1800-209-7262
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Grievance Desk:</span>
                  <a href="mailto:grievances@pcmcindia.gov.in" className="text-[#0f2b5c] dark:text-blue-400 truncate max-w-[170px] hover:underline">
                    grievances@pcmcindia.gov.in
                  </a>
                </div>
              </div>

              {/* Mobile Login / User Profile */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {isAuthenticated ? (
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
                      Signed in as <span className="text-slate-800 dark:text-slate-200 font-semibold">{user?.name}</span> ({user?.role})
                    </div>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-[#0f2b5c] dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#0f2b5c] hover:bg-[#1e3a8a] rounded-lg transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Admin Login</span>
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 overflow-x-clip min-w-0">
        <Outlet />
      </main>

      {/* Institutional Government Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-600 dark:text-slate-400 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0f2b5c] dark:text-blue-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">CivicLens Redressal Portal</span>
              <span>&bull;</span>
              <span>Pimpri-Chinchwad Municipal Corporation</span>
            </div>
            
            {/* Clickable Phone and Email in Footer */}
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 flex-wrap justify-center">
              <span>Ward 20 Zone Office, Pune - 411018</span>
              <span>&bull;</span>
              <a
                href="tel:18002097262"
                className="hover:text-slate-900 dark:hover:text-white hover:underline transition cursor-pointer flex items-center gap-1 font-medium"
                title="Call 1800-209-7262"
              >
                <PhoneCall className="w-3 h-3 text-slate-400" />
                <span>Toll Free: 1800-209-7262</span>
              </a>
              <span>&bull;</span>
              <a
                href="mailto:grievances@pcmcindia.gov.in"
                className="hover:text-slate-900 dark:hover:text-white hover:underline transition cursor-pointer flex items-center gap-1 font-medium"
                title="Send grievance email"
              >
                <Mail className="w-3 h-3 text-slate-400" />
                <span>grievances@pcmcindia.gov.in</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>&copy; {new Date().getFullYear()} Municipal Corporation of Pimpri-Chinchwad. All Rights Reserved.</span>
            
            {/* Clickable Policy Disclosure Links */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setActivePolicyModal('charter')}
                className="hover:text-[#0f2b5c] dark:hover:text-blue-400 hover:underline cursor-pointer"
              >
                {isMr ? 'नागरी सनद (Citizen Charter)' : 'Citizen Charter'}
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setActivePolicyModal('privacy')}
                className="hover:text-[#0f2b5c] dark:hover:text-blue-400 hover:underline cursor-pointer"
              >
                {isMr ? 'गोपनीयता धोरण (Privacy Policy)' : 'Privacy Policy'}
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setActivePolicyModal('rti')}
                className="hover:text-[#0f2b5c] dark:hover:text-blue-400 hover:underline cursor-pointer"
              >
                {isMr ? 'माहिती अधिकार (RTI Disclosure)' : 'RTI Disclosure'}
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setActivePolicyModal('hyperlink')}
                className="hover:text-[#0f2b5c] dark:hover:text-blue-400 hover:underline cursor-pointer"
              >
                {isMr ? 'हायपरलिंकिंग धोरण' : 'Hyperlinking Policy'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Official Policy Disclosures Modal */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100 mx-2 sm:mx-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0f2b5c] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold tracking-tight">
                  {activePolicyModal === 'charter' && (isMr ? 'नागरी सनद व हमी (Citizen Charter)' : 'PCMC Citizen Charter & SLA Commitments')}
                  {activePolicyModal === 'privacy' && (isMr ? 'गोपनीयता धोरण (Privacy Policy)' : 'Privacy & Data Protection Policy')}
                  {activePolicyModal === 'rti' && (isMr ? 'माहितीचा अधिकार (RTI Act 2005)' : 'RTI Act Proactive Disclosures')}
                  {activePolicyModal === 'hyperlink' && (isMr ? 'हायपरलिंकिंग व बाह्य दुवे धोरण' : 'Hyperlinking & Terms Policy')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                aria-label="Close modal"
                className="min-h-11 min-w-11 p-2.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              {activePolicyModal === 'charter' && (
                <>
                  <p>
                    Under the <strong>Maharashtra Right to Public Services Act, 2015</strong>, PCMC guarantees the following standard resolution SLAs across Ward 20:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Potholes & Road Cracks:</strong> Within 48 hours of AI verification.</li>
                    <li><strong>Garbage Overflow & Solid Waste:</strong> Cleared within 24 hours.</li>
                    <li><strong>Drainage Clogs & Sewage:</strong> Remediated within 48 hours.</li>
                    <li><strong>Streetlights & Electrical Faults:</strong> Repaired within 24 hours.</li>
                  </ul>
                  <p className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Citizens are entitled to inspect before-and-after photographic evidence and dispute incomplete remediations within 72 hours.
                  </p>
                </>
              )}

              {activePolicyModal === 'privacy' && (
                <>
                  <p>
                    CivicLens complies with the <strong>Digital Personal Data Protection Act (DPDPA), 2023</strong>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Photographic uploads are encrypted and inspected solely for civic defect validation and deduplication.</li>
                    <li>GPS coordinates are utilized exclusively for assigning work crews within Ward 20 jurisdiction.</li>
                    <li>Citizen contact numbers are masked and never traded or disclosed to third parties.</li>
                  </ul>
                </>
              )}

              {activePolicyModal === 'rti' && (
                <>
                  <p>
                    In compliance with Section 4(1)(b) of the <strong>Right to Information Act, 2005</strong>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Public Information Officer (PIO):</strong> Ward 20 Officer, PCMC Chinchwad Office.</li>
                    <li><strong>Appellate Authority:</strong> Additional Commissioner, PCMC Headquarters, Mumbai-Pune Road, Pimpri.</li>
                    <li>All aggregate SLA throughput and resolution records are proactively published on the Transparency Dashboard.</li>
                  </ul>
                </>
              )}

              {activePolicyModal === 'hyperlink' && (
                <>
                  <p>
                    <strong>Hyperlinking Policy:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Prior permission is not required to hyperlink to CivicLens PCMC portal pages.</li>
                    <li>Pages must open in a complete browser window and may not be framed within external commercial sites.</li>
                    <li>Outbound links are provided solely for resident convenience; PCMC is not responsible for contents on external domains.</li>
                  </ul>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className="w-full sm:w-auto min-h-11 px-5 py-2.5 bg-[#0f2b5c] hover:bg-[#091a38] text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center"
              >
                Close Disclosure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
