import axios from "axios";

// Use Vite env variable when available. VITE_API_URL should be like: http://localhost:5000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
});

// Attach Authorization header if a token exists in localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore localStorage errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
