import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser, loginUser } from "../services/api"

const style = document.createElement("style")
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

  .auth-root * { box-sizing: border-box; }

  .auth-root {
    min-height: 100vh;
    background: #f0f4ff;
    background-image:
      radial-gradient(ellipse 80% 60% at 20% -10%, rgba(99,134,255,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 110%, rgba(59,106,255,0.14) 0%, transparent 55%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .auth-card {
    background: #ffffff;
    border: 1px solid rgba(99,134,255,0.18);
    border-radius: 28px;
    padding: 48px 44px;
    width: 100%;
    max-width: 520px;
    box-shadow:
      0 4px 6px rgba(59,106,255,0.04),
      0 20px 60px rgba(59,106,255,0.12),
      0 1px 0 rgba(255,255,255,0.8) inset;
    position: relative;
    overflow: hidden;
  }

  .auth-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b6aff, #6384ff, #3b6aff);
    background-size: 200%;
    animation: shimmer 3s linear infinite;
  }

  @keyframes shimmer {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 0%; }
  }

  .auth-logo-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
    justify-content: center;
  }

  .auth-logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #3b6aff, #6384ff);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 14px rgba(59,106,255,0.3);
  }

  .auth-brand {
    font-family: 'Instrument Serif', serif;
    font-size: 1.55rem;
    font-weight: 400;
    color: #0f1c4d;
    letter-spacing: 0.5px;
  }

  .auth-tagline {
    text-align: center;
    font-size: 0.82rem;
    color: #8898cc;
    font-weight: 500;
    margin-bottom: 32px;
    letter-spacing: 0.3px;
  }

  .auth-tab-bar {
    display: flex;
    background: #f2f5ff;
    border-radius: 14px;
    padding: 5px;
    margin-bottom: 32px;
    gap: 4px;
  }

  .auth-tab {
    flex: 1;
    padding: 11px 0;
    border: none;
    border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.8px;
    cursor: pointer;
    transition: all 0.22s ease;
  }

  .auth-tab.active {
    background: #ffffff;
    color: #3b6aff;
    box-shadow: 0 2px 12px rgba(59,106,255,0.15);
  }

  .auth-tab.inactive {
    background: transparent;
    color: #a0aec8;
  }

  .auth-tab.inactive:hover {
    color: #3b6aff;
  }

  .auth-field {
    margin-bottom: 18px;
  }

  .auth-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #5668a0;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    margin-bottom: 7px;
  }

  .auth-label-icon {
    font-size: 13px;
  }

  .auth-input {
    width: 100%;
    background: #f7f9ff;
    border: 1.5px solid #e3e9ff;
    border-radius: 12px;
    padding: 13px 16px;
    color: #0f1c4d;
    font-size: 0.95rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500;
    outline: none;
    transition: all 0.2s ease;
  }

  .auth-input:focus {
    border-color: #3b6aff;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(59,106,255,0.1);
  }

  .auth-input::placeholder {
    color: #b8c4e0;
    font-weight: 400;
  }

  .auth-select {
    width: 100%;
    background: #f7f9ff;
    border: 1.5px solid #e3e9ff;
    border-radius: 12px;
    padding: 13px 16px;
    color: #0f1c4d;
    font-size: 0.95rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .auth-select:focus {
    border-color: #3b6aff;
    box-shadow: 0 0 0 4px rgba(59,106,255,0.1);
  }

  .auth-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #3b6aff 0%, #5580ff 100%);
    border: none;
    border-radius: 14px;
    color: #ffffff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.22s ease;
    box-shadow: 0 4px 18px rgba(59,106,255,0.35);
    margin-top: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .auth-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(59,106,255,0.45);
  }

  .auth-btn:active {
    transform: translateY(0px);
  }

  .auth-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .auth-msg {
    text-align: center;
    margin-top: 14px;
    font-size: 0.88rem;
    font-weight: 600;
    padding: 10px 14px;
    border-radius: 10px;
  }

  .auth-msg.success {
    background: #edfaf3;
    color: #1a8a4a;
    border: 1px solid #b6e8d0;
  }

  .auth-msg.error {
    background: #fff2f2;
    color: #d63031;
    border: 1px solid #f9c0c0;
  }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 22px 0;
  }

  .auth-divider-line {
    flex: 1;
    height: 1px;
    background: #e8edfc;
  }

  .auth-divider-text {
    font-size: 0.75rem;
    color: #b0bdd8;
    font-weight: 600;
  }

  .auth-seller-link {
    text-align: center;
    font-size: 0.85rem;
    color: #8898cc;
    font-weight: 500;
  }

  .auth-seller-link span {
    color: #3b6aff;
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .auth-seller-link span:hover {
    color: #2456e0;
  }

  .auth-logout-btn {
    display: block;
    margin: 12px auto 0;
    padding: 8px 22px;
    background: transparent;
    border: 1.5px solid #f9c0c0;
    border-radius: 10px;
    color: #d63031;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .auth-logout-btn:hover {
    background: #fff2f2;
  }

  .auth-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  @media (max-width: 480px) {
    .auth-card { padding: 32px 22px; }
    .auth-grid-2 { grid-template-columns: 1fr; }
  }
`
document.head.appendChild(style)

export default function UserAuth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("signin")
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    full_name: "", email: "", password: "", phone: "", role: "buyer",
  })
  const [message, setMessage] = useState("")
  const [msgType, setMsgType] = useState("error")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoginData({ email: "", password: "" })
    setRegisterData({ full_name: "", email: "", password: "", phone: "", role: "buyer" })
    setMessage("")
  }, [mode])

  const validateEmail = (email) => /^[^@]+@gmail\.com$/.test(email)

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters."
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter."
    if (!/[0-9]/.test(password)) return "Password must include at least one number."
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must include at least one special character."
    return null
  }

  // Strips non-digits, counts digits only, enforces max 11 digits after '+'
  const formatPhone = (value) => {
    const digits = value.replace(/[^\d]/g, "")
    return "+" + digits.slice(0, 11)
  }

  const showMsg = (text, type = "error") => { setMessage(text); setMsgType(type) }

  const handleLogin = async () => {
    setLoading(true); setMessage("")
    if (!validateEmail(loginData.email)) {
      showMsg("Please include an '@gmail.com' in the gmail address")
      setLoading(false); return
    }
    try {
      const res = await loginUser(loginData)
      localStorage.clear()
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("role", res.data.role)
      localStorage.setItem("name", res.data.name)
      showMsg("Login successful! Redirecting…", "success")
      setTimeout(() => {
        if (res.data.role === "admin") navigate("/admin")
        else navigate("/")
      }, 800)
    } catch (err) {
      showMsg(err.response?.data?.detail || "Login failed. Please try again.")
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    setLoading(true); setMessage("")
    if (!validateEmail(registerData.email)) {
      showMsg("Please include an '@gmail.com' in the gmail address")
      setLoading(false); return
    }
    // Require exactly 12 characters total: '+' + 11 digits
    if (registerData.phone.length < 12) {
      showMsg("Please enter a valid phone number (e.g. +94771234567 — 12 characters).")
      setLoading(false); return
    }
    const passwordError = validatePassword(registerData.password)
    if (passwordError) {
      showMsg(passwordError)
      setLoading(false); return
    }
    try {
      await registerUser(registerData)
      showMsg("Account created! Please sign in.", "success")
      setTimeout(() => setMode("signin"), 1200)
    } catch (err) {
      showMsg(err.response?.data?.detail || "Registration failed.")
    }
    setLoading(false)
  }

  return (
    <div className="auth-root">
      <div className="auth-card">

        {/* TOP NAV TABS */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", borderBottom: "1.5px solid #e3e9ff", paddingBottom: "16px" }}>
          {[
            { label: "👤 User",   path: "/",       role: "buyer"  },
            { label: "💎 Seller", path: "/seller", role: "seller" },
            { label: "🛡️ Admin",  path: "/admin",  role: "admin"  },
          ].map(({ label, path, role }) => {
            const currentPath = window.location.pathname
            const isActive = currentPath === path || (currentPath === "/" && role === "buyer")
            return (
              <button key={role} onClick={() => navigate(path)} style={{
                flex: 1,
                padding: "9px 0",
                border: isActive ? "2px solid #3b6aff" : "1.5px solid #dde4f8",
                borderRadius: "10px",
                background: isActive ? "#edf2ff" : "transparent",
                color: isActive ? "#3b6aff" : "#8898cc",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.3px",
              }}>
                {label}
              </button>
            )
          })}
        </div>

        {/* LOGO */}
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon">💎</div>
          <div className="auth-brand">Pinnawala Gems</div>
        </div>
        <div className="auth-tagline">AI-Powered Virtual Gemologist Platform</div>

        {/* TABS */}
        <div className="auth-tab-bar">
          <button className={`auth-tab ${mode === "signin" ? "active" : "inactive"}`}
            onClick={() => setMode("signin")}>
            SIGN IN
          </button>
          <button className={`auth-tab ${mode === "signup" ? "active" : "inactive"}`}
            onClick={() => setMode("signup")}>
            SIGN UP
          </button>
        </div>

        {/* SIGN IN */}
        {mode === "signin" && (
          <div>
            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">✉️</span> Gmail Address
              </label>
              <input
                className="auth-input"
                type="text"
                placeholder="your@gmail.com"
                autoComplete="off"
                value={loginData.email}
                pattern="[^@]+@gmail\.com"
                title="Please include a '@gmail.com' in the gmail address"
                required
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">🔒</span> Password
              </label>
              <input
                className="auth-input"
                type="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>

            <button className="auth-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "⏳ Signing in…" : <>Sign In <span>→</span></>}
            </button>
          </div>
        )}

        {/* SIGN UP */}
        {mode === "signup" && (
          <div>
            <div className="auth-grid-2">
              <div className="auth-field">
                <label className="auth-label">
                  <span className="auth-label-icon">👤</span> Full Name
                </label>
                <input className="auth-input" type="text" placeholder="Your full name"
                  autoComplete="off" value={registerData.full_name}
                  onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })} />
              </div>
              <div className="auth-field">
                <label className="auth-label">
                  <span className="auth-label-icon">📱</span> Phone Number
                </label>
                <input
                  className="auth-input"
                  type="tel"
                  placeholder="+94771234567"
                  autoComplete="off"
                  value={registerData.phone}
                  maxLength={12}
                  onKeyPress={(e) => { if (!/[0-9+]/.test(e.key)) e.preventDefault() }}
                  onChange={(e) => setRegisterData({ ...registerData, phone: formatPhone(e.target.value) })}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">✉️</span> Gmail Address
              </label>
              <input
                className="auth-input"
                type="text"
                placeholder="your@gmail.com"
                autoComplete="off"
                value={registerData.email}
                pattern="[^@]+@gmail\.com"
                title="Please include a '@gmail.com' in the gmail address"
                required
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">🎭</span> Register As
              </label>
              <select className="auth-select" value={registerData.role}
                onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}>
                <option value="buyer">🛒 Buyer — Browse & purchase gems</option>
                <option value="seller">💎 Seller — List & sell gems</option>
              </select>
            </div>

            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">🔒</span> Password
              </label>
              <input
                className="auth-input"
                type="password"
                placeholder="Min 8 chars, uppercase, number, special char"
                autoComplete="new-password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>

            <button className="auth-btn" onClick={handleRegister} disabled={loading}>
              {loading ? "⏳ Creating account…" : <>Create Account <span>→</span></>}
            </button>
          </div>
        )}

        {/* MESSAGE */}
        {message && (
          <div className={`auth-msg ${msgType}`}>
            {msgType === "success" ? "✅ " : "⚠️ "}{message}
          </div>
        )}

        {/* LOGOUT */}
        {localStorage.getItem("token") && (
          <button className="auth-logout-btn" onClick={() => {
            localStorage.clear()
            setLoginData({ email: "", password: "" })
            showMsg("Logged out successfully.", "success")
          }}>
            🔓 Logout
          </button>
        )}

        {/* SELLER LINK */}
        <div className="auth-divider">
          <div className="auth-divider-line" />
          <div className="auth-divider-text">NEW SELLER?</div>
          <div className="auth-divider-line" />
        </div>
        <div className="auth-seller-link">
          Want to sell gems?{" "}
          <span onClick={() => navigate("/seller")}>Register as Verified Seller →</span>
        </div>

      </div>
    </div>
  )
}