import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faExclamationTriangle,
  faDollarSign, faHouseUser, faClipboardList,
  faChartLine, faDatabase, faServer, faUserShield, faChartPie,
  faArrowRight, faClockRotateLeft, faCheckCircle, faTimesCircle,
  faSpinner, faRefresh
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

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, ArcElement
);

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
    if (role !== 'admin') { navigate('/'); return; }
    fetchStats();
  }, [navigate]);

  useEffect(() => {
    if (!loading) return;
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[idx]);
    }, 2000);
    return () => clearInterval(id);
  }, [loading]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [listingsRes, pendingRes, usersRes] = await Promise.all([
        axios.get('/api/listings'),
        axios.get('/api/listings/pending'),
        axios.get('/api/users')
      ]);
      const allListings = listingsRes.data.data || [];
      const pendingListings = pendingRes.data.listings || [];
      const allUsers = usersRes.data.users || [];

      setStats({
        totalListings: allListings.length,
        approvedListings: allListings.filter(l => l.status === 'approved').length,
        pendingListings: pendingListings.length,
        rejectedListings: allListings.filter(l => l.status === 'rejected').length,
        registeredUsers: allUsers.length,
        totalBookings: 0
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const listingStatusData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [stats.approvedListings, stats.pendingListings, stats.rejectedListings],
      backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(245,158,11,0.85)', 'rgba(239,68,68,0.85)'],
      borderColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 2,
      hoverOffset: 8
    }]
  };

  const doughnutOptions = {
    responsive: true,
    cutout: '78%',
    plugins: {
      legend: { position: 'right', labels: { usePointStyle: true, padding: 18, font: { weight: 'bold', size: 11 } } },
      title: { display: false }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          {[faUsers, faHouseUser, faClipboardList, faChartLine, faDatabase, faServer, faExclamationTriangle, faDollarSign].map((icon, i) => (
            <div key={i} className="absolute animate-pulse"
              style={{ left: `${10 + i * 11}%`, top: `${15 + (i % 3) * 30}%`, fontSize: `${28 + i * 4}px`, animationDelay: `${i * 0.4}s` }}>
              <FontAwesomeIcon icon={icon} />
            </div>
          ))}
        </div>
        <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 md:p-12 text-center border border-gray-100">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-60 animate-pulse"></div>
            <LoadingSpinner size="large" color="#2563eb" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 transition-all duration-500">{loadingMessage}</h3>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-8 max-w-[280px] mx-auto">
            <div className="h-full bg-blue-600 rounded-full" style={{ animation: 'dashProgress 2s ease-in-out infinite', width: '60%' }}></div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[{ icon: faUsers, label: 'Users' }, { icon: faHouseUser, label: 'Listings' }, { icon: faChartPie, label: 'Analytics' }, { icon: faUserShield, label: 'Admin' }].map((m, i) => (
              <span key={i} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold uppercase tracking-wider" style={{ animationDelay: `${i * 150}ms` }}>
                <FontAwesomeIcon icon={m.icon} className="text-sm" />{m.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Stat cards config
  const statCards = [
    { label: 'Total Users', value: stats.registeredUsers, icon: faUsers, gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-600', change: 'Platform members', link: '/manage-users' },
    { label: 'Total Listings', value: stats.totalListings, icon: faHouseUser, gradient: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 text-indigo-600', change: 'All properties', link: '/manage-listings' },
    { label: 'Approved', value: stats.approvedListings, icon: faCheckCircle, gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-600', change: 'Live listings' },
    { label: 'Pending Review', value: stats.pendingListings, icon: faClockRotateLeft, gradient: 'from-amber-500 to-amber-600', light: 'bg-amber-50 text-amber-600', change: 'Awaiting approval', link: '/pending-listings' },
    { label: 'Rejected', value: stats.rejectedListings, icon: faTimesCircle, gradient: 'from-rose-500 to-rose-600', light: 'bg-rose-50 text-rose-600', change: 'Declined listings' }
  ];

  // Quick actions
  const quickActions = [
    { label: 'Manage Users', desc: 'View and delete platform users', icon: faUsers, color: 'blue', link: '/manage-users' },
    { label: 'Manage Listings', desc: 'Edit and control all listings', icon: faHouseUser, color: 'indigo', link: '/manage-listings' },
    { label: 'Review Pending', desc: 'Approve or reject new listings', icon: faClockRotateLeft, color: 'amber', link: '/pending-listings' }
  ];

  const colorMap = { blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100', indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100', amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' };

  return (
    <div className="flex min-h-screen bg-gray-50/30">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-3 border border-blue-100">
                <FontAwesomeIcon icon={faUserShield} className="text-[10px]" />
                Admin Console
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">System performance and platform overview</p>
            </div>
            <button
              onClick={fetchStats}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
            >
              <FontAwesomeIcon icon={faRefresh} className="text-blue-500" />
              Refresh Data
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((stat, i) => (
              <div
                key={i}
                onClick={() => stat.link && navigate(stat.link)}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition-all group relative overflow-hidden ${stat.link ? 'cursor-pointer' : ''}`}
              >
                {/* Gradient accent top bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${stat.gradient} rounded-t-2xl`} />
                <div className="p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.light} group-hover:scale-110 transition-transform`}>
                    <FontAwesomeIcon icon={stat.icon} className="text-sm" />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900 leading-none">{stat.value}</p>
                  <p className="text-xs text-gray-400 font-medium mt-2">{stat.change}</p>
                </div>
                {stat.link && (
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon icon={faArrowRight} className="text-gray-300 text-xs" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Charts + Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Doughnut Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900">Property Insights</h3>
                  <p className="text-xs text-gray-400 font-medium">Status distribution overview</p>
                </div>
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                  <FontAwesomeIcon icon={faChartPie} className="text-sm" />
                </div>
              </div>
              <div className="h-[240px] flex items-center justify-center relative">
                {stats.totalListings > 0 ? (
                  <>
                    <Doughnut data={listingStatusData} options={doughnutOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[100px]">
                      <span className="text-3xl font-black text-gray-900">{stats.totalListings}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-400">
                    <FontAwesomeIcon icon={faChartPie} className="text-4xl mb-3 opacity-30" />
                    <p className="text-sm font-semibold">No listings yet</p>
                  </div>
                )}
              </div>
              {/* Legend summary */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-50">
                {[
                  { label: 'Approved', value: stats.approvedListings, color: 'bg-emerald-500' },
                  { label: 'Pending', value: stats.pendingListings, color: 'bg-amber-400' },
                  { label: 'Rejected', value: stats.rejectedListings, color: 'bg-rose-500' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                    <div>
                      <p className="text-xs font-black text-gray-900">{item.value}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-black text-gray-900">Quick Actions</h3>
                <p className="text-xs text-gray-400 font-medium">Navigate to key sections</p>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(action.link)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all active:scale-[0.98] group ${colorMap[action.color]}`}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white shadow-sm border border-white/80 shrink-0">
                      <FontAwesomeIcon icon={action.icon} className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black leading-none mb-0.5">{action.label}</p>
                      <p className="text-xs opacity-70 font-medium truncate">{action.desc}</p>
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs opacity-0 group-hover:opacity-60 transition-opacity" />
                  </button>
                ))}
              </div>

              {/* System Status */}
              <div className="mt-6 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">System Status</span>
                </div>
                <div className="space-y-2">
                  {[{ label: 'API Server', status: 'Operational' }, { label: 'Database', status: 'Healthy' }, { label: 'Storage', status: 'Online' }].map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">{s.label}</span>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
