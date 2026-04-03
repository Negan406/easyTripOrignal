import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faBars, faUserCircle, faSearch, faHome, faSuitcase, faHeart, faUser, faSignInAlt, faUserPlus, faUsers, faHouseUser, faChartLine, faClipboardList, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import logoImg from "../components/unnamed.png";

const Header = ({ onSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [searchTerm, setSearchTerm] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const dropdownRef = useRef(null);
  const role = localStorage.getItem('role') || 'user';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const countries = ['All', 'United States', 'Canada', 'United Kingdom', 'France', 'Germany', 'Spain', 'Italy', 'Japan'];

  const handleBecomeHostClick = () => {
    navigate(location.pathname === "/become-host" ? "/" : "/become-host");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('role');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    onSearch(searchTerm);
    setShowMobileSearch(false);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  const renderAdminLinks = () => {
    if (role === 'admin') {
      return (
        <div className="py-2 bg-gray-50 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
            <FontAwesomeIcon icon={faChartLine} className="w-4" /> Dashboard
          </Link>
          <Link to="/pending-listings" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
            <FontAwesomeIcon icon={faClipboardList} className="w-4" /> Pending Listings
          </Link>
          <Link to="/manage-users" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
            <FontAwesomeIcon icon={faUsers} className="w-4" /> Manage Users
          </Link>
        </div>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
      <nav className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0 cursor-pointer flex items-center gap-2" onClick={() => navigate("/")}>
          <img src={logoImg} alt="EasyTrip" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          <span className="hidden sm:inline text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent tracking-tight">EasyTrip</span>
        </div>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-grow max-w-xl items-center bg-white border border-gray-300 rounded-full py-1.5 px-2 shadow-sm hover:shadow-md transition-shadow duration-200 group">
          <input
            type="text"
            placeholder="Where would you like to go?"
            className="flex-grow bg-transparent border-none outline-none px-4 text-sm font-medium text-gray-700 placeholder-gray-500 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200 shadow-sm">
            <FontAwesomeIcon icon={faSearch} className="text-xs" />
          </button>
        </form>

        {/* Mobile Search Icon */}
        <button onClick={() => setShowMobileSearch(true)} className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm">
          <FontAwesomeIcon icon={faSearch} />
        </button>

        {/* Nav Right */}
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          <button
            className="hidden lg:block text-sm font-semibold py-2.5 px-4 rounded-full text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={handleBecomeHostClick}
          >
            {location.pathname === "/become-host" ? "Switch to traveling" : "Become a host"}
          </button>

          {/* Country Selector */}
          <div className="hidden sm:block relative">
            <button
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faGlobe} className="text-lg" />
            </button>
            {showCountryDropdown && (
              <div className="absolute top-12 right-0 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[60] animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Select Country</div>
                {countries.map((country) => (
                  <button
                    key={country}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedCountry === country ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    {country}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-2 py-1.5 md:px-3 md:py-2 bg-white border border-gray-300 rounded-full hover:shadow-md transition-all duration-200"
            >
              <FontAwesomeIcon icon={faBars} className="text-sm text-gray-600" />
              <div className="relative">
                <FontAwesomeIcon icon={faUserCircle} className="text-2xl md:text-3xl text-gray-500" />
                {role === 'admin' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute top-14 right-0 w-64 md:w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                <div className="block sm:hidden border-b border-gray-100">
                  <button onClick={handleBecomeHostClick} className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    {location.pathname === "/become-host" ? "Switch to traveling" : "Become a host"}
                  </button>
                </div>

                <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                  <FontAwesomeIcon icon={faHome} className="w-4 text-gray-400" /> Home
                </Link>

                {isLoggedIn ? (
                  <>
                    {renderAdminLinks()}
                    <Link to="/trips" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                      <FontAwesomeIcon icon={faSuitcase} className="w-4 text-gray-400" /> Trips
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                      <FontAwesomeIcon icon={faHeart} className="w-4 text-gray-400" /> Wishlist
                    </Link>
                    <Link to="/account-settings" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                      <FontAwesomeIcon icon={faUser} className="w-4 text-gray-400" /> Account
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      disabled={isLoggingOut}
                    >
                      <FontAwesomeIcon icon={faSignInAlt} className="rotate-180" /> {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                      <FontAwesomeIcon icon={faSignInAlt} className="w-4 text-blue-600" /> Login
                    </Link>
                    <Link to="/register" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                      <FontAwesomeIcon icon={faUserPlus} className="w-4 text-blue-600" /> Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col pt-4 px-4 h-screen animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setShowMobileSearch(false)}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FontAwesomeIcon icon={faBars} className="rotate-90" />
            </button>
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Where to?"
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-2xl outline-none text-gray-800 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto px-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Popular destinations</h3>
            <div className="grid grid-cols-2 gap-3 pb-8">
              {['Paris', 'Bali', 'London', 'New York', 'Tokyo', 'Rome'].map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchTerm(city);
                    onSearch(city);
                    setShowMobileSearch(false);
                  }}
                  className="flex flex-col gap-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-full aspect-square bg-gray-200 rounded-xl"></div>
                  <span className="text-sm font-semibold text-gray-700">{city}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto py-4 border-t border-gray-100 flex justify-between gap-4">
            <button className="flex-grow py-3 text-gray-600 font-semibold" onClick={() => setShowMobileSearch(false)}>Cancel</button>
            <button className="flex-grow py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200" onClick={handleSearch}>Search</button>
          </div>
        </div>
      )}
    </header>
  );
};

Header.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default Header;