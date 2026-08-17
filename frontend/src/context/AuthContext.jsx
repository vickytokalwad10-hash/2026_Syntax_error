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
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Extract role from Firebase email format: "9800000001@agripulse.farmer" -> "farmer"
function getRoleFromEmail(email = "") {
  if (email.includes("@agripulse.farmer")) return "farmer";
  if (email.includes("@agripulse.buyer")) return "buyer";
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const inferredRole = getRoleFromEmail(firebaseUser.email);
        
        // Try to load Firestore profile — but don't crash if it fails
        try {
          const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (docSnap.exists()) {
            const profile = docSnap.data();
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName, ...profile });
            setRole(profile.role || inferredRole);
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName });
            setRole(inferredRole);
          }
        } catch (_) {
          // Firestore unavailable — still log user in using Auth data
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName });
          setRole(inferredRole);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─── FARMER SIGNUP ─────────────────────────────────────────────────────────
  const signupFarmer = async ({ name, phone, village, district, state, password }) => {
    const email = `${phone}@agripulse.farmer`;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        name, phone, village, district, state, role: "farmer", createdAt: serverTimestamp(),
      });
    } catch (_) { /* Firestore write failed — auth still works */ }
    setRole("farmer");
    return cred;
  };

  // ─── BUYER SIGNUP ───────────────────────────────────────────────────────────
  const signupBuyer = async ({ name, phone, company, gst, state, password }) => {
    const email = `${phone}@agripulse.buyer`;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        name, phone, company, gst, state, role: "buyer", createdAt: serverTimestamp(),
      });
    } catch (_) { /* Firestore write failed — auth still works */ }
    setRole("buyer");
    return cred;
  };

  // ─── LOGIN ──────────────────────────────────────────────────────────────────
  const login = async (phone, password, targetRole) => {
    const email = `${phone}@agripulse.${targetRole}`;
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setRole(targetRole);
    return cred;
  };

  // ─── LOGOUT ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user, role, loading,
      isAuthenticated: Boolean(user),
      login, signupFarmer, signupBuyer, logout,
      API_BASE,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
