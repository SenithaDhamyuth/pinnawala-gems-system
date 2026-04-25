import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Auctions } from './pages/Auctions';
import { AuctionDetails } from './pages/AuctionDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateAuction } from './pages/CreateAuction';

// Redirect component defined inline using createElement to avoid needing .tsx
import { createElement } from 'react';

const RedirectToAuctions = () => createElement(Navigate, { to: '/auctions', replace: true });

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: RedirectToAuctions,
      },
      {
        path: 'auctions',
        Component: Auctions,
      },
      {
        path: 'auction/:id',
        Component: AuctionDetails,
      },
      {
        path: 'admin',
        Component: AdminDashboard,
      },
      {
        path: 'admin/create-auction',
        Component: CreateAuction,
      },
      {
        path: 'admin/edit-auction/:id',
        Component: CreateAuction,
      },
    ],
  },
]);