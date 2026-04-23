import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser, uploadKYC } from "../services/api"

const style = document.createElement("style")
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

  .sr-root * { box-sizing: border-box; }

  .sr-root {
    min-height: 100vh;
    background: #f0f4ff;
    background-image:
      radial-gradient(ellipse 80% 50% at 10% -5%,  rgba(99,134,255,0.16) 0%, transparent 55%),
      radial-gradient(ellipse 50% 60% at 90% 110%, rgba(59,106,255,0.12) 0%, transparent 55%);
    padding: 48px 20px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .sr-inner {
    max-width: 680px;
    margin: 0 auto;
  }

  /* ── Header ── */
  .sr-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 10px;
  }

  .sr-header-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #3b6aff, #6384ff);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 4px 18px rgba(59,106,255,0.3);
    flex-shrink: 0;
  }

  .sr-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.9rem;
    color: #0f1c4d;
    line-height: 1.1;
  }

  .sr-subtitle {
    font-size: 0.85rem;
    color: #8898cc;
    font-weight: 500;
    margin-bottom: 34px;
    padding-left: 64px;
  }

  /* ── Progress Bar ── */
  .sr-progress {
    background: #ffffff;
    border: 1px solid rgba(99,134,255,0.18);
    border-radius: 20px;
    padding: 20px 28px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 20px rgba(59,106,255,0.08);
  }

  .sr-step-wrap {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .sr-step-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.85rem;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .sr-step-circle.done {
    background: linear-gradient(135deg, #3b6aff, #5580ff);
    color: #fff;
    box-shadow: 0 4px 12px rgba(59,106,255,0.35);
  }

  .sr-step-circle.active {
    background: #ffffff;
    color: #3b6aff;
    border: 2.5px solid #3b6aff;
    box-shadow: 0 0 0 5px rgba(59,106,255,0.12);
  }

  .sr-step-circle.pending {
    background: #f0f4ff;
    color: #b0bdd8;
    border: 2px solid #dde4f8;
  }

  .sr-step-label {
    margin-left: 8px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.4px;
    white-space: nowrap;
  }

  .sr-step-label.active-lbl  { color: #3b6aff; }
  .sr-step-label.done-lbl    { color: #5580ff; }
  .sr-step-label.pending-lbl { color: #c4cde6; }

  .sr-step-line {
    flex: 1;
    height: 2px;
    margin: 0 10px;
    background: #dde4f8;
    border-radius: 2px;
    overflow: hidden;
  }

  .sr-step-line-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b6aff, #6384ff);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  /* ── Card ── */
  .sr-card {
    background: #ffffff;
    border: 1px solid rgba(99,134,255,0.15);
    border-radius: 24px;
    padding: 40px;
    box-shadow:
      0 4px 6px rgba(59,106,255,0.04),
      0 20px 60px rgba(59,106,255,0.1);
    position: relative;
    overflow: hidden;
  }

  .sr-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b6aff, #6384ff, #3b6aff);
    background-size: 200%;
    animation: srshimmer 3s linear infinite;
  }

  @keyframes srshimmer {
    0%   { background-position: 0% 0%; }
    100% { background-position: 200% 0%; }
  }

  .sr-step-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.45rem;
    color: #0f1c4d;
    margin-bottom: 4px;
  }

  .sr-step-desc {
    font-size: 0.83rem;
    color: #8898cc;
    font-weight: 500;
    margin-bottom: 28px;
  }

  .sr-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.71rem;
    font-weight: 700;
    color: #5668a0;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    margin-bottom: 7px;
  }

  .sr-input {
    width: 100%;
    background: #f7f9ff;
    border: 1.5px solid #e3e9ff;
    border-radius: 12px;
    padding: 12px 16px;
    color: #0f1c4d;
    font-size: 0.93rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500;
    outline: none;
    transition: all 0.2s ease;
    margin-bottom: 18px;
  }

  .sr-input:focus {
    border-color: #3b6aff;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(59,106,255,0.1);
  }

  .sr-input::placeholder { color: #b8c4e0; font-weight: 400; }

  .sr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  /* Upload zone */
  .sr-upload-zone {
    border: 2px dashed #c2d0f8;
    border-radius: 16px;
    padding: 28px;
    text-align: center;
    background: #f8faff;
    margin-bottom: 18px;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .sr-upload-zone:hover {
    border-color: #3b6aff;
    background: #edf2ff;
  }

  .sr-upload-icon {
    font-size: 2.4rem;
    margin-bottom: 8px;
    display: block;
  }

  .sr-upload-title {
    font-weight: 700;
    color: #0f1c4d;
    font-size: 0.9rem;
    margin-bottom: 4px;
  }

  .sr-upload-sub {
    font-size: 0.78rem;
    color: #8898cc;
    margin-bottom: 12px;
  }

  .sr-upload-ok {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #edfaf3;
    border: 1px solid #b6e8d0;
    border-radius: 8px;
    padding: 6px 12px;
    color: #1a8a4a;
    font-size: 0.8rem;
    font-weight: 700;
    margin-top: 8px;
  }

  /* Gem chips */
  .sr-gems-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
  }

  .sr-gem-chip {
    padding: 9px 18px;
    border-radius: 50px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.83rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
    border: 1.5px solid #dde4f8;
    background: transparent;
    color: #8898cc;
  }

  .sr-gem-chip.selected {
    border-color: #3b6aff;
    background: #edf2ff;
    color: #3b6aff;
    box-shadow: 0 2px 8px rgba(59,106,255,0.18);
  }

  .sr-gem-chip:hover:not(.selected) {
    border-color: #3b6aff;
    color: #3b6aff;
  }

  /* Review rows */
  .sr-review-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;
    border-bottom: 1px solid #f0f4ff;
  }

  .sr-review-key {
    font-size: 0.75rem;
    font-weight: 700;
    color: #8898cc;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .sr-review-val {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0f1c4d;
  }

  /* Buttons */
  .sr-btn-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 28px;
  }

  .sr-btn-next {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 28px;
    background: linear-gradient(135deg, #3b6aff 0%, #5580ff 100%);
    border: none;
    border-radius: 14px;
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.3px;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(59,106,255,0.35);
    transition: all 0.22s ease;
  }

  .sr-btn-next:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,106,255,0.45); }
  .sr-btn-next:active { transform: translateY(0); }
  .sr-btn-next:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .sr-btn-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 13px 22px;
    background: transparent;
    border: 1.5px solid #dde4f8;
    border-radius: 14px;
    color: #8898cc;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sr-btn-back:hover { border-color: #3b6aff; color: #3b6aff; }

  /* Success screen */
  .sr-success {
    min-height: 100vh;
    background: #f0f4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .sr-success-card {
    background: #fff;
    border-radius: 28px;
    padding: 60px 48px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(59,106,255,0.14);
    max-width: 440px;
    width: 90%;
  }

  .sr-success-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #3b6aff, #6384ff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    margin: 0 auto 24px;
    box-shadow: 0 8px 28px rgba(59,106,255,0.3);
  }

  .sr-error-msg {
    text-align: center;
    background: #fff2f2;
    border: 1px solid #f9c0c0;
    color: #d63031;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 0.88rem;
    font-weight: 600;
    margin-bottom: 14px;
  }

  @media (max-width: 500px) {
    .sr-card { padding: 28px 20px; }
    .sr-grid-2 { grid-template-columns: 1fr; }
    .sr-progress { padding: 16px 14px; }
    .sr-step-label { display: none; }
  }
`
document.head.appendChild(style)

const STEPS = ["Personal", "KYC Docs", "Business", "Review"]
const GEM_OPTIONS = ["Blue Sapphire", "Ruby", "Emerald", "Cat's Eye", "Alexandrite", "Topaz", "Amethyst", "Other"]

export default function SellerRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const [personal, setPersonal] = useState({
    full_name: "", email: "", phone: "", password: "", nic_number: "", district: "",
  })
  const [nicFront, setNicFront] = useState(null)
  const [nicBack, setNicBack] = useState(null)
  const [ngjaLicense, setNgjaLicense] = useState(null)
  const [business, setBusiness] = useState({
    shop_name: "", years_in_business: "", business_description: "", gem_types: [],
  })

  const toggleGem = (gem) => {
    setBusiness((prev) => ({
      ...prev,
      gem_types: prev.gem_types.includes(gem)
        ? prev.gem_types.filter((g) => g !== gem)
        : [...prev.gem_types, gem],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true); setMessage("")
    try {
      await registerUser({
        full_name: personal.full_name, email: personal.email,
        password: personal.password, phone: personal.phone, role: "seller",
      })
      const form = new FormData()
      form.append("email", personal.email)
      form.append("nic_number", personal.nic_number)
      form.append("shop_name", business.shop_name)
      form.append("nic_front", nicFront)
      form.append("ngja_license", ngjaLicense)
      await uploadKYC(form)
      setStep(5)
    } catch (err) {
      setMessage(err.response?.data?.detail || "Submission failed. Please try again.")
    }
    setLoading(false)
  }

  /* ── Success Screen ── */
  if (step === 5) return (
    <div className="sr-success">
      <div className="sr-success-card">
        <div className="sr-success-icon">✅</div>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.8rem", color: "#0f1c4d", marginBottom: "10px" }}>
          Application Submitted!
        </div>
        <div style={{ fontSize: "0.9rem", color: "#8898cc", fontWeight: "500", marginBottom: "32px", lineHeight: 1.6 }}>
          Thank you for registering as a seller on Pinnawala Gems.<br/>
          Our admin team will review your KYC documents within <strong style={{ color: "#3b6aff" }}>48 hours</strong>.
        </div>
        <button className="sr-btn-next" style={{ margin: "0 auto" }} onClick={() => navigate("/")}>
          Back to Sign In →
        </button>
      </div>
    </div>
  )

  return (
    <div className="sr-root">
      <div className="sr-inner">

        {/* TOP NAV TABS */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
          {[
            { label: "👤 User",   path: "/",       role: "buyer"  },
            { label: "💎 Seller", path: "/seller", role: "seller" },
            { label: "🛡️ Admin",  path: "/admin",  role: "admin"  },
          ].map(({ label, path, role }) => {
            const isActive = role === "seller"
            return (
              <button key={role} onClick={() => navigate(path)} style={{
                flex: 1,
                padding: "9px 0",
                border: isActive ? "2px solid #3b6aff" : "1.5px solid #dde4f8",
                borderRadius: "10px",
                background: isActive ? "#edf2ff" : "#ffffff",
                color: isActive ? "#3b6aff" : "#8898cc",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.3px",
                boxShadow: isActive ? "0 2px 10px rgba(59,106,255,0.15)" : "none",
              }}>
                {label}
              </button>
            )
          })}
        </div>

        {/* HEADER */}
        <div className="sr-header">
          <div className="sr-header-icon">💎</div>
          <div>
            <div className="sr-title">Seller Registration</div>
          </div>
        </div>
        <div className="sr-subtitle">Complete all 4 steps to become a verified gem seller on Pinnawala</div>

        {/* PROGRESS */}
        <div className="sr-progress">
          {STEPS.map((label, i) => {
            const s = i + 1
            const isDone    = step > s
            const isActive  = step === s
            const isPending = step < s
            return (
              <div className="sr-step-wrap" key={i}>
                <div className={`sr-step-circle ${isDone ? "done" : isActive ? "active" : "pending"}`}>
                  {isDone ? "✓" : s}
                </div>
                <span className={`sr-step-label ${isDone ? "done-lbl" : isActive ? "active-lbl" : "pending-lbl"}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="sr-step-line">
                    <div className="sr-step-line-fill" style={{ width: isDone ? "100%" : "0%" }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CARD */}
        <div className="sr-card">

          {/* STEP 1 — Personal */}
          {step === 1 && (
            <div>
              <div className="sr-step-title">Personal Details</div>
              <div className="sr-step-desc">Your basic identification information as it appears on your NIC</div>

              <div className="sr-grid-2">
                <div>
                  <label className="sr-label">👤 Full Name</label>
                  <input className="sr-input" placeholder="Your legal full name"
                    autoComplete="off" value={personal.full_name}
                    onChange={(e) => setPersonal({ ...personal, full_name: e.target.value })} />
                </div>
                <div>
                  <label className="sr-label">🪪 NIC Number</label>
                  <input className="sr-input" placeholder="e.g. 200012345678"
                    autoComplete="off" value={personal.nic_number}
                    onChange={(e) => setPersonal({ ...personal, nic_number: e.target.value })} />
                </div>
                <div>
                  <label className="sr-label">✉️ Email Address</label>
                  <input className="sr-input" type="email" placeholder="seller@email.com"
                    autoComplete="off" value={personal.email}
                    onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
                </div>
                <div>
                  <label className="sr-label">📱 Phone Number</label>
                  <input className="sr-input" placeholder="+94 77 000 0000"
                    autoComplete="off" value={personal.phone}
                    onKeyPress={(e) => { if (!/[0-9+]/.test(e.key)) e.preventDefault() }}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value.replace(/[^0-9+]/g, "") })} />
                </div>
                <div>
                  <label className="sr-label">📍 District</label>
                  <select className="sr-input" style={{ cursor: "pointer" }} value={personal.district}
                    onChange={(e) => setPersonal({ ...personal, district: e.target.value })}>
                    <option value="">Select district…</option>
                    {["Ratnapura","Colombo","Kandy","Galle","Matara","Kurunegala","Other"].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="sr-label">🔒 Password</label>
                  <input className="sr-input" type="password" placeholder="Minimum 8 characters"
                    autoComplete="new-password" value={personal.password}
                    onChange={(e) => setPersonal({ ...personal, password: e.target.value })} />
                </div>
              </div>

              <div className="sr-btn-row">
                <div />
                <button className="sr-btn-next" onClick={() => setStep(2)}>
                  Next: KYC Documents →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — KYC */}
          {step === 2 && (
            <div>
              <div className="sr-step-title">KYC Documents</div>
              <div className="sr-step-desc">Upload clear copies — accepted formats: JPG, PNG, PDF</div>

              <label className="sr-label">🪪 NIC Front Side</label>
              <div className="sr-upload-zone">
                <span className="sr-upload-icon">🪪</span>
                <div className="sr-upload-title">Upload NIC Front</div>
                <div className="sr-upload-sub">Click to browse or drag & drop your file here</div>
                <input type="file" accept=".jpg,.png,.pdf"
                  onChange={(e) => setNicFront(e.target.files[0])}
                  style={{ fontSize: "0.82rem", color: "#3b6aff" }} />
                {nicFront && (
                  <div className="sr-upload-ok">✅ {nicFront.name}</div>
                )}
              </div>

              <label className="sr-label">🪪 NIC Back Side</label>
              <div className="sr-upload-zone">
                <span className="sr-upload-icon">🪪</span>
                <div className="sr-upload-title">Upload NIC Back</div>
                <div className="sr-upload-sub">Click to browse or drag & drop your file here</div>
                <input type="file" accept=".jpg,.png,.pdf"
                  onChange={(e) => setNicBack(e.target.files[0])}
                  style={{ fontSize: "0.82rem", color: "#3b6aff" }} />
                {nicBack && (
                  <div className="sr-upload-ok">✅ {nicBack.name}</div>
                )}
              </div>

              <label className="sr-label">📋 NGJA License</label>
              <div className="sr-upload-zone">
                <span className="sr-upload-icon">📋</span>
                <div className="sr-upload-title">Upload NGJA License</div>
                <div className="sr-upload-sub">National Gem & Jewellery Authority license — required for sellers</div>
                <input type="file" accept=".jpg,.png,.pdf"
                  onChange={(e) => setNgjaLicense(e.target.files[0])}
                  style={{ fontSize: "0.82rem", color: "#3b6aff" }} />
                {ngjaLicense && (
                  <div className="sr-upload-ok">✅ {ngjaLicense.name}</div>
                )}
              </div>

              <div className="sr-btn-row">
                <button className="sr-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="sr-btn-next" onClick={() => setStep(3)}>
                  Next: Business Info →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Business */}
          {step === 3 && (
            <div>
              <div className="sr-step-title">Business Information</div>
              <div className="sr-step-desc">Tell us about your gemstone business and what you specialise in</div>

              <div className="sr-grid-2">
                <div>
                  <label className="sr-label">🏪 Shop Name</label>
                  <input className="sr-input" placeholder="e.g. Ratna Gems Palace"
                    autoComplete="off" value={business.shop_name}
                    onChange={(e) => setBusiness({ ...business, shop_name: e.target.value })} />
                </div>
                <div>
                  <label className="sr-label">📅 Years in Business</label>
                  <select className="sr-input" style={{ cursor: "pointer" }}
                    value={business.years_in_business}
                    onChange={(e) => setBusiness({ ...business, years_in_business: e.target.value })}>
                    <option value="">Select range…</option>
                    {["Less than 1 year","1–3 years","3–5 years","5–10 years","10+ years"].map(y => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="sr-label">💎 Gem Types You Sell</label>
              <div className="sr-gems-wrap">
                {GEM_OPTIONS.map((gem, i) => (
                  <button key={gem + i} className={`sr-gem-chip ${business.gem_types.includes(gem) ? "selected" : ""}`}
                    onClick={() => toggleGem(gem)}>
                    {gem}
                  </button>
                ))}
              </div>

              <label className="sr-label">📝 Business Description</label>
              <textarea className="sr-input" rows={3}
                placeholder="Briefly describe your business, your expertise and the gems you specialise in…"
                autoComplete="off" value={business.business_description}
                onChange={(e) => setBusiness({ ...business, business_description: e.target.value })} />

              <div className="sr-btn-row">
                <button className="sr-btn-back" onClick={() => setStep(2)}>← Back</button>
                <button className="sr-btn-next" onClick={() => setStep(4)}>Next: Review →</button>
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {step === 4 && (
            <div>
              <div className="sr-step-title">Review & Submit</div>
              <div className="sr-step-desc">Double-check your information before final submission</div>

              <div style={{ background: "#f8faff", border: "1px solid #e3e9ff", borderRadius: "16px", padding: "8px 20px", marginBottom: "20px" }}>
                {[
                  ["👤 Full Name",    personal.full_name],
                  ["✉️ Email",        personal.email],
                  ["📱 Phone",        personal.phone],
                  ["🪪 NIC Number",   personal.nic_number],
                  ["📍 District",     personal.district],
                  ["🏪 Shop Name",    business.shop_name],
                  ["📅 Experience",   business.years_in_business],
                  ["🪪 NIC Front",    nicFront   ? "✅ " + nicFront.name   : "❌ Not uploaded"],
                  ["🪪 NIC Back",     nicBack    ? "✅ " + nicBack.name    : "❌ Not uploaded"],
                  ["📋 NGJA License", ngjaLicense ? "✅ " + ngjaLicense.name : "❌ Not uploaded"],
                  ["💎 Gem Types",    business.gem_types.join(", ") || "None selected"],
                ].map(([key, val]) => (
                  <div className="sr-review-row" key={key}>
                    <span className="sr-review-key">{key}</span>
                    <span className="sr-review-val">{val}</span>
                  </div>
                ))}
              </div>

              {message && <div className="sr-error-msg">⚠️ {message}</div>}

              <div className="sr-btn-row">
                <button className="sr-btn-back" onClick={() => setStep(3)}>← Back</button>
                <button className="sr-btn-next" onClick={handleSubmit} disabled={loading}>
                  {loading ? "⏳ Submitting…" : "✅ Submit Application"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}