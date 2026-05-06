
import { useState, useEffect } from "react";
import axios from "axios";

export default function PublicUpload() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState({ lat: 0, lon: 0 });
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) =>
        setLocation({
          lat: p.coords.latitude,
          lon: p.coords.longitude,
        }),
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
    fd.append("image", image);
    fd.append("latitude", location.lat);
    fd.append("longitude", location.lon);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/public/upload",
        fd
      );
      setStatus("success");
      setMessage(`Sighting reported! Report ID: #${res.data.sighting_id}`);
      setImage(null);
      setPreview(null);
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.error || "Upload failed. Please try again."
      );
    }
  };

  return (
    <div style={S.page}>
      {/* LEFT */}
      <div style={S.hero}>
        <div style={S.heroGlow}></div>

        <div style={S.heroInner}>
          <div style={S.liveTag}>
            <span style={S.liveDot} />
            AI Recognition Active
          </div>

          <h1 style={S.heroTitle}>
            Help bring <br />
            someone <span style={S.offsetWord}>home.</span>
          </h1>

          <p style={S.heroSub}>
            Spotted someone who might be missing? Upload their photo — our AI
            instantly checks against the missing persons database and alerts
            their family.
          </p>

          <div style={S.steps}>
            {[
              {
                n: "01",
                title: "Upload Photo",
                desc: "Take or upload a clear photo of the person you spotted.",
              },
              {
                n: "02",
                title: "AI Scans Database",
                desc: "Face recognition checks all missing persons in real time.",
              },
              {
                n: "03",
                title: "Family Gets Alerted",
                desc: "If matched, family and police receive instant alerts.",
              },
            ].map((s) => (
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

      {/* RIGHT */}
      <div style={S.right}>
        <div style={S.card}>
          <h2 style={S.cardTitle}>Report a Sighting</h2>
          <p style={S.cardSub}>No login required · Anonymous</p>

          {/* DROP ZONE */}
          <div
            onClick={() => document.getElementById("fileIn").click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              ...S.dropzone,
              borderColor: dragOver
                ? "#3b82f6"
                : preview
                ? "#22c55e"
                : "rgba(59,130,246,0.3)",
              background: dragOver
                ? "rgba(59,130,246,0.08)"
                : "transparent",
            }}
          >
            {preview ? (
              <div style={{ textAlign: "center" }}>
                <img src={preview} alt="preview" style={S.preview} />
                <p style={S.changeText}>
                  Click anywhere to change photo
                </p>
              </div>
            ) : (
              <div style={S.dropInner}>
                <div style={S.uploadIconBox}>📤</div>

                <p style={S.dropTitle}>
                  Drop photo anywhere or click to upload
                </p>

                <p style={S.dropHint}>
                  Drag & drop supported · JPG / PNG
                </p>
              </div>
            )}
          </div>

          <input
            id="fileIn"
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
            style={{ display: "none" }}
          />

          {/* LOCATION */}
          <div style={S.locRow}>
            📍
            <span style={S.locText}>
              {location.lat !== 0
                ? `${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}`
                : "Getting location..."}
            </span>
          </div>

          {/* STATUS */}
          {status === "success" && (
            <div style={S.alertGreen}>{message}</div>
          )}
          {status === "error" && (
            <div style={S.alertRed}>{message}</div>
          )}

          {/* BUTTON */}
          <button onClick={handleSubmit} style={S.btn}>
            {status === "loading"
              ? "⏳ Scanning..."
              : "Submit Sighting Report →"}
          </button>

          <p style={S.privacyNote}>
            🔒 Your identity is never stored.
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b1220, #0f172a)",
    fontFamily: "'Syne', sans-serif",
  },

  hero: {
    flex: 1,
    padding: "90px 110px",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(160deg, #0b1220 40%, #0f1c3d 100%)",
  },

  heroGlow: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%)",
    top: "-100px",
    left: "-100px",
    filter: "blur(60px)",
  },

  heroInner: {
    maxWidth: "600px",
    zIndex: 1,
  },

  liveTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    borderRadius: "20px",
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#22c55e",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "26px",
  },

  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  heroTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(40px, 4vw, 56px)",
    fontWeight: "800",
    lineHeight: "1.1",
    color: "#f8fafc",
    marginBottom: "18px",
  },

  offsetWord: {
    color: "#3b82f6",
    marginLeft: "18px",
  },

  heroSub: {
    fontSize: "15px",
    color: "#9fb3d9",
    lineHeight: "1.7",
    marginBottom: "40px",
  },

  steps: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  step: {
    display: "flex",
    gap: "14px",
  },

  stepNum: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#3b82f6",
  },

  stepTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#e2e8f0",
  },

  stepDesc: {
    fontSize: "13px",
    color: "#94a3b8",
  },

  right: {
    width: "480px",
    padding: "0 60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
  },

  card: {
    width: "100%",
    padding: "32px",
    background: "rgba(15,23,42,0.85)",
    border: "1px solid rgba(59,130,246,0.15)",
    borderRadius: "18px",
    backdropFilter: "blur(16px)",
  },

  cardTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "24px",
    fontWeight: "700",
    color: "#f8fafc",
  },

  cardSub: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "20px",
  },

  dropzone: {
    border: "2px dashed rgba(59,130,246,0.35)",
    borderRadius: "14px",
    padding: "26px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "16px",
    transition: "all 0.25s ease",
  },

  dropInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },

  uploadIconBox: {
    fontSize: "26px",
  },

  dropTitle: {
    fontSize: "14px",
    color: "#cbd5f5",
  },

  dropHint: {
    fontSize: "12px",
    color: "#64748b",
  },

  preview: {
    maxWidth: "100%",
    maxHeight: "180px",
    borderRadius: "10px",
    border: "2px solid rgba(34,197,94,0.5)",
  },

  changeText: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "8px",
  },

  locRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "12px",
    color: "#94a3b8",
  },

  locText: {
    fontSize: "12px",
  },

  alertGreen: {
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(34,197,94,0.12)",
    color: "#22c55e",
    marginBottom: "12px",
  },

  alertRed: {
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(239,68,68,0.12)",
    color: "#ef4444",
    marginBottom: "12px",
  },

  btn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontFamily: "'Syne', sans-serif",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  privacyNote: {
    fontSize: "11px",
    color: "#64748b",
    textAlign: "center",
    marginTop: "10px",
  },
};

