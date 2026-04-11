import { Search, SlidersHorizontal, X } from "lucide-react";

import { CATEGORIES, LISTING_TYPES, LISTING_TYPE_LABELS, STATUSES, STATUS_LABELS } from "../utils/constants";

const EMPTY = {
  search: "",
  status: "",
  category: "",
  color: "",
  listing_type: "",
  min_price: "",
  max_price: "",
  seller_name: "",
  seller_id: "",
};

export default function SearchFilter({ filters, onChange, showSeller = false }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const clear = () => onChange({ ...EMPTY });

  const hasFilters = Object.values(filters).some(Boolean);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <section className="inv-filter-panel">
      <div className="inv-filter-toolbar">
        <div className="inv-filter-heading">
          <span className="inv-filter-kicker">
            <SlidersHorizontal size={14} /> Inventory Filters
          </span>
          <p className="inv-filter-subtitle">
            Narrow listings by category, color, status, price, and {showSeller ? "seller details" : "listing type"}.
          </p>
        </div>

        <div className="inv-filter-toolbar-actions">
          {hasFilters && <span className="inv-filter-count">{activeFilterCount} active</span>}
          <button type="button" className="inv-btn inv-btn-ghost inv-btn-sm" onClick={clear}>
            <X size={14} /> Clear filters
          </button>
        </div>
      </div>

      <div className="inv-filter-grid">
        <div className="inv-filter-field inv-filter-field-wide">
          <label className="inv-filter-label">Search</label>
          <div className="inv-search-input-wrap">
            <Search size={16} />
            <input
              className="inv-input inv-search-input"
              placeholder={showSeller ? "Search gemstones, sellers, or keywords" : "Search your gemstones by name or keyword"}
              value={filters.search || ""}
              onChange={(event) => set("search", event.target.value)}
            />
          </div>
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Category</label>
          <select
            className="inv-filter-select"
            value={filters.category || ""}
            onChange={(event) => set("category", event.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Status</label>
          <select
            className="inv-filter-select"
            value={filters.status || ""}
            onChange={(event) => set("status", event.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Color</label>
          <input
            className="inv-input"
            placeholder="Royal blue"
            value={filters.color || ""}
            onChange={(event) => set("color", event.target.value)}
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Listing Type</label>
          <select
            className="inv-filter-select"
            value={filters.listing_type || ""}
            onChange={(event) => set("listing_type", event.target.value)}
          >
            <option value="">All Types</option>
            {LISTING_TYPES.map((type) => (
              <option key={type} value={type}>
                {LISTING_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="inv-filter-field inv-filter-field-wide">
          <label className="inv-filter-label">Price Range (LKR)</label>
          <div className="inv-filter-range">
            <input
              className="inv-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="Minimum"
              value={filters.min_price || ""}
              onChange={(event) => set("min_price", event.target.value)}
            />
            <input
              className="inv-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="Maximum"
              value={filters.max_price || ""}
              onChange={(event) => set("max_price", event.target.value)}
            />
          </div>
        </div>

        {showSeller && (
          <>
            <div className="inv-filter-field">
              <label className="inv-filter-label">Seller Name</label>
              <input
                className="inv-input"
                placeholder="Search by seller name"
                value={filters.seller_name || ""}
                onChange={(event) => set("seller_name", event.target.value)}
              />
            </div>
            <div className="inv-filter-field">
              <label className="inv-filter-label">Seller ID</label>
              <input
                className="inv-input"
                placeholder="Search by seller ID"
                value={filters.seller_id || ""}
                onChange={(event) => set("seller_id", event.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
