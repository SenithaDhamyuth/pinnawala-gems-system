import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArchiveX, CheckCircle, Gavel, Package, TrendingUp, Users } from "lucide-react";
import toast from "react-hot-toast";

import LowStockSummaryCard from "../../components/LowStockSummaryCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatsCard from "../../components/StatsCard";
import StatusBadge from "../../components/StatusBadge";
import InventoryLayout from "../../layouts/InventoryLayout";
import { adminService } from "../../services/adminService";
import { formatDate, formatPrice } from "../../utils/helpers";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getDashboardStats(), adminService.getAllInventory(), adminService.getLowStockItems()])
      .then(([dashboardStats, inventory, lowStock]) => {
        setStats(dashboardStats);
        setRecent((inventory.items || []).slice(0, 8));
        setLowStockItems(lowStock.items || []);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <InventoryLayout title="Admin Dashboard">
        <LoadingSpinner />
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout title="Admin Dashboard" subtitle="Inventory overview across all sellers">
      <div className="inv-stats-grid">
        <StatsCard icon={<Package size={22} />} label="Total Inventory" value={stats?.total_inventory_items} color="#2563eb" bg="#dbeafe" />
        <StatsCard icon={<CheckCircle size={22} />} label="Active Listings" value={stats?.active_listings} color="#16a34a" bg="#dcfce7" />
        <StatsCard icon={<ArchiveX size={22} />} label="Archived" value={stats?.archived_listings} color="#64748b" bg="#f1f5f9" />
        <StatsCard icon={<TrendingUp size={22} />} label="Sold" value={stats?.sold_listings} color="#9333ea" bg="#f3e8ff" />
        <StatsCard icon={<Gavel size={22} />} label="In Auction" value={stats?.in_auction_listings} color="#d97706" bg="#fef3c7" />
        <StatsCard icon={<Users size={22} />} label="Total Sellers" value={stats?.total_sellers} color="#0891b2" bg="#e0f2fe" />
        <StatsCard icon={<AlertTriangle size={22} />} label="Low Stock Gems" value={stats?.low_stock_items} color="#b45309" bg="#ffedd5" />
      </div>

      <LowStockSummaryCard
        title="Low Stock Gems"
        description="Admin view of gemstones that need replenishment across all sellers."
        items={lowStockItems}
        emptyMessage="No low stock gems across sellers right now."
        onViewItem={(item) => navigate(`/inventory/admin/view/${item.id}`)}
        showSeller
      />

      <div className="inv-card">
        <div className="inv-card-header">
          <span className="inv-card-title">Recent Listings</span>
          <a href="/inventory/admin/inventory" style={{ fontSize: 14, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
            {"View All ->"}
          </a>
        </div>
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Gem Name</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.id} className={item.is_low_stock ? "inv-row-alert" : ""}>
                  <td style={{ fontWeight: 600 }}>
                    {item.gem_name}
                    {item.is_low_stock && <div className="inv-inline-alert">Low stock</div>}
                  </td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>{item.seller_name}</td>
                  <td>{item.category}</td>
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
                    <StatusBadge status={item.status} />
                  </td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </InventoryLayout>
  );
}
