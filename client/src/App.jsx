import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public & Citizen pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ComplaintForm from './pages/citizen/ComplaintForm';
import TrackComplaint from './pages/citizen/TrackComplaint';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import PublicDashboard from './pages/public/PublicDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Authority pages
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import AuthorityIncidentDetail from './pages/authority/AuthorityIncidentDetail';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIncidents from './pages/admin/AdminIncidents';
import AdminIncidentDetail from './pages/admin/AdminIncidentDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
        <Routes>
          {/* Legacy QR links redirect directly to report form */}
          <Route path="/qr/:qrCode" element={<Navigate to="/report" replace />} />
          <Route path="/r/:qrCode" element={<Navigate to="/report" replace />} />

          {/* Public & Citizen routes wrapped with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ComplaintForm />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/track/:trackingId" element={<TrackComplaint />} />
            <Route path="/dashboard" element={<PublicDashboard />} />
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            {/* Custom 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Standalone Login route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authority routes wrapped in AdminLayout with authority guard */}
          <Route
            path="/authority"
            element={
              <ProtectedRoute allowedRoles={['authority', 'admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/authority/dashboard" replace />} />
            <Route path="dashboard" element={<AuthorityDashboard />} />
            <Route path="incidents/:id" element={<AuthorityIncidentDetail />} />
          </Route>

          {/* Admin routes wrapped in AdminLayout with admin guard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="incidents" element={<AdminIncidents />} />
            <Route path="incidents/:id" element={<AdminIncidentDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  );
}

export default App;
