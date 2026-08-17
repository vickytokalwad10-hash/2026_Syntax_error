import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sprout, Phone, Lock, ArrowLeft, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function FarmerLogin() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(phone.trim(), password, "farmer");
      navigate("/dashboard/farmer");
    } catch (err) {
      const msg = err.code === "auth/invalid-credential"
        ? "Invalid phone number or password."
        : err.code === "auth/too-many-requests"
        ? "Too many attempts. Please try again later."
        : err.message || "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDemoFill = () => {
    setPhone("9800000001");
    setPassword("Farmer@123");
  };

  return (
    <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem 1rem" }}>
      <div style={{ background: "#FFFFFF", border: "2px solid #FDE68A", borderRadius: "16px", width: "100%", maxWidth: "440px", padding: "2.2rem", boxShadow: "0 8px 24px rgba(217, 119, 6, 0.08)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <button onClick={() => navigate("/auth/role")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.82rem" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 10px", borderRadius: "999px", background: "#FEF3C7", color: "#92400E", fontSize: "0.8rem", fontWeight: "700" }}>
            <Sprout size={14} /> Farmer Portal
          </div>
        </div>

        <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.4rem" }}>Farmer Login</h2>
        <p style={{ fontSize: "0.88rem", color: "#64748B", marginBottom: "1.6rem" }}>Enter your registered mobile number & password.</p>

        {/* Demo Credentials Box */}
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "12px 14px", marginBottom: "1.4rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#065F46", marginBottom: "2px" }}>🌾 Demo Farmer Account</p>
              <p style={{ fontSize: "0.75rem", color: "#047857" }}>Phone: <strong>9800000001</strong> | Pass: <strong>Farmer@123</strong></p>
            </div>
            <button onClick={handleDemoFill} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: "6px", padding: "5px 12px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>
              Fill
            </button>
          </div>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "10px 12px", marginBottom: "1rem", color: "#991B1B", fontSize: "0.85rem" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>Mobile Number</label>
            <div style={{ position: "relative" }}>
              <Phone size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile number" required style={{ paddingLeft: "36px !important", width: "100%", paddingLeft: "36px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "1.4rem" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required style={{ paddingLeft: "36px", width: "100%" }} />
            </div>
          </div>

          <button type="submit" disabled={busy} className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: "0.95rem", justifyContent: "center", gap: "8px" }}>
            {busy ? "Signing in..." : <><span>Login as Farmer</span> <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.85rem", color: "#64748B" }}>
          New farmer? <Link to="/auth/farmer/signup" style={{ color: "#D97706", fontWeight: "700", textDecoration: "none" }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
