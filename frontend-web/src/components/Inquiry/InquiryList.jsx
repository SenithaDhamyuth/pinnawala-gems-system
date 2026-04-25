import React from 'react';
import AdminInquiryTab from './AdminInquiryTab.jsx';
import UserInquiryView from './UserInquiryView.jsx';

/**
 * Routes to the correct inquiry view based on role.
 * Mirrors the pattern used in AppointmentsList.jsx
 *
 * admin  → AdminInquiryTab  (manage all tickets, reply, change status)
 * buyer / seller → UserInquiryView (submit & track own tickets)
 */
export default function InquiryList({ role }) {
  const currentRole = role || localStorage.getItem('role') || '';

  if (currentRole === 'admin') {
    return <AdminInquiryTab />;
  }

  if (currentRole === 'buyer' || currentRole === 'seller') {
    return <UserInquiryView />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
      Unable to determine role for inquiries.
    </div>
  );
}
