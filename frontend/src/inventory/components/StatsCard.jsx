export default function StatsCard({ icon, label, value, color = "#2563eb", bg = "#dbeafe" }) {
  return (
    <div className="inv-stat-card">
      <div className="inv-stat-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <div className="inv-stat-value">{value ?? "-"}</div>
        <div className="inv-stat-label">{label}</div>
      </div>
    </div>
  );
}
