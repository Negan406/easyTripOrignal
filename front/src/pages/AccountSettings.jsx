import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faCreditCard, faBell, faShieldAlt, faCamera } from "@fortawesome/free-solid-svg-icons";
import axios, { API_BASE_URL } from "../utils/axios";

const AccountSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setMessage({
            type: 'error',
            text: 'Please log in to access account settings'
          });
          return;
        }

        const response = await axios.get('/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.success) {
          const userData = response.data.user;
          setFormData(prevState => ({
            ...prevState,
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            current_password: '',
            new_password: '',
            confirm_password: ''
          }));

          if (userData.profile_photo) {
            setPreviewUrl(`${API_BASE_URL}/storage/${userData.profile_photo}`);
          }
        } else {
          // If response.data.success is not present, try to use the user data directly
          // This handles both old and new API response formats
          const userData = response.data.user || response.data;
          if (userData) {
            setFormData(prevState => ({
              ...prevState,
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              current_password: '',
              new_password: '',
              confirm_password: ''
            }));

            if (userData.profile_photo) {
              setPreviewUrl(`${API_BASE_URL}/storage/${userData.profile_photo}`);
            }
          } else {
            throw new Error('Invalid response format from server');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to load user data. Please try again.'
        });
      }
    };

    fetchUserData();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);

      if (profilePhoto) {
        formDataToSend.append('profile_photo', profilePhoto);
      }

      const response = await axios.post('/api/user/update',
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    if (formData.new_password !== formData.confirm_password) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match'
      });
      return;
    }

    try {
      const response = await axios.post('/api/user/change-password',
        {
          current_password: formData.current_password,
          new_password: formData.new_password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({
        type: 'success',
        text: 'Password changed successfully!'
      });

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password'
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full transition-all duration-300">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your profile, security, and preferences</p>
          </div>

          {message.text && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
              <div className="flex items-center gap-3 font-semibold">
                <FontAwesomeIcon icon={message.type === 'success' ? faShieldAlt : faBell} className="opacity-50" />
                {message.text}
              </div>
              <button onClick={() => setMessage({ type: '', text: '' })} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors">×</button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Settings Menu */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="bg-white rounded-[32px] p-3 border border-gray-100 shadow-sm space-y-1">
                {[
                  { id: 'profile', icon: faUser, label: 'Personal Info' },
                  { id: 'security', icon: faLock, label: 'Security' },
                  { id: 'payments', icon: faCreditCard, label: 'Payments' },
                  { id: 'notifications', icon: faBell, label: 'Notifications' },
                  { id: 'privacy', icon: faShieldAlt, label: 'Privacy' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${activeSection === item.id
                      ? 'bg-gray-900 text-white shadow-xl shadow-gray-200'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className={`text-base ${activeSection === item.id ? 'text-blue-400' : 'opacity-50'}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-gray-100 shadow-sm min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
                {activeSection === 'profile' && (
                  <div className="space-y-12">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-[40px] bg-gray-50 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <FontAwesomeIcon icon={faUser} className="text-4xl text-gray-200" />
                          )}
                        </div>
                        <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all">
                          <FontAwesomeIcon icon={faCamera} className="text-sm" />
                          <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                      </div>
                      <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Personal Information</h2>
                        <p className="text-gray-500 font-medium mt-1">Update your details to keep your account current.</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-6 py-4 bg-gray-100 border border-transparent rounded-2xl font-bold text-gray-400 cursor-not-allowed opacity-60"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="md:col-span-2 pt-6">
                        <button type="submit" className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-2xl shadow-gray-200">
                          Save Profile Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'security' && (
                  <div className="space-y-12">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Password & Security</h2>
                      <p className="text-gray-500 font-medium mt-1">Manage your credentials and protect your account.</p>
                    </div>

                    <form onSubmit={handlePasswordChange} className="max-w-2xl space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                        <input
                          type="password"
                          value={formData.current_password}
                          onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                          <input
                            type="password"
                            value={formData.new_password}
                            onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900"
                            placeholder="Min. 8 characters"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                          <input
                            type="password"
                            value={formData.confirm_password}
                            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900"
                            placeholder="Repeat new password"
                          />
                        </div>
                      </div>
                      <div className="pt-6">
                        <button type="submit" className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-2xl shadow-blue-100">
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {['payments', 'notifications', 'privacy'].includes(activeSection) && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center text-3xl">
                      <FontAwesomeIcon icon={activeSection === 'payments' ? faCreditCard : activeSection === 'notifications' ? faBell : faShieldAlt} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Feature Coming Soon</h3>
                      <p className="text-gray-500 mt-2">We're working hard to bring this feature to EasyTrip. Stay tuned!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;