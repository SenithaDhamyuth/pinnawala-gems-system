import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Home from './pages/Home';
import Navbar from './components/Navbar';
import AIEngine from './components/AIEngine';
import Marketplace from './components/Marketplace/Marketplace';

import Login          from "./pages/Login";
import Register       from "./pages/Register";
import SellerRegister from "./pages/SellerRegister";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard  from "./pages/BuyerDashboard";
import SellerSettings from "./pages/SellerSettings";
import ShopCustomization from "./pages/ShopCustomization";
import ShopPage       from "./pages/ShopPage";
import PaymentPage    from "./pages/PaymentPage";
import MessagesPage   from "./pages/MessagesPage";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -30, scale: 1.02 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="min-h-screen flex flex-col origin-center pt-[64px]"
  >
    {children}
  </motion.div>
);

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Helps diagnose without taking the whole app down.
    console.error('[RouteErrorBoundary] Render crashed:', error, info);
  }

  componentDidUpdate(prevProps) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-black text-slate-900 mb-2">Something went wrong in this section</h2>
          <p className="text-sm text-slate-600 mb-4">
            The page crashed while rendering. Try returning to a safe page.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="px-4 py-2 rounded-xl bg-white text-slate-800 text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Go to home
            </button>
          </div>
          {this.state.error?.message && (
            <pre className="mt-4 text-xs text-slate-500 whitespace-pre-wrap">
              {String(this.state.error.message)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

function App() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  // Helper for safe dashboard routing
  const getDashboard = () => {
    if (role === 'admin') return '/admin';
    if (role === 'seller') return '/seller';
    return '/buyer';
  };

  return (
    <RouteErrorBoundary resetKey={location.pathname}>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/home" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/ai-engine" element={<PageWrapper><AIEngine /></PageWrapper>} />
          <Route path="/marketplace" element={<PageWrapper><Marketplace /></PageWrapper>} />
          
          <Route path="/login"       element={token ? <PageWrapper><Navigate to={getDashboard()} /></PageWrapper> : <PageWrapper><Login /></PageWrapper>} />
          <Route path="/register"    element={token ? <PageWrapper><Navigate to={getDashboard()} /></PageWrapper> : <PageWrapper><Register /></PageWrapper>} />
          <Route path="/"            element={token ? <PageWrapper><Home /></PageWrapper> : <PageWrapper><Login /></PageWrapper>} />
          <Route path="/seller-register" element={<PageWrapper><SellerRegister /></PageWrapper>} />
          <Route path="/admin"  element={<PageWrapper><AdminDashboard /></PageWrapper>} />
          <Route path="/seller" element={<PageWrapper><SellerDashboard /></PageWrapper>} />
          <Route path="/buyer"  element={<PageWrapper><BuyerDashboard /></PageWrapper>} />
          <Route path="/seller-settings" element={<PageWrapper><SellerSettings /></PageWrapper>} />
          <Route path="/shop-customization" element={<PageWrapper><ShopCustomization /></PageWrapper>} />
          <Route path="/shop/:sellerId"       element={<PageWrapper><ShopPage /></PageWrapper>} />
          <Route path="/payment"        element={<PaymentPage />} />
          <Route path="/messages"       element={<PageWrapper><MessagesPage /></PageWrapper>} />
          
          {/* 404 Fallback: Prevent blank screens and preserve auth session */}
          <Route path="*" element={<Navigate to={token ? getDashboard() : '/login'} replace />} />
        </Routes>
      </AnimatePresence>
    </RouteErrorBoundary>
  );
}

export default App;