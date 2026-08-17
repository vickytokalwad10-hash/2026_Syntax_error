import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext();

// Fallback API for non-auth backend calls (copilot, market data, etc.)
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load user profile from Firestore
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profile = docSnap.data();
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...profile });
          setRole(profile.role || null);
        } else {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─── FARMER SIGNUP ──────────────────────────────────────────────────────────
  const signupFarmer = async ({ name, phone, village, district, state, password }) => {
    const email = `${phone}@agripulse.farmer`;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile = {
      name, phone, village, district, state,
      role: "farmer",
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), profile);
    setRole("farmer");
    return cred;
  };

  // ─── BUYER SIGNUP ────────────────────────────────────────────────────────────
  const signupBuyer = async ({ name, phone, company, gst, state, password }) => {
    const email = `${phone}@agripulse.buyer`;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile = {
      name, phone, company, gst, state,
      role: "buyer",
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), profile);
    setRole("buyer");
    return cred;
  };

  // ─── LOGIN (farmer or buyer) ─────────────────────────────────────────────────
  const login = async (phone, password, targetRole) => {
    const email = `${phone}@agripulse.${targetRole}`;
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Profile is loaded automatically via onAuthStateChanged
    return cred;
  };

  // ─── LOGOUT ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated: Boolean(user),
        login,
        signupFarmer,
        signupBuyer,
        logout,
        API_BASE,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
