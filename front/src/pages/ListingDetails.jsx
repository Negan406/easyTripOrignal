import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Comments from "../components/Comments";
import Notification from "../components/Notification";
import axios, { API_BASE_URL } from "../utils/axios";

const ListingDetails = () => {
  const [listing, setListing] = useState(null);
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [areSelectedDatesAvailable, setAreSelectedDatesAvailable] = useState(true);
  const [unavailableDateRanges, setUnavailableDateRanges] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const reviewsRef = useRef(null);
  const [highlightReviewForm, setHighlightReviewForm] = useState(false);

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
    const fetchListing = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/listings/${id}`);
        console.log('API Response:', response.data); // Debug log

        if (response.data && response.data.listing) {
          const listingData = response.data.listing;

          // Format the listing data
          const formattedListing = {
            id: listingData.id,
            title: listingData.title,
            description: listingData.description,
            location: listingData.location,
            price: parseFloat(listingData.price),
            mainPhoto: listingData.main_photo,
            photos: listingData.photos?.map(photo => photo.photo_url) || [],
            category: listingData.category,
            host: listingData.host,
            status: listingData.status,
            averageRating: listingData.average_rating ? parseFloat(listingData.average_rating) : 0,
            totalRatings: listingData.total_ratings ? parseInt(listingData.total_ratings) : 0
          };

          setListing(formattedListing);
          // Set the main photo as the initially selected photo
          setSelectedPhoto(getImageUrl(listingData.main_photo));
        } else {
          console.error("Invalid response format:", response.data);
          setNotification({
            message: 'Error: Listing not found',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        setNotification({
          message: 'Error loading listing details. Please try again later.',
          type: 'error'
        });
      } finally {
        // Add a small delay to ensure the spinner is visible
        setTimeout(() => {
          setLoading(false);
        }, 200); // Increased delay for better visibility
      }
    };

    fetchListing();

    // Check if the listing is already booked by the current user
    const checkBookingStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await axios.get(`/api/bookings/check/${id}`);

        setIsAlreadyBooked(response.data.isBooked);
      } catch (error) {
        console.error('Error checking booking status:', error);
      }
    };

    if (localStorage.getItem('isLoggedIn') === 'true') {
      checkBookingStatus();
    }
  }, [id]);

  // Check date availability when both dates are selected
  useEffect(() => {
    if (startDate && endDate && listing) {
      checkDateAvailability();
    }
  }, [startDate, endDate]);

  const checkDateAvailability = async () => {
    if (!startDate || !endDate || !listing) return;

    setCheckingAvailability(true);

    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        `/api/bookings/check-availability/${id}`,
        {
          start_date: startDate,
          end_date: endDate
        }
      );

      if (response.data.success) {
        setAreSelectedDatesAvailable(response.data.is_available);

        if (!response.data.is_available) {
          setUnavailableDateRanges(response.data.unavailable_dates);
          setNotification({
            message: 'Selected dates are not available. Please choose different dates.',
            type: 'warning'
          });
        }
      }
    } catch (error) {
      console.error('Error checking date availability:', error);
      setNotification({
        message: 'Error checking date availability. Please try again.',
        type: 'error'
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    // Reset availability status when date changes
    setAreSelectedDatesAvailable(true);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    // Reset availability status when date changes
    setAreSelectedDatesAvailable(true);
  };

  const handleBookNow = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) {
      setNotification({ message: 'Please log in to book this listing.', type: 'error' });
      return;
    }

    if (isAlreadyBooked) {
      setNotification({ message: 'This listing is already booked by you.', type: 'error' });
      return;
    }

    if (!startDate || !endDate) {
      setNotification({ message: 'Please select both check-in and check-out dates.', type: 'error' });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setNotification({ message: 'Check-in date cannot be in the past.', type: 'error' });
      return;
    }

    if (end <= start) {
      setNotification({ message: 'Check-out date must be after check-in date.', type: 'error' });
      return;
    }

    // Check availability before proceeding to payment
    try {
      setCheckingAvailability(true);

      const response = await axios.post(
        `/api/bookings/check-availability/${id}`,
        {
          start_date: startDate,
          end_date: endDate
        }
      );

      if (response.data.success && response.data.is_available) {
        // If dates are available, proceed to payment
        navigate('/payment', {
          state: {
            listing,
            booking: {
              startDate,
              endDate
            }
          }
        });
      } else {
        // If dates are not available, show error message
        setAreSelectedDatesAvailable(false);
        setUnavailableDateRanges(response.data.unavailable_dates || []);
        setNotification({
          message: 'Selected dates are not available. Please choose different dates.',
          type: 'warning'
        });
      }
    } catch (error) {
      console.error('Error checking date availability:', error);
      setNotification({
        message: 'Error checking date availability. Please try again.',
        type: 'error'
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  // Format unavailable date ranges for display
  const formatUnavailableDates = () => {
    if (unavailableDateRanges.length === 0) return '';

    return unavailableDateRanges.map((range, index) => {
      const start = new Date(range.start_date).toLocaleDateString();
      const end = new Date(range.end_date).toLocaleDateString();
      return `${start} to ${end}${index < unavailableDateRanges.length - 1 ? ', ' : ''}`;
    }).join('');
  };

  // Create array of unique photos with proper URLs
  const allPhotos = listing ? Array.from(new Set([
    getImageUrl(listing.mainPhoto),
    ...listing.photos.map(photo => getImageUrl(photo))
  ])).filter(Boolean) : [];

  // Get success message from navigation state if available
  useEffect(() => {
    if (location.state && location.state.bookingSuccess) {
      setNotification({
        message: location.state.message,
        type: 'success'
      });

      // Highlight the review form if redirected from a successful booking
      setHighlightReviewForm(true);

      // Scroll to reviews section if requested
      if (location.state.scrollToReviews && reviewsRef.current) {
        setTimeout(() => {
          reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
      }

      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Add listener for rating updates
  useEffect(() => {
    const handleReviewUpdate = (event) => {
      const { listingId, averageRating, totalReviews } = event.detail;

      if (parseInt(listingId) === parseInt(id) && listing) {
        setListing(prevListing => ({
          ...prevListing,
          averageRating: parseFloat(averageRating),
          totalRatings: parseInt(totalReviews)
        }));
      }
    };

    window.addEventListener('reviewUpdated', handleReviewUpdate);

    return () => {
      window.removeEventListener('reviewUpdated', handleReviewUpdate);
    };
  }, [id, listing]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 animate-in fade-in duration-700">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-600">
            <i className="fas fa-home text-2xl animate-bounce"></i>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Preparing your stay...</h3>
        <p className="text-gray-500">Finding all the details for this property</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-exclamation-triangle text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Listing not found</h3>
        <p className="text-gray-500 mb-6">The getaway you&apos;re looking for might have been moved or doesn&apos;t exist.</p>
        <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <main className="max-w-[1280px] mx-auto px-4 md:px-10 lg:px-20 pt-8 pb-20">
        {/* Gallery Section */}
        <div className="mb-10">
          <div className="relative w-full rounded-3xl overflow-hidden bg-gray-100 shadow-xl group mb-4" style={{ maxHeight: '520px' }}>
            <img
              src={selectedPhoto || getImageUrl(listing.mainPhoto)}
              alt={listing.title}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ height: '480px', objectFit: 'cover' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent group-hover:opacity-0 transition-opacity duration-300"></div>
          </div>

          {allPhotos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {allPhotos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => handlePhotoClick(photo)}
                  className={`relative flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedPhoto === photo
                      ? 'border-blue-500 ring-2 ring-blue-500/30 scale-[0.97]'
                      : 'border-transparent hover:border-gray-300 hover:scale-[0.97]'
                    }`}
                  style={{ width: '100px', height: '72px' }}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  {selectedPhoto === photo && (
                    <div className="absolute inset-0 bg-blue-600/10" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
          {/* Left Column: Info */}
          <div className="flex-grow space-y-12">
            <div className="border-b border-gray-100 pb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 font-semibold">
                <div className="flex items-center gap-2 text-gray-900">
                  <i className="fas fa-map-marker-alt text-blue-600"></i>
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-tag"></i>
                  <span>{listing.category}</span>
                </div>
                {listing.averageRating > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    <i className="fas fa-star text-[10px]"></i>
                    <span>{listing.averageRating.toFixed(1)} ({listing.totalRatings} Reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {listing.host && (
              <div className="flex items-start gap-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                <div className="relative flex-shrink-0">
                  <img
                    src={getImageUrl(listing.host.profile_photo)}
                    alt={listing.host.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] border-2 border-white">
                    <i className="fas fa-check"></i>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Hosted by {listing.host.name}</h3>
                  {listing.host.bio && <p className="text-gray-600 leading-relaxed max-w-2xl">{listing.host.bio}</p>}
                  {listing.host.phone && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-bold">
                      <i className="fas fa-phone"></i>
                      <span>{listing.host.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">About this place</h3>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{listing.description}</p>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <Comments
                listingId={id.toString()}
                userName={localStorage.getItem('userName')}
                isLoggedIn={localStorage.getItem('isLoggedIn') === 'true'}
                highlightReviewForm={highlightReviewForm}
                initialRating={listing?.averageRating || 0}
                initialReviewCount={listing?.totalRatings || 0}
                key={`reviews-${id}`}
              />
            </div>
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:w-[400px] flex-shrink-0">
            <div className="sticky top-28 bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl shadow-gray-100/50">
              <div className="flex items-baseline justify-between mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">${listing.price}</span>
                  <span className="text-gray-500 font-semibold">/ night</span>
                </div>
              </div>

              <form onSubmit={handleBookNow} className="space-y-6">
                <div className="grid grid-cols-2 gap-px bg-gray-300 border border-gray-300 rounded-2xl overflow-hidden">
                  <div className="bg-white p-4">
                    <label className="block text-[10px] font-bold text-gray-900 uppercase mb-1">Check-in</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full text-sm font-semibold outline-none bg-transparent"
                    />
                  </div>
                  <div className="bg-white p-4 border-l border-gray-300">
                    <label className="block text-[10px] font-bold text-gray-900 uppercase mb-1">Check-out</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      required
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full text-sm font-semibold outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white border border-gray-300 rounded-2xl">
                  <label className="block text-[10px] font-bold text-gray-900 uppercase mb-1">Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    defaultValue="1"
                    placeholder="Number of guests"
                    required
                    className="w-full text-sm font-semibold outline-none bg-transparent"
                  />
                </div>

                {!areSelectedDatesAvailable && unavailableDateRanges.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 space-y-1">
                    <p className="font-bold flex items-center gap-2">
                      <i className="fas fa-calendar-times"></i>
                      Dates Not Available
                    </p>
                    <p className="opacity-80">Unavailable: {formatUnavailableDates()}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAlreadyBooked || checkingAvailability || !areSelectedDatesAvailable}
                  className={`w-full py-4 rounded-2xl text-lg font-bold shadow-xl transition-all active:scale-[0.98] ${isAlreadyBooked || !areSelectedDatesAvailable
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                    }`}
                >
                  {isAlreadyBooked
                    ? 'Already Booked'
                    : checkingAvailability
                      ? 'Checking...'
                      : !areSelectedDatesAvailable
                        ? 'Dates Taken'
                        : 'Book Your Stay'}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-1">
                  <i className="fas fa-shield-alt text-blue-500/50"></i>
                  <span>Secure Payment</span>
                </div>
                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                <div className="flex items-center gap-1">
                  <i className="fas fa-leaf text-green-500/50"></i>
                  <span>Eco-Friendly</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex gap-4">
              <i className="fas fa-info-circle text-blue-500 mt-1"></i>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                To protect your payment, never transfer money or communicate outside of the EasyTrip website or app.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListingDetails;