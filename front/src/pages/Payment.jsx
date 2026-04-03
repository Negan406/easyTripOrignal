import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faUser, faUsers, faCalendarAlt, faMapMarkerAlt, faLock, faShieldAlt, faArrowLeft, faCheckCircle, faBell } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";

const Payment = () => {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  });
  const [guestName, setGuestName] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { listing, booking } = location.state || {};

  // Check availability when component mounts
  useEffect(() => {
    if (listing && booking) {
      checkDateAvailability();
    }
  }, []);

  const checkDateAvailability = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      setNotification({ message: 'You must be logged in to complete payment.', type: 'error' });
      return false;
    }

    setCheckingAvailability(true);

    try {
      // Format dates to match backend expectations (YYYY-MM-DD)
      const formattedStartDate = booking.startDate.split('T')[0];
      const formattedEndDate = booking.endDate.split('T')[0];

      const response = await axios.post(
        `/api/bookings/check-availability/${listing.id}`,
        {
          start_date: formattedStartDate,
          end_date: formattedEndDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success || !response.data.is_available) {
        setNotification({
          message: 'These dates are no longer available. Please choose different dates.',
          type: 'error'
        });

        // Redirect back to the listing page after 3 seconds
        setTimeout(() => {
          navigate(`/listing/${listing.id}`);
        }, 3000);

        return false;
      }

      return true;
    } catch (error) {
      console.error('Availability check error:', error);
      setNotification({
        message: 'Error checking date availability. Please try again.',
        type: 'error'
      });
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      setNotification({ message: 'You must be logged in to complete payment.', type: 'error' });
      return;
    }

    // Validate dates
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setNotification({ message: 'Check-in date cannot be in the past.', type: 'error' });
      return;
    }

    if (endDate <= startDate) {
      setNotification({ message: 'Check-out date must be after check-in date.', type: 'error' });
      return;
    }

    // Check if dates are still available
    const isAvailable = await checkDateAvailability();
    if (!isAvailable) {
      return;
    }

    setLoading(true);

    try {
      // Configure axios with the auth token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Format dates to match backend expectations (YYYY-MM-DD)
      const formattedStartDate = booking.startDate.split('T')[0];
      const formattedEndDate = booking.endDate.split('T')[0];

      // Create the booking
      const response = await axios.post('/api/bookings', {
        listing_id: listing.id,
        start_date: formattedStartDate,
        end_date: formattedEndDate
      });

      if (response.data && response.data.success) {
        setNotification({
          message: response.data.message || 'Booking successful!',
          type: 'success'
        });

        // Redirect back to the listing page after successful booking
        setTimeout(() => {
          navigate(`/listing/${listing.id}`, {
            state: {
              bookingSuccess: true,
              message: 'Booking completed successfully! We hope you enjoy your stay. Don\'t forget to leave a review after your visit.',
              scrollToReviews: true
            }
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);

      // Handle 409 Conflict (dates not available)
      if (error.response && error.response.status === 409) {
        setNotification({
          message: 'These dates are no longer available. Please choose different dates.',
          type: 'error'
        });

        // Redirect back to the listing page after 3 seconds
        setTimeout(() => {
          navigate(`/listing/${listing.id}`);
        }, 3000);
      } else {
        const errorMessage = error.response?.data?.message
          || error.response?.data?.error
          || 'Failed to create booking. Please try again.';

        setNotification({
          message: errorMessage,
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  if (!listing || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6">
        <div className="bg-white rounded-[40px] px-10 py-12 text-center max-w-md shadow-2xl animate-in zoom-in-95">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Error</h3>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">Booking information not found. Please try again from the listing page.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
          >
            Go Back
          </button>
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
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-colors mb-2 text-xs uppercase tracking-widest group"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Confirm & Pay</h1>
              <p className="text-gray-500 font-medium mt-1">Review your booking and complete the payment.</p>
            </div>
          </div>

          {notification && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
              <div className="flex items-center gap-3 font-semibold">
                <FontAwesomeIcon icon={notification.type === 'success' ? faCheckCircle : faBell} className="opacity-50" />
                {notification.message}
              </div>
              <button onClick={closeNotification} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors">×</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
            {/* Payment Section */}
            <div className="lg:col-span-7 space-y-10">
              {/* Trip Summary Section */}
              <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Trip</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dates</p>
                        <p className="font-bold text-gray-900">{booking.startDate} – {booking.endDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={faUsers} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guests</p>
                        <p className="font-bold text-gray-900">{guestCount} traveler{guestCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100 space-y-6">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Traveler Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          required
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Number of Guests</label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUsers} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="number"
                          placeholder="1"
                          value={guestCount}
                          onChange={(e) => setGuestCount(e.target.value)}
                          min="1"
                          required
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payment Method</h2>
                  <div className="flex gap-2">
                    <div className="w-10 h-6 bg-gray-100 rounded shadow-sm flex items-center justify-center text-[10px] font-black text-gray-400">VISA</div>
                    <div className="w-10 h-6 bg-gray-100 rounded shadow-sm flex items-center justify-center text-[10px] font-black text-gray-400">MC</div>
                  </div>
                </div>

                {checkingAvailability ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-pulse">
                    <div className="w-12 h-12 bg-blue-50 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Checking Availability...</p>
                  </div>
                ) : (
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cardholder Name</label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="text"
                          name="cardHolderName"
                          placeholder="Name as it appears on card"
                          value={paymentDetails.cardHolderName}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Card Number</label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faCreditCard} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="text"
                          name="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={paymentDetails.cardNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiration</label>
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={paymentDetails.expiryDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CVV</label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faLock} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                          <input
                            type="text"
                            name="cvv"
                            placeholder="123"
                            value={paymentDetails.cvv}
                            onChange={handleInputChange}
                            required
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50">
                      <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl mb-8">
                        <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 mt-1" />
                        <div>
                          <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">Secure Payment</p>
                          <p className="text-xs font-medium text-blue-700 leading-relaxed">Your payment information is encrypted and protected by our secure processing system.</p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || checkingAvailability}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-2xl shadow-blue-600/20 disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Pay Now – ${listing.price} / night
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar Summary Section */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-8">
                <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex gap-6 mb-8 pb-8 border-b border-gray-100">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md">
                      <img src={listing.main_photo ? (listing.main_photo.startsWith('http') ? listing.main_photo : `${axios.defaults.baseURL}/storage/${listing.main_photo}`) : 'https://via.placeholder.com/150'} alt={listing.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{listing.category?.replace('-', ' ')}</p>
                      <h3 className="text-lg font-black text-gray-900 leading-tight mb-2">{listing.title}</h3>
                      <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                        {listing.location}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Price Details</h4>
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Price per night</span>
                      <span className="text-gray-900">${listing.price}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Service fee</span>
                      <span className="text-gray-900">$0.00</span>
                    </div>
                    <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-lg font-black text-gray-900">Total (USD)</span>
                      <span className="text-2xl font-black text-blue-600">${listing.price}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-emerald-50 rounded-[32px] flex items-center gap-4 border border-emerald-100">
                  <div className="w-10 h-10 bg-white text-emerald-500 rounded-2xl flex items-center justify-center shadow-sm">
                    <FontAwesomeIcon icon={faShieldAlt} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">EasyTrip Protection</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Worry-free booking guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;