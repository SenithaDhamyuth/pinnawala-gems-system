import React from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Home from './pages/Home.jsx';
import Navbar from './components/Navbar.jsx';
import AIEngine from './components/AIEngine.jsx';
import Marketplace from './components/Marketplace/Marketplace.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SellerRegister from './pages/SellerRegister.jsx';
import AdminLogin from './pages/admin/Login.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import LearningHub from './components/Learning/LearningHub.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import InventoryDashboard from './components/Inventory/InventoryDashboard.jsx';
import AuctionsList from './components/Bidding/AuctionsList.jsx';
import AppointmentsList from './components/Visitor/AppointmentsList.jsx';
import MyOffers from './components/Marketplace/MyOffers.jsx';
import ReceivedOffers from './components/Marketplace/ReceivedOffers.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import ShopSettings from './components/Inventory/ShopSettings.jsx';
import ShopView from './pages/ShopView.jsx';

const MainLayout = () => (
  <>
    <Navbar />
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-24"
    >
      <Outlet />
    </motion.div>
  </>
);

const AuthLayout = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen bg-slate-50 flex items-center justify-center"
  >
    <Outlet />
  </motion.div>
);

function App() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const getDashboard = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'seller') return '/dashboard/inventory';
    return '/home';
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!token) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to={getDashboard()} replace />;
    }
    return children;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        <Route path="/admin">
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="login" element={!token ? <AdminLogin /> : <Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          } />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={token ? <Navigate to={getDashboard()} /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to={getDashboard()} /> : <Register />} />
          <Route path="/seller-register" element={<SellerRegister />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/ai-engine" element={<AIEngine />} />
          <Route path="/learning-hub" element={<LearningHub />} />
          <Route path="/learning" element={<LearningHub />} />
          <Route path="/messages" element={
            <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
              <MessagesPage />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/inventory" element={
            <ProtectedRoute allowedRoles={['admin', 'seller']}>
              <DashboardLayout role={role}><InventoryDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/auctions" element={
            <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
              <DashboardLayout role={role}><AuctionsList role={role} /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/appointments" element={
            <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
              <DashboardLayout role={role}><AppointmentsList role={role} /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/my-offers" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <DashboardLayout role={role}><MyOffers /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/received-offers" element={
            <ProtectedRoute allowedRoles={['seller']}>
              <DashboardLayout role={role}><ReceivedOffers /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/shop-settings" element={
            <ProtectedRoute allowedRoles={['seller']}>
              <DashboardLayout role={role}><ShopSettings /></DashboardLayout>
            </ProtectedRoute>
          } />
          {/* Public seller shop page — accessible without login */}
          <Route path="/shop/:sellerId" element={<ShopView />} />
        </Route>

        <Route path="*" element={<Navigate to={token ? getDashboard() : '/login'} replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;