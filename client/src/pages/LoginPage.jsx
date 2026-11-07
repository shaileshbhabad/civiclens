import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Eye, EyeOff, Lock, User, ShieldCheck, AlertCircle, Loader2, ArrowRight, Landmark } from 'lucide-react';

const LoginPage = () => {
  useDocumentTitle(
    'Municipal Administration Sign-In',
    'Authorized administrative access for PCMC Ward 20 officials and designated system administrators.'
  );

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please provide your administrator ID or email address.');
      return;
    }
    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(identifier.trim(), password);

      if (res?.success) {
        navigate(from, { replace: true });
      } else {
        setError(res?.error || 'Authentication failed. Please verify your administrator credentials.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the authentication service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1322] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-150">
      {/* Brand & Title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-bold text-slate-900 dark:text-white">
          <div className="w-10 h-10 rounded-lg bg-[#0f2b5c] text-white flex items-center justify-center shadow-xs">
            <Landmark className="w-5 h-5" />
          </div>
          <span className="tracking-tight text-xl font-bold">CivicLens</span>
        </Link>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-1 px-3 w-fit mx-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0f2b5c] dark:text-blue-400" />
          <span>PCMC Ward 20 Administration</span>
        </div>

        <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Official Administrative Login
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Authorized personnel access for complaint dispatch, triage, and SLA resolution tracking.
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-5 sm:rounded-lg sm:px-8 border border-slate-200 dark:border-slate-800 shadow-xs">
          {error && (
            <div className="mb-5 p-3.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Administrator Identifier */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Admin Officer ID / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@civiclens.in or Shailesh Bhabad"
                  className="block w-full pl-10 pr-3.5 py-2.5 min-h-11 text-base sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-[#0f2b5c] outline-none transition font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="block w-full pl-10 pr-12 py-2.5 min-h-11 text-base sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-[#0f2b5c] outline-none transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 min-h-11 min-w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-11 flex items-center justify-center gap-2 py-3 px-4 rounded-lg shadow-xs text-sm font-semibold text-white bg-[#0f2b5c] hover:bg-[#1e3a8a] transition duration-150 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Official</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Citizen Helper Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Not an administrator? Citizens can report and track issues freely without logging in:
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-4 text-xs font-semibold">
              <Link to="/report" className="text-[#0f2b5c] dark:text-blue-400 hover:underline">
                Report Issue
              </Link>
              <span className="text-slate-300 dark:text-slate-600">&bull;</span>
              <Link to="/track" className="text-[#0f2b5c] dark:text-blue-400 hover:underline">
                Track Status
              </Link>
              <span className="text-slate-300 dark:text-slate-600">&bull;</span>
              <Link to="/dashboard" className="text-[#0f2b5c] dark:text-blue-400 hover:underline">
                Public Transparency
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
