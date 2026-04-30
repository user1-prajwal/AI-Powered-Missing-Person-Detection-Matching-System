// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// function AdminLogin() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error,    setError]    = useState("");
//   const [loading,  setLoading]  = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     if (!username || !password) {
//       setError("Please enter username and password.");
//       return;
//     }
//     setLoading(true);
//     setError("");

//     try {
//       const res = await axios.post("http://localhost:5000/api/admin/login", {
//         username, password
//       });
//       localStorage.setItem("adminToken", res.data.token);
//       navigate("/dashboard");
//     } catch (err) {
//       setError("Invalid credentials. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         <div style={{ textAlign: "center", fontSize: "48px" }}>🔐</div>
//         <h2 style={styles.title}>Admin Login</h2>
//         <p style={styles.subtitle}>Police / NGO portal</p>

//         <input
//           style       = {styles.input}
//           placeholder = "Username"
//           value       = {username}
//           onChange    = {e => setUsername(e.target.value)}
//         />
//         <input
//           style       = {styles.input}
//           placeholder = "Password"
//           type        = "password"
//           value       = {password}
//           onChange    = {e => setPassword(e.target.value)}
//           onKeyDown   = {e => e.key === "Enter" && handleLogin()}
//         />

//         {error && <p style={styles.error}>{error}</p>}

//         <button
//           onClick  = {handleLogin}
//           disabled = {loading}
//           style    = {{ ...styles.button, opacity: loading ? 0.6 : 1 }}
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   page    : { minHeight: "90vh", backgroundColor: "#f0f2f5", display: "flex", justifyContent: "center", alignItems: "center" },
//   card    : { backgroundColor: "white", borderRadius: "12px", padding: "40px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
//   title   : { textAlign: "center", marginBottom: "4px" },
//   subtitle: { textAlign: "center", color: "#888", marginBottom: "24px" },
//   input   : { width: "100%", padding: "12px", marginBottom: "14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" },
//   button  : { width: "100%", padding: "14px", backgroundColor: "#1a1a2e", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
//   error   : { color: "red", fontSize: "13px", marginBottom: "10px", textAlign: "center" }
// };

// export default AdminLogin;






// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";

// function AdminLogin() {
//   const [email,    setEmail]    = useState("");
//   const [password, setPassword] = useState("");
//   const [error,    setError]    = useState("");
//   const [loading,  setLoading]  = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     if (!email || !password) { setError("Please enter email and password."); return; }
//     setLoading(true);
//     setError("");

//     try {
//       const res = await axios.post("http://localhost:5000/api/auth/login", {
//         email, password
//       });

//       // Save everything we need
//       localStorage.setItem("adminToken",   res.data.token);
//       localStorage.setItem("orgName",      res.data.org_name);
//       localStorage.setItem("orgType",      res.data.org_type);

//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.error || "Login failed. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         <div style={{ textAlign: "center", fontSize: "48px" }}>🔐</div>
//         <h2 style={styles.title}>Admin Login</h2>
//         <p style={styles.subtitle}>Police / NGO portal</p>

//         <input
//           style       = {styles.input}
//           placeholder = "Email"
//           type        = "email"
//           value       = {email}
//           onChange    = {e => setEmail(e.target.value)}
//         />
//         <input
//           style       = {styles.input}
//           placeholder = "Password"
//           type        = "password"
//           value       = {password}
//           onChange    = {e => setPassword(e.target.value)}
//           onKeyDown   = {e => e.key === "Enter" && handleLogin()}
//         />

//         {error && <p style={styles.error}>{error}</p>}

//         <button
//           onClick  = {handleLogin}
//           disabled = {loading}
//           style    = {{ ...styles.button, opacity: loading ? 0.6 : 1 }}
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>

//         <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#666" }}>
//           New organization?{" "}
//           <Link to="/register" style={{ color: "#1a1a2e", fontWeight: "bold" }}>
//             Register here
//           </Link>
//         </p>
//       </div>
  //   </div>
  // );
// }

// const styles = {
//   page    : { minHeight: "90vh", backgroundColor: "#f0f2f5", display: "flex", justifyContent: "center", alignItems: "center" },
//   card    : { backgroundColor: "white", borderRadius: "12px", padding: "40px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
//   title   : { textAlign: "center", marginBottom: "4px" },
//   subtitle: { textAlign: "center", color: "#888", marginBottom: "24px" },
//   input   : { width: "100%", padding: "12px", marginBottom: "14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" },
//   button  : { width: "100%", padding: "14px", backgroundColor: "#1a1a2e", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
//   error   : { color: "red", fontSize: "13px", marginBottom: "10px", textAlign: "center" }
// };

// export default AdminLogin;




import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function AdminLogin() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("orgName",    res.data.org_name);
      localStorage.setItem("orgType",    res.data.org_type);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>

      {/* Background blobs */}
      <div style={S.blob1} />
      <div style={S.blob2} />

      <div style={S.wrapper} className="fade-up">

        {/* ── LEFT INFO PANEL ── */}
        <div style={S.left}>
{/* 
          <div style={S.logoRow}>
            <div style={S.logoBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#60a5fa" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
           
          </div> */}


          <div style={S.statsRow}>
             {[
                { num: "10K+",  label: "Sightings Reported" },
                { num: "94%",   label: "Match Accuracy"     },
                { num: "< 30s", label: "Alert Delivery"     },
              ].map(s => (
            <div key={s.label} style={S.statBox}>
              <div style={S.statNum}>{s.num}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
            ))}
          </div>

          <h1 style={S.leftTitle}>Authorized<br />Personnel<br />Access</h1>

          <p style={S.leftSub}>
            Secure portal for verified police stations
            and NGOs to manage missing person records
            and receive AI match alerts.
          </p>

          <div style={S.divider} />

          <div style={S.featureList}>
            {[
              { icon: "🔍", title: "AI Face Matching",      desc: "Real-time comparison against database" },
              { icon: "📍", title: "GPS Location Capture",  desc: "Precise coordinates on every sighting" },
              { icon: "⚡", title: "Instant Email Alerts",  desc: "Family notified the moment match found" },
              { icon: "🔐", title: "Verified Access Only",  desc: "Super Admin approved organizations only" },
            ].map(f => (
              <div key={f.title} style={S.feature}>
                <span style={{ fontSize: "18px" }}>{f.icon}</span>
                <div>
                  <div style={S.featureTitle}>{f.title}</div>
                  <div style={S.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── RIGHT FORM ── */}
        <div style={S.formCard}>

          <div style={S.formBadge}>🏛 Police / NGO Portal</div>

          <h2 style={S.formTitle}>Welcome back</h2>
          <p style={S.formSub}>Sign in to access your dashboard</p>

          {/* Email */}
          <div style={S.fieldGroup}>
            <label style={S.label}>EMAIL ADDRESS</label>
            <input
              style       = {S.input}
              type        = "email"
              placeholder = "you@organization.gov.in"
              value       = {email}
              onChange    = {e => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div style={S.fieldGroup}>
            <label style={S.label}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input
                style       = {S.input}
                type        = {showPass ? "text" : "password"}
                placeholder = "Enter your password"
                value       = {password}
                onChange    = {e => setPassword(e.target.value)}
                onKeyDown   = {e => e.key === "Enter" && handleLogin()}
              />
              <button
                onClick = {() => setShowPass(p => !p)}
                style   = {S.eyeBtn}
                type    = "button"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={S.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8"  x2="12"    y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick  = {handleLogin}
            disabled = {loading}
            style    = {{
              ...S.btn,
              opacity: loading ? 0.6 : 1,
              cursor : loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Verifying..." : "Sign In →"}
          </button>

          {/* Register link */}
          <div style={S.registerRow}>
            New organization?{" "}
            <Link to="/register" style={S.registerLink}>
              Apply for access
            </Link>
          </div>

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
    position     : "absolute",
    top          : "-150px",
    right        : "-150px",
    width        : "500px",
    height       : "500px",
    borderRadius : "50%",
    background   : "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position     : "absolute",
    bottom       : "-200px",
    left         : "-100px",
    width        : "600px",
    height       : "600px",
    borderRadius : "50%",
    background   : "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  wrapper: {
    display    : "flex",
    gap        : "60px",
    maxWidth   : "920px",
    width      : "100%",
    alignItems : "center",
    position   : "relative",
    zIndex     : 1,
  },

  /* LEFT */
  left: { flex: 1 },
  // logoRow: {
  //   display      : "flex",
  //   alignItems   : "center",
  //   gap          : "10px",
  //   marginBottom : "36px",
  // },
  // logoBox: {
  //   width          : "44px",
  //   height         : "44px",
  //   borderRadius   : "12px",
  //   background     : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
  //   display        : "flex",
  //   alignItems     : "center",
  //   justifyContent : "center",
  //   boxShadow      : "0 6px 20px rgba(59,130,246,0.35)",
  // },
  // logoText: {
  //   fontFamily : "'Syne', sans-serif",
  //   fontSize   : "20px",
  //   fontWeight : "700",
  //   color      : "#f0f4ff",
  // },
  leftTitle: {
    fontFamily  : "'Syne', sans-serif",
    fontSize    : "clamp(32px, 3.5vw, 46px)",
    fontWeight  : "800",
    lineHeight  : "1.15",
    color       : "#f0f4ff",
    marginBottom: "18px",
  },
  leftSub: {
    fontSize    : "14px",
    color       : "#69b870",
    lineHeight  : "1.75",
    marginBottom: "28px",
    maxWidth    : "360px",
  },
  divider: {
    height      : "1px",
    background  : "rgba(59,130,246,0.12)",
    marginBottom: "28px",
  },
  featureList: { display: "flex", flexDirection: "column", gap: "18px" },
  feature: {
    display    : "flex",
    gap        : "14px",
    alignItems : "flex-start",
  },
  featureTitle: {
    fontSize    : "17px",
    fontWeight  : "600",
    color       : "#cbd5e1",
    marginBottom: "3px",
  },
  featureDesc: { fontSize: "12px", color: "#8dacd4" },

  /* RIGHT FORM */
  formCard: {
    width          : "380px",
    padding        : "38px 34px",
    background     : "rgba(10,22,40,0.8)",
    border         : "1px solid rgba(59,130,246,0.15)",
    borderRadius   : "20px",
    backdropFilter : "blur(24px)",
    flexShrink     : 0,
  },
  formBadge: {
    display        : "inline-flex",
    alignItems     : "center",
    gap            : "6px",
    padding        : "5px 12px",
    borderRadius   : "20px",
    background     : "rgba(59,130,246,0.1)",
    border         : "1px solid rgba(59,130,246,0.2)",
    color          : "#60a5fa",
    fontSize       : "11px",
    fontWeight     : "600",
    letterSpacing  : "0.5px",
    marginBottom   : "22px",
  },
  formTitle: {
    fontFamily  : "'Syne', sans-serif",
    fontSize    : "24px",
    fontWeight  : "700",
    color       : "#f0f4ff",
    marginBottom: "6px",
  },
  formSub: {
    fontSize    : "13px",
    color       : "#475569",
    marginBottom: "28px",
  },
  fieldGroup: { marginBottom: "18px" },
  label: {
    display       : "block",
    fontSize      : "11px",
    fontWeight    : "600",
    color         : "#475569",
    letterSpacing : "0.8px",
    marginBottom  : "8px",
  },
  input: {
    width          : "100%",
    padding        : "12px 16px",
    background     : "rgba(255,255,255,0.04)",
    border         : "1px solid rgba(59,130,246,0.15)",
    borderRadius   : "10px",
    color          : "#f0f4ff",
    fontFamily     : "'DM Sans', sans-serif",
    fontSize       : "14px",
    outline        : "none",
    boxSizing      : "border-box",
    transition     : "border-color 0.2s",
  },
  eyeBtn: {
    position   : "absolute",
    right      : "12px",
    top        : "50%",
    transform  : "translateY(-50%)",
    background : "none",
    border     : "none",
    cursor     : "pointer",
    fontSize   : "16px",
  },
  errorBox: {
    display      : "flex",
    alignItems   : "center",
    gap          : "8px",
    padding      : "10px 14px",
    borderRadius : "10px",
    background   : "rgba(239,68,68,0.08)",
    border       : "1px solid rgba(239,68,68,0.2)",
    color        : "#ef4444",
    fontSize     : "13px",
    marginBottom : "14px",
  },
  btn: {
    width        : "100%",
    padding      : "13px",
    background   : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
    border       : "none",
    borderRadius : "10px",
    color        : "white",
    fontFamily   : "'Syne', sans-serif",
    fontSize     : "14px",
    fontWeight   : "600",
    letterSpacing: "0.3px",
    boxShadow    : "0 4px 20px rgba(59,130,246,0.3)",
    transition   : "all 0.2s",
    marginBottom : "20px",
  },
  registerRow: {
    textAlign : "center",
    fontSize  : "13px",
    color     : "#334155",
  },
  registerLink: {
    color          : "#60a5fa",
    textDecoration : "none",
    fontWeight     : "600",
  },
// };

statsRow: {
  display      : "flex",
  gap          : "12px",
  marginBottom : "36px",
},
statBox: {
  flex         : 1,
  padding      : "16px 12px",
  background   : "rgba(59,130,246,0.06)",
  border       : "1px solid rgba(59,130,246,0.15)",
  borderRadius : "12px",
  textAlign    : "center",
},
statNum: {
  fontFamily  : "'Syne', sans-serif",
  fontSize    : "22px",
  fontWeight  : "800",
  color       : "#60a5fa",
  marginBottom: "4px",
},
statLabel: {
  fontSize: "11px",
  color   : "#475569",
  fontWeight: "500",
},
};