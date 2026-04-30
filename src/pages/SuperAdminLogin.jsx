import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SuperAdminLogin() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { setError("Fill all fields."); return; }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email, password
      });
      if (res.data.org_type !== "superadmin") {
        setError("You are not a Super Admin.");
        return;
      }
      localStorage.setItem("superToken", res.data.token);
      navigate("/superadmin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: "center", fontSize: "48px" }}>👑</div>
        <h2 style={styles.title}>Super Admin Login</h2>
        <p style={styles.subtitle}>System owner only</p>

        <input style={styles.input} placeholder="Email"    type="email"    value={email}    onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()} />

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleLogin} disabled={loading}
          style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page    : { minHeight: "90vh", backgroundColor: "#0f0f1a", display: "flex", justifyContent: "center", alignItems: "center" },
  card    : { backgroundColor: "white", borderRadius: "12px", padding: "40px", width: "100%", maxWidth: "380px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" },
  title   : { textAlign: "center", marginBottom: "4px" },
  subtitle: { textAlign: "center", color: "#888", marginBottom: "24px" },
  input   : { width: "100%", padding: "12px", marginBottom: "14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" },
  button  : { width: "100%", padding: "14px", backgroundColor: "#722ed1", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
  error   : { color: "red", fontSize: "13px", marginBottom: "10px", textAlign: "center" }
};

export default SuperAdminLogin;