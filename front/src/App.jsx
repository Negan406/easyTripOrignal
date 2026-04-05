import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import ListingDetails from "./pages/ListingDetails";
import BecomeHost from "./pages/BecomeHost";
import AccountSettings from "./pages/AccountSettings";
import Trips from "./pages/Trips";
import Wishlist from "./pages/Wishlist";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddListing from "./pages/AddListing";
import ManageListings from "./pages/ManageListings";
import EditListing from "./pages/EditListing";
import Payment from "./pages/Payment";
import ManageBookings from "./pages/ManageBookings";
import ManageUsers from './pages/ManageUsers';
import PendingListings from "./pages/PendingListings";
import Dashboard from './pages/Dashboard';
import "./styles.css";
import ErrorBoundary from "./components/ErrorBoundary";
import ClearStorageButton from "./components/ClearStorageButton";
import AOS from 'aos';
import 'aos/dist/aos.css';

// Page fade transition wrapper
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  return (
    <div
      style={{
        opacity: transitionStage === "fadeIn" ? 1 : 0,
        transform: transitionStage === "fadeIn" ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.28s ease, transform 0.28s ease"
      }}
      onTransitionEnd={() => {
        if (transitionStage === "fadeOut") {
          setTransitionStage("fadeIn");
          setDisplayLocation(location);
        }
      }}
    >
      {children}
    </div>
  );
};

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true
    });
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <>
      <Header onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} onSearch={handleSearch} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home searchTerm={searchTerm} />} />
          <Route path="/listing/:id" element={
            <ErrorBoundary>
              <ListingDetails />
            </ErrorBoundary>
          } />
          <Route path="/become-host" element={<BecomeHost />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/manage-listings" element={<ManageListings />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/manage-bookings" element={<ManageBookings />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/pending-listings" element={<PendingListings />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </PageTransition>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;