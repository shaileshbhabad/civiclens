import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  Home,
  Sun,
  Moon,
  Landmark
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { lang, changeLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isMr = lang === 'mr';

  // Auto-close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { name: isMr ? 'डॅशबोर्ड (Dashboard)' : 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: isMr ? 'तक्रार समूह (Incidents)' : 'Incidents', path: '/admin/incidents', icon: ShieldAlert },
    { name: isMr ? 'विश्लेषण (Analytics)' : 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: isMr ? 'अधिकारी यादी (Users)' : 'Users', path: '/admin/users', icon: Users }
  ];

  const authorityNavItems = [
    { name: isMr ? 'क्षेत्रीय डॅशबोर्ड' : 'Department Queue', path: '/authority/dashboard', icon: LayoutDashboard }
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : authorityNavItems;

  const isActive = (path) => {
    return location.pathname === path || (path !== '/admin/dashboard' && path !== '/authority/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#0b1322] text-slate-900 dark:text-slate-100 flex transition-colors duration-150 font-sans overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Stationary Sidebar on md+, Drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#091a38] text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static shrink-0 h-full flex flex-col justify-between border-r border-slate-800 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0f2b5c] border border-blue-500/40 flex items-center justify-center text-white shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white">
                  CivicLens
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  {user?.role === 'admin'
                    ? (isMr ? 'प्रशासक नियंत्रण केंद्र' : 'Admin Operations')
                    : (isMr ? 'अधिकारी केंद्र' : 'Field Operations')}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden min-h-11 min-w-11 p-2.5 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Department / User badge */}
          <div className="p-3 mx-4 my-4 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0f2b5c] text-blue-200 border border-blue-400/40 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">
                  {isMr ? 'महापालिका प्रशासन' : (user?.department || user?.role)}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-11 rounded-lg text-xs font-semibold transition ${
                    active
                      ? 'bg-[#0f2b5c] text-white border border-blue-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-1 text-xs">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2.5 min-h-11 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>{isMr ? 'सार्वजनिक मुख्यपृष्ठ' : 'Public Home'}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-11 rounded-lg font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{isMr ? 'बाहेर पडा (Sign Out)' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Container - Independent Scrolling */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-30 shrink-0 transition-colors duration-150 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden min-h-11 min-w-11 p-2.5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="hidden sm:inline-block text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              {user?.role === 'admin'
                ? (isMr ? 'प्रणाली प्रशासक (PCMC Ward 20)' : 'PCMC Ward 20 Administrator')
                : (isMr ? 'महापालिका क्षेत्रीय अधिकारी' : 'Municipal Field Authority')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`min-h-11 min-w-11 px-2.5 py-1 rounded-md transition cursor-pointer flex items-center justify-center ${
                  lang === 'en'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">English</span>
                <span className="sm:hidden">EN</span>
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('mr')}
                className={`min-h-11 min-w-11 px-2.5 py-1 rounded-md transition cursor-pointer flex items-center justify-center ${
                  lang === 'mr'
                    ? 'bg-[#0f2b5c] dark:bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">मराठी</span>
                <span className="sm:hidden">म</span>
              </button>
            </div>

            {/* Theme Switcher Button beside Language Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
              className="min-h-11 min-w-11 p-2.5 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              )}
            </button>

            {/* Admin User Info & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[130px]">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title={isMr ? 'बाहेर पडा' : 'Sign Out'}
                aria-label="Sign out"
                className="min-h-11 min-w-11 p-2.5 flex items-center justify-center text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
