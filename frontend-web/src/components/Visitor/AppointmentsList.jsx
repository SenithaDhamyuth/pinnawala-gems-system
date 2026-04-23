import React from 'react';
import AppointmentTab from './AppointmentTab.jsx';
import BookAppointmentView from './BookAppointmentView.jsx';

/**
 * Routes buyers/sellers to booking UI and admins to slot management.
 * @see AppointmentTab.jsx — admin creates slots
 * @see BookAppointmentView.jsx — buyers book Available slots
 */
export default function AppointmentsList({ role }) {
  const currentRole = role || localStorage.getItem('role') || '';

  if (currentRole === 'admin') {
    return <AppointmentTab />;
  }

  if (currentRole === 'buyer' || currentRole === 'seller') {
    return <BookAppointmentView />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
      Unable to determine role for appointments.
    </div>
  );
}
