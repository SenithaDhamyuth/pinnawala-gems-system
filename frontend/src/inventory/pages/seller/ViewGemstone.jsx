import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Archive, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import ConfirmDialog from "../../components/ConfirmDialog";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import InventoryLayout from "../../layouts/InventoryLayout";
import { adminService } from "../../services/adminService";
import { inventoryService } from "../../services/inventoryService";
import { formatDate, formatListingType, formatPrice, getImageUrl } from "../../utils/helpers";

export default function ViewGemstone() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);
  const isAdmin = user?.role === "admin";
  const backPath = isAdmin ? "/inventory/admin/inventory" : "/inventory/seller";
  const editPath = isAdmin ? `/inventory/admin/edit/${id}` : `/inventory/seller/edit/${id}`;
  const getItem = isAdmin ? adminService.getItemById : inventoryService.getItemById;
  const deleteItem = isAdmin ? adminService.deleteItem : inventoryService.deleteItem;
  const archiveItem = isAdmin ? adminService.archiveItem : inventoryService.archiveItem;

  useEffect(() => {
    let isMounted = true;

    getItem(id)
      .then((data) => {
        if (isMounted) {
          setItem(data);
        }
      })
      .catch(() => {
        toast.error("Item not found");
        navigate(backPath);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate, backPath]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteItem(id);
      toast.success("Deleted successfully");
      navigate(backPath);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Delete failed");
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveItem(id);
      toast.success("Gemstone archived");
      navigate(backPath);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Archive failed");
    }
  };

  if (loading) {
    return (
      <InventoryLayout title="View Gemstone">
        <LoadingSpinner />
      </InventoryLayout>
    );
  }

  if (!item) {
    return null;
  }

  const fields = [
    { label: "Gem Type", value: item.gem_type },
    { label: "Category", value: item.category },
    { label: "Color", value: item.color },
    { label: "Carat Weight", value: `${item.carat} ct` },
    { label: "Cut", value: item.cut || "-" },
    { label: "Origin", value: item.origin || "-" },
    { label: "Listing Type", value: formatListingType(item.listing_type) },
    { label: "Stock Quantity", value: item.stock_quantity },
    { label: "Low Stock Alert Level", value: item.low_stock_threshold },
    { label: "Date Added", value: formatDate(item.created_at) },
    { label: "Last Updated", value: formatDate(item.updated_at) },
  ];

  return (
    <InventoryLayout title="Gemstone Details" subtitle={item.gem_name}>
      <div style={{ maxWidth: 920 }}>
        <button className="inv-btn inv-btn-ghost inv-btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(backPath)}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className="inv-detail-layout">
          <div className="inv-card">
            <div className="inv-card-body">
              {item.images?.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(item.images[selectedImg])}
                    alt={item.gem_name}
                    style={{
                      width: "100%",
                      height: 300,
                      objectFit: "cover",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  {item.images.length > 1 && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      {item.images.map((url, index) => (
                        <img
                          key={`${url}-${index}`}
                          src={getImageUrl(url)}
                          alt=""
                          onClick={() => setSelectedImg(index)}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 10,
                            cursor: "pointer",
                            border: index === selectedImg ? "2px solid #2563eb" : "1px solid #e2e8f0",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="inv-view-empty-image">GI</div>
              )}
            </div>
          </div>

          <div className="inv-card">
            <div className="inv-card-header">
              <div>
                <span className="inv-card-title">{item.gem_name}</span>
                {item.is_low_stock && <div className="inv-inline-alert">Low stock: replenish soon</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {item.is_low_stock && (
                  <span className="inv-low-stock-badge">
                    {item.stock_quantity} left / alert at {item.low_stock_threshold}
                  </span>
                )}
                <StatusBadge status={item.status} />
              </div>
            </div>
            <div className="inv-card-body">
              <div className="inv-detail-price" style={{ marginBottom: 16 }}>
                {formatPrice(item.price)}
              </div>
              <div className="inv-detail-grid">
                {fields.map((field) => (
                  <div className="inv-detail-item" key={field.label}>
                    <span className="inv-detail-label">{field.label}</span>
                    <span className="inv-detail-value" style={{ textTransform: "capitalize" }}>
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>

              {item.description && (
                <div className="inv-description-box">
                  <span className="inv-detail-label" style={{ display: "block", marginBottom: 6 }}>
                    Description
                  </span>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{item.description}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => navigate(editPath)}>
                  <Pencil size={14} /> Edit
                </button>
                {!item.is_archived && (
                  <button className="inv-btn inv-btn-ghost inv-btn-sm" onClick={handleArchive}>
                    <Archive size={14} /> Archive
                  </button>
                )}
                <button className="inv-btn inv-btn-danger inv-btn-sm" onClick={() => setShowDelete(true)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDelete && (
        <ConfirmDialog
          title="Delete Gemstone?"
          message={`Permanently delete "${item.gem_name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
          confirmText="Delete"
        />
      )}
    </InventoryLayout>
  );
}
