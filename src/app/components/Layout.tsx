import { Link, useLocation, Outlet } from 'react-router';
import { Gem, Gavel, User, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export function Layout() {
  const location = useLocation();
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/auctions" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Gem className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">GemAuction</h1>
                <p className="text-xs text-blue-200">Rare Gemstones Worldwide</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/auctions"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive('/auctions') || isActive('/auction')
                    ? 'bg-white text-blue-900'
                    : 'hover:bg-blue-800'
                  }`}
              >
                <Gavel className="w-4 h-4" />
                Auctions
              </Link>
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive('/admin')
                      ? 'bg-white text-blue-900'
                      : 'hover:bg-blue-800'
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserRole(userRole === 'user' ? 'admin' : 'user')}
                className="bg-white text-blue-900 hover:bg-blue-50 border-white"
              >
                {userRole === 'user' ? <User className="w-4 h-4 md:mr-2" /> : <Shield className="w-4 h-4 md:mr-2" />}
                <span className="hidden md:inline">Switch to {userRole === 'user' ? 'Admin' : 'User'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-200px)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Gem className="w-5 h-5" />
                GemAuction
              </h3>
              <p className="text-blue-200 text-sm">
                Your trusted platform for bidding on rare and precious gemstones from around the world.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><Link to="/auctions" className="hover:text-white transition-colors">Auctions</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>Email: info@gemauction.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Hours: Mon-Fri, 9AM-6PM EST</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-700 mt-8 pt-6 text-center text-sm text-blue-200">
            <p>&copy; 2026 GemAuction. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}