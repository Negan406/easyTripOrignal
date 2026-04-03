import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://striking-healing-production.up.railway.app' : 'http://localhost:8000');

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add auth token to requests if available
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle CSRF token mismatch errors
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 419) {
            // Get new CSRF token
            await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`);
            // Retry the original request
            return axiosInstance(error.config);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 