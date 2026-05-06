
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("orgName", res.data.org_name);
      localStorage.setItem("orgType", res.data.org_type);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.blob1}></div>
      <div style={S.blob2}></div>

      <div style={S.outer}>
        <div style={S.wrapper}>
          
          {/* LEFT */}
          <div style={S.left}>
            
            <div style={S.statsRow}>
              {[
                { num: "10K+", label: "Sightings Reported" },
                { num: "94%", label: "Match Accuracy" },
                { num: "< 30s", label: "Alert Delivery" },
              ].map((s) => (
                <div key={s.label} style={S.statBox}>
                  <div style={S.statNum}>{s.num}</div>
                  <div style={S.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <h1 style={S.leftTitle}>
              Authorized <br /> Personnel <br /> Access
            </h1>

            <div style={S.accentLine}></div>

            <p style={S.leftSub}>
              Secure portal for verified police stations and NGOs to manage
              missing person records and receive AI match alerts.
            </p>

            <div style={S.divider}></div>

            <div style={S.featureList}>
              {[
                { icon: "🔍", title: "AI Face Matching", desc: "Real-time comparison" },
                { icon: "📍", title: "GPS Tracking", desc: "Accurate coordinates" },
                { icon: "⚡", title: "Instant Alerts", desc: "Immediate notifications" },
                { icon: "🔐", title: "Secure Access", desc: "Admin approved only" },
              ].map((f) => (
                <div key={f.title} style={S.feature}>
                  <span>{f.icon}</span>
                  <div>
                    <div style={S.featureTitle}>{f.title}</div>
                    <div style={S.featureDesc}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT FORM */}
          <div style={S.formCard}>
            <div style={S.formBadge}>🏛 Police / NGO Portal</div>

            <h2 style={S.formTitle}>Welcome back</h2>
            <p style={S.formSub}>Sign in to access your dashboard</p>

            <div style={S.fieldGroup}>
              <label style={S.label}>EMAIL</label>
              <input
                style={S.input}
                type="email"
                placeholder="you@organization.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={S.fieldGroup}>
              <label style={S.label}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input
                  style={S.input}
                  type={showPass ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  onClick={() => setShowPass((p) => !p)}
                  style={S.eyeBtn}
                  type="button"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <div style={S.errorBox}>{error}</div>}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={S.btn}
            >
              {loading ? "Verifying..." : "Sign In →"}
            </button>

            <div style={S.registerRow}>
              New organization?{" "}
              <Link to="/register" style={S.registerLink}>
                Apply for access
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background: "#020617",
  },

  outer: {
    width: "100%",
    padding: "0 40px",
    display: "flex",
    justifyContent: "center",
  },

  wrapper: {
    display: "flex",
    gap: "100px",
    maxWidth: "1200px",
    width: "100%",
    alignItems: "center",
  },

  blob1: {
    position: "absolute",
    top: "-150px",
    right: "-150px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent)",
  },

  blob2: {
    position: "absolute",
    bottom: "-200px",
    left: "-100px",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.1), transparent)",
  },

  left: { flex: 0.9 },

  leftTitle: {
    fontSize: "48px",
    fontWeight: "900",
    color: "#f0f4ff",
    lineHeight: "1.1",
  },

  accentLine: {
    width: "60px",
    height: "4px",
    background: "linear-gradient(90deg,#3b82f6,#60a5fa)",
    borderRadius: "10px",
    margin: "20px 0",
  },

  leftSub: {
    color: "#94a3b8",
    lineHeight: "1.6",
    marginBottom: "20px",
  },

  divider: {
    height: "1px",
    background: "rgba(59,130,246,0.2)",
    margin: "20px 0",
  },

  featureList: { display: "flex", flexDirection: "column", gap: "16px" },

  feature: { display: "flex", gap: "10px" },

  featureTitle: { color: "#cbd5e1", fontWeight: "600" },

  featureDesc: { color: "#64748b", fontSize: "12px" },

  statsRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "30px",
  },

  statBox: {
    flex: 1,
    padding: "16px",
    background: "rgba(59,130,246,0.08)",
    borderRadius: "12px",
  },

  statNum: { color: "#60a5fa", fontWeight: "800", fontSize: "20px" },

  statLabel: { color: "#64748b", fontSize: "12px" },

  formCard: {
    width: "420px",
    padding: "40px",
    background: "rgba(15,23,42,0.8)",
    borderRadius: "20px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },

  formBadge: {
    color: "#60a5fa",
    marginBottom: "20px",
    fontSize: "12px",
  },

  formTitle: { color: "#fff", fontSize: "24px", fontWeight: "700" },

  formSub: { color: "#64748b", marginBottom: "20px" },

  fieldGroup: { marginBottom: "16px" },

  label: { fontSize: "12px", color: "#64748b" },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(59,130,246,0.2)",
    color: "#fff",
  },

  eyeBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  errorBox: {
    color: "#ef4444",
    marginBottom: "10px",
  },

  btn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg,#2563eb,#3b82f6)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },

  registerRow: {
    textAlign: "center",
    marginTop: "15px",
    color: "#64748b",
  },

  registerLink: {
    color: "#60a5fa",
    textDecoration: "none",
  },
};