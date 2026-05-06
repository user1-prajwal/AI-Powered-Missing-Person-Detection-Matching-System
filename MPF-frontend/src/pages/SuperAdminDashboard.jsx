import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SuperAdminDashboard() {
  const [pending,  setPending]  = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [message,  setMessage]  = useState("");
  const navigate  = useNavigate();
  const token     = localStorage.getItem("superToken");

  useEffect(() => {
    if (!token) { navigate("/superadmin"); return; }
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const [pendRes, appRes] = await Promise.all([
        axios.get("http://localhost:5000/api/superadmin/pending",
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/superadmin/approved",
          { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPending(pendRes.data.pending);
      setApproved(appRes.data.approved);
    } catch { navigate("/superadmin"); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id, name) => {
    try {
      await axios.post(
        `http://localhost:5000/api/superadmin/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ ${name} approved successfully!`);
      fetchOrgs();
    } catch {
      setMessage("❌ Approval failed.");
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject ${name}?`)) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/superadmin/reject/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`🗑️ ${name} rejected.`);
      fetchOrgs();
    } catch {
      setMessage("❌ Rejection failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("superToken");
    navigate("/superadmin");
  };

  const typeIcon = (type) => type === "police" ? "👮" : "🤝";

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={{ fontSize: "13px", opacity: 0.7 }}>System Owner</div>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>👑 Super Admin Dashboard</div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* Stats bar */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statBox, borderColor: "#fa8c16" }}>
          <div style={styles.statNum}>{pending.length}</div>
          <div style={styles.statLabel}>Pending Approval</div>
        </div>
        <div style={{ ...styles.statBox, borderColor: "#52c41a" }}>
          <div style={styles.statNum}>{approved.length}</div>
          <div style={styles.statLabel}>Active Organizations</div>
        </div>
      </div>

      {message &&
        <div style={{
          ...styles.messageBox,
          backgroundColor: message.startsWith("✅") ? "#e6ffed" : message.startsWith("🗑️") ? "#fff7e6" : "#fff0f0",
          borderColor    : message.startsWith("✅") ? "#52c41a" : message.startsWith("🗑️") ? "#fa8c16"  : "#ff4d4f"
        }}>
          {message}
        </div>
      }

      {/* Pending approvals */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>⏳ Pending Approvals</h2>
        {loading
          ? <p style={styles.empty}>Loading...</p>
          : pending.length === 0
            ? <p style={styles.empty}>No pending applications 🎉</p>
            : pending.map(org => (
                <div key={org.id} style={styles.orgCard}>
                  <div style={styles.orgLeft}>
                    <div style={styles.orgName}>{typeIcon(org.type)} {org.name}</div>
                    <div style={styles.orgMeta}>📧 {org.email}</div>
                    <div style={styles.orgMeta}>
                      Type: <strong>{org.type.toUpperCase()}</strong> &nbsp;|&nbsp;
                      Applied: {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={styles.orgActions}>
                    <button
                      onClick = {() => handleApprove(org.id, org.name)}
                      style   = {styles.approveBtn}>
                      ✅ Approve
                    </button>
                    <button
                      onClick = {() => handleReject(org.id, org.name)}
                      style   = {styles.rejectBtn}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))
        }
      </div>

      {/* Approved organizations */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>✅ Active Organizations</h2>
        {loading
          ? <p style={styles.empty}>Loading...</p>
          : approved.length === 0
            ? <p style={styles.empty}>No approved organizations yet.</p>
            : approved.map(org => (
                <div key={org.id} style={{ ...styles.orgCard, backgroundColor: "#f6ffed" }}>
                  <div style={styles.orgLeft}>
                    <div style={styles.orgName}>{typeIcon(org.type)} {org.name}</div>
                    <div style={styles.orgMeta}>📧 {org.email}</div>
                    <div style={styles.orgMeta}>
                      Type: <strong>{org.type.toUpperCase()}</strong> &nbsp;|&nbsp;
                      Joined: {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ ...styles.badge, backgroundColor: "#52c41a" }}>Active</div>
                </div>
              ))
        }
      </div>

    </div>
  );
}

const styles = {
  page      : { padding: "20px", maxWidth: "750px", margin: "0 auto" },
  header    : { backgroundColor: "#1a1a2e", color: "white", padding: "18px 24px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  statsRow  : { display: "flex", gap: "16px", marginBottom: "16px" },
  statBox   : { flex: 1, backgroundColor: "white", borderRadius: "10px", padding: "20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderTop: "4px solid" },
  statNum   : { fontSize: "32px", fontWeight: "bold", color: "#1a1a2e" },
  statLabel : { fontSize: "13px", color: "#888", marginTop: "4px" },
  card      : { backgroundColor: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
  cardTitle : { marginTop: 0, marginBottom: "16px", fontSize: "18px" },
  orgCard   : { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", border: "1px solid #eee", borderRadius: "10px", marginBottom: "10px" },
  orgLeft   : { flex: 1 },
  orgName   : { fontWeight: "bold", fontSize: "16px", marginBottom: "4px" },
  orgMeta   : { fontSize: "13px", color: "#666", marginBottom: "2px" },
  orgActions: { display: "flex", gap: "8px", flexDirection: "column" },
  approveBtn: { padding: "8px 16px", backgroundColor: "#52c41a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
  rejectBtn : { padding: "8px 16px", backgroundColor: "#ff4d4f", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
  logoutBtn : { padding: "8px 18px", backgroundColor: "#ff4d4f", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  empty     : { color: "#aaa", textAlign: "center", padding: "20px 0" },
  messageBox: { padding: "12px 16px", borderRadius: "8px", border: "1px solid", marginBottom: "16px", fontWeight: "500" },
  badge     : { color: "white", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }
};

export default SuperAdminDashboard;