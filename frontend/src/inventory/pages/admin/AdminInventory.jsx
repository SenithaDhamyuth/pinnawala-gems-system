import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, ArchiveX, Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import SearchFilter from "../../components/SearchFilter";
import StatusBadge from "../../components/StatusBadge";
import InventoryLayout from "../../layouts/InventoryLayout";
import { adminService } from "../../services/adminService";
import { STATUSES, STATUS_LABELS } from "../../utils/constants";
import { buildFilterParams, formatDate, formatListingType, formatPrice, getImageUrl } from "../../utils/helpers";

export default function AdminInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    color: "",
    listing_type: "",
    min_price: "",
    max_price: "",
    seller_name: "",
    seller_id: "",
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  async function fetchItems(nextFilters = filters) {
    setLoading(true);
    try {
      const data = await adminService.getAllInventory(buildFilterParams(nextFilters));
      setItems(data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems(filters);
  }, [filters]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteItem(deleteTarget.id);
      toast.success("Record removed");
      setDeleteTarget(null);
      fetchItems(filters);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async (item) => {
    try {
      const updatedItem = await adminService.archiveItem(item.id);
      toast.success(updatedItem.is_archived ? "Record archived" : "Record restored");
      await fetchItems(filters);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Archive failed");
    }
  };

  const handleStatusChange = async (item, status) => {
    try {
      await adminService.updateStatus(item.id, status);
      toast.success(`Status updated to ${STATUS_LABELS[status]}`);
      setStatusTarget(null);
      fetchItems(filters);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Status update failed");
    }
  };

  return (
    <InventoryLayout title="All Inventory" subtitle="Monitor and manage gemstone listings across all sellers">
      <div className="inv-card">
        <div className="inv-card-header">
          <span className="inv-card-title">Global Inventory ({items.length} records)</span>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => navigate("/inventory/admin/add")}>
            <Plus size={16} /> Add Gemstone
          </button>
        </div>
        <div className="inv-card-body" style={{ paddingBottom: 0 }}>
          <SearchFilter filters={filters} onChange={setFilters} showSeller />
        </div>
        <div className="inv-table-wrap">
          {loading ? (
            <LoadingSpinner />
          ) : items.length === 0 ? (
            <EmptyState title="No records found" description="No inventory matches your current filters." />
          ) : (
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Gem</th>
                  <th>Seller</th>
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
                          <img className="inv-gem-thumb" src={getImageUrl(item.images[0])} alt="" />
                        ) : (
                          <div className="inv-gem-thumb-placeholder">GI</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.gem_name}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{item.gem_type}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.seller_name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.seller_id}</div>
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
                    <td style={{ fontSize: 12, textTransform: "capitalize" }}>{formatListingType(item.listing_type)}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>{formatDate(item.created_at)}</td>
                    <td>
                      <div className="inv-table-actions">
                        <button className="inv-btn-icon" title="View Details" onClick={() => navigate(`/inventory/admin/view/${item.id}`)}>
                          <Eye size={15} />
                        </button>
                        <button className="inv-btn-icon" title="Edit" onClick={() => navigate(`/inventory/admin/edit/${item.id}`)}>
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
                        <button className="inv-btn-icon danger" title="Delete Record" onClick={() => setDeleteTarget(item)}>
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
          title="Delete Record?"
          message={`Remove "${deleteTarget.gem_name}" from all inventory? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
          confirmText="Delete Record"
        />
      )}
    </InventoryLayout>
  );
}
