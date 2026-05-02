

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const [image,       setImage]       = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [name,        setName]        = useState("");
  const [age,         setAge]         = useState("");
  const [familyEmail, setFamilyEmail] = useState("");
  const [status,      setStatus]      = useState(null);
  const [message,     setMessage]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [persons,     setPersons]     = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [dragOver,    setDragOver]    = useState(false);

  const navigate = useNavigate();
  const token   = localStorage.getItem("adminToken");
  const orgName = localStorage.getItem("orgName");
  const orgType = localStorage.getItem("orgType");

  useEffect(() => {
    if (!token) { navigate("/admin"); return; }
    axios.get("http://localhost:5000/api/admin/missing-persons", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setPersons(res.data.missing_persons);
      setAuthChecked(true);
    })
    .catch(() => { localStorage.clear(); navigate("/admin"); });
  }, []);

  if (!authChecked) return (
    <div style={S.loadingScreen}>
      <div style={S.spinner} />
      <p style={{ color: "#475569", fontSize: "14px", marginTop: "16px" }}>
        Authenticating...
      </p>
    </div>
  );

  const fetchPersons = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/admin/missing-persons",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPersons(res.data.missing_persons);
  };

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setStatus(null);
  };

  const handleSubmit = async () => {
    if (!image || !name || !familyEmail) {
      setStatus("error");
      setMessage("Please fill all fields and upload a photo.");
      return;
    }
    setLoading(true); setStatus(null);
    const fd = new FormData();
    fd.append("image",        image);
    fd.append("name",         name);
    fd.append("age",          age);
    fd.append("family_email", familyEmail);
    try {
      await axios.post(
        "http://localhost:5000/api/admin/add-missing", fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus("success");
      setMessage("Added! All sightings scanned for matches.");
      setImage(null); setPreview(null);
      setName(""); setAge(""); setFamilyEmail("");
      fetchPersons();
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Something went wrong.");
    } finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/admin"); };

  return (
    <div style={S.page}>

      {/* Subtle purple-tinted background — different from other pages */}
      <div style={S.bgTint} />

      {/* ── TOP BAR ── */}
      <div style={S.topBar}>

        <div style={S.topLeft}>
          <div style={S.orgAvatar}>
            {orgType === "police" ? "👮" : "🤝"}
          </div>
          <div>
            <div style={S.orgName}>{orgName}</div>
            <div style={S.orgSub}>
              {orgType === "police" ? "Police Station" : "NGO / Welfare"} · Admin
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div style={S.liveRow}>
          <div style={S.liveDot} />
          <span style={S.liveText}>AI Scanning Active</span>
        </div>

        <div style={S.topRight}>
          <div style={S.statChip}>
            <span style={S.statNum}>{persons.length}</span>
            <span style={S.statLabel}>Active Cases</span>
          </div>
          <button onClick={handleLogout} style={S.logoutBtn}>
            Sign Out
          </button>
        </div>

      </div>

      {/* ── SPLIT LAYOUT ── */}
      <div style={S.split}>

        {/* ══ LEFT — Fixed upload panel ══ */}
        <div style={S.leftPanel}>

          <div style={S.panelHeader}>
            <div style={S.panelIcon}>➕</div>
            <div>
              <div style={S.panelTitle}>Add Missing Person</div>
              <div style={S.panelSub}>Upload photo and fill details</div>
            </div>
          </div>

          {/* Photo upload */}
          <div
            onDragOver = {e => { e.preventDefault(); setDragOver(true);  }}
            onDragLeave= {()  => setDragOver(false)}
            onDrop     = {e  => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick    = {()  => document.getElementById("adminFile").click()}
            style      = {{
              ...S.dropzone,
              borderColor: dragOver ? "#a78bfa"
                         : preview  ? "#22c55e"
                         : "rgba(167,139,250,0.25)",
              background : dragOver ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.02)",
            }}
          >
            {preview ? (
              <div style={{ textAlign: "center" }}>
                <img src={preview} alt="preview" style={S.previewImg} />
                <p style={S.changeText}>Click to change photo</p>
              </div>
            ) : (
              <div style={S.dropInner}>
                <div style={S.uploadIcon}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="#a78bfa" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p style={S.dropTitle}>
                  Drop photo or{" "}
                  <span style={{ color: "#a78bfa" }}>browse</span>
                </p>
                <p style={S.dropHint}>Clear face required for AI matching</p>
              </div>
            )}
          </div>
          <input id="adminFile" type="file" accept="image/*"
            onChange={e => handleFile(e.target.files[0])}
            style={{ display: "none" }} />

          {/* Divider */}
          <div style={S.divider} />

          {/* Form fields */}
          <div style={S.field}>
            <label style={S.label}>FULL NAME</label>
            <input
              style       = {S.input}
              placeholder = "e.g. Ravi Kumar"
              value       = {name}
              onChange    = {e => setName(e.target.value)}
            />
          </div>

          <div style={S.field}>
            <label style={S.label}>AGE</label>
            <input
              style       = {S.input}
              placeholder = "e.g. 34"
              type        = "number"
              value       = {age}
              onChange    = {e => setAge(e.target.value)}
            />
          </div>

          <div style={S.field}>
            <label style={S.label}>FAMILY EMAIL</label>
            <input
              style       = {S.input}
              placeholder = "family@email.com"
              type        = "email"
              value       = {familyEmail}
              onChange    = {e => setFamilyEmail(e.target.value)}
            />
            <p style={S.hint}>Match alert + photo sent here automatically</p>
          </div>

          {/* Alerts */}
          {status === "success" && (
            <div style={S.alertGreen}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#22c55e" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {message}
            </div>
          )}
          {status === "error" && (
            <div style={S.alertRed}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8"  x2="12"    y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {message}
            </div>
          )}

          <button
            onClick  = {handleSubmit}
            disabled = {loading}
            style    = {{
              ...S.btn,
              opacity: loading ? 0.6 : 1,
              cursor : loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "⏳ Scanning All Sightings..." : "Add & Scan for Matches →"}
          </button>

        </div>

        {/* ══ RIGHT — Scrollable records ══ */}
        <div style={S.rightPanel}>

          {/* Records header */}
          <div style={S.recordsHeader}>
            <div>
              <h3 style={S.recordsTitle}>Active Cases</h3>
              <p style={S.recordsSub}>
                {persons.length > 0
                  ? `${persons.length} missing person${persons.length > 1 ? "s" : ""} registered`
                  : "No cases registered yet"}
              </p>
            </div>
            {/* Search hint */}
            {persons.length > 0 && (
              <div style={S.aiTag}>
                <span style={S.aiDot} />
                AI actively scanning
              </div>
            )}
          </div>

          {/* Empty state */}
          {persons.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyEmoji}>🔍</div>
              <p style={S.emptyTitle}>No cases yet</p>
              <p style={S.emptyDesc}>
                Add a missing person using the panel on the left.
                The AI will immediately scan all existing public
                sightings for a match.
              </p>
            </div>
          ) : (
            <div style={S.cardsList}>
              {persons.map((p, i) => (
                <div key={p.id} style={S.personCard}
                  className="fade-up"
                >
                  {/* Left color bar */}
                  <div style={S.colorBar} />

                  {/* Avatar */}
                  <div style={S.avatar}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={S.personInfo}>
                    <div style={S.personTop}>
                      <div style={S.personName}>{p.name}</div>
                      <div style={S.activeBadge}>● Active</div>
                    </div>

                    <div style={S.personMeta}>
                      {p.age && (
                        <span style={S.metaItem}>
                          <span style={S.metaIcon}>👤</span> Age {p.age}
                        </span>
                      )}
                      <span style={S.metaItem}>
                        <span style={S.metaIcon}>📧</span> {p.family_email}
                      </span>
                      <span style={S.metaItem}>
                        <span style={S.metaIcon}>🕐</span>{" "}
                        {new Date(p.added_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Case ID */}
                  <div style={S.caseId}>#{String(p.id).padStart(4, "0")}</div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight : "calc(100vh - 64px)",
    display   : "flex",
    flexDirection: "column",
    position  : "relative",
    overflow  : "hidden",
  },

  /* Slightly different bg — warm purple tint */
  bgTint: {
    position     : "fixed",
    top          : "30%",
    right        : "-200px",
    width        : "700px",
    height       : "700px",
    borderRadius : "50%",
    background   : "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex       : 0,
  },

  loadingScreen: {
    minHeight     : "calc(100vh - 64px)",
    display       : "flex",
    flexDirection : "column",
    alignItems    : "center",
    justifyContent: "center",
  },
  spinner: {
    width      : "36px",
    height     : "36px",
    border     : "3px solid rgba(167,139,250,0.2)",
    borderTop  : "3px solid #a78bfa",
    borderRadius: "50%",
    animation  : "spin 0.8s linear infinite",
  },

  /* TOP BAR */
  // topBar: {
  //   display       : "flex",
  //   alignItems    : "center",
  //   justifyContent: "space-between",
  //   padding       : "14px 32px",
  //   background    : "rgba(10,5,30,0.85)",
  //   borderBottom  : "1px solid rgba(124,58,237,0.15)",
  //   backdropFilter: "blur(20px)",
  //   position      : "relative",
  //   zIndex        : 10,
  //   gap           : "20px",
  // },
  topBar: {
    display       : "flex",
    alignItems    : "center",
    justifyContent: "space-between",
    padding       : "14px 32px",
    background    : "linear-gradient(135deg, #1a0533, #0f0a2e)",
    borderBottom  : "1px solid rgba(167,139,250,0.25)",
    backdropFilter: "blur(20px)",
    position      : "relative",
    zIndex        : 10,
    gap           : "20px",
    boxShadow     : "0 4px 24px rgba(0,0,0,0.4)",
  },
  topLeft: {
    display   : "flex",
    alignItems: "center",
    gap       : "12px",
  },
  orgAvatar: {
    width         : "42px",
    height        : "42px",
    borderRadius  : "11px",
    background    : "linear-gradient(135deg, #5b21b6, #7c3aed)",
    display       : "flex",
    alignItems    : "center",
    justifyContent: "center",
    fontSize      : "20px",
    boxShadow     : "0 4px 14px rgba(124,58,237,0.35)",
  },
  orgName: {
    fontFamily: "'Syne', sans-serif",
    fontSize  : "15px",
    fontWeight: "700",
    color     : "#f0f4ff",
  },
  orgSub: { fontSize: "11px", color: "#475569", marginTop: "2px" },

  liveRow: {
    display   : "flex",
    alignItems: "center",
    gap       : "8px",
    padding   : "7px 14px",
    borderRadius: "20px",
    background: "rgba(34,197,94,0.06)",
    border    : "1px solid rgba(34,197,94,0.15)",
  },
  liveDot: {
    width      : "7px",
    height     : "7px",
    borderRadius: "50%",
    background : "#22c55e",
    animation  : "pulse 2s infinite",
  },
  liveText: { fontSize: "12px", color: "#22c55e", fontWeight: "500" },

  topRight: {
    display   : "flex",
    alignItems: "center",
    gap       : "12px",
  },
  statChip: {
    display     : "flex",
    alignItems  : "center",
    gap         : "8px",
    padding     : "8px 16px",
    borderRadius: "10px",
    background  : "rgba(124,58,237,0.08)",
    border      : "1px solid rgba(124,58,237,0.2)",
  },
  statNum  : {
    fontFamily: "'Syne', sans-serif",
    fontSize  : "18px",
    fontWeight: "800",
    color     : "#a78bfa",
  },
  statLabel: { fontSize: "11px", color: "#475569" },
  logoutBtn: {
    padding     : "9px 18px",
    background  : "rgba(239,68,68,0.08)",
    border      : "1px solid rgba(239,68,68,0.2)",
    borderRadius: "10px",
    color       : "#ef4444",
    fontFamily  : "'DM Sans', sans-serif",
    fontSize    : "13px",
    fontWeight  : "500",
    cursor      : "pointer",
  },

  /* SPLIT */
  split: {
    display : "flex",
    flex    : 1,
    height  : "calc(100vh - 120px)",
    position: "relative",
    zIndex  : 1,
  },

  /* LEFT PANEL — fixed, no scroll */
  // leftPanel: {
  //   width        : "380px",
  //   minWidth     : "380px",
  //   padding      : "28px 28px",
  //   borderRight  : "1px solid rgba(124,58,237,0.12)",
  //   background   : "rgba(10,5,30,0.6)",
  //   backdropFilter: "blur(20px)",
  //   overflowY    : "auto",
  //   height       : "100%",
  // },
  leftPanel: {
    width          : "380px",
    minWidth       : "380px",
    padding        : "28px",
    borderRight    : "1px solid rgba(167,139,250,0.15)",
    background     : "rgba(20,8,50,0.95)",
    backdropFilter : "blur(20px)",
    overflowY      : "auto",
    height         : "100%",
    boxShadow      : "4px 0 24px rgba(0,0,0,0.3)",
  },
  panelHeader: {
    display     : "flex",
    alignItems  : "center",
    gap         : "12px",
    marginBottom: "22px",
  },
  panelIcon: {
    width         : "38px",
    height        : "38px",
    borderRadius  : "10px",
    background    : "rgba(124,58,237,0.12)",
    border        : "1px solid rgba(124,58,237,0.2)",
    display       : "flex",
    alignItems    : "center",
    justifyContent: "center",
    fontSize      : "16px",
  },
  panelTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize  : "15px",
    fontWeight: "700",
    color     : "#f0f4ff",
  },
  panelSub: { fontSize: "12px", color: "#475569", marginTop: "2px" },

  dropzone: {
    border       : "2px dashed",
    borderRadius : "14px",
    padding      : "24px 16px",
    textAlign    : "center",
    cursor       : "pointer",
    transition   : "all 0.25s",
    minHeight    : "180px",
    display      : "flex",
    alignItems   : "center",
    justifyContent: "center",
    marginBottom : "20px",
  },
  dropInner: {
    display      : "flex",
    flexDirection: "column",
    alignItems   : "center",
    gap          : "10px",
  },
  uploadIcon: {
    width         : "54px",
    height        : "54px",
    borderRadius  : "13px",
    background    : "rgba(124,58,237,0.08)",
    border        : "1px solid rgba(124,58,237,0.2)",
    display       : "flex",
    alignItems    : "center",
    justifyContent: "center",
  },
  dropTitle: { fontSize: "13px", color: "#94a3b8", fontWeight: "500" },
  dropHint : { fontSize: "11px", color: "#334155" },
  previewImg: {
    maxWidth    : "100%",
    maxHeight   : "160px",
    borderRadius: "10px",
    border      : "2px solid rgba(34,197,94,0.4)",
  },
  changeText: { fontSize: "11px", color: "#475569", marginTop: "6px" },

  divider: {
    height      : "1px",
    background  : "rgba(124,58,237,0.1)",
    marginBottom: "20px",
  },

  field: { marginBottom: "14px" },
  label: {
    display      : "block",
    fontSize     : "10px",
    fontWeight   : "700",
    color        : "#475569",
    letterSpacing: "0.8px",
    marginBottom : "7px",
  },
  input: {
    width        : "100%",
    padding      : "11px 14px",
    background   : "rgba(255,255,255,0.03)",
    border       : "1px solid rgba(124,58,237,0.15)",
    borderRadius : "10px",
    color        : "#f0f4ff",
    fontFamily   : "'DM Sans', sans-serif",
    fontSize     : "13px",
    outline      : "none",
    boxSizing    : "border-box",
    transition   : "border-color 0.2s",
  },
  hint: { fontSize: "11px", color: "#1e293b", marginTop: "5px" },

  alertGreen: {
    display     : "flex", alignItems: "center", gap: "8px",
    padding     : "10px 12px", borderRadius: "9px",
    background  : "rgba(34,197,94,0.08)",
    border      : "1px solid rgba(34,197,94,0.2)",
    color       : "#22c55e", fontSize: "12px",
    marginBottom: "12px", lineHeight: "1.5",
  },
  alertRed: {
    display     : "flex", alignItems: "center", gap: "8px",
    padding     : "10px 12px", borderRadius: "9px",
    background  : "rgba(239,68,68,0.08)",
    border      : "1px solid rgba(239,68,68,0.2)",
    color       : "#ef4444", fontSize: "12px",
    marginBottom: "12px",
  },

  btn: {
    width        : "100%",
    padding      : "13px",
    background   : "linear-gradient(135deg, #5b21b6, #7c3aed)",
    border       : "none",
    borderRadius : "10px",
    color        : "white",
    fontFamily   : "'Syne', sans-serif",
    fontSize     : "13px",
    fontWeight   : "600",
    letterSpacing: "0.3px",
    boxShadow    : "0 4px 20px rgba(124,58,237,0.35)",
    transition   : "all 0.2s",
  },

  /* RIGHT PANEL — scrollable */
  // rightPanel: {
  //   flex      : 1,
  //   padding   : "28px 32px",
  //   overflowY : "auto",
  //   height    : "100%",
  // },
  rightPanel: {
    flex      : 1,
    padding   : "28px 32px",
    overflowY : "auto",
    height    : "100%",
    background: "rgba(5,2,20,0.4)",
  },

  recordsHeader: {
    display        : "flex",
    justifyContent : "space-between",
    alignItems     : "flex-start",
    marginBottom   : "24px",
  },
  // recordsTitle: {
  //   fontFamily  : "'Syne', sans-serif",
  //   fontSize    : "20px",
  //   fontWeight  : "700",
  //   color       : "#f0f4ff",
  //   marginBottom: "4px",
  // },
  // recordsSub: { fontSize: "13px", color: "#475569" },
  recordsTitle: {
    fontFamily  : "'Syne', sans-serif",
    fontSize    : "20px",
    fontWeight  : "700",
    color       : "#e2d9ff",
    marginBottom: "4px",
  },
  recordsSub: { fontSize: "13px", color: "#7c6a9e" },
  aiTag: {
    display     : "flex",
    alignItems  : "center",
    gap         : "7px",
    padding     : "6px 14px",
    borderRadius: "20px",
    background  : "rgba(34,197,94,0.06)",
    border      : "1px solid rgba(34,197,94,0.15)",
    fontSize    : "12px",
    color       : "#22c55e",
    fontWeight  : "500",
    whiteSpace  : "nowrap",
  },
  aiDot: {
    width      : "6px",
    height     : "6px",
    borderRadius: "50%",
    background : "#22c55e",
    animation  : "pulse 2s infinite",
    display    : "inline-block",
  },

  /* Empty state */
  emptyState: {
    display        : "flex",
    flexDirection  : "column",
    alignItems     : "center",
    justifyContent : "center",
    padding        : "80px 20px",
    textAlign      : "center",
  },
  emptyEmoji: { fontSize: "52px", marginBottom: "20px" },
  emptyTitle: {
    fontFamily  : "'Syne', sans-serif",
    fontSize    : "20px",
    fontWeight  : "700",
    color       : "#334155",
    marginBottom: "10px",
  },
  emptyDesc: {
    fontSize  : "14px",
    color     : "#1e293b",
    lineHeight: "1.7",
    maxWidth  : "340px",
  },

  /* Person cards */
  cardsList: { display: "flex", flexDirection: "column", gap: "12px" },
  // personCard: {
  //   display      : "flex",
  //   alignItems   : "center",
  //   gap          : "16px",
  //   padding      : "18px 20px",
  //   background   : "rgba(10,5,30,0.6)",
  //   border       : "1px solid rgba(124,58,237,0.12)",
  //   borderRadius : "14px",
  //   backdropFilter: "blur(20px)",
  //   position     : "relative",
  //   overflow     : "hidden",
  //   transition   : "border-color 0.2s, transform 0.2s",
  // },
  personCard: {
    display        : "flex",
    alignItems     : "center",
    gap            : "16px",
    padding        : "18px 20px",
    background     : "rgba(30,10,70,0.8)",
    border         : "1px solid rgba(167,139,250,0.2)",
    borderRadius   : "14px",
    backdropFilter : "blur(20px)",
    position       : "relative",
    overflow       : "hidden",
    transition     : "border-color 0.2s, transform 0.2s",
    boxShadow      : "0 4px 16px rgba(0,0,0,0.3)",
  },
  colorBar: {
    position    : "absolute",
    left        : 0,
    top         : 0,
    bottom      : 0,
    width       : "3px",
    background  : "linear-gradient(180deg, #7c3aed, #3b82f6)",
    borderRadius: "3px 0 0 3px",
  },
  avatar: {
    width         : "46px",
    height        : "46px",
    borderRadius  : "12px",
    background    : "linear-gradient(135deg, #5b21b6, #7c3aed)",
    display       : "flex",
    alignItems    : "center",
    justifyContent: "center",
    fontFamily    : "'Syne', sans-serif",
    fontSize      : "18px",
    fontWeight    : "800",
    color         : "white",
    flexShrink    : 0,
    boxShadow     : "0 4px 12px rgba(124,58,237,0.3)",
  },
  personInfo : { flex: 1, minWidth: 0 },
  personTop  : {
    display        : "flex",
    alignItems     : "center",
    justifyContent : "space-between",
    marginBottom   : "8px",
  },
  // personName: {
  //   fontFamily: "'Syne', sans-serif",
  //   fontSize  : "15px",
  //   fontWeight: "700",
  //   color     : "#f0f4ff",
  // },
  personName: {
    fontFamily: "'Syne', sans-serif",
    fontSize  : "15px",
    fontWeight: "700",
    color     : "#e2d9ff",
  },
  activeBadge: {
    padding     : "3px 10px",
    borderRadius: "20px",
    background  : "rgba(34,197,94,0.08)",
    border      : "1px solid rgba(34,197,94,0.2)",
    color       : "#22c55e",
    fontSize    : "11px",
    fontWeight  : "600",
  },
  personMeta: {
    display : "flex",
    gap     : "16px",
    flexWrap: "wrap",
  },
  // metaItem: {
  //   display    : "flex",
  //   alignItems : "center",
  //   gap        : "5px",
  //   fontSize   : "12px",
  //   color      : "#475569",
  //   overflow   : "hidden",
  //   textOverflow: "ellipsis",
  //   whiteSpace : "nowrap",
  // },
  metaItem: {
    display    : "flex",
    alignItems : "center",
    gap        : "5px",
    fontSize   : "12px",
    color      : "#9d8fc0",
    overflow   : "hidden",
    textOverflow: "ellipsis",
    whiteSpace : "nowrap",
  },
  metaIcon: { fontSize: "12px" },
  // caseId: {
  //   fontFamily : "'Syne', sans-serif",
  //   fontSize   : "12px",
  //   fontWeight : "700",
  //   color      : "#334155",
  //   letterSpacing: "0.5px",
  //   flexShrink : 0,
  // },
  caseId: {
    fontFamily   : "'Syne', sans-serif",
    fontSize     : "12px",
    fontWeight   : "700",
    color        : "#6d4fa0",
    letterSpacing: "0.5px",
    flexShrink   : 0,
  },
};