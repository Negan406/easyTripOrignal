import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from 'react-router-dom';
import ListingCard from "../components/ListingCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from 'prop-types';
import {
  faGlobe,
  faUmbrellaBeach,
  faCity,
  faMountain,
  faTree,
  faWater,
  faHouseChimney,
  faFire,
  faCampground,
  faSnowflake,
  faSun,
  faAnchor,
  faPlane,
  faHotel,
  faMapMarkedAlt,
  faCompass,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import axios, { API_BASE_URL } from "../utils/axios";


const categories = [
  { id: "all", name: "All", icon: faGlobe },
  { id: "beach-houses", name: "Beach Houses", icon: faUmbrellaBeach },
  { id: "city-apartments", name: "City Apartments", icon: faCity },
  { id: "mountain-cabins", name: "Mountain Cabins", icon: faMountain },
  { id: "forest-lodges", name: "Forest Lodges", icon: faTree },
  { id: "pools", name: "Pools", icon: faWater },
  { id: "luxury-villas", name: "Luxury Villas", icon: faHouseChimney },
  { id: "trending", name: "Trending", icon: faFire },
  { id: "camping", name: "Camping", icon: faCampground },
  { id: "arctic", name: "Arctic", icon: faSnowflake },
  { id: "desert", name: "Desert", icon: faSun },
  { id: "islands", name: "Islands", icon: faAnchor }
];

const Home = ({ searchTerm }) => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [clickedListingId, setClickedListingId] = useState(null);
  const [loadingIcons] = useState([faHotel, faPlane, faMapMarkedAlt, faCompass, faGlobe, faUmbrellaBeach]);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [wishlistNotification, setWishlistNotification] = useState(null);

  // Animation for loading icons
  useEffect(() => {
    if (loading || categoryLoading) {
      const iconInterval = setInterval(() => {
        setCurrentIconIndex(prevIndex => (prevIndex + 1) % loadingIcons.length);
      }, 1000);

      return () => clearInterval(iconInterval);
    }
  }, [loading, categoryLoading, loadingIcons]);

  // Progress bar animation
  useEffect(() => {
    if (loading) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Cap at 90% until actual data loads
          }
          return prev + 1;
        });
      }, 30);

      return () => clearInterval(progressInterval);
    }
  }, [loading]);

  // Fetch listings from API
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setLoadingProgress(0);

      try {
        const response = await axios.get('/api/listings');
        console.log('API Response:', response.data);

        if (response.data.success && Array.isArray(response.data.data)) {
          const formattedListings = response.data.data.map(listing => {
            const rating = listing.average_rating ? parseFloat(listing.average_rating) : 0;
            const totalRatings = parseInt(listing.total_ratings || 0);

            return {
              id: listing.id,
              title: listing.title,
              location: listing.location,
              price: parseFloat(listing.price),
              main_photo: listing.main_photo,
              description: listing.description,
              category: listing.category,
              status: listing.status,
              wishlist_id: listing.wishlist_id,
              host: listing.host,
              rating: rating,
              total_ratings: totalRatings
            };
          });

          console.log('Formatted listings with ratings:', formattedListings);

          setLoadingProgress(100);

          setTimeout(() => {
            setListings(formattedListings);
            setFilteredListings(formattedListings);
            setLoading(false);
          }, 500);
        } else {
          console.error("Invalid response format:", response.data);
          setListings([]);
          setFilteredListings([]);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
        setFilteredListings([]);
        setLoading(false);
      }
    };

    fetchListings();

    // Listen for rating updates
    const handleReviewUpdate = (event) => {
      const { listingId, averageRating, totalReviews } = event.detail;
      console.log('Updating rating for listing:', { listingId, averageRating, totalReviews });

      const updateListingRatings = (prevListings) =>
        prevListings.map(listing => {
          if (listing.id === parseInt(listingId)) {
            const newRating = parseFloat(averageRating);
            return {
              ...listing,
              rating: newRating,
              total_ratings: parseInt(totalReviews)
            };
          }
          return listing;
        });

      setListings(updateListingRatings);
      setFilteredListings(updateListingRatings);
    };

    window.addEventListener('reviewUpdated', handleReviewUpdate);

    return () => {
      window.removeEventListener('reviewUpdated', handleReviewUpdate);
    };
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      // No need to store users since we're not using them
      // Just keeping this effect to check role
    }
  }, [role]);

  // Update the filter logic
  useEffect(() => {
    let filtered = [...listings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }

    setFilteredListings(filtered);
  }, [searchTerm, listings, selectedCategory]);

  const handleFilterClick = (category) => {
    setCategoryLoading(true);
    setSelectedCategory(category);
    setTimeout(() => {
      setCategoryLoading(false);
    }, 800); // Increased for better visibility
  };

  const handleDeleteClick = (listingId) => {
    if (!isLoggedIn || role !== 'admin') {
      navigate('/login');
      return;
    }
    setDeleteConfirmation(listingId);
  };

  const handleConfirmDelete = async (listingId) => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('role');

      if (!token || role !== 'admin') {
        setShowSuccessMsg(false);
        setNotification({
          type: 'error',
          message: 'You must be an admin to delete listings'
        });
        return;
      }

      const response = await axios.delete(`/api/listings/${listingId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 204) {
        // Remove the deleted listing from both listings and filteredListings
        const updatedListings = listings.filter(listing => listing.id !== listingId);
        const updatedFilteredListings = filteredListings.filter(listing => listing.id !== listingId);

        setListings(updatedListings);
        setFilteredListings(updatedFilteredListings);

        setShowSuccessMsg(true);
        setTimeout(() => setShowSuccessMsg(false), 3000);
      } else {
        throw new Error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete listing. Please try again.'
      });
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmation(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Add a handler for wishlist notifications
  const handleWishlistNotification = (message, type) => {
    setWishlistNotification({ message, type });
    // Auto-close after 3 seconds
    setTimeout(() => {
      setWishlistNotification(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 pb-20">
        {showSuccessMsg && createPortal(
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl animate-in slide-in-from-top-4 duration-300">
            Listing deleted successfully!
          </div>,
          document.body
        )}

        {notification && createPortal(
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-xl shadow-xl animate-in slide-in-from-top-4 duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
            <div className="flex items-center gap-4">
              <span>{notification.message}</span>
              <button onClick={() => setNotification(null)} className="hover:opacity-75 transition-opacity">×</button>
            </div>
          </div>,
          document.body
        )}

        {wishlistNotification && createPortal(
          <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300 ${wishlistNotification.type === 'error' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border border-gray-100'}`}>
            <div className="flex items-center gap-4">
              <span className="font-medium">{wishlistNotification.message}</span>
              <button onClick={() => setWishlistNotification(null)} className="hover:opacity-75 transition-opacity">×</button>
            </div>
          </div>,
          document.body
        )}

        {/* Categories Bar */}
        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 -mx-4 px-4 md:-mx-10 md:px-10 lg:-mx-20 lg:px-20 mb-8">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`flex flex-col items-center gap-2 min-w-fit group transition-all duration-300 border-b-2 py-2 ${selectedCategory === category.id ? "border-gray-900 opacity-100" : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-200"}`}
                onClick={() => handleFilterClick(category.id)}
              >
                <FontAwesomeIcon icon={category.icon} className={`text-xl transition-transform group-hover:scale-110 ${selectedCategory === category.id ? "scale-110" : ""}`} />
                <span className={`text-xs font-semibold whitespace-nowrap ${selectedCategory === category.id ? "text-gray-900" : "text-gray-500"}`}>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                  <FontAwesomeIcon icon={loadingIcons[currentIconIndex]} className="text-2xl animate-bounce" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Discovering amazing stays...</h3>
              <p className="text-gray-500 mb-8">Finding the perfect getaways just for you</p>
              <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="listings-grid-container">
              {categoryLoading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">Updating results...</p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <FontAwesomeIcon icon={faCompass} className="text-4xl text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No listings found</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">We couldn&apos;t find any properties matching your current criteria. Try adjusting your filters.</p>
                  <button onClick={() => setSelectedCategory("all")} className="mt-6 px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Clear all filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 animate-in fade-in duration-500">
                  {filteredListings.map((listing, index) => (
                    <div
                      key={listing.id}
                      className={`relative group transition-all duration-500 ${clickedListingId === listing.id ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}`}
                      onClick={() => {
                        setClickedListingId(listing.id);
                        setTimeout(() => {
                          navigate(`/listing/${listing.id}`);
                        }, 500);
                      }}
                    >
                      <ListingCard
                        listing={listing}
                        onWishlistUpdate={(message, type) => handleWishlistNotification(message, type)}
                      />
                      {isLoggedIn && role === 'admin' && (
                        <button
                          className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-red-600 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(listing.id);
                          }}
                          disabled={deleteLoading}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {deleteConfirmation && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelDelete}></div>
          <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">Are you absolutely sure you want to delete this listing? This action cannot be undone and will remove all associated data.</p>
            <div className="flex gap-4">
              <button
                className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3.5 px-6 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                onClick={() => handleConfirmDelete(deleteConfirmation)}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

Home.propTypes = {
  searchTerm: PropTypes.string,
};

export default Home;