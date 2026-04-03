import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCamera, faMapMarkerAlt, faTag, faAlignLeft, faCheckCircle, faArrowLeft, faSave, faBell } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";

const EditListing = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    category: ''
  });
  const [mainPhoto, setMainPhoto] = useState(null);
  const [mainPhotoPreview, setMainPhotoPreview] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [previews, setPreviews] = useState({
    main: null,
    additional: []
  });
  const navigate = useNavigate();

  const categories = [
    { value: 'beach-houses', label: 'Beach Houses' },
    { value: 'city-apartments', label: 'City Apartments' },
    { value: 'mountain-cabins', label: 'Mountain Cabins' },
    { value: 'luxury-villas', label: 'Luxury Villas' },
    { value: 'pools', label: 'Pools' },
    { value: "desert", label: "Desert" }
  ];

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/listings/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const listingData = response.data.listing;
        setListing(listingData);
        setFormData({
          title: listingData.title,
          description: listingData.description,
          location: listingData.location,
          price: listingData.price,
          category: listingData.category
        });
        setMainPhotoPreview(getImageUrl(listingData.main_photo));

        // Set additional photos previews if they exist
        if (listingData.photos && listingData.photos.length > 0) {
          setPreviews(prev => ({
            ...prev,
            additional: listingData.photos.map(photo =>
              getImageUrl(photo.photo_path)
            )
          }));
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch listing');
      setTimeout(() => navigate('/manage-listings'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMainPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Main photo must be less than 5MB');
        return;
      }
      setMainPhoto(file);
      setMainPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalPhotosChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 additional photos
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      setError('All photos must be less than 5MB');
      return;
    }

    setAdditionalPhotos(files);

    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setPreviews(prev => ({ ...prev, additional: newPreviews }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const updateData = new FormData();

      Object.keys(formData).forEach(key => {
        updateData.append(key, formData[key]);
      });

      if (mainPhoto) {
        updateData.append('main_photo', mainPhoto);
      }

      // Append additional photos if any
      if (additionalPhotos.length > 0) {
        additionalPhotos.forEach(photo => {
          updateData.append('photos[]', photo);
        });
      }

      const response = await axios.post(
        `/api/listings/${id}?_method=PUT`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        navigate('/manage-listings');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update listing');
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/300x200?text=No+Image';

    // If it's already a full URL
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // For storage paths
    if (imageUrl.includes('storage/') || imageUrl.startsWith('listings/')) {
      const cleanPath = imageUrl
        .replace('storage/', '')  // Remove 'storage/' if present
        .replace(/^\/+/, '');     // Remove leading slashes
      return `${API_BASE_URL}/storage/${cleanPath}`;
    }

    // For any other case, assume it's a relative path in storage
    const cleanPath = imageUrl.replace(/^\/+/, '');
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  if (loading) return <LoadingSpinner />;
  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto">
          <FontAwesomeIcon icon={faBell} />
        </div>
        <h3 className="text-xl font-black text-gray-900">Listing not found</h3>
        <button onClick={() => navigate('/manage-listings')} className="text-blue-600 font-bold hover:underline">Back to listings</button>
      </div>
    </div>
  );

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
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Listing</h1>
              <p className="text-gray-500 font-medium mt-1">Update your property details and availability.</p>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-in shake-1">
              <FontAwesomeIcon icon={faBell} className="opacity-50" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            {/* Form Left Side */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Title</label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faPlus} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                        placeholder="e.g. Modern Beachfront Villa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price per night</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-gray-300">$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faTag} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 appearance-none"
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faAlignLeft} className="absolute left-6 top-6 text-gray-300" />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="6"
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[32px] focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 placeholder:text-gray-300 resize-none"
                        placeholder="Tell travelers what makes your place special..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Right Side - Photos */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">Photos</h3>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Update Images</span>
                    </div>

                    {/* Main Photo */}
                    <div className="relative group">
                      <div className={`aspect-video rounded-[32px] overflow-hidden border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-4 ${mainPhotoPreview ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}>
                        {mainPhotoPreview ? (
                          <img src={mainPhotoPreview} alt="Main Preview" className="w-full h-full object-cover rounded-2xl animate-in fade-in zoom-in-95" />
                        ) : (
                          <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 mx-auto group-hover:scale-110 transition-transform">
                              <FontAwesomeIcon icon={faCamera} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900">Change Main Photo</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">JPEG, PNG Max 5MB</p>
                            </div>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleMainPhotoChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Additional Photos */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Additional Photos (Max 3)</p>
                      <div className="grid grid-cols-3 gap-4">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center relative overflow-hidden group">
                            {previews.additional[i] ? (
                              <img src={previews.additional[i]} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                            ) : (
                              <FontAwesomeIcon icon={faPlus} className="text-gray-300 group-hover:scale-125 transition-transform" />
                            )}
                            {i === 0 && (
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                multiple
                                onChange={handleAdditionalPhotosChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-2xl shadow-blue-600/20 disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <LoadingSpinner size="small" color="white" />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditListing;