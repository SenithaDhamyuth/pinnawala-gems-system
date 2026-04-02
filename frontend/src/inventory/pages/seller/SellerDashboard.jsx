import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Archive,
  ArchiveX,
  CheckCircle,
  Eye,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Tag,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import LowStockPopup from "../../components/LowStockPopup";
import LowStockSummaryCard from "../../components/LowStockSummaryCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import SearchFilter from "../../components/SearchFilter";
import StatsCard from "../../components/StatsCard";
import StatusBadge from "../../components/StatusBadge";
import InventoryLayout from "../../layouts/InventoryLayout";
import { inventoryService } from "../../services/inventoryService";
import { STATUSES, STATUS_LABELS } from "../../utils/constants";
import { buildFilterParams, formatDate, formatListingType, formatPrice, getImageUrl } from "../../utils/helpers";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [summaryItems, setSummaryItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    color: "",
    listing_type: "",
    min_price: "",
    max_price: "",
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [showLowStockPopup, setShowLowStockPopup] = useState(false);

  async function fetchItems(nextFilters = filters) {
    setLoading(true);
    try {
      const data = await inventoryService.getMyItems(buildFilterParams(nextFilters));
      setItems(data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummaryItems() {
    try {
      const data = await inventoryService.getMyItems();
      setSummaryItems(data.items || []);
    } catch (error) {
      toast.error("Failed to load summary data");
    }
  }

  async function fetchLowStockItems(shouldShowPopup = false) {
    try {
      const data = await inventoryService.getLowStockItems();
      setLowStockItems(data.items || []);
      setShowLowStockPopup(shouldShowPopup && (data.total || 0) > 0);
    } catch (error) {
      toast.error("Failed to load low stock alerts");
    }
  }

  useEffect(() => {
    fetchItems(filters);
  }, [filters]);

  useEffect(() => {
    fetchSummaryItems();
    fetchLowStockItems(true);
  }, []);

  const stats = {
    total: summaryItems.length,
    active: summaryItems.filter((item) => item.status === "active").length,
    archived: summaryItems.filter((item) => item.is_archived).length,
    sold: summaryItems.filter((item) => item.status === "sold").length,
    lowStock: lowStockItems.length,
  };

  const refreshData = async () => {
    await fetchItems(filters);
    await fetchSummaryItems();
    await fetchLowStockItems(false);
  };

  const handleArchive = async (item) => {
    try {
      const updatedItem = await inventoryService.archiveItem(item.id);
      toast.success(updatedItem.is_archived ? "Item archived" : "Item restored");
      await refreshData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Archive failed");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await inventoryService.deleteItem(deleteTarget.id);
      toast.success("Item deleted");
      setDeleteTarget(null);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (item, status) => {
    try {
      await inventoryService.updateStatus(item.id, status);
      toast.success(`Status updated to ${STATUS_LABELS[status]}`);
      setStatusTarget(null);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Status update failed");
    }
  };

  return (
    <InventoryLayout title="Seller Dashboard" subtitle="Manage your gemstone inventory">
      <div className="inv-stats-grid">
        <StatsCard icon={<Package size={22} />} label="Total Items" value={stats.total} color="#2563eb" bg="#dbeafe" />
        <StatsCard icon={<CheckCircle size={22} />} label="Active Listings" value={stats.active} color="#16a34a" bg="#dcfce7" />
        <StatsCard icon={<ArchiveX size={22} />} label="Archived" value={stats.archived} color="#64748b" bg="#f1f5f9" />
        <StatsCard icon={<Tag size={22} />} label="Sold" value={stats.sold} color="#9333ea" bg="#f3e8ff" />
        <StatsCard icon={<AlertTriangle size={22} />} label="Low Stock Alerts" value={stats.lowStock} color="#b45309" bg="#ffedd5" />
      </div>

      <LowStockSummaryCard
        title="Low Stock Gems"
        description="These gemstones have reached or passed their low stock alert level."
        items={lowStockItems}
        emptyMessage="No low stock gemstones right now."
        onViewItem={(item) => navigate(`/inventory/seller/view/${item.id}`)}
      />

      <div className="inv-card">
        <div className="inv-card-header">
          <span className="inv-card-title">My Inventory</span>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => navigate("/inventory/seller/add")}>
            <Plus size={16} /> Add Gemstone
          </button>
        </div>

        <div className="inv-card-body" style={{ paddingBottom: 0 }}>
          <SearchFilter filters={filters} onChange={setFilters} />
        </div>

        <div className="inv-table-wrap">
          {loading ? (
            <LoadingSpinner />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Package size={32} />}
              title="No gemstones found"
              description="Add a new listing or adjust your current filters."
              action={
                <button className="inv-btn inv-btn-primary" onClick={() => navigate("/inventory/seller/add")}>
                  <Plus size={15} /> Add Gemstone
                </button>
              }
            />
          ) : (
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Gem</th>
                  <th>Category</th>
                  <th>Color</th>
                  <th>Carat</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={item.is_low_stock ? "inv-row-alert" : ""}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {item.images?.[0] ? (
                          <img className="inv-gem-thumb" src={getImageUrl(item.images[0])} alt={item.gem_name} />
                        ) : (
                          <div className="inv-gem-thumb-placeholder">GI</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.gem_name}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{item.gem_type}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.color || "-"}</td>
                    <td>{item.carat} ct</td>
                    <td>
                      <div className="inv-stock-cell">
                        <span style={{ fontWeight: 700 }}>{item.stock_quantity}</span>
                        {item.is_low_stock && (
                          <span className="inv-low-stock-badge">
                            Alert at {item.low_stock_threshold}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "#2563eb" }}>{formatPrice(item.price)}</td>
                    <td>
                      <span style={{ fontSize: 12, textTransform: "capitalize" }}>
                        {formatListingType(item.listing_type)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>{formatDate(item.created_at)}</td>
                    <td>
                      <div className="inv-table-actions">
                        <button className="inv-btn-icon" title="View" onClick={() => navigate(`/inventory/seller/view/${item.id}`)}>
                          <Eye size={15} />
                        </button>
                        <button className="inv-btn-icon" title="Edit" onClick={() => navigate(`/inventory/seller/edit/${item.id}`)}>
                          <Pencil size={15} />
                        </button>
                        <button
                          className="inv-btn-icon"
                          title={item.is_archived ? "Unarchive" : "Archive"}
                          onClick={() => handleArchive(item)}
                        >
                          {item.is_archived ? <ArchiveX size={15} /> : <Archive size={15} />}
                        </button>
                        <div style={{ position: "relative" }}>
                          <button
                            className="inv-btn-icon"
                            title="Change Status"
                            onClick={() => setStatusTarget(statusTarget === item.id ? null : item.id)}
                          >
                            <RefreshCw size={15} />
                          </button>
                          {statusTarget === item.id && (
                            <div className="inv-status-menu">
                              {STATUSES.map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(item, status)}
                                  className={`inv-status-menu-item ${item.status === status ? "active" : ""}`}
                                >
                                  {STATUS_LABELS[status]}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button className="inv-btn-icon danger" title="Delete" onClick={() => setDeleteTarget(item)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Gemstone?"
          message={`"${deleteTarget.gem_name}" will be permanently removed from your inventory.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
          confirmText="Delete"
        />
      )}

      {showLowStockPopup && (
        <LowStockPopup
          items={lowStockItems}
          onClose={() => setShowLowStockPopup(false)}
          onViewItem={(item) => {
            setShowLowStockPopup(false);
            navigate(`/inventory/seller/view/${item.id}`);
          }}
        />
      )}
    </InventoryLayout>
  );
}
