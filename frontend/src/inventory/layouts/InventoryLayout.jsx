import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Gem,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function isActive(currentPath, targetPath) {
  if (targetPath === "/inventory/seller") {
    return (
      currentPath === "/inventory/seller" ||
      currentPath.startsWith("/inventory/seller/edit/") ||
      currentPath.startsWith("/inventory/seller/view/")
    );
  }

  if (targetPath === "/inventory/admin") {
    return currentPath === "/inventory/admin";
  }

  if (targetPath === "/inventory/admin/inventory") {
    return (
      currentPath === "/inventory/admin/inventory" ||
      currentPath.startsWith("/inventory/admin/edit/") ||
      currentPath.startsWith("/inventory/admin/view/")
    );
  }

  return currentPath === targetPath;
}

export default function InventoryLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/inventory/login");
  };

  const sellerLinks = [
    { to: "/inventory/seller", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/inventory/seller/add", icon: <PlusCircle size={18} />, label: "Add Gemstone" },
  ];

  const adminLinks = [
    { to: "/inventory/admin", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/inventory/admin/add", icon: <PlusCircle size={18} />, label: "Add Gemstone" },
    { to: "/inventory/admin/inventory", icon: <Package size={18} />, label: "All Inventory" },
  ];

  const links = user?.role === "admin" ? adminLinks : sellerLinks;

  return (
    <div className="inv-module">
      <div className="inv-shell">
        <aside className="inv-sidebar">
          <div className="inv-sidebar-logo">
            <Gem size={28} color="#60a5fa" />
            <div>
              <span>Pinnawala Gems</span>
              <small>Inventory Module</small>
            </div>
          </div>

          <nav className="inv-nav">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`inv-nav-link ${isActive(location.pathname, link.to) ? "active" : ""}`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </nav>

          <div className="inv-sidebar-footer">
            <div className="inv-user-chip">
              <div className="inv-user-chip-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
              <div className="inv-user-chip-info">
                <div className="inv-user-chip-name">{user?.name}</div>
                <div className="inv-user-chip-role">{user?.role}</div>
              </div>
              <button className="inv-logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        <main className="inv-main">
          <div className="inv-topbar">
            <div>
              <div className="inv-topbar-title">{title}</div>
              {subtitle && <div className="inv-topbar-subtitle">{subtitle}</div>}
            </div>

            {user?.role === "admin" && (
              <span className="inv-admin-pill">
                <ShieldCheck size={13} /> Admin Mode
              </span>
            )}
          </div>

          <div className="inv-page">{children}</div>
        </main>
      </div>
    </div>
  );
}
