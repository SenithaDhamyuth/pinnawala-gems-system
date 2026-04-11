import { AlertTriangle, Eye } from "lucide-react";

import { formatPrice, getImageUrl } from "../utils/helpers";

export default function LowStockSummaryCard({
  title,
  description,
  items = [],
  emptyMessage,
  onViewItem,
  showSeller = false,
}) {
  return (
    <div className="inv-card inv-low-stock-card">
      <div className="inv-card-header">
        <div>
          <span className="inv-card-title">{title}</span>
          {description && <p className="inv-low-stock-description">{description}</p>}
        </div>
        <span className="inv-low-stock-count">
          <AlertTriangle size={14} /> {items.length} low stock
        </span>
      </div>
      <div className="inv-card-body">
        {items.length === 0 ? (
          <div className="inv-low-stock-empty">{emptyMessage}</div>
        ) : (
          <div className="inv-low-stock-list">
            {items.map((item) => (
              <div className="inv-low-stock-item" key={item.id}>
                <div className="inv-low-stock-item-main">
                  {item.images?.[0] ? (
                    <img className="inv-gem-thumb" src={getImageUrl(item.images[0])} alt={item.gem_name} />
                  ) : (
                    <div className="inv-gem-thumb-placeholder">GI</div>
                  )}
                  <div>
                    <div className="inv-low-stock-item-name">{item.gem_name}</div>
                    <div className="inv-low-stock-item-meta">
                      {showSeller ? `${item.seller_name} | ` : ""}
                      {item.category} | {formatPrice(item.price)}
                    </div>
                  </div>
                </div>
                <div className="inv-low-stock-item-side">
                  <span className="inv-low-stock-badge">
                    {item.stock_quantity} left / alert at {item.low_stock_threshold}
                  </span>
                  {onViewItem && (
                    <button className="inv-btn inv-btn-ghost inv-btn-sm" onClick={() => onViewItem(item)}>
                      <Eye size={14} /> View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
