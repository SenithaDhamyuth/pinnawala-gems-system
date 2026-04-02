import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Gem } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import { DEMO_CREDENTIALS } from "../utils/constants";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/inventory/admin" : "/inventory/seller", { replace: true });
    }
  }, [user, navigate]);

  const fill = (credential) => setForm({ email: credential.email, password: credential.password });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please enter your demo credentials");
      return;
    }

    setLoading(true);

    try {
      const loggedInUser = await login(form.email, form.password);
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      navigate(loggedInUser.role === "admin" ? "/inventory/admin" : "/inventory/seller");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inv-login-page">
      <div className="inv-login-card">
        <div className="inv-login-logo">
          <div className="inv-login-logo-icon">
            <Gem size={26} />
          </div>
          <div className="inv-login-logo-text">
            <h1>Pinnawala Gems</h1>
            <p>Inventory Management System</p>
          </div>
        </div>

        <h2 className="inv-login-title">Sign In</h2>
        <p className="inv-login-sub">Use the demo Admin or Seller account to access this module.</p>

        <div className="inv-demo-box">
          <h4>Demo Credentials</h4>
          <div className="inv-demo-creds">
            {DEMO_CREDENTIALS.map((credential) => (
              <div className="inv-demo-cred-row" key={credential.role}>
                <div>
                  <div className="inv-demo-cred-label">{credential.role}</div>
                  <div className="inv-demo-cred-info">
                    {credential.email} | {credential.password}
                  </div>
                </div>
                <button className="inv-demo-fill-btn" onClick={() => fill(credential)}>
                  Use
                </button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="inv-field">
            <label className="inv-label inv-label-req">Email Address</label>
            <input
              className="inv-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
            />
          </div>

          <div className="inv-field">
            <label className="inv-label inv-label-req">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="inv-input"
                type={showPw ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((previous) => !previous)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            className="inv-btn inv-btn-primary"
            type="submit"
            disabled={loading}
            style={{ justifyContent: "center", padding: "12px", fontSize: 15, marginTop: 4 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
