import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faArrowLeft, faHome } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import ListingCard from "../components/ListingCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link, useNavigate } from "react-router-dom";
import axios, { API_BASE_URL } from "../utils/axios";

// Add loading animation constants
const LOADING_MESSAGES = [
  "Finding your favorite places...",
  "Preparing your wishlist...",
  "Gathering your dream destinations...",
  "Almost there..."
];

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const navigate = useNavigate();

  const fetchWishlistItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to view your wishlist');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/wishlists', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('API Response:', response.data); // Debug the API response

      // Check various possible response formats
      let wishlistsData = [];

      if (response.data.success && Array.isArray(response.data.wishlists)) {
        wishlistsData = response.data.wishlists;
      } else if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        wishlistsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        wishlistsData = response.data;
      } else if (response.data.wishlists && Array.isArray(response.data.wishlists)) {
        wishlistsData = response.data.wishlists;
      } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
        // If it's just a direct object with listing data
        wishlistsData = [response.data];
      }

      // Process the wishlist data
      if (wishlistsData.length > 0) {
        const formattedListings = wishlistsData.map(item => {
          // Handle different data structures
          const listing = item.listing || item;
          if (!listing || !listing.id) return null;

          const rating = listing.average_rating ? parseFloat(listing.average_rating) :
            (listing.rating ? parseFloat(listing.rating) : 0);

          const totalRatings = listing.total_ratings ? parseInt(listing.total_ratings) :
            (listing.totalRatings ? parseInt(listing.totalRatings) : 0);

          return {
            ...listing,
            wishlist_id: item.id || listing.id,
            rating: rating,
            total_ratings: totalRatings,
            averageRating: rating,
            totalRatings: totalRatings
          };
        }).filter(Boolean);

        console.log('Formatted wishlist items:', formattedListings);

        setWishlistItems(formattedListings);
        setError(null); // Clear any previous errors
      } else {
        console.log('No wishlist items found in response');
        setWishlistItems([]);
        // No error, just an empty wishlist
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Use setTimeout to ensure the DOM has updated with the loading state before showing error
      setTimeout(() => {
        setError(error.response?.data?.message || 'Failed to load wishlist. Please try again later.');
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set a flag to check if component is mounted
    let isMounted = true;

    const initFetch = async () => {
      try {
        await fetchWishlistItems();
      } catch (error) {
        console.error('Initial wishlist fetch failed:', error);
        if (isMounted) {
          setError('Failed to load wishlist. Please refresh the page.');
        }
      }
    };

    initFetch();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  // Add loading message rotation
  useEffect(() => {
    if (!loading) return;

    let messageIndex = 0;
    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2000); // Change message every 2 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [loading]);

  const handleRemoveFromWishlist = async (listingId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to remove items from your wishlist');
        return;
      }

      // Find the wishlist item with this listing ID
      const wishlistItem = wishlistItems.find(item => item.id === listingId);
      if (!wishlistItem) {
        console.error('Wishlist item not found for listing ID:', listingId);
        return;
      }

      // Use the wishlist_id from the item to delete
      const wishlistId = wishlistItem.wishlist_id;
      if (!wishlistId) {
        console.error('No wishlist ID found for listing:', listingId);
        setError('Unable to remove from wishlist. Please try again.');
        return;
      }

      console.log(`Removing wishlist ID ${wishlistId} for listing ID ${listingId}`);

      const response = await axios.delete(`/api/wishlists/${wishlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 204) {
        // Remove the item from the local state
        setWishlistItems(prev => prev.filter(item => item.id !== listingId));
        // Clear any previous errors
        setError(null);
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError(error.response?.data?.message || 'Failed to remove item from wishlist. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full transition-all duration-300">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 relative overflow-hidden">
              {/* Animated Background Hearts */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                {[...Array(12)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faHeart}
                    className="absolute animate-pulse text-6xl"
                    style={{
                      top: `${Math.random() * 80 + 10}%`,
                      left: `${Math.random() * 80 + 10}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: '3s'
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 w-full max-w-lg bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-12 text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="relative inline-flex mb-8">
                  <LoadingSpinner size="large" color="#f43f5e" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FontAwesomeIcon icon={faHeart} className="text-rose-600/20 text-xl" />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{loadingMessage}</h3>
                <p className="text-gray-500 font-medium mb-8">Gathering your dreams...</p>

                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-10">
                  <div className="h-full bg-rose-500 rounded-full animate-[progress_2s_ease_infinite] w-1/2"></div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {["Paris", "Bali", "Tokyo", "Rome"].map((city, i) => (
                    <span key={i} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 150}s` }}>
                      <FontAwesomeIcon icon={faHeart} className="text-[10px]" />
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="wishlist-content">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-colors mb-2 text-xs uppercase tracking-widest group">
                    <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
                    Back to listings
                  </Link>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <FontAwesomeIcon icon={faHeart} className="text-rose-500" />
                    My Wishlist
                  </h1>
                </div>
                {wishlistItems.length > 0 && (
                  <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Saved Items</p>
                      <p className="text-xl font-black text-rose-500 leading-tight">{wishlistItems.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faHeart} />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-in shake-1">
                  <FontAwesomeIcon icon={faHeart} className="opacity-50" />
                  {error}
                </div>
              )}

              {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {wishlistItems.map((listing) => (
                    <div key={listing.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <ListingCard
                        listing={listing}
                        onRemoveFromWishlist={() => handleRemoveFromWishlist(listing.id)}
                        isInWishlist={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100 shadow-sm border-dashed border-2 max-w-2xl mx-auto animate-in zoom-in-95 duration-700">
                  <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                    <FontAwesomeIcon icon={faHeart} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Your wishlist is empty</h3>
                  <p className="text-gray-500 font-medium mb-10">Save your favorite places by clicking the heart icon on any listing.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
                  >
                    Browse Listings
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Wishlist;
