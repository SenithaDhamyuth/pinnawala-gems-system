import { useState } from "react"
import { getPendingKYC, getAllUsers, updateKYCStatus, banUser } from "../services/api"

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPass, setAdminPass] = useState("")
  const [loginError, setLoginError] = useState("")
  const [pendingKYC, setPendingKYC] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [activeTab, setActiveTab] = useState("kyc")
  const [message, setMessage] = useState("")

  const loadData = async () => {
    try {
      const kycRes = await getPendingKYC()
      const usersRes = await getAllUsers()
      setPendingKYC(kycRes.data)
      setAllUsers(usersRes.data)
    } catch {
      setMessage("Could not load data.")
    }
  }

  const handleAdminLogin = () => {
    if (adminEmail === "admin@pinnawala.lk" && adminPass === "admin123") {
      setLoggedIn(true)
      loadData()
    } else {
      setLoginError("Wrong email or password!")
    }
  }

  const handleKYC = async (email, action) => {
    try {
      await updateKYCStatus(email, action)
      setMessage(`KYC ${action}d for ${email}`)
      setPendingKYC((prev) => prev.filter((s) => s.email !== email))
    } catch {
      setMessage("Action failed.")
    }
  }

  const handleBan = async (email) => {
    if (!window.confirm(`Ban user: ${email}?`)) return
    try {
      await banUser(email)
      setMessage(`User ${email} banned.`)
      loadData()
    } catch {
      setMessage("Ban failed.")
    }
  }

  const inputStyle = { width: "100%", background: "rgba(255,68,102,0.05)", border: "1px solid rgba(255,68,102,0.2)", borderRadius: "8px", padding: "11px 14px", color: "#fff", fontSize: "1rem", marginBottom: "14px", outline: "none", boxSizing: "border-box" }

  if (!loggedIn) return (
    <div style={{ minHeight: "100vh", background: "#020818", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ background: "rgba(6,20,60,0.9)", border: "1px solid rgba(255,68,102,0.3)", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "380px", color: "#fff" }}>
        <div style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "16px" }}>🛡️</div>
        <div style={{ fontFamily: "monospace", fontSize: "1.2rem", color: "#ff4466", textAlign: "center", letterSpacing: "3px", marginBottom: "6px" }}>ADMIN PORTAL</div>
        <div style={{ textAlign: "center", color: "#4a6fa5", fontSize: "0.85rem", marginBottom: "28px" }}>Restricted — Authorized Personnel Only</div>
        <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", color: "#ff4466", letterSpacing: "1.5px", marginBottom: "6px" }}>ADMIN EMAIL</label>
        <input style={inputStyle} type="email" placeholder="admin@pinnawala.lk" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
        <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", color: "#ff4466", letterSpacing: "1.5px", marginBottom: "6px" }}>PASSWORD</label>
        <input style={inputStyle} type="password" placeholder="••••••••" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()} />
        <button onClick={handleAdminLogin} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#ff4466,#ff6b35)", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "monospace", fontWeight: "bold", fontSize: "0.8rem", letterSpacing: "2px", cursor: "pointer" }}>
          ACCESS DASHBOARD →
        </button>
        {loginError && <div style={{ textAlign: "center", color: "#ff4466", marginTop: "12px" }}>{loginError}</div>}
        <div style={{ marginTop: "20px", padding: "12px", background: "rgba(255,68,102,0.05)", border: "1px solid rgba(255,68,102,0.15)", borderRadius: "8px", fontSize: "0.8rem", color: "#4a6fa5" }}>
          ⚠️ Demo login:<br />Email: <strong style={{ color: "#ff4466" }}>admin@pinnawala.lk</strong><br />Password: <strong style={{ color: "#ff4466" }}>admin123</strong>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#020818", fontFamily: "sans-serif", color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "rgba(2,8,24,0.9)", borderBottom: "1px solid rgba(0,200,255,0.15)" }}>
        <div style={{ fontFamily: "monospace", fontSize: "1rem", color: "#00c8ff", letterSpacing: "2px" }}>🛡️ ADMIN DASHBOARD</div>
        <button onClick={() => setLoggedIn(false)} style={{ padding: "8px 20px", background: "transparent", border: "1px solid rgba(255,68,102,0.4)", borderRadius: "8px", color: "#ff4466", fontFamily: "monospace", fontSize: "0.65rem", cursor: "pointer" }}>🔓 LOGOUT</button>
      </div>

      <div style={{ padding: "32px" }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "28px" }}>
          {[["👥 Total Users", allUsers.length, "#fff"], ["💎 Sellers", allUsers.filter(u => u.role === "seller").length, "#00c8ff"], ["⏳ Pending KYC", pendingKYC.length, "#ffd700"], ["🚫 Banned", allUsers.filter(u => u.is_banned).length, "#ff4466"]].map(([label, val, color]) => (
            <div key={label} style={{ background: "rgba(6,20,60,0.7)", border: "1px solid rgba(0,200,255,0.15)", borderRadius: "14px", padding: "20px" }}>
              <div style={{ fontFamily: "monospace", fontSize: "1.8rem", fontWeight: "bold", color }}>{val}</div>
              <div style={{ fontSize: "0.75rem", color: "#4a6fa5", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>

        {message && <div style={{ padding: "12px 20px", background: "rgba(0,255,179,0.08)", border: "1px solid rgba(0,255,179,0.2)", borderRadius: "8px", color: "#00ffb3", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "16px" }}>{message}</div>}

        {/* TABS */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
          {[["kyc", "⏳ PENDING KYC"], ["users", "👥 ALL USERS"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "10px 24px", border: activeTab === tab ? "1px solid rgba(0,200,255,0.5)" : "1px solid rgba(0,200,255,0.1)", borderRadius: "8px", background: activeTab === tab ? "rgba(0,200,255,0.12)" : "transparent", color: activeTab === tab ? "#00c8ff" : "#4a6fa5", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "1.5px", cursor: "pointer" }}>{label}</button>
          ))}
        </div>

        <div style={{ background: "rgba(6,20,60,0.7)", border: "1px solid rgba(0,200,255,0.15)", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,200,255,0.15)", fontFamily: "monospace", fontSize: "0.8rem", color: "#fff" }}>
            {activeTab === "kyc" ? `KYC PENDING — ${pendingKYC.length} sellers waiting` : `ALL USERS — ${allUsers.length} total`}
          </div>

          {activeTab === "kyc" && (
            pendingKYC.length === 0
              ? <div style={{ padding: "40px", textAlign: "center", color: "#4a6fa5" }}>✅ No pending KYC applications.</div>
              : <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    {["Name", "Email", "Shop", "NIC", "Actions"].map(h => <th key={h} style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "0.55rem", color: "#00c8ff", letterSpacing: "1.5px", textAlign: "left", background: "rgba(0,200,255,0.05)", borderBottom: "1px solid rgba(0,200,255,0.1)" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {pendingKYC.map((seller) => (
                      <tr key={seller.email}>
                        <td style={{ padding: "14px 20px", color: "#c8e0ff" }}><strong>{seller.full_name}</strong></td>
                        <td style={{ padding: "14px 20px", color: "#c8e0ff" }}>{seller.email}</td>
                        <td style={{ padding: "14px 20px", color: "#c8e0ff" }}>{seller.shop_name || "—"}</td>
                        <td style={{ padding: "14px 20px", color: "#c8e0ff" }}>{seller.nic_number || "—"}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <button onClick={() => handleKYC(seller.email, "approve")} style={{ padding: "6px 14px", background: "rgba(0,255,179,0.15)", border: "1px solid rgba(0,255,179,0.4)", borderRadius: "6px", color: "#00ffb3", fontFamily: "monospace", fontSize: "0.55rem", cursor: "pointer", marginRight: "6px" }}>✅ APPROVE</button>
                          <button onClick={() => handleKYC(seller.email, "reject")} style={{ padding: "6px 14px", background: "rgba(255,68,102,0.1)", border: "1px solid rgba(255,68,102,0.3)", borderRadius: "6px", color: "#ff4466", fontFamily: "monospace", fontSize: "0.55rem", cursor: "pointer" }}>❌ REJECT</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}

          {activeTab === "users" && (
            allUsers.length === 0
              ? <div style={{ padding: "40px", textAlign: "center", color: "#4a6fa5" }}>No users yet.</div>
              : <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    {["Name", "Email", "Role", "KYC Status", "Banned", "Actions"].map(h => <th key={h} style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "0.55rem", color: "#00c8ff", letterSpacing: "1.5px", textAlign: "left", background: "rgba(0,200,255,0.05)", borderBottom: "1px solid rgba(0,200,255,0.1)" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.email}>
                        <td style={{ padding: "14px 20px", color: "#c8e0ff" }}><strong>{user.full_name}</strong></td>
                        <td style={{ padding: "14px 20px", color: "#c8e0ff" }}>{user.email}</td>
                        <td style={{ padding: "14px 20px" }}><span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "0.75rem", background: user.role === "seller" ? "rgba(0,200,255,0.12)" : "rgba(123,47,255,0.12)", color: user.role === "seller" ? "#00c8ff" : "#b07fff" }}>{user.role}</span></td>
                        <td style={{ padding: "14px 20px", color: user.kyc_status === "approved" ? "#00ffb3" : user.kyc_status === "rejected" ? "#ff4466" : "#ffd700" }}>{user.kyc_status || "—"}</td>
                        <td style={{ padding: "14px 20px" }}>{user.is_banned ? <span style={{ color: "#ff4466" }}>🚫 Yes</span> : <span style={{ color: "#00ffb3" }}>✅ No</span>}</td>
                        <td style={{ padding: "14px 20px" }}>{!user.is_banned && <button onClick={() => handleBan(user.email)} style={{ padding: "6px 14px", background: "rgba(255,68,102,0.1)", border: "1px solid rgba(255,68,102,0.3)", borderRadius: "6px", color: "#ff4466", fontFamily: "monospace", fontSize: "0.55rem", cursor: "pointer" }}>🚫 BAN</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}
        </div>
      </div>
    </div>
  )
}