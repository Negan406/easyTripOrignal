import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMapMarkerAlt, faClock } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import Notification from "../components/Notification";
import ConfirmationModal from "../components/ConfirmationModal";
import LoadingSpinner from "../components/LoadingSpinner";
import axios, { API_BASE_URL } from "../utils/axios";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/800x600?text=No+Image+Available';

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
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get('/api/bookings');

        if (response.data && response.data.data) {
          setTrips(response.data.data);
        } else {
          setTrips([]);
        }
      } catch (error) {
        console.error("Failed to load trips:", error);
        setNotification({
          message: error.message === 'Authentication required'
            ? 'Please log in to view your trips'
            : 'Failed to load your trips. Please try again.',
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleDeleteTrip = async (bookingId) => {
    try {
      const booking = trips.find(trip => trip.id === bookingId);
      if (booking?.payment_status === "completed") {
        setNotification({ message: "Cannot cancel a completed booking.", type: "error" });
        return;
      }
      setTripToDelete(bookingId);
      setShowModal(true);
    } catch (error) {
      console.error('Error handling delete:', error);
      setNotification({ message: "Failed to process deletion.", type: "error" });
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      await axios.delete(`/api/bookings/${tripToDelete}`);

      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripToDelete));
      setNotification({ message: "Trip cancelled successfully!", type: "success" });
    } catch (error) {
      console.error('Error deleting trip:', error);
      setNotification({ message: "Failed to cancel trip. Please try again.", type: "error" });
    } finally {
      setShowModal(false);
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
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Trips</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your upcoming and past travel adventures</p>
          </div>

          {notification && (
            <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-8 duration-300">
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={closeNotification}
              />
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
              <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
              <div className="relative z-10 w-full max-w-sm">
                <ConfirmationModal
                  message="Are you sure you want to cancel this trip?"
                  onConfirm={confirmDelete}
                  onCancel={() => setShowModal(false)}
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="large" color="#2563eb" />
            </div>
          ) : (
            <div className="trips-list">
              {!trips || trips.length === 0 ? (
                <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100 shadow-sm border-dashed border-2 max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No trips yet</h3>
                  <p className="text-gray-500 font-medium mb-10">Time to dust off your bags and start planning your next adventure.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
                  >
                    Start Searching
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {trips.map((trip) => {
                    const paymentStatus = trip.payment_status || 'pending';
                    const isCompleted = paymentStatus === 'completed';

                    return (
                      <div key={trip.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/40 transition-all group flex flex-col relative">
                        <div className="absolute top-4 right-4 z-10">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${isCompleted ? 'bg-emerald-500/90 text-white' :
                            paymentStatus === 'cancelled' ? 'bg-rose-500/90 text-white' :
                              'bg-amber-500/90 text-white'
                            }`}>
                            {paymentStatus}
                          </span>
                        </div>

                        {isCompleted ? (
                          <div className="relative h-52 overflow-hidden shrink-0">
                            <img
                              src={getImageUrl(trip.listing?.main_photo)}
                              alt={trip.listing?.title || "Trip Image"}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                        ) : (
                          <div className="h-4 p-4 shrink-0"></div>
                        )}

                        <div className="p-6 pt-2 flex-1 flex flex-col">
                          <h3 className="text-xl font-black text-gray-900 mb-6 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {trip.listing?.title || "Unknown Location"}
                          </h3>

                          <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-transparent group-hover:border-gray-100 transition-colors">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 border border-gray-100 shadow-sm">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-sm" />
                              </div>
                              <p className="text-sm font-bold text-gray-600 truncate">{trip.listing?.location || "Location unavailable"}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-center gap-4">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-400 text-lg" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Duration</span>
                                  <span className="text-xs font-black text-blue-900">
                                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between px-2 pt-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Price</span>
                              <span className="text-xl font-black text-gray-900">${parseFloat(trip.total_price || 0).toFixed(2)}</span>
                            </div>
                          </div>

                          {!isCompleted && paymentStatus !== 'cancelled' && (
                            <button
                              onClick={() => handleDeleteTrip(trip.id)}
                              className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-100 transition-all active:scale-95 border border-rose-100 mt-auto flex items-center justify-center gap-2 group/cancel"
                            >
                              <FontAwesomeIcon icon={faTimes} className="text-[10px] group-hover/cancel:rotate-90 transition-transform" />
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Trips;
