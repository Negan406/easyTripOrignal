import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCamera, faMapMarkerAlt, faTag, faAlignLeft, faCheckCircle, faArrowLeft, faBell } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../components/LoadingSpinner";

const AddListing = () => {
  const [newListing, setNewListing] = useState({
    title: '',
    location: '',
    price: '',
    category: 'beach-houses', // Default category
    description: '',
    main_photo: null,
    photos: []
  });
  const [previews, setPreviews] = useState({
    main: null,
    additional: []
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const categories = [
    { value: 'beach-houses', label: 'Beach Houses' },
    { value: 'city-apartments', label: 'City Apartments' },
    { value: 'mountain-cabins', label: 'Mountain Cabins' },
    { value: 'luxury-villas', label: 'Luxury Villas' },
    { value: 'pools', label: 'Pools' },
    { value: "desert", label: "Desert" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing({ ...newListing, [name]: value });
  };

  const handleMainPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Main photo must be less than 5MB');
        return;
      }
      setNewListing({ ...newListing, main_photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, main: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalPhotosChange = (index, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Check sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('All photos must be less than 5MB');
      return;
    }

    // Copy existing arrays to retain previously uploaded files
    const updatedPhotos = [...newListing.photos];
    const updatedPreviews = [...previews.additional];

    // Ensure the arrays have a length of 3 to insert at precise indexes
    while (updatedPhotos.length < 3) updatedPhotos.push(null);
    while (updatedPreviews.length < 3) updatedPreviews.push(null);

    // Populate from the selected index onwards
    let fileIdx = 0;
    for (let i = index; i < 3 && fileIdx < files.length; i++) {
      updatedPhotos[i] = files[fileIdx++];
    }

    // Filter out nulls for the final form data payload but keep track of actual content
    setNewListing({ ...newListing, photos: updatedPhotos.filter(Boolean) });

    // Generate previews
    let loadedCount = 0;
    const totalToLoad = files.length;

    // Quick helper to read file as data url
    const readFile = (file, i) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedPreviews[i] = reader.result;
        loadedCount++;
        if (loadedCount >= Math.min(totalToLoad, 3 - index)) {
          // We are done loading all selected images
          setPreviews({ ...previews, additional: updatedPreviews });
        }
      };
      reader.readAsDataURL(file);
    };

    // Trigger file reads
    let readIdx = 0;
    for (let i = index; i < 3 && readIdx < files.length; i++) {
      readFile(files[readIdx++], i);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to add a listing');
      }

      const formData = new FormData();
      formData.append('title', newListing.title);
      formData.append('description', newListing.description);
      formData.append('location', newListing.location);
      formData.append('price', newListing.price);
      formData.append('category', newListing.category);
      formData.append('main_photo', newListing.main_photo);

      if (newListing.photos.length > 0) {
        newListing.photos.forEach(photo => {
          formData.append('photos[]', photo);
        });
      }

      const response = await axios.post('/api/listings', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setShowConfirmation(true);
      } else {
        throw new Error(response.data.message || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Failed to add listing:', error);
      setError(error.response?.data?.message || error.message || 'Failed to add listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmationOk = () => {
    setShowConfirmation(false);
    navigate('/manage-listings');
  };

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
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add New Listing</h1>
              <p className="text-gray-500 font-medium mt-1">Share your place with the world and start hosting.</p>
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
                        value={newListing.title}
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
                          value={newListing.location}
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
                          value={newListing.price}
                          onChange={handleInputChange}
                          required
                          min="0"
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
                        value={newListing.category}
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
                        value={newListing.description}
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
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Required</span>
                    </div>

                    {/* Main Photo */}
                    <div className="relative group">
                      <div className={`aspect-video rounded-[32px] overflow-hidden border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-4 ${previews.main ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}>
                        {previews.main ? (
                          <img src={previews.main} alt="Main Preview" className="w-full h-full object-cover rounded-2xl animate-in fade-in zoom-in-95" />
                        ) : (
                          <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 mx-auto group-hover:scale-110 transition-transform">
                              <FontAwesomeIcon icon={faCamera} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900">Upload Main Photo</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">JPEG, PNG Max 5MB</p>
                            </div>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleMainPhotoChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          required={!previews.main}
                        />
                      </div>
                    </div>

                    {/* Additional Photos */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Additional Photos (Max 3)</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center relative overflow-hidden group">
                            {previews.additional[i] ? (
                              <img src={previews.additional[i]} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                            ) : (
                              <FontAwesomeIcon icon={faPlus} className="text-gray-300 group-hover:scale-125 transition-transform text-xs" />
                            )}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              multiple
                              onChange={(e) => handleAdditionalPhotosChange(i, e)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
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
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Submit Listing
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] px-10 py-12 text-center max-w-md shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner animate-bounce">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Success!</h3>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">Your listing has been submitted for admin approval. We'll notify you once it's live!</p>
            <button
              onClick={handleConfirmationOk}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
            >
              Back to My Listings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddListing;