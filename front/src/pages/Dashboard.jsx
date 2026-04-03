import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faExclamationTriangle,
  faDollarSign, faHouseUser, faClipboardList,
  faChartLine, faDatabase, faServer, faUserShield, faChartPie
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from "../components/LoadingSpinner";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Add loading animation constants
const LOADING_MESSAGES = [
  "Preparing your admin dashboard...",
  "Analyzing system metrics...",
  "Crunching the numbers...",
  "Fetching user statistics...",
  "Generating insights..."
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    approvedListings: 0,
    pendingListings: 0,
    rejectedListings: 0,
    registeredUsers: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [navigate]);

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

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const listingsResponse = await axios.get('/api/listings');
      const allListings = listingsResponse.data.data || [];

      // Fetch pending listings
      const pendingResponse = await axios.get('/api/listings/pending');
      const pendingListings = pendingResponse.data.listings || [];

      // Fetch all users
      const usersResponse = await axios.get('/api/users');
      const allUsers = usersResponse.data.users || [];

      // Calculate listing statistics
      const approvedListings = allListings.filter(listing => listing.status === 'approved');
      const rejectedListings = allListings.filter(listing => listing.status === 'rejected');

      setStats({
        totalListings: allListings.length,
        approvedListings: approvedListings.length,
        pendingListings: pendingListings.length,
        rejectedListings: rejectedListings.length,
        registeredUsers: allUsers.length,
        totalBookings: 0 // This will be updated when bookings endpoint is available
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Listing Statistics',
      },
    },
  };

  const listingStatusData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          stats.approvedListings,
          stats.pendingListings,
          stats.rejectedListings
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 p-6 relative overflow-hidden">
        {/* Floating Background Icons */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          {[faUsers, faHouseUser, faClipboardList, faChartLine, faDatabase, faServer, faExclamationTriangle, faDollarSign].map((icon, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${20 + Math.random() * 40}px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <FontAwesomeIcon icon={icon} />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 md:p-12 text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-700">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <LoadingSpinner size="large" color="#2563eb" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2 transition-all duration-500">{loadingMessage}</h3>

          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-8 max-w-[280px] mx-auto">
            <div className="h-full bg-blue-600 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: faUsers, label: 'Users' },
              { icon: faHouseUser, label: 'Listings' },
              { icon: faChartPie, label: 'Analytics' },
              { icon: faUserShield, label: 'Admin' }
            ].map((metric, i) => (
              <span key={i} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                <FontAwesomeIcon icon={metric.icon} className="text-sm" />
                {metric.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/30">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 transition-all duration-300">
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Console</h1>
              <p className="text-sm text-gray-500 font-medium">System performance and user metrics</p>
            </div>
            <button
              onClick={fetchStats}
              className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <FontAwesomeIcon icon={faServer} className="text-[10px]" />
              Refresh Data
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2 animate-in slide-in-from-top-2">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { label: 'Users', value: stats.registeredUsers, icon: faUsers, color: 'blue' },
              { label: 'Listings', value: stats.totalListings, icon: faHouseUser, color: 'indigo' },
              { label: 'Approved', value: stats.approvedListings, icon: faClipboardList, color: 'emerald' },
              { label: 'Pending', value: stats.pendingListings, icon: faClipboardList, color: 'amber' },
              { label: 'Rejected', value: stats.rejectedListings, icon: faExclamationTriangle, color: 'rose' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-105 transition-transform`}>
                    <FontAwesomeIcon icon={stat.icon} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</h3>
                    <p className="text-xl font-black text-gray-900 leading-none mt-1">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900">Property Insights</h3>
                  <p className="text-xs text-gray-500 font-medium">Status distribution overview</p>
                </div>
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                  <FontAwesomeIcon icon={faChartPie} />
                </div>
              </div>
              <div className="h-[240px] flex items-center justify-center relative">
                <Doughnut
                  data={listingStatusData}
                  options={{
                    ...chartOptions,
                    cutout: '80%',
                    plugins: {
                      ...chartOptions.plugins,
                      title: { display: false },
                      legend: {
                        position: 'right',
                        labels: {
                          usePointStyle: true,
                          padding: 15,
                          font: { weight: 'bold', size: 11 }
                        }
                      }
                    }
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[100px]">
                  <span className="text-2xl font-black text-gray-900">{stats.totalListings}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center justify-center space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner shadow-indigo-100/50">
                <FontAwesomeIcon icon={faUserShield} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Admin Control</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">System logs and security audits are available for review.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold border border-gray-100">Audit</span>
                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold border border-gray-100">Logs</span>
                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold border border-gray-100">Auth</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
