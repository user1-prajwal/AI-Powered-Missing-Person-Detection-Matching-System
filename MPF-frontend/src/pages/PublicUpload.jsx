import { useState, useEffect } from "react";
import axios from "axios";

export default function PublicUpload() {
  const [image,    setImage]    = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [status,   setStatus]   = useState(null);
  const [message,  setMessage]  = useState("");
  const [location, setLocation] = useState({ lat: 0, lon: 0 });
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    // Load Poppins + Oswald fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    navigator.geolocation.getCurrentPosition(
      p  => setLocation({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {}
    );
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      setMessage("File too large. Maximum 5MB allowed.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setStatus(null);
  };

  const handleSubmit = async () => {
    if (!image) { setStatus("error"); setMessage("Please select an image first."); return; }
    setStatus("loading");
    const fd = new FormData();
    fd.append("image",     image);
    fd.append("latitude",  location.lat);
    fd.append("longitude", location.lon);
    try {
      const res = await axios.post("http://localhost:5000/api/public/upload", fd);
      setStatus("success");
      setMessage(`Sighting reported. Report ID: #${res.data.sighting_id}`);
      setImage(null); setPreview(null);
    } catch (err) {
      if (err.response?.status === 429) {
        setStatus("error");
        setMessage("Too many uploads. Max 5 per hour. Please try again later.");
      } else {
        setStatus("error");
        setMessage(err.response?.data?.error || "Upload failed. Please try again.");
      }
    }
  };

  return (
    <div style={S.page}>

      {/* ── Perspective grid floor ── */}
      <div style={S.gridFloor} />
      <div style={S.horizon} />

      {/* ── Ambient teal glow ── */}
      <div style={S.glowCenter} />
      <div style={S.glowRight} />

      {/* ── Floating depth lines ── */}
      <div style={S.depthLine1} />
      <div style={S.depthLine2} />
      <div style={S.depthLine3} />

      {/* ══ MAIN LAYOUT ══ */}
      <div style={S.main}>

        {/* ── LEFT HERO ── */}
        <div style={S.hero}>

          {/* Live status pill */}
          {/* <div style={S.livePill}>
            <span style={S.liveDot} />
            <span style={S.livePillText}>SYSTEM ACTIVE</span> */}
          {/* </div> */}

          {/* Title — Oswald display font */}
          <h1 style={S.heroTitle}>
            HELP BRING<br />
            SOMEONE{" "}
            <span style={S.titleAccent}>HOME.</span>
          </h1>

          {/* Angled accent bar */}
          <div style={S.accentBar}>
            <div style={S.accentBarFill} />
          </div>

          <p style={S.heroSub}>
            Spotted someone who might be missing?
            Upload their photo — our AI instantly
            checks against the missing persons
            database and alerts their family.
          </p>

          {/* ── Perspective steps — layered 3D ── */}
          <div style={S.stepsOuter}>
            {[
              { n: "01", title: "Upload Photo",      desc: "Take or upload a clear photo of the person you spotted." },
              { n: "02", title: "AI Scans Database", desc: "Face recognition checks all missing persons in real time." },
              { n: "03", title: "Family Alerted",    desc: "If matched, family gets instant email with location + photo." },
            ].map((s, i) => (
              <div key={s.n} style={{
                ...S.step,
                transform: `perspective(800px) rotateX(${i * 1.5}deg) translateY(${i * 2}px) translateX(${i * 12}px)`,
                opacity  : 1 - i * 0.12,
                zIndex   : 3 - i,
              }}>
                <div style={S.stepLeft}>
                  <div style={S.stepNum}>{s.n}</div>
                  <div style={S.stepConnector} />
                </div>
                <div style={S.stepRight}>
                  <div style={S.stepTitle}>{s.title}</div>
                  <div style={S.stepDesc}>{s.desc}</div>
                </div>
                {/* Edge highlight */}
                <div style={S.stepEdge} />
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={S.statsRow}>
            {[
              { val: "AI",    label: "Face Recognition" },
              { val: "< 30s", label: "Alert Speed"      },
              { val: "Free",  label: "No Login Needed"  },
            ].map(s => (
              <div key={s.label} style={S.statItem}>
                <div style={S.statVal}>{s.val}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

        </div>

        {/* ── RIGHT — Perspective tilted card ── */}
        <div style={S.cardOuter}>

          {/* Shadow layer behind card */}
          <div style={S.cardShadow} />

          {/* Main card — tilted */}
          <div style={S.card}>

            {/* Top accent strip */}
            <div style={S.cardTopStrip} />

            {/* Corner mark */}
            <div style={S.cornerMark} />

            <div style={S.cardInner}>

              {/* Card header */}
              <div style={S.cardHeader}>
                <div style={S.cardTitleRow}>
                  <div style={S.cardIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#bd5b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <div style={S.cardTitle}>Report a Sighting</div>
                    <div style={S.cardSub}>Anonymous · No login required</div>
                  </div>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver = {e => { e.preventDefault(); setDragOver(true);  }}
                onDragLeave= {()  => setDragOver(false)}
                onDrop     = {e  => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick    = {()  => document.getElementById("fileIn").click()}
                style      = {{
                  ...S.dropzone,
                  borderColor: dragOver  ? "#00BD7D"
                             : preview   ? "#16A34A"
                             : "rgba(0,189,125,0.2)",
                  background : dragOver  ? "rgba(0,189,125,0.05)" : "rgba(78, 80, 73, 0.72)",
                  transform  : dragOver  ? "scale(0.99)" : "scale(1)",
                }}
              >
                {preview ? (
                  <div style={{ textAlign: "center" }}>
                    <img src={preview} alt="preview" style={S.previewImg} />
                    <p style={S.changeText}>Click to change photo</p>
                  </div>
                ) : (
                  <div style={S.dropInner}>
                    <div style={S.uploadIconBox}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="#bd5b00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p style={S.dropTitle}>
                      Drop photo or{" "}
                      <span style={{ color: "#00BD7D", fontWeight: "600" }}>browse files</span>
                    </p>
                    <p style={S.dropHint}>JPG, PNG · Max 5MB · Clear face required</p>
                  </div>
                )}
              </div>
              <input id="fileIn" type="file" accept="image/*"
                onChange={e => handleFile(e.target.files[0])}
                style={{ display: "none" }} />

              {/* Location strip */}
              <div style={S.locStrip}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="#bd5b00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={S.locText}>
                  {location.lat !== 0
                    ? `Location captured: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
                    : "Capturing your location..."}
                </span>
              </div>

              {/* Status messages */}
              {status === "success" && (
                <div style={S.alertSuccess}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#bd5b00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {message}
                </div>
              )}
              {status === "error" && (
                <div style={S.alertError}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {message}
                </div>
              )}

              {/* Submit button */}
              <button
                onClick  = {handleSubmit}
                disabled = {status === "loading"}
                style    = {{
                  ...S.btn,
                  opacity: status === "loading" ? 0.7 : 1,
                  cursor : status === "loading" ? "not-allowed" : "pointer",
                }}
              >
                <span>{status === "loading" ? "Scanning & Uploading..." : "Submit Sighting Report"}</span>
                {status !== "loading" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </button>

              <p style={S.privacy}>
                🔒 Identity never stored · Used solely to locate missing persons
              </p>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const S = {
  page: {
    fontFamily   : "'Poppins', sans-serif",
    background   : "#ffffff",
    minHeight    : "calc(100vh - 64px)",
    display      : "flex",
    alignItems   : "center",
    position     : "relative",
    overflow     : "hidden",
  },

  /* ── Perspective floor grid ── */
  gridFloor: {
    position       : "absolute",
    bottom         : 0,
    left           : 0,
    right          : 0,
    height         : "50%",
    backgroundImage: `
      linear-gradient(rgba(0,189,125,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,189,125,0.06) 1px, transparent 1px)
    `,
    backgroundSize : "50px 50px",
    transform      : "perspective(500px) rotateX(60deg)",
    transformOrigin: "bottom center",
    pointerEvents  : "none",
  },

  horizon: {
    position  : "absolute",
    left      : 0,
    right     : 0,
    bottom    : "38%",
    height    : "1px",
    background: "linear-gradient(90deg, transparent, rgba(0,189,125,0.4), rgba(0,189,125,0.2), transparent)",
    pointerEvents: "none",
  },

  glowCenter: {
    position     : "absolute",
    bottom       : "20%",
    left         : "50%",
    transform    : "translateX(-50%)",
    width        : "800px",
    height       : "300px",
    borderRadius : "50%",
    background   : "radial-gradient(ellipse, rgba(0,189,125,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  glowRight: {
    position     : "absolute",
    top          : "10%",
    right        : "-10%",
    width        : "500px",
    height       : "500px",
    borderRadius : "50%",
    background   : "radial-gradient(circle, rgba(0,189,125,0.04) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  depthLine1: {
    position     : "absolute",
    top          : "20%",
    left         : "30%",
    width        : "400px",
    height       : "1px",
    background   : "linear-gradient(90deg, transparent, rgba(0,189,125,0.08), transparent)",
    transform    : "perspective(400px) rotateX(30deg)",
    pointerEvents: "none",
  },

  depthLine2: {
    position     : "absolute",
    top          : "30%",
    left         : "20%",
    width        : "600px",
    height       : "1px",
    background   : "linear-gradient(90deg, transparent, rgba(0,189,125,0.05), transparent)",
    transform    : "perspective(400px) rotateX(30deg)",
    pointerEvents: "none",
  },

  depthLine3: {
    position     : "absolute",
    top          : "40%",
    left         : "10%",
    width        : "800px",
    height       : "1px",
    background   : "linear-gradient(90deg, transparent, rgba(0,189,125,0.03), transparent)",
    transform    : "perspective(400px) rotateX(30deg)",
    pointerEvents: "none",
  },

  /* ── Main layout ── */
  main: {
    display       : "flex",
    gap           : "60px",
    maxWidth      : "1200px",
    width         : "100%",
    margin        : "0 auto",
    padding       : "60px 48px",
    alignItems    : "center",
    position      : "relative",
    zIndex        : 5,
  },

  /* ── LEFT HERO ── */
  hero: {
    flex         : 1,
    paddingRight : "20px",
  },


  /* Oswald display font for headline */
  heroTitle: {
    fontFamily  : "'Oswald', sans-serif",
    fontSize    : "clamp(42px, 5vw, 64px)",
    fontWeight  : "700",
    lineHeight  : "1.05",
    color       : "#000000",
    letterSpacing: "-0.5px",
    marginBottom: "16px",
  },

  titleAccent: {
    color: "#00BD7D",
  },

  accentBar: {
    width        : "100%",
    height       : "2px",
    background   : "rgba(255,255,255,0.04)",
    marginBottom : "20px",
    borderRadius : "2px",
    overflow     : "hidden",
  },

  accentBarFill: {
    width      : "120px",
    height     : "100%",
    background : "linear-gradient(90deg, #00BD7D, transparent)",
    borderRadius: "2px",
  },

  heroSub: {
    fontFamily  : "'Poppins', sans-serif",
    fontSize    : "14px",
    fontWeight  : "300",
    color       : "#6B7280",
    lineHeight  : "1.8",
    marginBottom: "40px",
    maxWidth    : "400px",
  },

  /* ── Perspective steps ── */
  stepsOuter: {
    position    : "relative",
    marginBottom: "36px",
  },

  step: {
    display      : "flex",
    alignItems   : "flex-start",
    gap          : "16px",
    padding      : "14px 20px 14px 16px",
    background   : "rgba(8,14,25,0.9)",
    border       : "1px solid rgb(0, 189, 126)",
    borderRadius : "8px",
    marginBottom : "8px",
    position     : "relative",
    overflow     : "hidden",
    transition   : "all 0.2s",
  },

  stepLeft: {
    display      : "flex",
    flexDirection: "column",
    alignItems   : "center",
    gap          : "6px",
    flexShrink   : 0,
  },

  stepNum: {
    fontFamily   : "'Oswald', sans-serif",
    fontSize     : "12px",
    fontWeight   : "600",
    color        : "#00BD7D",
    background   : "rgba(0,189,125,0.08)",
    border       : "1px solid rgba(0,189,125,0.2)",
    borderRadius : "4px",
    padding      : "2px 7px",
    letterSpacing: "0.5px",
  },

  stepConnector: {
    width     : "1px",
    flex      : 1,
    minHeight : "16px",
    background: "rgba(0,189,125,0.1)",
  },

  stepRight: { flex: 1 },

  stepTitle: {
    fontFamily  : "'Poppins', sans-serif",
    fontSize    : "13px",
    fontWeight  : "600",
    color       : "#E5E7EB",
    marginBottom: "3px",
  },

  stepDesc: {
    fontFamily: "'Poppins', sans-serif",
    fontSize  : "11px",
    fontWeight: "300",
    color     : "#6bd898",
    lineHeight: "1.6",
  },

  /* Left edge accent bar on steps */
  stepEdge: {
    position    : "absolute",
    left        : 0,
    top         : 0,
    bottom      : 0,
    width       : "2px",
    background  : "linear-gradient(180deg, #00BD7D, transparent)",
    borderRadius: "2px 0 0 2px",
  },

  statsRow: {
    display        : "flex",
    gap            : "0",
    borderTop      : "1px solid rgba(0,189,125,0.08)",
    paddingTop     : "24px",
  },

  statItem: {
    flex       : 1,
    textAlign  : "center",
    paddingRight: "16px",
    borderRight: "1px solid rgba(0,189,125,0.08)",
  },

  statVal: {
    fontFamily  : "'Oswald', sans-serif",
    fontSize    : "18px",
    fontWeight  : "600",
    color       : "#00BD7D",
    marginBottom: "2px",
  },

  statLabel: {
    fontFamily: "'Poppins', sans-serif",
    fontSize  : "10px",
    fontWeight: "400",
    color     : "#374151",
    letterSpacing: "0.3px",
  },

  /* ── RIGHT — Perspective card ── */
  cardOuter: {
    width    : "440px",
    flexShrink: 0,
    position : "relative",
  },

  /* Shadow card behind for depth illusion */
  cardShadow: {
    position    : "absolute",
    inset       : "0",
    background  : "rgb(71, 216, 221)",
    border      : "1px solid rgba(112, 192, 164, 0.8)",
    borderRadius: "16px",
    transform   : "perspective(1000px) rotateY(-6deg) rotateX(2deg) translateX(-16px) translateY(16px)",
    transformOrigin: "right center",
  },

  /* Main tilted card */
  card: {
    background     : "rgba(231, 231, 231, 0.97)",
    border         : "1px solid rgba(0,189,125,0.2)",
    borderRadius   : "16px",
    position       : "relative",
    overflow       : "hidden",
    transform      : "perspective(1000px) rotateY(-4deg) rotateX(1deg)",
    transformOrigin: "right center",
    boxShadow      : "-24px 0 60px rgba(122, 188, 197, 0.5), 0 40px 80px rgba(185, 71, 71, 0.3)",
  },

  /* Teal top strip */
  cardTopStrip: {
    height    : "3px",
    background: "linear-gradient(90deg, #00BD7D, rgba(0,189,125,0.2), transparent)",
  },

  /* Corner bracket mark */
  cornerMark: {
    position    : "absolute",
    bottom      : "16px",
    right       : "16px",
    width       : "24px",
    height      : "24px",
    borderBottom: "2px solid rgb(0, 189, 126)",
    borderRight : "2px solid rgba(0,189,125,0.2)",
    borderRadius: "0 0 4px 0",
  },

  cardInner: { padding: "28px 28px 24px" },

  cardHeader  : { marginBottom: "20px" },
  cardTitleRow: { display: "flex", alignItems: "center", gap: "12px" },

  cardIcon: {
    width          : "36px",
    height         : "36px",
    borderRadius   : "8px",
    background     : "rgba(0,189,125,0.08)",
    border         : "1px solid rgba(0,189,125,0.2)",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
    flexShrink     : 0,
  },

  cardTitle: {
    fontFamily  : "'Oswald', sans-serif",
    fontSize    : "18px",
    fontWeight  : "600",
    color       : "#000000",
    letterSpacing: "0.3px",
  },

  cardSub: {
    fontFamily: "'Poppins', sans-serif",
    fontSize  : "11px",
    fontWeight: "300",
    color     : "#20252e",
    marginTop : "2px",
  },

  /* Drop zone */
  dropzone: {
    border       : "1.5px dashed",
    borderRadius : "10px",
    padding      : "24px 16px",
    textAlign    : "center",
    cursor       : "pointer",
    marginBottom : "14px",
    transition   : "all 0.2s",
    minHeight    : "160px",
    display      : "flex",
    alignItems   : "center",
    justifyContent: "center",
    flexDirection: "column",
    gap          : "10px",
  },

  dropInner: {
    display      : "flex",
    flexDirection: "column",
    alignItems   : "center",
    gap          : "8px",
  },

  uploadIconBox: {
    width          : "50px",
    height         : "50px",
    borderRadius   : "10px",
    background     : "rgba(0, 189, 126, 0.62)",
    border         : "1px solid rgba(0,189,125,0.2)",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
  },

  dropTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize  : "13px",
    fontWeight: "400",
    color     : "#ffffff",
  },

  dropHint: {
    fontFamily: "'Poppins', sans-serif",
    fontSize  : "11px",
    fontWeight: "300",
    color     : "#fefeff",
  },

  previewImg: {
    maxWidth    : "100%",
    maxHeight   : "160px",
    borderRadius: "8px",
    border      : "1.5px solid rgba(22,163,74,0.5)",
  },

  changeText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize  : "11px",
    color     : "#374151",
    marginTop : "6px",
  },

  /* Location strip */
  locStrip: {
    display      : "flex",
    alignItems   : "center",
    gap          : "7px",
    padding      : "8px 12px",
    background   : "rgba(0, 189, 126, 0.37)",
    border       : "1px solid rgba(0,189,125,0.12)",
    borderRadius : "6px",
    marginBottom : "14px",
  },

  locText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize  : "11px",
    fontWeight: "400",
    color     : "#000000",
  },

  /* Alerts */
  alertSuccess: {
    display      : "flex",
    alignItems   : "center",
    gap          : "8px",
    padding      : "10px 14px",
    borderRadius : "8px",
    background   : "rgba(22,163,74,0.08)",
    border       : "1px solid rgba(22,163,74,0.2)",
    color        : "#16A34A",
    fontFamily   : "'Poppins', sans-serif",
    fontSize     : "12px",
    marginBottom : "12px",
    lineHeight   : "1.5",
  },

  alertError: {
    display      : "flex",
    alignItems   : "center",
    gap          : "8px",
    padding      : "10px 14px",
    borderRadius : "8px",
    background   : "rgba(220,38,38,0.08)",
    border       : "1px solid rgba(220,38,38,0.2)",
    color        : "#DC2626",
    fontFamily   : "'Poppins', sans-serif",
    fontSize     : "12px",
    marginBottom : "12px",
  },

  /* Submit button */
  btn: {
    width          : "100%",
    padding        : "13px 20px",
    background     : "#00BD7D",
    border         : "none",
    borderRadius   : "8px",
    color          : "white",
    fontFamily     : "'Poppins', sans-serif",
    fontSize       : "13px",
    fontWeight     : "600",
    letterSpacing  : "0.3px",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
    gap            : "8px",
    marginBottom   : "12px",
    boxShadow      : "0 4px 24px rgba(0,189,125,0.25)",
    transition     : "all 0.2s",
  },

  privacy: {
    fontFamily: "'Poppins', sans-serif",
    fontSize  : "10px",
    fontWeight: "300",
    color     : "#1F2937",
    textAlign : "center",
  },
};



