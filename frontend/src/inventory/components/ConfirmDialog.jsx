import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  loading,
  confirmText = "Confirm",
}) {
  return (
    <div className="inv-overlay" onClick={onCancel}>
      <div className="inv-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="inv-dialog-icon">
          <AlertTriangle size={24} color="#dc2626" />
        </div>
        <h3>{title || "Are you sure?"}</h3>
        <p>{message || "This action cannot be undone."}</p>
        <div className="inv-dialog-actions">
          <button className="inv-btn inv-btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="inv-btn inv-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
