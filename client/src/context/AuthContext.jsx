import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('civiclens_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('civiclens_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civiclens_user');
      localStorage.removeItem('civiclens_token');
    }
  }, [user]);

  /**
   * Authentic Database Login: Strictly authenticates with backend MongoDB
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res && res.user) {
        setUser(res.user);
        setLoading(false);
        return { success: true, user: res.user };
      }
      setLoading(false);
      return { success: false, error: 'Authentication failed.' };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Authentication failed. Please verify credentials.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civiclens_user');
    localStorage.removeItem('civiclens_token');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isAuthority = user?.role === 'authority' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isAuthority
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      login: async () => ({ success: false }),
      logout: () => {},
      isAuthenticated: false,
      isAdmin: false,
      isAuthority: false
    };
  }
  return context;
};

export default AuthContext;
