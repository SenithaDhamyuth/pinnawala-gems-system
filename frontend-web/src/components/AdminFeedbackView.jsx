import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RoleChip = ({ role }) => {
  const roleStyles = {
    buyer: 'bg-blue-100 text-blue-800',
    seller: 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${roleStyles[role] || 'bg-slate-100 text-slate-800'}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${star <= rating ? 'text-amber-400' : 'text-slate-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function AdminFeedbackView() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/feedback', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFeedback(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load feedback');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-amber-500 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-slate-600 font-medium">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium text-center">{error}</p>
          </div>
          <button
            onClick={fetchFeedback}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">User Feedback & Reviews</h1>
          <p className="text-slate-600">
            {feedback.length} {feedback.length === 1 ? 'feedback' : 'feedbacks'} received
          </p>
        </div>

        {/* Feedback Grid */}
        {feedback.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-slate-600 text-lg">No feedback received yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedback.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{item.user_name}</h3>
                    <RoleChip role={item.user_role} />
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <StarRating rating={item.rating} />
                </div>

                {/* Message */}
                <div className="mb-4 flex-grow">
                  <p className="text-slate-700 leading-relaxed">{item.message}</p>
                </div>

                {/* Date */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-10 text-center">
          <button
            onClick={fetchFeedback}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
