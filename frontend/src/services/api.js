import axios from "axios";
import useAuthStore from "../store/authStore";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add bearer token
API.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling and token rotation
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token Expired)
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const res = await axios.post(
          `${API.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (res.data?.success) {
          const { accessToken } = res.data.data;
          useAuthStore.getState().setAuth(useAuthStore.getState().user, accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default API;
