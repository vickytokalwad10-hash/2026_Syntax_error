import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, User, Phone, Lock, MapPin, ArrowLeft, ArrowRight, AlertCircle, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function BuyerSignup() {
  const navigate = useNavigate();
  const { signupBuyer } = useAuth();

  const [form, setForm] = useState({ name: "", phone: "", company: "", gst: "", state: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      await signupBuyer(form);
      navigate("/dashboard/buyer");
    } catch (err) {
      setError(err.code === "auth/email-already-in-use"
        ? "This mobile number is already registered. Please login."
        : err.message || "Registration failed.");
    } finally { setBusy(false); }
  };

  const field = (label, key, type = "text", icon, placeholder) => (
    <div style={{ marginBottom: "0.9rem" }}>
      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "5px" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {icon && React.cloneElement(icon, { size: 15, style: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" } })}
        <input type={type} value={form[key]} onChange={handleChange(key)} placeholder={placeholder} required={key !== "gst"} style={{ paddingLeft: icon ? "36px" : "12px", width: "100%" }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem 1rem" }}>
      <div style={{ background: "#FFFFFF", border: "2px solid #E2E8F0", borderRadius: "16px", width: "100%", maxWidth: "480px", padding: "2rem", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.4rem" }}>
          <button onClick={() => navigate("/auth/buyer/login")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.82rem" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 10px", borderRadius: "999px", background: "#F1F5F9", color: "#0F172A", fontSize: "0.8rem", fontWeight: "700" }}>
            <Building2 size={14} /> Buyer Registration
          </div>
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.3rem" }}>Create Buyer Account</h2>
        <p style={{ fontSize: "0.85rem", color: "#64748B", marginBottom: "1.5rem" }}>Register to procure directly from verified farm clusters.</p>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "10px 12px", marginBottom: "1rem", color: "#991B1B", fontSize: "0.85rem" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {field("Contact Person Name", "name", "text", <User />, "e.g. Anita Sharma")}
          {field("Mobile Number (used to login)", "phone", "tel", <Phone />, "10-digit number")}
          {field("Company / Firm Name", "company", "text", <Building2 />, "Your business name")}
          {field("GST Number (optional)", "gst", "text", <FileText />, "15-digit GST number")}
          {field("State", "state", "text", <MapPin />, "State of operation")}
          {field("Password", "password", "password", <Lock />, "Minimum 6 characters")}
          {field("Confirm Password", "confirm", "password", <Lock />, "Repeat your password")}

          <button type="submit" disabled={busy} style={{ width: "100%", padding: "12px", background: "#0F172A", color: "#FFFFFF", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "0.5rem" }}>
            {busy ? "Creating account..." : <><span>Register as Buyer</span> <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.85rem", color: "#64748B" }}>
          Already registered? <Link to="/auth/buyer/login" style={{ color: "#0F172A", fontWeight: "700", textDecoration: "none" }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
