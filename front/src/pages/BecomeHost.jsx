import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import HostRegistrationModal from "../components/HostRegistrationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from 'react-router-dom';
import Notification from "../components/Notification";
import AOS from 'aos';
import 'aos/dist/aos.css';
import im1 from "../pages/announce-advertisement-poster-background-illustration-free-vector.jpg";
import im2 from "../pages/th.jpeg";
import im3 from "../pages/ge.png";
import im4 from "../pages/tr.webp";


const BecomeHost = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    location: '',
    price: '',
    photo: '',
    description: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing({ ...newListing, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save the new listing to localStorage or send it to a backend
    const listings = JSON.parse(localStorage.getItem('listings')) || [];
    listings.push(newListing);
    localStorage.setItem('listings', JSON.stringify(listings));
    navigate('/'); // Redirect to Home page
  };

  const handleGetStarted = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      navigate('/add-listing');
    } else {
      setNotification({
        message: 'Please login first to become a host',
        type: 'info'
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  const handleManageListings = () => {
    navigate('/manage-listings');
  };

  const handleManageBookings = () => {
    navigate('/manage-bookings');
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    if (isAlreadyBooked) {
      setNotification({ message: 'This listing is already booked by you.', type: 'error' });
      return;
    }

    navigate('/payment', { state: { listing, startDate, endDate } });
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 w-full transition-all duration-300">
        {notification && (
          <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-8 duration-300">
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          </div>
        )}

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-[#f8fafc]">
          {/* Subtle decorative elements */}
          <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] -ml-64 -mb-64"></div>
          </div>

          <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
            <div className="inline-block px-4 py-2 bg-blue-600/5 border border-blue-600/10 rounded-2xl text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
              Join our global community
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight text-gray-900">
              Become a <span className="text-blue-600">Host</span>
            </h1>

            <p className="text-xl md:text-2xl font-medium mb-12 text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Publier votre logement sur <span className="text-blue-600 font-bold">EasyTrip</span>, c'est facile. Rejoignez notre communauté d'hôtes passionnés dès aujourd'hui.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={handleGetStarted}
                className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all hover:shadow-[0_20px_50px_rgba(37,99,235,0.2)] active:scale-95"
              >
                Get Started
              </button>

              {isLoggedIn && (
                <button
                  onClick={handleManageListings}
                  className="px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                  Manage Listings
                </button>
              )}

              {role === 'admin' && (
                <button
                  onClick={() => navigate('/pending-listings')}
                  className="px-10 py-5 bg-white text-amber-600 border-2 border-amber-50/50 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-50 transition-all active:scale-95"
                >
                  Review Pending
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
              Tous les outils qu'il vous faut en une même application
            </h2>
            <p className="text-lg text-gray-500 font-medium max-w-3xl mx-auto">
              Nous protégeons votre logement, quel que soit votre style d'accueil, avec des outils conçus pour votre réussite.
            </p>
          </div>

          <div className="space-y-32">
            {[
              { img: im1, title: "Configuration de votre annonce", desc: "Photographies de votre logement, configuration des tarifs et création d'un guide d'arrivée", side: 'right' },
              { img: im2, title: "Préparation de votre logement", desc: "Préparation, ménage et service de maintenance pour votre logement", side: 'left' },
              { img: im3, title: "Gestion de vos réservations", desc: "Gestion de vos réservations et communication avec les voyageurs", side: 'right' },
              { img: im4, title: "Accompagnement des voyageurs", desc: "Gestion des arrivées, des départs et des demandes sur place", side: 'left' }
            ].map((feature, i) => (
              <div
                key={i}
                className={`flex flex-col ${feature.side === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24 animate-in fade-in slide-in-from-bottom-12 duration-1000`}
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <div className="w-full lg:w-1/2 group">
                  <div className="relative overflow-hidden rounded-[40px] shadow-2xl shadow-gray-200 group-hover:shadow-blue-200/50 transition-all duration-700">
                    <img
                      src={feature.img}
                      alt={feature.title}
                      className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2">
                  <div className="max-w-md">
                    <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-6">
                      Feature 0{i + 1}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                      {feature.desc}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
                      <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Learn More</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-gray-900 py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
              Prêt à accueillir des voyageurs ?
            </h2>
            <button
              onClick={handleGetStarted}
              className="px-12 py-6 bg-blue-600 text-white rounded-[24px] font-black text-lg uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-2xl shadow-blue-600/40"
            >
              Start Your Hosting Journey
            </button>
          </div>
        </section>

        <HostRegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight text-center">Add Your Listing</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  name="title"
                  placeholder="Property Title"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={newListing.title}
                  onChange={handleInputChange}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    value={newListing.location}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="number"
                    name="price"
                    placeholder="Price per night"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    value={newListing.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <input
                  type="text"
                  name="photo"
                  placeholder="Main Photo URL"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={newListing.photo}
                  onChange={handleInputChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Property Description"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium h-32 resize-none"
                  value={newListing.description}
                  onChange={handleInputChange}
                  required
                />
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                  >
                    Confirm Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BecomeHost;
