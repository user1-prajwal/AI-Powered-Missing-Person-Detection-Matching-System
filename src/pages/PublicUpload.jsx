
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
    navigator.geolocation.getCurrentPosition(
      p  => setLocation({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {}
    );
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setStatus(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) {
      setStatus("error");
      setMessage("Please select an image first.");
      return;
    }
    setStatus("loading");
    const fd = new FormData();
    fd.append("image",     image);
    fd.append("latitude",  location.lat);
    fd.append("longitude", location.lon);
    try {
      const res = await axios.post("http://localhost:5000/api/public/upload", fd);
      setStatus("success");
      setMessage(`Sighting reported! Report ID: #${res.data.sighting_id}`);
      setImage(null);
      setPreview(null);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Upload failed. Please try again.");
    }
  };

  return (
    <div style={S.page}>

      {/* ── LEFT HERO PANEL ── */}
      <div style={S.hero}>
        <div style={S.heroInner}>

          <div style={S.liveTag}>
            <span style={S.liveDot} />
            AI Recognition Active
          </div>

          <h1 style={S.heroTitle}>
            Help bring<br />
            someone <span style={S.accent}>home.</span>
          </h1>
          
          <p style={S.heroSub}>
            Spotted someone who might be missing?
            Upload their photo — our AI instantly
            checks against the missing persons
            database and alerts their family.
          </p>

          {/* Steps */}
          <div style={S.steps}>
            {[
              { n: "01", title: "Upload Photo",
                desc: "Take or upload a clear photo of the person you spotted." },
              { n: "02", title: "AI Scans Database",
                desc: "Face recognition checks all missing persons in real time." },
              { n: "03", title: "Family Gets Alerted",
                desc: "If matched, family and police receive instant email + location." },
            ].map(s => (
              <div key={s.n} style={S.step}>
                <div style={S.stepNum}>{s.n}</div>
                <div>
                  <div style={S.stepTitle}>{s.title}</div>
                  <div style={S.stepDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={S.right}>
        <div style={S.card} className="fade-up">

          <h2 style={S.cardTitle}>Report a Sighting</h2>
          <p style={S.cardSub}>No login required · Completely anonymous</p>

          {/* Drop zone */}
          <div
            onClick    = {() => document.getElementById("fileIn").click()}
            onDragOver = {e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave= {()  => setDragOver(false)}
            onDrop     = {handleDrop}
            style={{
              ...S.dropzone,
              borderColor: dragOver   ? "#3b82f6"
                         : preview    ? "#22c55e"
                         : "rgba(59,130,246,0.25)",
              background : dragOver   ? "rgba(59,130,246,0.08)"
                         : "rgba(255,255,255,0.02)",
            }}
          >
            {preview ? (
              <div style={{ textAlign: "center" }}>
                <img src={preview} alt="preview" style={S.preview} />
                <p style={S.changeText}>Click to change photo</p>
              </div>
            ) : (
              <div style={S.dropInner}>
                <div style={S.uploadIconBox}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="#3b82f6" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p style={S.dropTitle}>
                  Drop photo here or{" "}
                  <span style={{ color: "#60a5fa" }}>browse files</span>
                </p>
                <p style={S.dropHint}>JPG, JPEG, PNG · Clear face needed for AI matching</p>
              </div>
            )}
          </div>
          <input
            id       = "fileIn"
            type     = "file"
            accept   = "image/*"
            onChange = {e => handleFile(e.target.files[0])}
            style    = {{ display: "none" }}
          />

          {/* Location row */}
          <div style={S.locRow}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="#3b82f6" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={S.locText}>
              {location.lat !== 0
                ? `Location captured: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
                : "Capturing your location..."}
            </span>
          </div>

          {/* Status alerts */}
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
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            onClick  = {handleSubmit}
            disabled = {status === "loading"}
            style    = {{
              ...S.btn,
              opacity: status === "loading" ? 0.6 : 1,
              cursor : status === "loading" ? "not-allowed" : "pointer",
            }}
          >
            {status === "loading"
              ? "⏳  Scanning & Uploading..."
              : "Submit Sighting Report →"}
          </button>

          <p style={S.privacyNote}>
            🔒 Your identity is never stored. Reports are used solely to locate missing persons.
          </p>

        </div>
      </div>

    </div>
  );
}

const S = {
  page   : {
    display      : "flex",
    minHeight    : "calc(100vh - 64px)",
  },

  /* LEFT */
  hero   : {
    flex         : 1,
    padding      : "60px 100px",
    display      : "flex",
    alignItems   : "center",
    borderRight  : "10px solid rgba(59,130,246,0.08)",
  },
  heroInner : { maxWidth: "1000px" },

  liveTag: {
    display        : "inline-flex",
    alignItems     : "center",
    gap            : "8px",
    padding        : "6px 14px",
    borderRadius   : "20px",
    background     : "rgba(34,197,94,0.08)",
    border         : "1px solid rgba(34,197,94,0.2)",
    color          : "#22c55e",
    fontSize       : "12px",
    fontWeight     : "600",
    letterSpacing  : "0.4px",
    marginBottom   : "28px",
  },
  liveDot: {
    width        : "7px",
    height       : "7px",
    borderRadius : "50%",
    background   : "#22c55e",
    display      : "inline-block",
    animation    : "pulse 2s infinite",
  },

  heroTitle : {
    fontFamily  : "'Syne', sans-serif",
    fontSize    : "clamp(38px, 4vw, 54px)",
    fontWeight  : "800",
    lineHeight  : "1.12",
    color       : "#f0f4ff",
    marginBottom: "20px",
  },
  accent    : { color: "#60a5fa" },
  heroSub   : {
    fontSize    : "15px",
    color       : "#74bb74",
    lineHeight  : "1.75",
    marginTop   : "50px",
    marginBottom: "44px",
    maxWidth    : "400px",
  },

  steps  : { display: "flex", flexDirection: "column", gap: "22px" },
  step   : { display: "flex", gap: "16px", alignItems: "flex-start" },
  stepNum: {
    fontFamily   : "'Syne', sans-serif",
    fontSize     : "11px",
    fontWeight   : "700",
    color        : "#3b82f6",
    background   : "rgba(59,130,246,0.1)",
    border       : "1px solid rgba(59,130,246,0.2)",
    borderRadius : "6px",
    padding      : "3px 8px",
    whiteSpace   : "nowrap",
    marginTop    : "3px",
  },
  stepTitle : {
    fontSize    : "14px",
    fontWeight  : "600",
    color       : "#e2e8f0",
    marginBottom: "3px",
  },
  stepDesc  : { fontSize: "13px", color: "#8dacd4", lineHeight: "1.5" },

  /* RIGHT */
  right  : {
    width          : "460px",
    minWidth       : "300px",
    padding        : "0px 36px",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
  },
  card   : {
    width        : "100%",
    padding      : "36px 30px",
    background   : "rgba(15,31,61,0.6)",
    border       : "1px solid rgba(59,130,246,0.12)",
    borderRadius : "20px",
    backdropFilter: "blur(20px)",
  },
  cardTitle : {
    fontFamily  : "'Syne', sans-serif",
    fontSize    : "26px",
    fontWeight  : "700",
    color       : "#f0f4ff",
    marginBottom: "6px",
  },
  cardSub   : { fontSize: "13px", color: "#64676d", marginBottom: "24px" },

  dropzone  : {
    border       : "2px dashed",
    borderRadius : "14px",
    padding      : "28px 20px",
    textAlign    : "center",
    cursor       : "pointer",
    marginBottom : "14px",
    transition   : "all 0.25s",
    minHeight    : "170px",
    display      : "flex",
    alignItems   : "center",
    justifyContent: "center",
  },
  dropInner  : {
    display       : "flex",
    flexDirection : "column",
    alignItems    : "center",
    gap           : "12px",
  },
  uploadIconBox: {
    width          : "58px",
    height         : "58px",
    borderRadius   : "14px",
    background     : "rgba(59,130,246,0.08)",
    border         : "1px solid rgba(59,130,246,0.2)",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
  },
  dropTitle  : { fontSize: "14px", color: "#94a3b8", fontWeight: "500" },
  dropHint   : { fontSize: "12px", color: "#334155" },
  preview    : {
    maxWidth     : "100%",
    maxHeight    : "180px",
    borderRadius : "10px",
    border       : "2px solid rgba(34,197,94,0.4)",
  },
  changeText : { fontSize: "12px", color: "#475569", marginTop: "8px" },

  locRow : {
    display      : "flex",
    alignItems   : "center",
    gap          : "6px",
    marginBottom : "16px",
  },
  locText: { fontSize: "12px", color: "#334155" },

  alertGreen: {
    display        : "flex",
    alignItems     : "center",
    gap            : "8px",
    padding        : "11px 14px",
    borderRadius   : "10px",
    background     : "rgba(34,197,94,0.08)",
    border         : "1px solid rgba(34,197,94,0.2)",
    color          : "#22c55e",
    fontSize       : "13px",
    marginBottom   : "12px",
  },
  alertRed: {
    display        : "flex",
    alignItems     : "center",
    gap            : "8px",
    padding        : "11px 14px",
    borderRadius   : "10px",
    background     : "rgba(239,68,68,0.08)",
    border         : "1px solid rgba(239,68,68,0.2)",
    color          : "#ef4444",
    fontSize       : "13px",
    marginBottom   : "12px",
  },

  btn: {
    width          : "100%",
    padding        : "14px",
    background     : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
    border         : "none",
    borderRadius   : "12px",
    color          : "white",
    fontFamily     : "'Syne', sans-serif",
    fontSize       : "14px",
    fontWeight     : "600",
    letterSpacing  : "0.3px",
    boxShadow      : "0 4px 20px rgba(59,130,246,0.35)",
    transition     : "all 0.2s",
    marginBottom   : "14px",
  },
  privacyNote: {
    fontSize   : "11px",
    color      : "#8fc58d",
    textAlign  : "center",
  },
};