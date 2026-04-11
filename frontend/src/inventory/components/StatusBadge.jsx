import { STATUS_LABELS, STATUS_COLORS, STATUS_BG } from '../utils/constants';

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || '#64748b';
  const bg = STATUS_BG[status] || '#f1f5f9';
  return (
    <span className="inv-badge" style={{ color, backgroundColor: bg }}>
      <span className="inv-badge-dot" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
