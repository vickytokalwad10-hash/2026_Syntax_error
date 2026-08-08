import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = 'http://127.0.0.1:8000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agripulse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('agripulse_token') || null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem('agripulse_role') || null;
  });

  const [loading, setLoading] = useState(false);

  const saveAuthSession = (accessToken, userObj, userRole) => {
    setToken(accessToken);
    setUser(userObj);
    setRole(userRole);
    localStorage.setItem('agripulse_token', accessToken);
    localStorage.setItem('agripulse_user', JSON.stringify(userObj));
    localStorage.setItem('agripulse_role', userRole);
  };

  const login = async (identifier, password, targetRole) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role: targetRole })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      saveAuthSession(data.access_token, data.user, data.role);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signupFarmer = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/farmer/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Farmer registration failed');
      }
      saveAuthSession(data.access_token, data.user, data.role);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signupBuyer = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/buyer/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Buyer registration failed');
      }
      saveAuthSession(data.access_token, data.user, data.role);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (phone, purpose = 'signup') => {
    const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to send OTP');
    }
    return data;
  };

  const verifyOTP = async (phone, otp, purpose = 'signup') => {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, purpose })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Invalid OTP code');
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('agripulse_token');
    localStorage.removeItem('agripulse_user');
    localStorage.removeItem('agripulse_role');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      signupFarmer,
      signupBuyer,
      sendOTP,
      verifyOTP,
      logout,
      API_BASE
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
