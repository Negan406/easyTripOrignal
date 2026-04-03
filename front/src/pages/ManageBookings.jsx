import { useState, useEffect } from "react";
import Notification from "../components/Notification";
import LoadingSpinner from "../components/LoadingSpinner";
import axios, { API_BASE_URL } from "../utils/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/800x600?text=No+Image+Available';

    // If it's already a full URL
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // For storage paths
    if (imageUrl.includes('storage/') || imageUrl.startsWith('profiles/') || imageUrl.startsWith('listings/')) {
      const cleanPath = imageUrl
        .replace('storage/', '')  // Remove 'storage/' if present
        .replace(/^\/+/, '');     // Remove leading slashes
      return `${API_BASE_URL}/storage/${cleanPath}`;
    }

    // For any other case, assume it's a relative path in storage
    const cleanPath = imageUrl.replace(/^\/+/, '');
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  useEffect(() => {
    const fetchHostBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get('/api/bookings/host');

        if (response.data && response.data.data) {
          setBookings(response.data.data);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("Error loading bookings:", error);
        setNotification({
          message: error.response?.status === 404
            ? 'No bookings found for your listings'
            : error.message === 'Authentication required'
              ? 'Please log in to view your listings\' bookings'
              : 'Failed to load bookings. Please try again.',
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHostBookings();
  }, []);

  const handleAcceptBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      await axios.post(`/api/bookings/${bookingId}/accept`);

      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'accepted' }
            : booking
        )
      );

      setNotification({ message: 'Booking accepted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error accepting booking:', error);
      setNotification({
        message: error.response?.data?.message || 'Failed to accept booking. Please try again.',
        type: 'error'
      });
    }
  };

  const handleRefuseBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      await axios.post(`/api/bookings/${bookingId}/refuse`);

      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'refused' }
            : booking
        )
      );

      setNotification({ message: 'Booking refused successfully!', type: 'success' });
    } catch (error) {
      console.error('Error refusing booking:', error);
      setNotification({
        message: error.response?.data?.message || 'Failed to refuse booking. Please try again.',
        type: 'error'
      });
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full transition-all duration-300">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {notification && (
            <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-8 duration-300">
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={closeNotification}
              />
            </div>
          )}

          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Listing Bookings</h1>
            <p className="text-gray-500 font-medium mt-1">Review and manage check-in requests for your properties</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="large" color="#2563eb" />
            </div>
          ) : (
            <div className="bookings-content">
              {!bookings || bookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-gray-100 shadow-sm border-dashed border-2">
                  <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">No bookings yet</h3>
                  <p className="text-gray-500 mt-2 font-medium">When guests book your listings, they will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group flex flex-col">
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={getImageUrl(booking.listing?.main_photo)}
                          alt={booking.listing?.title || 'Listing'}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/300x200?text=No+Image';
                          }}
                        />
                        <div className="absolute top-4 right-4">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${booking.payment_status === 'completed' ? 'bg-emerald-500/90 text-white' :
                            booking.payment_status === 'refused' ? 'bg-rose-500/90 text-white' :
                              'bg-amber-500/90 text-white'
                            }`}>
                            {booking.payment_status || 'pending'}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {booking.listing?.title || 'Listing not available'}
                        </h3>

                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 border border-gray-100 shadow-sm">
                              <FontAwesomeIcon icon={faUser} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guest</p>
                              <p className="text-sm font-bold text-gray-900">{booking.user?.name || 'Anonymous'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-50">
                              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Check-in</p>
                              <p className="text-xs font-black text-blue-900">{formatDate(booking.start_date)}</p>
                            </div>
                            <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-50">
                              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Check-out</p>
                              <p className="text-xs font-black text-indigo-900">{formatDate(booking.end_date)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-6 px-1">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Price</span>
                          <span className="text-2xl font-black text-gray-900">${parseFloat(booking.total_price || 0).toFixed(2)}</span>
                        </div>

                        {booking.payment_status === 'pending' && (
                          <div className="flex gap-3 mt-auto">
                            <button
                              onClick={() => handleAcceptBooking(booking.id)}
                              className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRefuseBooking(booking.id)}
                              className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 border border-rose-100"
                            >
                              Refuse
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageBookings;