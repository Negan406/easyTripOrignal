import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import ListingCard from '../components/ListingCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from '../utils/axios';
import Sidebar from '../components/Sidebar';

const PendingListings = () => {
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [processing, setProcessing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPendingListings();
  }, [navigate]);

  const fetchPendingListings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/listings/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        // Format listings to include consistent rating property names
        const formattedListings = (response.data.listings || []).map(listing => {
          const rating = listing.average_rating ? parseFloat(listing.average_rating) :
            (listing.rating ? parseFloat(listing.rating) : 0);

          const totalRatings = listing.total_ratings ? parseInt(listing.total_ratings) :
            (listing.totalRatings ? parseInt(listing.totalRatings) : 0);

          return {
            ...listing,
            rating: rating,
            total_ratings: totalRatings,
            averageRating: rating,
            totalRatings: totalRatings
          };
        });

        setPendingListings(formattedListings);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching pending listings:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load pending listings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (listing) => {
    setProcessing(listing.id);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`/api/listings/${listing.id}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setPendingListings(current => current.filter(item => item.id !== listing.id));
        setNotification({
          type: 'success',
          message: `"${listing.title}" has been approved successfully`
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to approve listing'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (listing) => {
    setProcessing(listing.id);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`/api/listings/${listing.id}/reject`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setPendingListings(current => current.filter(item => item.id !== listing.id));
        setNotification({
          type: 'info',
          message: `"${listing.title}" has been rejected`
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to reject listing'
      });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full transition-all duration-300">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Pending Listings</h1>
            <p className="text-gray-500 font-medium mt-1">Review and approve new property submissions</p>
          </div>

          {notification && (
            <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-8 duration-300">
              <Notification
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(null)}
              />
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="large" color="#2563eb" />
            </div>
          ) : (
            <div className="pending-content">
              {pendingListings.length === 0 ? (
                <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100 shadow-sm border-dashed border-2">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">All Caught Up!</h3>
                  <p className="text-gray-500 font-medium">There are no pending listings to review at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pendingListings.map(listing => (
                    <div key={listing.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/40 transition-all group flex flex-col">
                      <div className="relative shrink-0">
                        <ListingCard listing={listing} />
                      </div>

                      <div className="p-6 pt-0 mt-auto bg-white">
                        <div className="flex gap-3 pt-4 border-t border-gray-50">
                          <button
                            className={`flex-[2] py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn ${processing === listing.id ? 'opacity-70 cursor-wait' : ''
                              }`}
                            onClick={() => handleApprove(listing)}
                            disabled={processing !== null}
                          >
                            {processing === listing.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                            )}
                            Approve
                          </button>
                          <button
                            className={`flex-1 py-3.5 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 border border-rose-100 flex items-center justify-center gap-2 group/btn ${processing === listing.id ? 'opacity-70 cursor-wait' : ''
                              }`}
                            onClick={() => handleReject(listing)}
                            disabled={processing !== null}
                          >
                            <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                            Reject
                          </button>
                        </div>
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

export default PendingListings;
