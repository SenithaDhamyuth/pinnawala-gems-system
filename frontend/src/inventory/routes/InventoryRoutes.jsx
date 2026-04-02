import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminInventory from "../pages/admin/AdminInventory";
import AddGemstone from "../pages/seller/AddGemstone";
import EditGemstone from "../pages/seller/EditGemstone";
import SellerDashboard from "../pages/seller/SellerDashboard";
import ViewGemstone from "../pages/seller/ViewGemstone";

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/inventory/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/inventory/admin" : "/inventory/seller"} replace />;
  }

  return children;
}

function DefaultInventoryRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/inventory/login" replace />;
  }

  return <Navigate to={user.role === "admin" ? "/inventory/admin" : "/inventory/seller"} replace />;
}

function InventoryRoutesInner() {
  return (
    <Routes>
      <Route index element={<DefaultInventoryRedirect />} />
      <Route path="login" element={<LoginPage />} />
      <Route
        path="seller"
        element={
          <RequireAuth role="seller">
            <SellerDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="seller/add"
        element={
          <RequireAuth role="seller">
            <AddGemstone />
          </RequireAuth>
        }
      />
      <Route
        path="seller/edit/:id"
        element={
          <RequireAuth role="seller">
            <EditGemstone />
          </RequireAuth>
        }
      />
      <Route
        path="seller/view/:id"
        element={
          <RequireAuth role="seller">
            <ViewGemstone />
          </RequireAuth>
        }
      />
      <Route
        path="admin"
        element={
          <RequireAuth role="admin">
            <AdminDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="admin/inventory"
        element={
          <RequireAuth role="admin">
            <AdminInventory />
          </RequireAuth>
        }
      />
      <Route
        path="admin/add"
        element={
          <RequireAuth role="admin">
            <AddGemstone />
          </RequireAuth>
        }
      />
      <Route
        path="admin/edit/:id"
        element={
          <RequireAuth role="admin">
            <EditGemstone />
          </RequireAuth>
        }
      />
      <Route
        path="admin/view/:id"
        element={
          <RequireAuth role="admin">
            <ViewGemstone />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/inventory" replace />} />
    </Routes>
  );
}

export default function InventoryRoutes() {
  return (
    <AuthProvider>
      <InventoryRoutesInner />
    </AuthProvider>
  );
}
