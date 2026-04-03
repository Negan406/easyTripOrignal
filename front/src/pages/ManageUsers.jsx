import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash, faCrown, faPhone, faUserGear,
  faShield, faUserPlus, faEnvelope, faKey, faUser
} from '@fortawesome/free-solid-svg-icons';
import axios, { API_BASE_URL } from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Sidebar from '../components/Sidebar';

// Add loading animation constants
const LOADING_MESSAGES = [
  "Loading user profiles...",
  "Fetching account information...",
  "Preparing user management tools...",
  "Retrieving user data...",
  "Almost there..."
];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchDebugLogs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.users && response.data.users.length > 0) {
          const sampleUser = response.data.users[0];
          console.log('Sample user data format:', sampleUser);
          console.log('Profile photo value:', sampleUser.profile_photo);

          // Test the URL format that AccountSettings.jsx uses
          if (sampleUser.profile_photo) {
            const testUrl = `${API_BASE_URL}/storage/${sampleUser.profile_photo}`;
            console.log('Test URL format:', testUrl);

            // Fetch the image to check if it exists
            fetch(testUrl)
              .then(res => {
                console.log('Image fetch status:', res.status, res.ok);
              })
              .catch(err => console.error('Image fetch error:', err));
          }
        }
      } catch (error) {
        console.error('Debug log error:', error);
      }
    };

    if (localStorage.getItem('role') === 'admin') {
      fetchDebugLogs();
    }
  }, []);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/150x150?text=User';

    // If it's already a full URL, return it as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // Use the same format as AccountSettings.jsx
    // This assumes the API returns paths without 'storage/' prefix
    return `${API_BASE_URL}/storage/${imageUrl.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Process users to ensure consistent photo URLs
        const processedUsers = response.data.users.map(user => ({
          ...user,
          profile_photo: user.profile_photo || null
        }));

        setUsers(processedUsers);
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete.role === 'admin') {
      setNotification({
        type: 'error',
        message: 'Cannot delete admin users'
      });
      return;
    }
    setDeleteConfirmation(userId);
  };

  const handleConfirmDelete = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(users.filter(user => user.id !== userId));
        setNotification({
          type: 'success',
          message: 'User deleted successfully'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete user'
      });
    } finally {
      setDeleteConfirmation(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50/50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Animated Background Icons */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            {[faUserGear, faShield, faEnvelope, faPhone, faUserPlus, faKey, faCrown, faTrash].map((icon, i) => (
              <FontAwesomeIcon
                key={i}
                icon={icon}
                className="absolute animate-pulse text-6xl"
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '3s'
                }}
              />
            ))}
          </div>

          <div className="relative z-10 w-full max-w-lg bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-12 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="relative inline-flex mb-8">
              <LoadingSpinner size="large" color="#2563eb" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserGear} className="text-blue-600/20 text-xl" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{loadingMessage}</h3>
            <p className="text-gray-500 font-medium mb-8">This may take a few moments...</p>

            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-10">
              <div className="h-full bg-blue-600 rounded-full animate-[progress_2s_ease_infinite] w-1/2"></div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: faUserGear, label: 'Admins' },
                { icon: faKey, label: 'Accounts' },
                { icon: faEnvelope, label: 'Emails' },
                { icon: faUserPlus, label: 'New Users' }
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 150}s` }}>
                  <FontAwesomeIcon icon={item.icon} className="text-[10px]" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
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
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Users</h1>
              <p className="text-gray-500 font-medium mt-1">Monitor activity and manage platform accounts</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Users</p>
                <p className="text-xl font-black text-blue-600 leading-tight">{users.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-in shake-1">
              <FontAwesomeIcon icon={faShield} />
              {error}
            </div>
          )}

          {notification && (
            <div className={`mb-8 p-4 rounded-2xl text-sm flex items-center justify-between gap-3 animate-in slide-in-from-top-2 shadow-sm border ${notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
              <div className="flex items-center gap-3 font-semibold">
                <FontAwesomeIcon icon={notification.type === 'success' ? faShield : faShield} className="opacity-50" />
                {notification.message}
              </div>
              <button onClick={() => setNotification(null)} className="text-current opacity-60 hover:opacity-100 transition-opacity">
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <div key={user.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group relative overflow-hidden">
                {user.role === 'admin' && (
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute transform rotate-45 bg-amber-400 text-amber-900 text-[8px] font-black py-1 px-10 right-[-32px] top-[14px] text-center shadow-sm tracking-widest">
                      ADMIN
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-5 mb-8">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-[24px] overflow-hidden border-2 border-gray-50 shadow-inner bg-gray-50 group-hover:scale-105 transition-transform duration-500">
                      {user.profile_photo ? (
                        <img
                          src={getImageUrl(user.profile_photo)}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150x150?text=User';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                      )}
                    </div>
                    {user.role === 'admin' && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-400 text-amber-900 rounded-xl flex items-center justify-center text-xs shadow-lg border-2 border-white">
                        <FontAwesomeIcon icon={faCrown} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 pt-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{user.name}</h3>
                    <p className="text-gray-500 text-xs font-medium truncate mb-3">{user.email}</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-6">
                  {user.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl text-gray-600 border border-transparent group-hover:border-gray-100 transition-colors">
                      <FontAwesomeIcon icon={faPhone} className="text-xs opacity-40 shrink-0" />
                      <span className="text-xs font-bold">{user.phone}</span>
                    </div>
                  )}
                </div>

                <button
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn ${user.role === 'admin'
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 border border-rose-100'
                    }`}
                  onClick={() => handleDeleteClick(user.id)}
                  disabled={user.role === 'admin'}
                >
                  <FontAwesomeIcon icon={faTrash} className="text-[10px] group-hover/btn:rotate-12 transition-transform" />
                  Delete Account
                </button>
              </div>
            ))}
          </div>

          {deleteConfirmation && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
              <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDeleteConfirmation(null)}></div>
              <div className="relative z-10 w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 fade-in duration-300 text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[24px] flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner">
                  <FontAwesomeIcon icon={faTrash} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Confirm Delete</h3>
                <p className="text-gray-500 font-medium mb-10 leading-relaxed px-2">Are you sure you want to delete this user? This action cannot be undone.</p>
                <div className="flex gap-4">
                  <button
                    className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                    onClick={() => setDeleteConfirmation(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95"
                    onClick={() => handleConfirmDelete(deleteConfirmation)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;