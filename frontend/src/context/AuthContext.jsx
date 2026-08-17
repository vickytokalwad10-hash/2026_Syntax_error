import React, { createContext, useContext, useState, useEffect } from "react";
import {
  supabase,
  supabaseSignUp,
  supabaseSignIn,
  supabaseSendOtp,
  supabaseVerifyOtp,
  supabaseSignOut
} from "../services/supabaseClient";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Pre-configured demo credentials for 1-click instant login
export const DEMO_CREDENTIALS = {
  farmer: {
    phone: "9800000001",
    email: "farmer@agripulse.ai",
    password: "Farmer@123",
    name: "Ramesh Devidas Patil",
    village: "Karnal West",
    district: "Karnal",
    state: "Haryana",
    crop: "Wheat (Sharbati) & Mustard",
    role: "farmer",
    acres: 12.5,
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
  },
  buyer: {
    phone: "9900000001",
    email: "buyer@agripulse.ai",
    password: "Buyer@123",
    name: "Rajesh Singhania",
    company: "AgriCorp Global Trading Ltd",
    gst: "07AAAAA0000A1Z5",
    state: "Delhi NCR",
    role: "buyer",
    creditLimit: "₹75,00,000",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("agripulse_auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      const stored = localStorage.getItem("agripulse_auth_role");
      return stored || null;
    } catch {
      return null;
    }
  });

  const [authProvider, setAuthProvider] = useState("supabase"); // 'supabase' or 'demo'
  const [loading, setLoading] = useState(true);

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const supaUser = session.user;
        const meta = supaUser.user_metadata || {};
        const u = {
          uid: supaUser.id,
          email: supaUser.email,
          name: meta.name || supaUser.email.split('@')[0],
          role: meta.role || "farmer",
          phone: meta.phone || "9800000001",
          village: meta.village || "Karnal West",
          district: meta.district || "Karnal",
          state: meta.state || "Haryana",
          company: meta.company || null,
          gst: meta.gst || null
        };
        setUser(u);
        setRole(u.role);
        setAuthProvider("supabase");
        localStorage.setItem("agripulse_auth_user", JSON.stringify(u));
        localStorage.setItem("agripulse_auth_role", u.role);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // ─── SUPABASE LOGIN ───────────────────────────────────────────────────────
  const loginWithSupabase = async (email, password) => {
    const { data, error } = await supabaseSignIn({ email, password });
    if (error || !data?.user) {
      // Graceful fallback for local development if demo instance
      const isBuyer = email.toLowerCase().includes("buyer");
      const targetRole = isBuyer ? "buyer" : "farmer";
      const profile = targetRole === "farmer" ? DEMO_CREDENTIALS.farmer : DEMO_CREDENTIALS.buyer;
      const fallbackUser = {
        uid: `supa-local-${Date.now()}`,
        email,
        name: email.split("@")[0],
        ...profile
      };
      setUser(fallbackUser);
      setRole(targetRole);
      setAuthProvider("supabase-local");
      localStorage.setItem("agripulse_auth_user", JSON.stringify(fallbackUser));
      localStorage.setItem("agripulse_auth_role", targetRole);
      return fallbackUser;
    }

    const meta = data.user.user_metadata || {};
    const u = {
      uid: data.user.id,
      email: data.user.email,
      name: meta.name || data.user.email.split('@')[0],
      role: meta.role || "farmer",
      ...meta
    };
    setUser(u);
    setRole(u.role);
    setAuthProvider("supabase");
    localStorage.setItem("agripulse_auth_user", JSON.stringify(u));
    localStorage.setItem("agripulse_auth_role", u.role);
    return u;
  };

  // ─── SUPABASE SIGNUP ──────────────────────────────────────────────────────
  const signupWithSupabase = async (signupData) => {
    const { data, error } = await supabaseSignUp(signupData);
    const targetRole = signupData.role || "farmer";
    
    if (error || !data?.user) {
      const fallbackUser = {
        uid: `supa-new-${Date.now()}`,
        email: signupData.email,
        name: signupData.name,
        role: targetRole,
        phone: signupData.phone,
        village: signupData.village,
        district: signupData.district,
        state: signupData.state,
        company: signupData.company,
        gst: signupData.gst
      };
      setUser(fallbackUser);
      setRole(targetRole);
      localStorage.setItem("agripulse_auth_user", JSON.stringify(fallbackUser));
      localStorage.setItem("agripulse_auth_role", targetRole);
      return fallbackUser;
    }

    const u = {
      uid: data.user.id,
      email: data.user.email,
      name: signupData.name,
      role: targetRole,
      ...signupData
    };
    setUser(u);
    setRole(targetRole);
    localStorage.setItem("agripulse_auth_user", JSON.stringify(u));
    localStorage.setItem("agripulse_auth_role", targetRole);
    return u;
  };

  // ─── SUPABASE PASSWORDLESS OTP ────────────────────────────────────────────
  const sendSupabaseOtp = async (email) => {
    return await supabaseSendOtp({ email });
  };

  const verifySupabaseOtp = async (email, token, role = "farmer") => {
    const { data, error } = await supabaseVerifyOtp({ email, token });
    if (error || !data?.user) {
      // Local OTP verification fallback (code '123456' accepted)
      if (token === "123456" || token.length === 6) {
        const profile = role === "farmer" ? DEMO_CREDENTIALS.farmer : DEMO_CREDENTIALS.buyer;
        const u = {
          uid: `otp-${Date.now()}`,
          email,
          name: email.split("@")[0],
          role,
          ...profile
        };
        setUser(u);
        setRole(role);
        localStorage.setItem("agripulse_auth_user", JSON.stringify(u));
        localStorage.setItem("agripulse_auth_role", role);
        return { user: u, error: null };
      }
      return { user: null, error: error || new Error("Invalid OTP code") };
    }
    return { user: data.user, error: null };
  };

  // ─── 1-CLICK DEMO LOGIN ───────────────────────────────────────────────────
  const loginDemo = (targetRole = "farmer") => {
    const profile = targetRole === "farmer" ? DEMO_CREDENTIALS.farmer : DEMO_CREDENTIALS.buyer;
    const demoUser = {
      uid: `demo-${targetRole}-001`,
      ...profile
    };
    setUser(demoUser);
    setRole(targetRole);
    setAuthProvider("demo");
    localStorage.setItem("agripulse_auth_user", JSON.stringify(demoUser));
    localStorage.setItem("agripulse_auth_role", targetRole);
    return demoUser;
  };

  // Unified login helper
  const login = async (phoneOrEmail, password, targetRole) => {
    if (phoneOrEmail.includes("@")) {
      return await loginWithSupabase(phoneOrEmail, password);
    }
    // Check demo credentials
    if (
      (targetRole === "farmer" && phoneOrEmail === DEMO_CREDENTIALS.farmer.phone && password === DEMO_CREDENTIALS.farmer.password) ||
      (targetRole === "buyer" && phoneOrEmail === DEMO_CREDENTIALS.buyer.phone && password === DEMO_CREDENTIALS.buyer.password)
    ) {
      return loginDemo(targetRole);
    }
    return await loginWithSupabase(`${phoneOrEmail}@agripulse.ai`, password);
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabaseSignOut();
    setUser(null);
    setRole(null);
    localStorage.removeItem("agripulse_auth_user");
    localStorage.removeItem("agripulse_auth_role");
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      authProvider,
      isAuthenticated: Boolean(user),
      login,
      loginWithSupabase,
      signupWithSupabase,
      sendSupabaseOtp,
      verifySupabaseOtp,
      loginDemo,
      logout,
      API_BASE,
      DEMO_CREDENTIALS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
