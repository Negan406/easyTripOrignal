import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faEnvelope, faPhone, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Support</h4>
            <ul className="flex flex-col gap-2.5">
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Help Centre</Link></li>
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Safety information</Link></li>
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Cancellation options</Link></li>
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Our COVID-19 Response</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Community</h4>
            <ul className="flex flex-col gap-2.5">
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">EasyTrip.org: disaster relief housing</Link></li>
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Support Afghan refugees</Link></li>
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Combating discrimination</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Hosting</h4>
            <ul className="flex flex-col gap-2.5">
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Try hosting</Link></li>
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">AirCover: protection for Hosts</Link></li>
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Explore hosting resources</Link></li>
              <li><Link to="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Visit our community forum</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <Link to="tel:+15551234567" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <FontAwesomeIcon icon={faPhone} className="text-xs" />
                </div>
                <span>+1 (555) 123-4567</span>
              </Link>
              <Link to="mailto:contact@easytrip.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                </div>
                <span>contact@easytrip.com</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-gray-500">
            <p>&copy; {currentYear} EasyTrip, Inc.</p>
            <span className="hidden sm:inline text-gray-300">·</span>
            <div className="flex gap-4">
              <Link to="#" className="hover:underline">Privacy</Link>
              <Link to="#" className="hover:underline">Terms</Link>
              <Link to="#" className="hover:underline">Sitemap</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faGlobe} className="text-gray-400" />
              <span>English (US)</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span>$</span>
              <span>USD</span>
            </div>
            <div className="flex gap-4 text-gray-400">
              <FontAwesomeIcon icon={faHeart} className="text-red-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;