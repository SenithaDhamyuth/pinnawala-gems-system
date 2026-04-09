import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getPendingKYC, getAllUsers, banUser } from "../services/api"

const style = document.createElement("style")
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

  .ad-root * { box-sizing: border-box; }

  .ad-root {
    min-height: 100vh;
    background: #f0f4ff;
    background-image:
      radial-gradient(ellipse 80% 60% at 20% -10%, rgba(99,134,255,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 110%, rgba(59,106,255,0.14) 0%, transparent 55%);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .ad-login-wrap {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 40px 20px;
  }

  .ad-login-card {
    background: #ffffff;
    border: 1px solid rgba(99,134,255,0.18);
    border-radius: 28px;
    padding: 48px 44px;
    width: 100%; max-width: 460px;
    box-shadow: 0 4px 6px rgba(59,106,255,0.04), 0 20px 60px rgba(59,106,255,0.12);
    position: relative; overflow: hidden;
  }

  .ad-login-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, #3b6aff, #6384ff, #3b6aff);
    background-size: 200%;
    animation: adshimmer 3s linear infinite;
  }

  @keyframes adshimmer {
    0%   { background-position: 0%;   }
    100% { background-position: 200%; }
  }

  .ad-nav-tabs {
    display: flex; gap: 8px;
    margin-bottom: 28px; padding-bottom: 16px;
    border-bottom: 1.5px solid #e3e9ff;
  }

  .ad-nav-tab {
    flex: 1; padding: 9px 0; border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; font-size: 0.78rem;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;
  }
  .ad-nav-tab.active   { border: 2px solid #3b6aff; background: #edf2ff; color: #3b6aff; box-shadow: 0 2px 10px rgba(59,106,255,0.15); }
  .ad-nav-tab.inactive { border: 1.5px solid #dde4f8; background: transparent; color: #8898cc; }
  .ad-nav-tab.inactive:hover { border-color: #3b6aff; color: #3b6aff; }

  .ad-login-icon {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #3b6aff, #6384ff);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 30px; margin: 0 auto 18px;
    box-shadow: 0 6px 22px rgba(59,106,255,0.32);
  }

  .ad-login-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.7rem; color: #0f1c4d;
    text-align: center; margin-bottom: 4px;
  }

  .ad-login-sub {
    text-align: center; font-size: 0.83rem;
    color: #8898cc; font-weight: 500; margin-bottom: 32px;
  }

  .ad-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.71rem; font-weight: 700; color: #5668a0;
    letter-spacing: 0.9px; text-transform: uppercase; margin-bottom: 7px;
  }

  .ad-input {
    width: 100%; background: #f7f9ff;
    border: 1.5px solid #e3e9ff; border-radius: 12px;
    padding: 13px 16px; color: #0f1c4d;
    font-size: 0.95rem; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500; outline: none;
    transition: all 0.2s ease; margin-bottom: 18px;
  }
  .ad-input:focus         { border-color: #3b6aff; background: #fff; box-shadow: 0 0 0 4px rgba(59,106,255,0.1); }
  .ad-input::placeholder  { color: #b8c4e0; font-weight: 400; }

  .ad-btn-primary {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, #3b6aff 0%, #5580ff 100%);
    border: none; border-radius: 14px; color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; font-size: 0.9rem; letter-spacing: 0.5px;
    cursor: pointer; transition: all 0.22s ease;
    box-shadow: 0 4px 18px rgba(59,106,255,0.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .ad-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,106,255,0.45); }

  .ad-hint-box {
    margin-top: 20px; background: #f7f9ff;
    border: 1px solid #e3e9ff; border-radius: 12px;
    padding: 14px 16px; font-size: 0.82rem;
    color: #8898cc; line-height: 1.8;
  }
  .ad-hint-box strong { color: #3b6aff; }

  .ad-err {
    text-align: center; color: #d63031;
    font-size: 0.86rem; font-weight: 600; margin-top: 12px;
    background: #fff2f2; border: 1px solid #f9c0c0;
    border-radius: 10px; padding: 9px 14px;
  }

  /* DASHBOARD */
  .ad-topbar {
    background: #ffffff; border-bottom: 1px solid #e3e9ff;
    padding: 14px 36px;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 2px 12px rgba(59,106,255,0.07);
    position: sticky; top: 0; z-index: 10;
  }

  .ad-topbar-left  { display: flex; align-items: center; gap: 12px; }
  .ad-topbar-right { display: flex; gap: 8px; align-items: center; }

  .ad-topbar-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, #3b6aff, #6384ff);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 3px 10px rgba(59,106,255,0.28);
  }

  .ad-topbar-title { font-family: 'Instrument Serif', serif; font-size: 1.2rem; color: #0f1c4d; }

  .ad-topbar-badge {
    background: #edf2ff; border: 1px solid #c5d3ff;
    border-radius: 20px; padding: 3px 10px;
    font-size: 0.7rem; font-weight: 700; color: #3b6aff; letter-spacing: 0.5px;
  }

  .ad-topbar-navbtn {
    padding: 7px 16px; border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; font-size: 0.76rem; cursor: pointer;
    transition: all 0.2s; letter-spacing: 0.3px;
    border: 1.5px solid #dde4f8; background: transparent; color: #8898cc;
  }
  .ad-topbar-navbtn:hover { border-color: #3b6aff; color: #3b6aff; }

  .ad-logout-btn {
    padding: 8px 18px; background: transparent;
    border: 1.5px solid #f9c0c0; border-radius: 10px; color: #d63031;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; font-size: 0.76rem; cursor: pointer; transition: all 0.2s;
  }
  .ad-logout-btn:hover { background: #fff2f2; }

  .ad-body { padding: 32px 36px; }

  .ad-stats {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 18px; margin-bottom: 28px;
  }

  .ad-stat-card {
    background: #ffffff; border: 1px solid rgba(99,134,255,0.15);
    border-radius: 18px; padding: 22px 24px;
    box-shadow: 0 2px 12px rgba(59,106,255,0.07);
    transition: transform 0.2s ease;
  }
  .ad-stat-card:hover { transform: translateY(-3px); }
  .ad-stat-icon  { font-size: 1.6rem; margin-bottom: 10px; display: block; }
  .ad-stat-val   { font-size: 2rem; font-weight: 800; line-height: 1; margin-bottom: 6px; }
  .ad-stat-label { font-size: 0.77rem; font-weight: 600; color: #8898cc; }

  .ad-msg {
    padding: 12px 18px; background: #edfaf3;
    border: 1px solid #b6e8d0; border-radius: 10px;
    color: #1a8a4a; font-size: 0.86rem; font-weight: 600;
    margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
  }

  .ad-tab-bar { display: flex; gap: 6px; margin-bottom: 20px; }

  .ad-tab-btn {
    padding: 10px 22px; border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; font-size: 0.8rem; cursor: pointer;
    transition: all 0.2s; letter-spacing: 0.3px;
  }
  .ad-tab-btn.tab-active   { background: #3b6aff; border: none; color: #fff; box-shadow: 0 4px 14px rgba(59,106,255,0.3); }
  .ad-tab-btn.tab-inactive { background: #fff; border: 1.5px solid #dde4f8; color: #8898cc; }
  .ad-tab-btn.tab-inactive:hover { border-color: #3b6aff; color: #3b6aff; }

  .ad-table-card {
    background: #fff; border: 1px solid rgba(99,134,255,0.15);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(59,106,255,0.08);
  }

  .ad-table-header {
    padding: 16px 26px; border-bottom: 1px solid #eef1ff;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ad-table-heading { font-family: 'Instrument Serif', serif; font-size: 1.05rem; color: #0f1c4d; }
  .ad-table-count   { background: #edf2ff; border: 1px solid #c5d3ff; border-radius: 20px; padding: 3px 12px; font-size: 0.75rem; font-weight: 700; color: #3b6aff; }

  .ad-table { width: 100%; border-collapse: collapse; }

  .ad-th {
    padding: 12px 22px; font-size: 0.68rem; font-weight: 700;
    color: #8898cc; letter-spacing: 1px; text-transform: uppercase;
    text-align: left; background: #f7f9ff; border-bottom: 1px solid #eef1ff;
  }

  .ad-td {
    padding: 14px 22px; font-size: 0.88rem;
    color: #2d3a6b; font-weight: 500; border-bottom: 1px solid #f5f7ff;
  }
  .ad-tr:last-child .ad-td { border-bottom: none; }
  .ad-tr:hover .ad-td      { background: #fafbff; }

  .ad-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 0.74rem; font-weight: 700; }
  .bdg-seller   { background: #edf2ff; color: #3b6aff;  }
  .bdg-buyer    { background: #f0f4ff; color: #8898cc;  }
  .bdg-approved { background: #edfaf3; color: #1a8a4a;  }
  .bdg-pending  { background: #fffbeb; color: #b45309;  }
  .bdg-rejected { background: #fff2f2; color: #d63031;  }
  .bdg-nr       { background: #f5f7ff; color: #8898cc;  }
  .bdg-banned   { background: #fff2f2; color: #d63031;  }
  .bdg-active   { background: #edfaf3; color: #1a8a4a;  }

  .ad-btn-approve {
    padding: 6px 14px; background: #edfaf3; border: 1.5px solid #b6e8d0;
    border-radius: 8px; color: #1a8a4a;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; font-size: 0.74rem; cursor: pointer;
    margin-right: 6px; transition: all 0.18s;
  }
  .ad-btn-approve:hover { background: #d4f5e5; }

  .ad-btn-reject {
    padding: 6px 14px; background: #fff2f2; border: 1.5px solid #f9c0c0;
    border-radius: 8px; color: #d63031;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; font-size: 0.74rem; cursor: pointer; transition: all 0.18s;
  }
  .ad-btn-reject:hover { background: #ffe0e0; }

  .ad-btn-ban {
    padding: 6px 14px; background: #fff2f2; border: 1.5px solid #f9c0c0;
    border-radius: 8px; color: #d63031;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700; font-size: 0.74rem; cursor: pointer; transition: all 0.18s;
  }
  .ad-btn-ban:hover { background: #ffe0e0; }

  .ad-empty      { padding: 56px 20px; text-align: center; color: #b0bdd8; font-size: 0.9rem; font-weight: 600; }
  .ad-empty-icon { font-size: 2.5rem; margin-bottom: 10px; display: block; }

  @media (max-width: 768px) {
    .ad-stats { grid-template-columns: repeat(2,1fr); }
    .ad-body  { padding: 20px 16px; }
    .ad-topbar{ padding: 12px 16px; }
  }
`
document.head.appendChild(style)

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [loggedIn, setLoggedIn]     = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPass, setAdminPass]   = useState("")
  const [loginError, setLoginError] = useState("")
  const [pendingKYC, setPendingKYC] = useState([])
  const [allUsers, setAllUsers]     = useState([])
  const [activeTab, setActiveTab]   = useState("kyc")
  const [message, setMessage]       = useState("")

  const loadData = async () => {
    try {
      const kycRes   = await getPendingKYC()
      const usersRes = await getAllUsers()
      setPendingKYC(kycRes.data)
      setAllUsers(usersRes.data)
    } catch {
      setMessage("Could not load data.")
    }
  }

  const handleAdminLogin = () => {
    if (adminEmail === "pinnawalagems@gmail.com" && adminPass === "admin2000") {
      setLoggedIn(true)
      loadData()
    } else {
      setLoginError("Wrong gmail or password!")
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

  const kycBadge = (status) => {
    const map = {
      approved:     { cls: "bdg-approved", icon: "✅", label: "Approved"     },
      rejected:     { cls: "bdg-rejected", icon: "❌", label: "Rejected"     },
      pending:      { cls: "bdg-pending",  icon: "⏳", label: "Pending"      },
      under_review: { cls: "bdg-pending",  icon: "🔍", label: "Under Review" },
      not_required: { cls: "bdg-nr",       icon: "—",  label: "N/A"          },
    }
    const b = map[status] || map["not_required"]
    return <span className={`ad-badge ${b.cls}`}>{b.icon} {b.label}</span>
  }

  const govBadge = (isVerified) => {
    if (isVerified) {
      return <span className="ad-badge bdg-approved">✅ Verified</span>
    }
    return <span className="ad-badge bdg-rejected">❌ Not Verified</span>
  }

  /* ══════════════ LOGIN PAGE ══════════════ */
  if (!loggedIn) return (
    <div className="ad-root">
      <div className="ad-login-wrap">
        <div className="ad-login-card">

          {/* NAV TABS */}
          <div className="ad-nav-tabs">
            {[
              { label: "👤 User",   path: "/",       key: "user"   },
              { label: "💎 Seller", path: "/seller", key: "seller" },
              { label: "🛡️ Admin",  path: "/admin",  key: "admin"  },
            ].map(({ label, path, key }) => {
              const currentPath = window.location.pathname
              const isActive = currentPath === path || (currentPath === "/admin" && key === "admin")
              return (
                <button key={key}
                  className={`ad-nav-tab ${isActive ? "active" : "inactive"}`}
                  onClick={() => navigate(path)}>
                  {label}
                </button>
              )
            })}
          </div>

          <div className="ad-login-icon">🛡️</div>
          <div className="ad-login-title">Admin Portal</div>
          <div className="ad-login-sub">Restricted — Authorized Personnel Only</div>

          <label className="ad-label">✉️ Admin Gmail</label>
          <input
            className="ad-input"
            type="text"
            placeholder="Enter admin gmail"
            autoComplete="off"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />

          <label className="ad-label">🔒 Password</label>
          <input
            className="ad-input"
            type="password"
            placeholder="Enter password"
            autoComplete="new-password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
          />

          <button className="ad-btn-primary" onClick={handleAdminLogin}>
            Access Dashboard →
          </button>

          {loginError && <div className="ad-err">⚠️ {loginError}</div>}

        </div>
      </div>
    </div>
  )

  /* ══════════════ DASHBOARD ══════════════ */
  return (
    <div className="ad-root">

      {/* TOP BAR */}
      <div className="ad-topbar">
        <div className="ad-topbar-left">
          <div className="ad-topbar-icon">🛡️</div>
          <div className="ad-topbar-title">Admin Dashboard</div>
          <span className="ad-topbar-badge">PINNAWALA GEMS</span>
        </div>
        <div className="ad-topbar-right">
          <button className="ad-topbar-navbtn" onClick={() => navigate("/")}>👤 User</button>
          <button className="ad-topbar-navbtn" onClick={() => navigate("/seller")}>💎 Seller</button>
          <button className="ad-logout-btn"
            onClick={() => { setLoggedIn(false); setMessage("") }}>
            🔓 Logout
          </button>
        </div>
      </div>

      <div className="ad-body">

        {/* STATS */}
        <div className="ad-stats">
          {[
            { icon: "👥", val: allUsers.length,                                  label: "Total Users",  color: "#3b6aff" },
            { icon: "💎", val: allUsers.filter(u => u.role === "seller").length, label: "Sellers",      color: "#0ea5e9" },
            { icon: "⏳", val: pendingKYC.length,                                label: "Pending KYC",  color: "#f59e0b" },
            { icon: "🚫", val: allUsers.filter(u => u.is_banned).length,         label: "Banned Users", color: "#d63031" },
          ].map(({ icon, val, label, color }) => (
            <div className="ad-stat-card" key={label}>
              <span className="ad-stat-icon">{icon}</span>
              <div className="ad-stat-val" style={{ color }}>{val}</div>
              <div className="ad-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* MESSAGE */}
        {message && <div className="ad-msg">✅ {message}</div>}

        {/* TABS */}
        <div className="ad-tab-bar">
          {[
            { key: "kyc",   label: "⏳ Pending KYC" },
            { key: "users", label: "👥 All Users"    },
          ].map(({ key, label }) => (
            <button key={key}
              className={`ad-tab-btn ${activeTab === key ? "tab-active" : "tab-inactive"}`}
              onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="ad-table-card">
          <div className="ad-table-header">
            <div className="ad-table-heading">
              {activeTab === "kyc" ? "KYC Applications" : "All Registered Users"}
            </div>
            <span className="ad-table-count">
              {activeTab === "kyc" ? pendingKYC.length : allUsers.length} records
            </span>
          </div>

          {/* KYC TAB */}
          {activeTab === "kyc" && (
            pendingKYC.length === 0
              ? <div className="ad-empty">
                  <span className="ad-empty-icon">✅</span>
                  No pending KYC applications right now.
                </div>
              : <table className="ad-table">
                  <thead>
                    <tr>
                      {['Name', 'Gmail', 'Shop', 'BRC', 'Verified'].map(h => (
                        <th key={h} className="ad-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingKYC.map((seller) => (
                      <tr key={seller.email} className="ad-tr">
                        <td className="ad-td"><strong>{seller.full_name}</strong></td>
                        <td className="ad-td">{seller.email}</td>
                        <td className="ad-td">{seller.shop_name || "—"}</td>
                        <td className="ad-td">{seller.nic_number || "—"}</td>
                        <td className="ad-td">{govBadge(seller.is_verified_seller)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            allUsers.length === 0
              ? <div className="ad-empty">
                  <span className="ad-empty-icon">👥</span>
                  No users registered yet.
                </div>
              : <table className="ad-table">
                  <thead>
                    <tr>
                      {["Name", "Gmail", "Role", "Verified", "KYC Status", "Banned", "Actions"].map(h => (
                        <th key={h} className="ad-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.email} className="ad-tr">
                        <td className="ad-td"><strong>{user.full_name}</strong></td>
                        <td className="ad-td">{user.email}</td>
                        <td className="ad-td">
                          <span className={`ad-badge ${user.role === "seller" ? "bdg-seller" : "bdg-buyer"}`}>
                            {user.role === "seller" ? "💎" : "👤"} {user.role}
                          </span>
                        </td>
                        <td className="ad-td">{govBadge(user.is_verified_seller)}</td>
                        <td className="ad-td">{kycBadge(user.kyc_status)}</td>
                        <td className="ad-td">
                          {user.is_banned
                            ? <span className="ad-badge bdg-banned">🚫 Banned</span>
                            : <span className="ad-badge bdg-active">✅ Active</span>}
                        </td>
                        <td className="ad-td">
                          {!user.is_banned && (
                            <button className="ad-btn-ban"
                              onClick={() => handleBan(user.email)}>
                              🚫 Ban
                            </button>
                          )}
                        </td>
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