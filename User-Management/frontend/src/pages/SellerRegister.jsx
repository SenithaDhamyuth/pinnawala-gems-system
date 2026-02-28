import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser, uploadKYC } from "../services/api"

export default function SellerRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const [personal, setPersonal] = useState({
    full_name: "", email: "", phone: "", password: "", nic_number: "", district: "",
  })
  const [nicFront, setNicFront] = useState(null)
  const [ngjaLicense, setNgjaLicense] = useState(null)
  const [business, setBusiness] = useState({
    shop_name: "", years_in_business: "", business_description: "", gem_types: [],
  })

  const gemOptions = ["Blue Sapphire", "Ruby", "Emerald", "Cat's Eye", "Alexandrite", "Other"]

  const toggleGem = (gem) => {
    setBusiness((prev) => ({
      ...prev,
      gem_types: prev.gem_types.includes(gem)
        ? prev.gem_types.filter((g) => g !== gem)
        : [...prev.gem_types, gem],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage("")
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
      setMessage(err.response?.data?.detail || "Submission failed. Try again.")
    }
    setLoading(false)
  }

  const inputStyle = { width: "100%", background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: "8px", padding: "11px 14px", color: "#fff", fontSize: "1rem", marginBottom: "16px", outline: "none", boxSizing: "border-box" }
  const labelStyle = { display: "block", fontFamily: "monospace", fontSize: "0.6rem", color: "#00c8ff", letterSpacing: "1.5px", marginBottom: "6px", textTransform: "uppercase" }
  const btnNext = { padding: "11px 28px", background: "linear-gradient(135deg,#00c8ff,#7b2fff)", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "monospace", fontWeight: "bold", fontSize: "0.7rem", letterSpacing: "1px", cursor: "pointer" }
  const btnBack = { padding: "11px 24px", background: "transparent", border: "1px solid rgba(0,200,255,0.2)", borderRadius: "8px", color: "#4a6fa5", fontFamily: "monospace", fontSize: "0.7rem", cursor: "pointer" }

  if (step === 5) return (
    <div style={{ minHeight: "100vh", background: "#020818", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>✅</div>
        <div style={{ fontFamily: "monospace", fontSize: "1.3rem", color: "#00ffb3", letterSpacing: "2px" }}>APPLICATION SUBMITTED!</div>
        <div style={{ color: "#4a6fa5", margin: "10px 0 30px" }}>Admin will review your KYC within 48 hours.</div>
        <button style={btnNext} onClick={() => navigate("/")}>GO TO SIGN IN →</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#020818", padding: "40px 20px", fontFamily: "sans-serif", color: "#fff" }}>
      <div style={{ maxWidth: "650px", margin: "0 auto" }}>

        <div style={{ fontFamily: "monospace", fontSize: "1.3rem", color: "#00ffb3", letterSpacing: "3px", marginBottom: "6px" }}>💎 SELLER REGISTRATION</div>
        <div style={{ color: "#4a6fa5", fontSize: "0.9rem", marginBottom: "30px" }}>Complete all 4 steps to become a verified seller</div>

        {/* PROGRESS */}
        <div style={{ display: "flex", alignItems: "center", background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.15)", borderRadius: "12px", padding: "16px 24px", marginBottom: "28px", gap: "8px" }}>
          {["Personal", "KYC Docs", "Business", "Review"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: step === i+1 ? "2px solid #00c8ff" : step > i+1 ? "none" : "2px solid #1a3060", background: step > i+1 ? "linear-gradient(135deg,#00c8ff,#7b2fff)" : "transparent", color: step === i+1 ? "#00c8ff" : step > i+1 ? "#fff" : "#1a3060", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: "bold", fontSize: "0.8rem", flexShrink: 0 }}>
                {step > i+1 ? "✓" : i+1}
              </div>
              <span style={{ fontSize: "0.7rem", color: step === i+1 ? "#00c8ff" : "#1a3060" }}>{label}</span>
              {i < 3 && <div style={{ flex: 1, height: "1px", background: "#1a3060" }} />}
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(6,20,60,0.8)", border: "1px solid rgba(0,255,179,0.2)", borderRadius: "16px", padding: "32px" }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "1rem", color: "#fff", letterSpacing: "2px", marginBottom: "4px" }}>PERSONAL DETAILS</div>
              <div style={{ color: "#4a6fa5", fontSize: "0.85rem", marginBottom: "24px" }}>Your basic identification information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} placeholder="Full legal name" autoComplete="off" value={personal.full_name} onChange={(e) => setPersonal({ ...personal, full_name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>NIC Number</label>
                  <input style={inputStyle} placeholder="200012345678" autoComplete="off" value={personal.nic_number} onChange={(e) => setPersonal({ ...personal, nic_number: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" placeholder="seller@email.com" autoComplete="off" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} placeholder="+94 77 000 0000" autoComplete="off" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>District</label>
                  <select style={{ ...inputStyle, background: "#060f2a" }} value={personal.district} onChange={(e) => setPersonal({ ...personal, district: e.target.value })}>
                    <option value="">Select...</option>
                    <option>Ratnapura</option>
                    <option>Colombo</option>
                    <option>Kandy</option>
                    <option>Galle</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input style={inputStyle} type="password" placeholder="Min 8 characters" autoComplete="new-password" value={personal.password} onChange={(e) => setPersonal({ ...personal, password: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <button style={btnNext} onClick={() => setStep(2)}>NEXT: KYC DOCS →</button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "1rem", color: "#fff", letterSpacing: "2px", marginBottom: "4px" }}>KYC DOCUMENTS</div>
              <div style={{ color: "#4a6fa5", fontSize: "0.85rem", marginBottom: "24px" }}>Upload clear copies — JPG, PNG or PDF</div>
              <label style={labelStyle}>NIC Front Side</label>
              <div style={{ border: "2px dashed rgba(0,200,255,0.3)", borderRadius: "12px", padding: "24px", textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🪪</div>
                <div style={{ color: "#4a6fa5", marginBottom: "10px" }}>Upload NIC Front</div>
                <input type="file" accept=".jpg,.png,.pdf" onChange={(e) => setNicFront(e.target.files[0])} />
                {nicFront && <div style={{ color: "#00ffb3", marginTop: "8px" }}>✅ {nicFront.name}</div>}
              </div>
              <label style={labelStyle}>NGJA License</label>
              <div style={{ border: "2px dashed rgba(0,200,255,0.3)", borderRadius: "12px", padding: "24px", textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📋</div>
                <div style={{ color: "#4a6fa5", marginBottom: "10px" }}>Upload NGJA License (Required)</div>
                <input type="file" accept=".jpg,.png,.pdf" onChange={(e) => setNgjaLicense(e.target.files[0])} />
                {ngjaLicense && <div style={{ color: "#00ffb3", marginTop: "8px" }}>✅ {ngjaLicense.name}</div>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button style={btnBack} onClick={() => setStep(1)}>← BACK</button>
                <button style={btnNext} onClick={() => setStep(3)}>NEXT: BUSINESS INFO →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "1rem", color: "#fff", letterSpacing: "2px", marginBottom: "4px" }}>BUSINESS INFORMATION</div>
              <div style={{ color: "#4a6fa5", fontSize: "0.85rem", marginBottom: "24px" }}>Tell us about your gemstone business</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Shop Name</label>
                  <input style={inputStyle} placeholder="e.g. Ratna Gems" autoComplete="off" value={business.shop_name} onChange={(e) => setBusiness({ ...business, shop_name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Years in Business</label>
                  <select style={{ ...inputStyle, background: "#060f2a" }} value={business.years_in_business} onChange={(e) => setBusiness({ ...business, years_in_business: e.target.value })}>
                    <option value="">Select...</option>
                    <option>Less than 1 year</option>
                    <option>1-3 years</option>
                    <option>3-5 years</option>
                    <option>5-10 years</option>
                    <option>10+ years</option>
                  </select>
                </div>
              </div>
              <label style={labelStyle}>Gem Types You Sell</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                {gemOptions.map((gem) => (
                  <button key={gem} onClick={() => toggleGem(gem)} style={{ padding: "8px 16px", border: business.gem_types.includes(gem) ? "1px solid #00c8ff" : "1px solid #1a3060", borderRadius: "20px", background: business.gem_types.includes(gem) ? "rgba(0,200,255,0.15)" : "transparent", color: business.gem_types.includes(gem) ? "#00c8ff" : "#4a6fa5", cursor: "pointer", fontSize: "0.85rem" }}>
                    {gem}
                  </button>
                ))}
              </div>
              <label style={labelStyle}>Business Description</label>
              <textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} placeholder="Describe your business..." autoComplete="off" value={business.business_description} onChange={(e) => setBusiness({ ...business, business_description: e.target.value })} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button style={btnBack} onClick={() => setStep(2)}>← BACK</button>
                <button style={btnNext} onClick={() => setStep(4)}>NEXT: REVIEW →</button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "1rem", color: "#fff", letterSpacing: "2px", marginBottom: "4px" }}>REVIEW & SUBMIT</div>
              <div style={{ color: "#4a6fa5", fontSize: "0.85rem", marginBottom: "24px" }}>Check your details before submitting</div>
              <div style={{ background: "rgba(0,200,255,0.04)", border: "1px solid rgba(0,200,255,0.1)", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
                {[
                  ["Full Name", personal.full_name],
                  ["Email", personal.email],
                  ["NIC Number", personal.nic_number],
                  ["District", personal.district],
                  ["Shop Name", business.shop_name],
                  ["NIC Front", nicFront ? "✅ " + nicFront.name : "❌ Not uploaded"],
                  ["NGJA License", ngjaLicense ? "✅ " + ngjaLicense.name : "❌ Not uploaded"],
                  ["Gem Types", business.gem_types.join(", ") || "None"]
                ].map(([key, val]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,200,255,0.07)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#4a6fa5", fontFamily: "monospace" }}>{key}</span>
                    <span style={{ fontSize: "0.9rem", color: "#fff", fontWeight: "600" }}>{val}</span>
                  </div>
                ))}
              </div>
              {message && <div style={{ color: "#ff4466", textAlign: "center", marginBottom: "12px" }}>{message}</div>}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button style={btnBack} onClick={() => setStep(3)}>← BACK</button>
                <button style={btnNext} onClick={handleSubmit} disabled={loading}>{loading ? "SUBMITTING..." : "SUBMIT APPLICATION ✓"}</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}