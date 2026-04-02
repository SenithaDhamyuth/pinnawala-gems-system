import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

import ImageUpload from "../../components/ImageUpload";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import InventoryLayout from "../../layouts/InventoryLayout";
import { adminService } from "../../services/adminService";
import { inventoryService } from "../../services/inventoryService";
import {
  CATEGORIES,
  CUT_TYPES,
  LISTING_TYPES,
  LISTING_TYPE_LABELS,
  ORIGINS,
  STATUSES,
  STATUS_LABELS,
} from "../../utils/constants";
import { formatLabel } from "../../utils/helpers";
import { validateInventoryForm } from "../../utils/validation";

export default function EditGemstone() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const isAdmin = user?.role === "admin";
  const backPath = isAdmin ? "/inventory/admin/inventory" : "/inventory/seller";
  const detailPath = isAdmin ? `/inventory/admin/view/${id}` : `/inventory/seller/view/${id}`;
  const getItem = isAdmin ? adminService.getItemById : inventoryService.getItemById;
  const updateItem = isAdmin ? adminService.updateItem : inventoryService.updateItem;

  useEffect(() => {
    let isMounted = true;

    getItem(id)
      .then((data) => {
        if (isMounted) {
          setForm({ ...data, carat: String(data.carat), price: String(data.price) });
        }
      })
      .catch(() => {
        toast.error("Item not found");
        navigate(backPath);
      })
      .finally(() => {
        if (isMounted) {
          setFetching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate, backPath]);

  const setField = (key, value) => {
    setForm((previous) => {
      const nextForm = { ...previous, [key]: value };

      if (key === "status" && value === "in_auction") {
        nextForm.listing_type = "auction";
      }

      if (key === "listing_type" && value !== "auction" && previous.status === "in_auction") {
        nextForm.status = "active";
      }

      return nextForm;
    });
    setErrors((previous) => ({
      ...previous,
      [key]: "",
      ...(key === "status" || key === "listing_type" ? { status: "", listing_type: "" } : {}),
    }));
  };

  const validate = () => {
    const { errors: nextErrors } = validateInventoryForm(form);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted form fields");
      return;
    }

    setLoading(true);

    try {
      const { sanitized } = validateInventoryForm(form);
      await updateItem(id, sanitized);
      toast.success("Gemstone updated");
      navigate(detailPath);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <InventoryLayout title="Edit Gemstone">
        <LoadingSpinner />
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout title="Edit Gemstone" subtitle={`Editing: ${form?.gem_name}`}>
      <div style={{ maxWidth: 860 }}>
        <button className="inv-btn inv-btn-ghost inv-btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(backPath)}>
          <ArrowLeft size={15} /> Back
        </button>

        <form onSubmit={handleSubmit}>
          <div className="inv-card">
            <div className="inv-card-header">
              <span className="inv-card-title">Update Gemstone Details</span>
            </div>
            <div className="inv-card-body">
              <div className="inv-form-grid">
                {[
                  { key: "gem_name", label: "Gem Name" },
                  { key: "gem_type", label: "Gem Type" },
                  { key: "color", label: "Color" },
                ].map((field) => (
                  <div className="inv-field" key={field.key}>
                    <label className="inv-label inv-label-req">{field.label}</label>
                    <input
                      className={`inv-input ${errors[field.key] ? "error" : ""}`}
                      maxLength={field.key === "color" ? 80 : 120}
                      value={form[field.key] || ""}
                      onChange={(event) => setField(field.key, event.target.value)}
                    />
                    {errors[field.key] && <span className="inv-error-msg">{errors[field.key]}</span>}
                  </div>
                ))}

                <div className="inv-field">
                  <label className="inv-label inv-label-req">Category</label>
                  <select className={`inv-select ${errors.category ? "error" : ""}`} value={form.category || ""} onChange={(event) => setField("category", event.target.value)}>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="inv-error-msg">{errors.category}</span>}
                </div>

                <div className="inv-field">
                  <label className="inv-label inv-label-req">Carat</label>
                  <input
                    className={`inv-input ${errors.carat ? "error" : ""}`}
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="10000"
                    value={form.carat || ""}
                    onChange={(event) => setField("carat", event.target.value)}
                  />
                  {errors.carat && <span className="inv-error-msg">{errors.carat}</span>}
                </div>

                <div className="inv-field">
                  <label className="inv-label inv-label-req">Cut</label>
                  <select className={`inv-select ${errors.cut ? "error" : ""}`} value={form.cut || ""} onChange={(event) => setField("cut", event.target.value)}>
                    <option value="">Select cut</option>
                    {CUT_TYPES.map((cut) => (
                      <option key={cut} value={cut}>
                        {formatLabel(cut)}
                      </option>
                    ))}
                  </select>
                  {errors.cut && <span className="inv-error-msg">{errors.cut}</span>}
                </div>

                <div className="inv-field">
                  <label className="inv-label inv-label-req">Origin</label>
                  <select className={`inv-select ${errors.origin ? "error" : ""}`} value={form.origin || ""} onChange={(event) => setField("origin", event.target.value)}>
                    <option value="">Select origin</option>
                    {ORIGINS.map((origin) => (
                      <option key={origin} value={origin}>
                        {origin}
                      </option>
                    ))}
                  </select>
                  {errors.origin && <span className="inv-error-msg">{errors.origin}</span>}
                </div>

                <div className="inv-field">
                  <label className="inv-label inv-label-req">Price (LKR)</label>
                  <input
                    className={`inv-input ${errors.price ? "error" : ""}`}
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100000000"
                    value={form.price || ""}
                    onChange={(event) => setField("price", event.target.value)}
                  />
                  {errors.price && <span className="inv-error-msg">{errors.price}</span>}
                </div>

                <div className="inv-field">
                  <label className="inv-label inv-label-req">Stock Quantity</label>
                  <input
                    className={`inv-input ${errors.stock_quantity ? "error" : ""}`}
                    type="number"
                    step="1"
                    min="0"
                    max="100000"
                    value={form.stock_quantity ?? ""}
                    onChange={(event) => setField("stock_quantity", event.target.value)}
                  />
                  {errors.stock_quantity && <span className="inv-error-msg">{errors.stock_quantity}</span>}
                </div>

                <div className="inv-field">
                  <label className="inv-label inv-label-req">Low Stock Alert Level</label>
                  <input
                    className={`inv-input ${errors.low_stock_threshold ? "error" : ""}`}
                    type="number"
                    step="1"
                    min="0"
                    max="100000"
                    value={form.low_stock_threshold ?? ""}
                    onChange={(event) => setField("low_stock_threshold", event.target.value)}
                  />
                  {errors.low_stock_threshold && <span className="inv-error-msg">{errors.low_stock_threshold}</span>}
                </div>

                <div className="inv-field">
                  <label className="inv-label">Listing Type</label>
                  <select
                    className={`inv-select ${errors.listing_type ? "error" : ""}`}
                    value={form.listing_type || "direct_sale"}
                    onChange={(event) => setField("listing_type", event.target.value)}
                  >
                    {LISTING_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {LISTING_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                  {errors.listing_type && <span className="inv-error-msg">{errors.listing_type}</span>}
                </div>

                <div className="inv-field">
                  <label className="inv-label">Status</label>
                  <select
                    className={`inv-select ${errors.status ? "error" : ""}`}
                    value={form.status || "active"}
                    onChange={(event) => setField("status", event.target.value)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  {errors.status && <span className="inv-error-msg">{errors.status}</span>}
                </div>

                <div className="inv-field inv-form-full">
                  <label className="inv-label inv-label-req">Description</label>
                  <textarea
                    className={`inv-textarea ${errors.description ? "error" : ""}`}
                    maxLength={2000}
                    value={form.description || ""}
                    onChange={(event) => setField("description", event.target.value)}
                  />
                  {errors.description && <span className="inv-error-msg">{errors.description}</span>}
                </div>

                <div className="inv-field inv-form-full">
                  <label className="inv-label">Images</label>
                  <ImageUpload images={form.images || []} onChange={(value) => setField("images", value)} />
                  {errors.images && <span className="inv-error-msg">{errors.images}</span>}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="submit" className="inv-btn inv-btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? "Saving..." : "Update Gemstone"}
            </button>
            <button type="button" className="inv-btn inv-btn-ghost" onClick={() => navigate(backPath)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </InventoryLayout>
  );
}
