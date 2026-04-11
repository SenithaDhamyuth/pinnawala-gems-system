import { AlertTriangle, Bell, Eye, X } from "lucide-react";

export default function LowStockPopup({ items = [], onClose, onViewItem }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-dialog inv-alert-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="inv-alert-dialog-header">
          <div className="inv-alert-dialog-icon">
            <Bell size={24} color="#b45309" />
          </div>
          <button className="inv-alert-dialog-close" onClick={onClose} aria-label="Close low stock alert">
            <X size={16} />
          </button>
        </div>
        <h3>Low Stock Alert</h3>
        <p>
          {items.length === 1
            ? "1 gemstone is running low on stock."
            : `${items.length} gemstones are running low on stock.`}
        </p>
        <div className="inv-alert-list">
          {items.slice(0, 5).map((item) => (
            <div className="inv-alert-item" key={item.id}>
              <div>
                <div className="inv-alert-item-name">{item.gem_name}</div>
                <div className="inv-alert-item-meta">
                  <AlertTriangle size={13} /> {item.stock_quantity} left / alert at {item.low_stock_threshold}
                </div>
              </div>
              {onViewItem && (
                <button className="inv-btn inv-btn-ghost inv-btn-sm" onClick={() => onViewItem(item)}>
                  <Eye size={14} /> View
                </button>
              )}
            </div>
          ))}
        </div>
        {items.length > 5 && (
          <div className="inv-alert-more">+{items.length - 5} more low stock gemstones in your list</div>
        )}
        <div className="inv-dialog-actions" style={{ marginTop: 20 }}>
          <button className="inv-btn inv-btn-primary" onClick={onClose}>
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
