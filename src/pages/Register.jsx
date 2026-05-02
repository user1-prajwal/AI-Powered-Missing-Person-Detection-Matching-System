
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [form,    setForm]    = useState({ name: "", email: "", password: "", type: "ngo" });
  const [status,  setStatus]  = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setStatus("error"); setMessage("Please fill all fields."); return;
    }
    setLoading(true); setStatus(null);
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      setStatus("success");
      setMessage("Application submitted! Super Admin will review within 24 hours.");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Registration failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.blob1} />
      <div style={S.blob2} />

      <div style={S.container} className="fade-up">

        {/* ── TOP HEADER ── */}
        <div style={S.header}>
          <div style={S.formBadge}>🏢 Organization Registration</div>
          <h2 style={S.formTitle}>Apply for Access</h2>
          <p style={S.formSub}>
            Verified police stations and NGOs only.
            Super Admin reviews and approves within 24 hours.
          </p>
        </div>

        {/* ── STEPS ROW ── */}
        <div style={S.stepsRow}>
          {[
            { n: "01", title: "Submit Form",      desc: "Fill details below" },
            { n: "02", title: "Admin Reviews",    desc: "Within 24 hours"    },
            { n: "03", title: "Get Approved",     desc: "Email confirmation"  },
            { n: "04", title: "Access Dashboard", desc: "Start saving lives"  },
          ].map((s, i) => (
            <div key={s.n} style={S.stepItem}>
              <div style={{
                ...S.stepCircle,
                background: i === 0
                  ? "linear-gradient(135deg, #1d4ed8, #3b82f6)"
                  : "rgba(59,130,246,0.08)",
                border: i === 0
                  ? "none"
                  : "1px solid rgba(59,130,246,0.2)",
              }}>
                <span style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize  : "11px",
                  fontWeight: "700",
                  color     : i === 0 ? "white" : "#3b82f6",
                }}>
                  {s.n}
                </span>
              </div>
              {/* connector */}
              {i < 3 && <div style={S.hConnector} />}
              <div style={S.stepLabel}>{s.title}</div>
              <div style={S.stepDesc}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* ── FORM GRID ── */}
        <div style={S.formGrid}>

          {/* Org Name */}
          <div style={S.field}>
            <label style={S.label}>ORGANIZATION NAME</label>
            <input
              style       = {S.input}
              name        = "name"
              placeholder = "e.g. Bengaluru City Police"
              value       = {form.name}
              onChange    = {handleChange}
            />
          </div>

          {/* Email */}
          <div style={S.field}>
            <label style={S.label}>OFFICIAL EMAIL</label>
            <input
              style       = {S.input}
              name        = "email"
              type        = "email"
              placeholder = "official@organization.gov.in"
              value       = {form.email}
              onChange    = {handleChange}
            />
          </div>

          {/* Password */}
          <div style={S.field}>
            <label style={S.label}>CREATE PASSWORD</label>
            <input
              style       = {S.input}
              name        = "password"
              type        = "password"
              placeholder = "Minimum 8 characters"
              value       = {form.password}
              onChange    = {handleChange}
            />
          </div>

          {/* Type selector */}
          <div style={S.field}>
            <label style={S.label}>ORGANIZATION TYPE</label>
            <div style={S.typeRow}>
              {[
                { val: "police", label: "👮 Police Station" },
                { val: "ngo",    label: "🤝 NGO / Welfare"  },
              ].map(t => (
                <div
                  key     = {t.val}
                  onClick = {() => setForm({ ...form, type: t.val })}
                  style   = {{
                    ...S.typeBtn,
                    background: form.type === t.val
                      ? "rgba(59,130,246,0.15)"
                      : "rgba(255,255,255,0.02)",
                    border: form.type === t.val
                      ? "1px solid rgba(59,130,246,0.5)"
                      : "1px solid rgba(59,130,246,0.12)",
                    color: form.type === t.val ? "#60a5fa" : "#475569",
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── WHO CAN REGISTER ── */}
        <div style={S.whoRow}>
          <div style={S.whoLabel}>Who can register?</div>
          <div style={S.whoItems}>
            {[
              "👮 Police Stations",
              "🤝 NGOs",
              "🏥 Govt. Departments",
              "🔍 Investigation Agencies",
            ].map(w => (
              <div key={w} style={S.whoChip}>{w}</div>
            ))}
          </div>
        </div>

        {/* ── STATUS ── */}
        {status === "success" && (
          <div style={S.alertGreen}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#22c55e" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {message}
          </div>
        )}
        {status === "error" && (
          <div style={S.alertRed}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#ef4444" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8"  x2="12"    y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {message}
          </div>
        )}

        {/* ── SUBMIT ── */}
        <button
          onClick  = {handleSubmit}
          disabled = {loading || status === "success"}
          style    = {{
            ...S.btn,
            opacity: (loading || status === "success") ? 0.6 : 1,
            cursor : (loading || status === "success") ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit Application →"}
        </button>

        <div style={S.loginRow}>
          Already have access?{" "}
          <Link to="/admin" style={S.loginLink}>Sign in here</Link>
        </div>

      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight      : "calc(100vh - 64px)",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
    padding        : "40px 24px",
    position       : "relative",
    overflow       : "hidden",
  },
  blob1: {
    position     : "absolute", top: "-150px", right: "-150px",
    width: "500px", height: "500px", borderRadius: "50%",
    background   : "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position     : "absolute", bottom: "-150px", left: "-150px",
    width: "500px", height: "500px", borderRadius: "50%",
    background   : "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  /* Main card */
  container: {
    width          : "100%",
    maxWidth       : "720px",
    padding        : "40px 44px",
    background     : "rgba(10,22,40,0.8)",
    border         : "1px solid rgba(59,130,246,0.15)",
    borderRadius   : "24px",
    backdropFilter : "blur(24px)",
    position       : "relative",
    zIndex         : 1,
  },

  /* Header */
  header   : { textAlign: "center", marginBottom: "36px" },
  formBadge: {
    display      : "inline-flex",
    alignItems   : "center",
    gap          : "6px",
    padding      : "5px 14px",
    borderRadius : "20px",
    background   : "rgba(59,130,246,0.1)",
    border       : "1px solid rgba(59,130,246,0.2)",
    color        : "#60a5fa",
    fontSize     : "11px",
    fontWeight   : "600",
    letterSpacing: "0.5px",
    marginBottom : "16px",
  },
  formTitle: {
    fontFamily  : "'Syne', sans-serif",
    fontSize    : "28px",
    fontWeight  : "800",
    color       : "#f0f4ff",
    marginBottom: "8px",
  },
  formSub: {
    fontSize  : "14px",
    color     : "#475569",
    lineHeight: "1.6",
  },

  /* Steps row */
  stepsRow: {
    display        : "flex",
    alignItems     : "flex-start",
    justifyContent : "center",
    marginBottom   : "36px",
    position       : "relative",
    gap            : "0",
  },
  stepItem: {
    display        : "flex",
    flexDirection  : "column",
    alignItems     : "center",
    flex           : 1,
    position       : "relative",
    textAlign      : "center",
  },
  stepCircle: {
    width          : "40px",
    height         : "40px",
    borderRadius   : "50%",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
    zIndex         : 1,
    marginBottom   : "10px",
  },
  hConnector: {
    position  : "absolute",
    top       : "20px",
    left       : "60%",
    width     : "80%",
    height    : "1px",
    background: "rgba(59,130,246,0.2)",
    zIndex    : 0,
  },
  stepLabel: {
    fontSize  : "12px",
    fontWeight: "600",
    color     : "#cbd5e1",
    marginBottom: "3px",
  },
  stepDesc: { fontSize: "11px", color: "#334155" },

  /* Form grid — 2 columns */
  formGrid: {
    display              : "grid",
    gridTemplateColumns  : "1fr 1fr",
    gap                  : "18px",
    marginBottom         : "24px",
  },
  field: {},
  label: {
    display      : "block",
    fontSize     : "11px",
    fontWeight   : "600",
    color        : "#475569",
    letterSpacing: "0.8px",
    marginBottom : "8px",
  },
  input: {
    width      : "100%",
    padding    : "12px 16px",
    background : "rgba(255,255,255,0.04)",
    border     : "1px solid rgba(59,130,246,0.15)",
    borderRadius: "10px",
    color      : "#f0f4ff",
    fontFamily : "'DM Sans', sans-serif",
    fontSize   : "14px",
    outline    : "none",
    boxSizing  : "border-box",
    transition : "border-color 0.2s",
  },
  typeRow: { display: "flex", gap: "10px" },
  typeBtn: {
    flex        : 1,
    padding     : "12px",
    borderRadius: "10px",
    textAlign   : "center",
    cursor      : "pointer",
    fontSize    : "13px",
    fontWeight  : "500",
    transition  : "all 0.2s",
  },

  /* Who row */
  whoRow: {
    display      : "flex",
    alignItems   : "center",
    gap          : "14px",
    padding      : "16px 20px",
    background   : "rgba(59,130,246,0.04)",
    border       : "1px solid rgba(59,130,246,0.1)",
    borderRadius : "12px",
    marginBottom : "24px",
    flexWrap     : "wrap",
  },
  whoLabel: {
    fontSize     : "11px",
    fontWeight   : "700",
    color        : "#475569",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    whiteSpace   : "nowrap",
  },
  whoItems: { display: "flex", gap: "8px", flexWrap: "wrap" },
  whoChip : {
    padding     : "5px 12px",
    borderRadius: "20px",
    background  : "rgba(59,130,246,0.08)",
    border      : "1px solid rgba(59,130,246,0.15)",
    color       : "#64748b",
    fontSize    : "12px",
  },

  /* Alerts */
  alertGreen: {
    display     : "flex", alignItems: "center", gap: "8px",
    padding     : "11px 14px", borderRadius: "10px",
    background  : "rgba(34,197,94,0.08)",
    border      : "1px solid rgba(34,197,94,0.2)",
    color       : "#22c55e", fontSize: "13px", marginBottom: "16px",
    lineHeight  : "1.5",
  },
  alertRed: {
    display     : "flex", alignItems: "center", gap: "8px",
    padding     : "11px 14px", borderRadius: "10px",
    background  : "rgba(239,68,68,0.08)",
    border      : "1px solid rgba(239,68,68,0.2)",
    color       : "#ef4444", fontSize: "13px", marginBottom: "16px",
  },

  /* Submit */
  btn: {
    width        : "100%",
    padding      : "14px",
    background   : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
    border       : "none",
    borderRadius : "12px",
    color        : "white",
    fontFamily   : "'Syne', sans-serif",
    fontSize     : "15px",
    fontWeight   : "600",
    letterSpacing: "0.3px",
    boxShadow    : "0 4px 20px rgba(59,130,246,0.3)",
    transition   : "all 0.2s",
    marginBottom : "20px",
  },
  loginRow: {
    textAlign: "center",
    fontSize : "13px",
    color    : "#334155",
  },
  loginLink: {
    color         : "#60a5fa",
    textDecoration: "none",
    fontWeight    : "600",
  },
};