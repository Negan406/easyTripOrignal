import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios, { API_BASE_URL } from '../utils/axios';
import LoadingSpinner from "../components/LoadingSpinner";
import Sidebar from "../components/Sidebar";

const ManageListings = () => {
  const [listings, setListings] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/300x200?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.includes('storage/') || imageUrl.startsWith('listings/')) {
      const cleanPath = imageUrl.replace('storage/', '').replace(/^\/+/, '');
      return `${API_BASE_URL}/storage/${cleanPath}`;
    }
    const cleanPath = imageUrl.replace(/^\/+/, '');
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/listings/user');

      if (response.data.success) {
        setListings(response.data.listings);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to fetch listings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`/api/listings/${listingId}`);

      if (response.data.success) {
        setListings(listings.filter(listing => listing.id !== listingId));
        setNotification({
          type: 'success',
          message: 'Listing deleted successfully'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete listing'
      });
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const handleModify = (id) => {
    navigate(`/edit-listing/${id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50/50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="large" color="#2563eb" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full transition-all duration-300">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Your Listings</h1>
              <p className="text-gray-500 font-medium mt-1">Edit, update or remove your property listings</p>
            </div>
            <button
              onClick={() => navigate('/add-listing')}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 group"
            >
              <i className="fas fa-plus text-xs group-hover:rotate-90 transition-transform"></i>
              Add New Listing
            </button>
          </div>

          {notification && (
            <div className={`mb-8 p-4 rounded-2xl text-sm flex items-center justify-between gap-3 animate-in slide-in-from-top-2 shadow-sm border ${notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
              <div className="flex items-center gap-3 font-semibold">
                <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {notification.message}
              </div>
              <button onClick={() => setNotification(null)} className="text-current opacity-60 hover:opacity-100 transition-opacity">
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {listings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-gray-100 shadow-sm border-dashed border-2">
              <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                <i className="fas fa-house-user"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900">No listings found</h3>
              <p className="text-gray-500 mt-2 mb-8">You haven&apos;t created any property listings yet.</p>
              <button
                onClick={() => navigate('/add-listing')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={getImageUrl(listing.main_photo)}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/300x200?text=No+Image';
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${listing.status === 'approved' ? 'bg-emerald-500/90 text-white' :
                        listing.status === 'pending' ? 'bg-amber-500/90 text-white' :
                          'bg-rose-500/90 text-white'
                        }`}>
                        {listing.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{listing.title}</h3>
                      <p className="text-gray-500 text-sm font-medium flex items-center gap-1.5 mt-1">
                        <i className="fas fa-map-marker-alt text-blue-500 text-xs text-opacity-70"></i>
                        {listing.location}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-50">
                      <div>
                        <span className="text-base font-black text-gray-900">${listing.price}</span>
                        <span className="text-xs font-bold text-gray-400 ml-1">/ night</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => handleModify(listing.id)}
                        className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95 border border-transparent hover:border-blue-100"
                      >
                        <i className="fas fa-edit mr-2"></i> Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation(listing.id)}
                        className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 border border-rose-100"
                      >
                        <i className="fas fa-trash-alt mr-2"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDeleteConfirmation(null)}></div>
            <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 fade-in duration-300">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Confirm Delete</h3>
              <p className="text-gray-500 text-center font-medium mb-8">Are you sure you want to delete this listing? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3.5 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95"
                  onClick={() => setDeleteConfirmation(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3.5 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95"
                  onClick={() => handleDelete(deleteConfirmation)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageListings;
