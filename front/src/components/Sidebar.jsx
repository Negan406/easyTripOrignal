import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faHome, faSuitcase, faHeart, faUser, faSignInAlt, faUserPlus, faUsers, faHouseUser, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';

const Sidebar = ({ isOpen, onClose }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role = localStorage.getItem('role');

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white z-[100] shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          </div>

          {/* Navigation Content */}
          <div className="flex-grow overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              <Link
                to="/"
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
                onClick={onClose}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-blue-100 transition-colors">
                  <FontAwesomeIcon icon={faHome} className="text-lg" />
                </div>
                <span>Homes</span>
              </Link>

              {isLoggedIn && (
                <>
                  <Link
                    to="/trips"
                    className="flex items-center gap-4 px-4 py-3.5 text-gray-700 font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
                    onClick={onClose}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-blue-100 transition-colors">
                      <FontAwesomeIcon icon={faSuitcase} className="text-lg" />
                    </div>
                    <span>Trips</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-4 px-4 py-3.5 text-gray-700 font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
                    onClick={onClose}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-blue-100 transition-colors">
                      <FontAwesomeIcon icon={faHeart} className="text-lg" />
                    </div>
                    <span>Wishlists</span>
                  </Link>
                </>
              )}

              <div className="h-px bg-gray-100 my-4 mx-4"></div>

              <Link
                to="/become-host"
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
                onClick={onClose}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-blue-100 transition-colors">
                  <FontAwesomeIcon icon={faHouseUser} className="text-lg" />
                </div>
                <span>Become a Host</span>
              </Link>

              {isLoggedIn && (
                <Link
                  to="/account-settings"
                  className="flex items-center gap-4 px-4 py-3.5 text-gray-700 font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
                  onClick={onClose}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-blue-100 transition-colors">
                    <FontAwesomeIcon icon={faUser} className="text-lg" />
                  </div>
                  <span>Account</span>
                </Link>
              )}

              {isLoggedIn && (
                <>
                  <Link
                    to="/manage-bookings"
                    className="flex items-center gap-4 px-4 py-3.5 text-gray-700 font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
                    onClick={onClose}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-blue-100 transition-colors">
                      <FontAwesomeIcon icon={faHouseUser} className="text-lg" />
                    </div>
                    <span>Manage Bookings</span>
                  </Link>
                  <Link
                    to="/manage-listings"
                    className="flex items-center gap-4 px-4 py-3.5 text-gray-700 font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
                    onClick={onClose}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-blue-100 transition-colors">
                      <FontAwesomeIcon icon={faSuitcase} className="text-lg" />
                    </div>
                    <span>Manage Listings</span>
                  </Link>
                </>
              )}

              {isLoggedIn && role === 'admin' && (
                <Link
                  to="/manage-users"
                  className="flex items-center gap-4 px-4 py-3.5 text-gray-700 font-semibold rounded-xl hover:bg-red-50 hover:text-red-600 transition-all group"
                  onClick={onClose}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 group-hover:bg-red-100 transition-colors">
                    <FontAwesomeIcon icon={faUsers} className="text-lg" />
                  </div>
                  <span>Manage Users</span>
                </Link>
              )}

              {!isLoggedIn && (
                <div className="pt-4 space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]"
                    onClick={onClose}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center w-full py-3 bg-white border-2 border-gray-100 text-gray-800 font-bold rounded-xl hover:border-blue-200 transition-all"
                    onClick={onClose}
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>

          {/* Footer branding */}
          <div className="p-6 bg-gray-50 text-center">
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1">EasyTrip</p>
            <p className="text-[10px] text-gray-400">© 2026 EasyTrip. All rights reserved.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;
