import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser, loginUser } from "../services/api"

export default function UserAuth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("signin")
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    full_name: "", email: "", password: "", phone: "", role: "buyer",
  })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoginData({ email: "", password: "" })
    setRegisterData({ full_name: "", email: "", password: "", phone: "", role: "buyer" })
  }, [])

  const validateEmail = (email) => {
    return email.includes("@") && email.includes(".")
  }

  const formatPhone = (value) => {
    let digits = value.replace(/[^\d]/g, "")
    return "+" + digits
  }

  const handleLogin = async () => {
    setLoading(true)
    setMessage("")
    if (!validateEmail(loginData.email)) {
      setMessage("Please enter a valid email address with @ symbol!")
      setLoading(false)
      return
    }
    try {
      const res = await loginUser(loginData)
      localStorage.clear()
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("role", res.data.role)
      localStorage.setItem("name", res.data.name)
      setMessage("Login successful! Redirecting...")
      if (res.data.role === "admin") navigate("/admin")
      else navigate("/")
    } catch (err) {
      setMessage(err.response?.data?.detail || "Login failed!")
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    setLoading(true)
    setMessage("")
    if (!validateEmail(registerData.email)) {
      setMessage("Please enter a valid email address with @ symbol!")
      setLoading(false)
      return
    }
    if (registerData.phone.length < 10) {
      setMessage("Please enter a valid phone number!")
      setLoading(false)
      return
    }
    try {
      await registerUser(registerData)
      setMessage("Account created! Please sign in.")
      setMode("signin")
    } catch (err) {
      setMessage(err.response?.data?.detail || "Registration failed!")
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020818",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      padding: "40px 20px",
    }}>
      <div style={{
        background: "rgba(6,20,60,0.9)",
        border: "1px solid rgba(0,200,255,0.3)",
        borderRadius: "20px",
        padding: "40px",
        width: "90%",
        maxWidth: "600px",
        color: "#fff",
      }}>

        {/* TITLE */}
        <div style={{ textAlign: "center", marginBottom: "8px", fontSize: "1.4rem", fontFamily: "monospace", color: "#00c8ff", letterSpacing: "3px" }}>
          💎 PINNAWALA GEMS
        </div>
        <div style={{ textAlign: "center", color: "#4a6fa5", fontSize: "0.9rem", marginBottom: "28px" }}>
          AI-Powered Virtual Gemologist
        </div>

        {/* TOGGLE */}
        <div style={{ display: "flex", gap: "8px", background: "rgba(0,200,255,0.05)", padding: "6px", borderRadius: "10px", marginBottom: "28px" }}>
          <button onClick={() => setMode("signin")} style={{ flex: 1, padding: "10px", border: mode === "signin" ? "1px solid #00c8ff" : "none", borderRadius: "8px", background: mode === "signin" ? "rgba(0,200,255,0.15)" : "transparent", color: mode === "signin" ? "#00c8ff" : "#4a6fa5", fontFamily: "monospace", fontWeight: "bold", fontSize: "0.75rem", cursor: "pointer" }}>
            SIGN IN
          </button>
          <button onClick={() => setMode("signup")} style={{ flex: 1, padding: "10px", border: mode === "signup" ? "1px solid #00c8ff" : "none", borderRadius: "8px", background: mode === "signup" ? "rgba(0,200,255,0.15)" : "transparent", color: mode === "signup" ? "#00c8ff" : "#4a6fa5", fontFamily: "monospace", fontWeight: "bold", fontSize: "0.75rem", cursor: "pointer" }}>
            SIGN UP
          </button>
        </div>

        {/* SIGN IN FORM */}
        {mode === "signin" && (
          <div>
            <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", color: "#00c8ff", letterSpacing: "1.5px", marginBottom: "6px" }}>EMAIL ADDRESS</label>
            <input type="email" placeholder="your@email.com" autoComplete="off"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              style={{ width: "100%", background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: "8px", padding: "14px 18px", color: "#fff", fontSize: "1rem", marginBottom: "16px", outline: "none", boxSizing: "border-box" }} />

            <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", color: "#00c8ff", letterSpacing: "1.5px", marginBottom: "6px" }}>PASSWORD</label>
            <input type="password" placeholder="Enter your password" autoComplete="new-password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              style={{ width: "100%", background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: "8px", padding: "14px 18px", color: "#fff", fontSize: "1rem", marginBottom: "16px", outline: "none", boxSizing: "border-box" }} />

            <button onClick={handleLogin} disabled={loading}
              style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#00c8ff,#7b2fff)", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "monospace", fontWeight: "bold", letterSpacing: "2px", cursor: "pointer", fontSize: "0.9rem" }}>
              {loading ? "SIGNING IN..." : "SIGN IN →"}
            </button>
          </div>
        )}

        {/* SIGN UP FORM */}
        {mode === "signup" && (
          <div>
            <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", color: "#00c8ff", letterSpacing: "1.5px", marginBottom: "6px" }}>FULL NAME</label>
            <input type="text" placeholder="Your full name" autoComplete="off"
              value={registerData.full_name}
              onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
              style={{ width: "100%", background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: "8px", padding: "14px 18px", color: "#fff", fontSize: "1rem", marginBottom: "16px", outline: "none", boxSizing: "border-box" }} />

            <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", color: "#00c8ff", letterSpacing: "1.5px", marginBottom: "6px" }}>EMAIL ADDRESS</label>
            <input type="email" placeholder="your@email.com" autoComplete="off"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              style={{ width: "100%", background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: "8px", padding: "14px 18px", color: "#fff", fontSize: "1rem", marginBottom: "16px", outline: "none", boxSizing: "border-box" }} />

            <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", color: "#00c8ff", letterSpacing: "1.5px", marginBottom: "6px" }}>PHONE NUMBER</label>
            <input type="tel" placeholder="+94 77 000 0000" autoComplete="off"
              value={registerData.phone}
              onChange={(e) => setRegisterData({ ...registerData, phone: formatPhone(e.target.value) })}
              style={{ width: "100%", background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: "8px", padding: "14px 18px", color: "#fff", fontSize: "1rem", marginBottom: "16px", outline: "none", boxSizing: "border-box" }} />

            <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", color: "#00c8ff", letterSpacing: "1.5px", marginBottom: "6px" }}>REGISTER AS</label>
            <select value={registerData.role}
              onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
              style={{ width: "100%", background: "#060f2a", border: "1px solid rgba(0,200,255,0.2)", borderRadius: "8px", padding: "14px 18px", color: "#fff", fontSize: "1rem", marginBottom: "16px" }}>
              <option value="buyer">🛒 Buyer — Browse and purchase gems</option>
              <option value="seller">💎 Seller — List and sell gems</option>
            </select>

            <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", color: "#00c8ff", letterSpacing: "1.5px", marginBottom: "6px" }}>PASSWORD</label>
            <input type="password" placeholder="Min 8 characters" autoComplete="new-password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              style={{ width: "100%", background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: "8px", padding: "14px 18px", color: "#fff", fontSize: "1rem", marginBottom: "16px", outline: "none", boxSizing: "border-box" }} />

            <button onClick={handleRegister} disabled={loading}
              style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#00c8ff,#7b2fff)", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "monospace", fontWeight: "bold", letterSpacing: "2px", cursor: "pointer", fontSize: "0.9rem" }}>
              {loading ? "CREATING..." : "CREATE ACCOUNT →"}
            </button>
          </div>
        )}

        {/* MESSAGE */}
        {message && (
          <div style={{ textAlign: "center", marginTop: "14px", fontSize: "0.9rem", color: message.includes("success") || message.includes("created") || message.includes("Logged out") ? "#00ffb3" : "#ff4466" }}>
            {message}
          </div>
        )}

        {/* LOGOUT BUTTON */}
        {localStorage.getItem("token") && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button onClick={() => {
              localStorage.clear()
              setLoginData({ email: "", password: "" })
              setMessage("Logged out successfully!")
            }} style={{
              padding: "8px 20px",
              background: "transparent",
              border: "1px solid rgba(255,68,102,0.4)",
              borderRadius: "8px",
              color: "#ff4466",
              fontFamily: "monospace",
              fontSize: "0.7rem",
              cursor: "pointer",
              letterSpacing: "1px"
            }}>
              🔓 LOGOUT
            </button>
          </div>
        )}

        {/* SELLER LINK */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.85rem", color: "#4a6fa5" }}>
          Want to sell gems?{" "}
          <span onClick={() => navigate("/seller")} style={{ color: "#00c8ff", cursor: "pointer" }}>
            Register as Seller →
          </span>
        </div>

      </div>
    </div>
  )
}