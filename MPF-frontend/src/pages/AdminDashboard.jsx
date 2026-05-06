
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
  const [matchResult, setMatchResult] = useState(null); // NEW
  const [loading,     setLoading]     = useState(false);
  const [persons,     setPersons]     = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const [expandedId,  setExpandedId]  = useState(null); // NEW
  const [rescanId,    setRescanId]    = useState(null); // NEW
  const [rescanImage, setRescanImage] = useState(null); // NEW
  const [rescanPreview, setRescanPreview] = useState(null); // NEW
  const [rescanLoading, setRescanLoading] = useState(false); // NEW
  const [rescanResult,  setRescanResult]  = useState(null);  // NEW

  const navigate = useNavigate();
  const token   = localStorage.getItem("adminToken");
  const orgName = localStorage.getItem("orgName");
  const orgType = localStorage.getItem("orgType");

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setMatchResult(null);
  };

  const handleSubmit = async () => {
    if (!image || !name || !familyEmail) {
      setStatus("error");
      setMessage("Please fill all fields and upload a photo.");
      return;
    }
    setLoading(true);
    setStatus(null);
    setMatchResult(null);
    const fd = new FormData();
    fd.append("image",        image);
    fd.append("name",         name);
    fd.append("age",          age);
    fd.append("family_email", familyEmail);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/add-missing", fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus("success");
      setMessage("Person added successfully!");
      // Show match result to police
      if (res.data.matches_found && res.data.matches_found > 0) {
        setMatchResult({
          found     : true,
          count     : res.data.matches_found,
          confidence: res.data.best_confidence || null,
        });
      } else {
        setMatchResult({ found: false });
      }
      setImage(null); setPreview(null);
      setName(""); setAge(""); setFamilyEmail("");
      fetchPersons();
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Something went wrong.");
    } finally { setLoading(false); }
  };

  // Rescan existing person with new photo
  const handleRescan = async (personId) => {
    if (!rescanImage) return;
    setRescanLoading(true);
    setRescanResult(null);
    const fd = new FormData();
    fd.append("image",     rescanImage);
    fd.append("person_id", personId);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/rescan", fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.matches_found > 0) {
        setRescanResult({
          found     : true,
          count     : res.data.matches_found,
          confidence: res.data.best_confidence,
        });
      } else {
        setRescanResult({ found: false });
      }
    } catch (err) {
      setRescanResult({ error: err.response?.data?.error || "Rescan failed." });
    } finally { setRescanLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/admin"); };

  return (
    <div style={S.page}>
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

        <div style={S.liveRow}>
          <div style={S.liveDot} />
          <span style={S.liveText}>AI Scanning Active</span>
        </div>

        <div style={S.topRight}>
          <div style={S.statChip}>
            <span style={S.statNum}>{persons.length}</span>
            <span style={S.statLabel}>Active Cases</span>
          </div>
          <button onClick={handleLogout} style={S.logoutBtn}>Sign Out</button>
        </div>
      </div>

      {/* ── SPLIT ── */}
      <div style={S.split}>

        {/* ══ LEFT PANEL ══ */}
        <div style={S.leftPanel}>

          <div style={S.panelHeader}>
            <div style={S.panelIcon}>➕</div>
            <div>
              <div style={S.panelTitle}>Add Missing Person</div>
              <div style={S.panelSub}>Upload photo and fill details</div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver = {e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave= {()  => setDragOver(false)}
            onDrop     = {e  => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick    = {()  => document.getElementById("adminFile").click()}
            style      = {{
              ...S.dropzone,
              borderColor: dragOver ? "#a78bfa" : preview ? "#22c55e" : "rgba(167,139,250,0.25)",
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
                    stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p style={S.dropTitle}>Drop photo or <span style={{ color: "#a78bfa" }}>browse</span></p>
                <p style={S.dropHint}>Clear face required for AI matching</p>
              </div>
            )}
          </div>
          <input id="adminFile" type="file" accept="image/*"
            onChange={e => handleFile(e.target.files[0])} style={{ display: "none" }} />

          <div style={S.divider} />

          <div style={S.field}>
            <label style={S.label}>FULL NAME</label>
            <input style={S.input} placeholder="e.g. Ravi Kumar"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>AGE</label>
            <input style={S.input} placeholder="e.g. 34" type="number"
              value={age} onChange={e => setAge(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>FAMILY EMAIL</label>
            <input style={S.input} placeholder="family@email.com" type="email"
              value={familyEmail} onChange={e => setFamilyEmail(e.target.value)} />
            <p style={S.hint}>Match alert + photo sent here automatically</p>
          </div>

          {/* Basic status */}
          {status === "error" && (
            <div style={S.alertRed}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {message}
            </div>
          )}

          {/* ── MATCH RESULT BOX — shown to police ── */}
          {matchResult && (
            <div style={{
              ...S.matchBox,
              borderColor: matchResult.found
                ? "rgba(34,197,94,0.35)"
                : "rgba(167,139,250,0.25)",
              background: matchResult.found
                ? "rgba(34,197,94,0.06)"
                : "rgba(124,58,237,0.06)",
            }}>
              {matchResult.found ? (
                <>
                  <div style={S.matchTitle}>
                    🎯 Match Found in Database!
                  </div>
                  <div style={S.matchDesc}>
                    {matchResult.count} existing sighting{matchResult.count > 1 ? "s" : ""} matched.
                    {matchResult.confidence && (
                      <span style={S.matchConf}>
                        Best confidence: <strong>{matchResult.confidence}%</strong>
                      </span>
                    )}
                  </div>
                  <div style={S.matchNote}>
                    ✅ Family has been notified via email with location and sighting photo.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ ...S.matchTitle, color: "#a78bfa" }}>
                    🔍 No Match Found Yet
                  </div>
                  <div style={S.matchDesc}>
                    Person added to database. AI will automatically scan all future public sightings and alert family if matched.
                  </div>
                </>
              )}
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

        {/* ══ RIGHT PANEL ══ */}
        <div style={S.rightPanel}>

          <div style={S.recordsHeader}>
            <div>
              <h3 style={S.recordsTitle}>Active Cases</h3>
              <p style={S.recordsSub}>
                {persons.length > 0
                  ? `${persons.length} missing person${persons.length > 1 ? "s" : ""} registered`
                  : "No cases registered yet"}
              </p>
            </div>
            {persons.length > 0 && (
              <div style={S.aiTag}>
                <span style={S.aiDot} />
                AI actively scanning
              </div>
            )}
          </div>

          {persons.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyEmoji}>🔍</div>
              <p style={S.emptyTitle}>No cases yet</p>
              <p style={S.emptyDesc}>
                Add a missing person using the panel on the left.
                The AI will immediately scan all existing public sightings.
              </p>
            </div>
          ) : (
            <div style={S.cardsList}>
              {persons.map(p => (
                <div key={p.id}>

                  {/* ── Person Card ── */}
                  <div
                    style   = {S.personCard}
                    onClick = {() => {
                      setExpandedId(expandedId === p.id ? null : p.id);
                      setRescanId(null);
                      setRescanImage(null);
                      setRescanPreview(null);
                      setRescanResult(null);
                    }}
                  >
                    <div style={S.colorBar} />

                    <div style={S.avatar}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>

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

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={S.caseId}>#{String(p.id).padStart(4, "0")}</div>
                      <div style={{
                        ...S.expandIcon,
                        transform: expandedId === p.id ? "rotate(180deg)" : "rotate(0deg)",
                      }}>▼</div>
                    </div>
                  </div>

                  {/* ── Expanded Details ── */}
                  {expandedId === p.id && (
                    <div style={S.expandedPanel}>

                      {/* Info grid */}
                      <div style={S.infoGrid}>
                        <div style={S.infoItem}>
                          <div style={S.infoLabel}>CASE ID</div>
                          <div style={S.infoValue}>#{String(p.id).padStart(4, "0")}</div>
                        </div>
                        <div style={S.infoItem}>
                          <div style={S.infoLabel}>NAME</div>
                          <div style={S.infoValue}>{p.name}</div>
                        </div>
                        <div style={S.infoItem}>
                          <div style={S.infoLabel}>AGE</div>
                          <div style={S.infoValue}>{p.age || "Not specified"}</div>
                        </div>
                        <div style={S.infoItem}>
                          <div style={S.infoLabel}>FAMILY EMAIL</div>
                          <div style={S.infoValue}>{p.family_email}</div>
                        </div>
                        <div style={S.infoItem}>
                          <div style={S.infoLabel}>DATE ADDED</div>
                          <div style={S.infoValue}>
                            {new Date(p.added_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "long", year: "numeric"
                            })}
                          </div>
                        </div>
                        <div style={S.infoItem}>
                          <div style={S.infoLabel}>STATUS</div>
                          <div style={{ ...S.infoValue, color: "#22c55e" }}>● Active / Searching</div>
                        </div>
                      </div>

                      <div style={S.expandDivider} />

                      {/* Rescan section */}
                      <div style={S.rescanHeader}>
                        <div style={S.rescanTitle}>🔄 Rescan with New Photo</div>
                        <div style={S.rescanDesc}>
                          Upload a different photo of this person to scan all public sightings again.
                          Useful if the original photo quality was poor.
                        </div>
                      </div>

                      {/* Rescan upload */}
                      <div
                        onClick = {() => document.getElementById(`rescan-${p.id}`).click()}
                        style   = {{
                          ...S.rescanDropzone,
                          borderColor: rescanPreview
                            ? "rgba(34,197,94,0.4)"
                            : "rgba(167,139,250,0.2)",
                        }}
                      >
                        {rescanPreview ? (
                          <div style={{ textAlign: "center" }}>
                            <img src={rescanPreview} alt="rescan" style={S.rescanPreviewImg} />
                            <p style={S.changeText}>Click to change</p>
                          </div>
                        ) : (
                          <div style={S.dropInner}>
                            <span style={{ fontSize: "24px" }}>📷</span>
                            <p style={{ fontSize: "13px", color: "#7c6a9e" }}>
                              Click to upload new photo
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        id       = {`rescan-${p.id}`}
                        type     = "file"
                        accept   = "image/*"
                        style    = {{ display: "none" }}
                        onChange = {e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setRescanImage(file);
                          setRescanPreview(URL.createObjectURL(file));
                          setRescanResult(null);
                          setRescanId(p.id);
                        }}
                      />

                      {/* Rescan result */}
                      {rescanResult && rescanId === p.id && (
                        <div style={{
                          ...S.matchBox,
                          marginBottom: "12px",
                          borderColor: rescanResult.found
                            ? "rgba(34,197,94,0.35)"
                            : "rgba(167,139,250,0.25)",
                          background: rescanResult.found
                            ? "rgba(34,197,94,0.06)"
                            : "rgba(124,58,237,0.06)",
                        }}>
                          {rescanResult.error ? (
                            <div style={{ color: "#ef4444", fontSize: "13px" }}>
                              ❌ {rescanResult.error}
                            </div>
                          ) : rescanResult.found ? (
                            <>
                              <div style={S.matchTitle}>🎯 Match Found!</div>
                              <div style={S.matchDesc}>
                                {rescanResult.count} sighting{rescanResult.count > 1 ? "s" : ""} matched.
                                {rescanResult.confidence && (
                                  <span style={S.matchConf}>
                                    Best confidence: <strong>{rescanResult.confidence}%</strong>
                                  </span>
                                )}
                              </div>
                              <div style={S.matchNote}>
                                ✅ Family notified via email with location.
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ ...S.matchTitle, color: "#a78bfa" }}>
                                🔍 No Match Found
                              </div>
                              <div style={S.matchDesc}>
                                No sightings matched this photo. Try again later.
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <button
                        onClick  = {() => handleRescan(p.id)}
                        disabled = {!rescanImage || rescanId !== p.id || rescanLoading}
                        style    = {{
                          ...S.rescanBtn,
                          opacity: (!rescanImage || rescanId !== p.id || rescanLoading) ? 0.4 : 1,
                          cursor : (!rescanImage || rescanId !== p.id || rescanLoading) ? "not-allowed" : "pointer",
                        }}
                      >
                        {rescanLoading && rescanId === p.id
                          ? "⏳ Scanning..."
                          : "🔄 Rescan All Sightings →"}
                      </button>

                    </div>
                  )}
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
  page         : { minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  bgTint       : { position: "fixed", top: "30%", right: "-200px", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
  loadingScreen: { minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  spinner      : { width: "36px", height: "36px", border: "3px solid rgba(167,139,250,0.2)", borderTop: "3px solid #a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  topBar  : { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", background: "linear-gradient(135deg, #1a0533, #0f0a2e)", borderBottom: "1px solid rgba(167,139,250,0.25)", backdropFilter: "blur(20px)", position: "relative", zIndex: 10, gap: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" },
  topLeft : { display: "flex", alignItems: "center", gap: "12px" },
  orgAvatar: { width: "42px", height: "42px", borderRadius: "11px", background: "linear-gradient(135deg, #5b21b6, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" },
  orgName : { fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "700", color: "#f0f4ff" },
  orgSub  : { fontSize: "11px", color: "#475569", marginTop: "2px" },
  liveRow : { display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", borderRadius: "20px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" },
  liveDot : { width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" },
  liveText: { fontSize: "12px", color: "#22c55e", fontWeight: "500" },
  topRight: { display: "flex", alignItems: "center", gap: "12px" },
  statChip: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "10px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" },
  statNum : { fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: "800", color: "#a78bfa" },
  statLabel: { fontSize: "11px", color: "#475569" },
  logoutBtn: { padding: "9px 18px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", color: "#ef4444", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "500", cursor: "pointer" },

  split     : { display: "flex", flex: 1, height: "calc(100vh - 120px)", position: "relative", zIndex: 1 },
  leftPanel : { width: "380px", minWidth: "380px", padding: "28px", borderRight: "1px solid rgba(167,139,250,0.15)", background: "rgba(20,8,50,0.95)", backdropFilter: "blur(20px)", overflowY: "auto", height: "100%", boxShadow: "4px 0 24px rgba(0,0,0,0.3)" },
  panelHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" },
  panelIcon : { width: "38px", height: "38px", borderRadius: "10px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" },
  panelTitle: { fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "700", color: "#e2d9ff" },
  panelSub  : { fontSize: "12px", color: "#6d4fa0", marginTop: "2px" },

  dropzone  : { border: "2px dashed", borderRadius: "14px", padding: "24px 16px", textAlign: "center", cursor: "pointer", transition: "all 0.25s", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  dropInner : { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  uploadIcon: { width: "54px", height: "54px", borderRadius: "13px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" },
  dropTitle : { fontSize: "13px", color: "#94a3b8", fontWeight: "500" },
  dropHint  : { fontSize: "11px", color: "#334155" },
  previewImg: { maxWidth: "100%", maxHeight: "140px", borderRadius: "10px", border: "2px solid rgba(34,197,94,0.4)" },
  changeText: { fontSize: "11px", color: "#475569", marginTop: "6px" },
  divider   : { height: "1px", background: "rgba(124,58,237,0.1)", marginBottom: "18px" },

  field : { marginBottom: "14px" },
  label : { display: "block", fontSize: "10px", fontWeight: "700", color: "#7c6a9e", letterSpacing: "0.8px", marginBottom: "7px" },
  input : { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "10px", color: "#e2d9ff", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  hint  : { fontSize: "11px", color: "#334155", marginTop: "5px" },

  alertRed: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "9px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "12px", marginBottom: "12px" },

  /* Match result box */
  matchBox  : { padding: "16px", borderRadius: "12px", border: "1px solid", marginBottom: "16px" },
  matchTitle: { fontFamily: "'Syne', sans-serif", fontSize: "14px", fontWeight: "700", color: "#22c55e", marginBottom: "8px" },
  matchDesc : { fontSize: "12px", color: "#9d8fc0", lineHeight: "1.6", marginBottom: "6px" },
  matchConf : { display: "block", marginTop: "4px", color: "#a78bfa" },
  matchNote : { fontSize: "11px", color: "#22c55e", marginTop: "6px" },

  btn: { width: "100%", padding: "13px", background: "linear-gradient(135deg, #5b21b6, #7c3aed)", border: "none", borderRadius: "10px", color: "white", fontFamily: "'Syne', sans-serif", fontSize: "13px", fontWeight: "600", letterSpacing: "0.3px", boxShadow: "0 4px 20px rgba(124,58,237,0.35)", transition: "all 0.2s" },

  rightPanel   : { flex: 1, padding: "28px 32px", overflowY: "auto", height: "100%", background: "rgba(5,2,20,0.4)" },
  recordsHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  recordsTitle : { fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "700", color: "#e2d9ff", marginBottom: "4px" },
  recordsSub   : { fontSize: "13px", color: "#7c6a9e" },
  aiTag        : { display: "flex", alignItems: "center", gap: "7px", padding: "6px 14px", borderRadius: "20px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", fontSize: "12px", color: "#22c55e", fontWeight: "500", whiteSpace: "nowrap" },
  aiDot        : { width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite", display: "inline-block" },

  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" },
  emptyEmoji: { fontSize: "52px", marginBottom: "20px" },
  emptyTitle: { fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "700", color: "#334155", marginBottom: "10px" },
  emptyDesc : { fontSize: "14px", color: "#1e293b", lineHeight: "1.7", maxWidth: "340px" },

  cardsList  : { display: "flex", flexDirection: "column", gap: "10px" },
  personCard : { display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px", background: "rgba(30,10,70,0.8)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "14px", backdropFilter: "blur(20px)", position: "relative", overflow: "hidden", transition: "all 0.2s", boxShadow: "0 4px 16px rgba(0,0,0,0.3)", cursor: "pointer" },
  colorBar   : { position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: "linear-gradient(180deg, #7c3aed, #3b82f6)", borderRadius: "3px 0 0 3px" },
  avatar     : { width: "46px", height: "46px", borderRadius: "12px", background: "linear-gradient(135deg, #5b21b6, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: "800", color: "white", flexShrink: 0, boxShadow: "0 4px 12px rgba(124,58,237,0.3)" },
  personInfo : { flex: 1, minWidth: 0 },
  personTop  : { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" },
  personName : { fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "700", color: "#e2d9ff" },
  activeBadge: { padding: "3px 10px", borderRadius: "20px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontSize: "11px", fontWeight: "600" },
  personMeta : { display: "flex", gap: "16px", flexWrap: "wrap" },
  metaItem   : { display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#9d8fc0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  metaIcon   : { fontSize: "12px" },
  caseId     : { fontFamily: "'Syne', sans-serif", fontSize: "12px", fontWeight: "700", color: "#6d4fa0", letterSpacing: "0.5px", flexShrink: 0 },
  expandIcon : { fontSize: "10px", color: "#6d4fa0", transition: "transform 0.2s" },

  /* Expanded panel */
  expandedPanel: { margin: "-6px 0 10px 0", padding: "24px", background: "rgba(20,5,50,0.9)", border: "1px solid rgba(167,139,250,0.15)", borderTop: "none", borderRadius: "0 0 14px 14px" },
  infoGrid     : { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" },
  infoItem     : {},
  infoLabel    : { fontSize: "10px", fontWeight: "700", color: "#6d4fa0", letterSpacing: "0.8px", marginBottom: "4px" },
  infoValue    : { fontSize: "13px", color: "#e2d9ff", fontWeight: "500" },
  expandDivider: { height: "1px", background: "rgba(167,139,250,0.1)", marginBottom: "20px" },

  rescanHeader : { marginBottom: "14px" },
  rescanTitle  : { fontFamily: "'Syne', sans-serif", fontSize: "14px", fontWeight: "700", color: "#a78bfa", marginBottom: "6px" },
  rescanDesc   : { fontSize: "12px", color: "#6d4fa0", lineHeight: "1.6" },
  rescanDropzone: { border: "2px dashed rgba(167,139,250,0.2)", borderRadius: "10px", padding: "16px", textAlign: "center", cursor: "pointer", marginBottom: "12px", minHeight: "90px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  rescanPreviewImg: { maxWidth: "100%", maxHeight: "80px", borderRadius: "8px", border: "2px solid rgba(34,197,94,0.4)" },
  rescanBtn    : { width: "100%", padding: "11px", background: "linear-gradient(135deg, #3b0764, #7c3aed)", border: "none", borderRadius: "9px", color: "white", fontFamily: "'Syne', sans-serif", fontSize: "13px", fontWeight: "600", boxShadow: "0 4px 14px rgba(124,58,237,0.25)", transition: "all 0.2s" },
};