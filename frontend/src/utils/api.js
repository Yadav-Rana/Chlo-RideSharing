import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Ride API calls
export const createRide = async (rideData) => {
  try {
    const response = await api.post("/rides", rideData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create ride");
  }
};

// Get rider earnings
export const getRiderEarnings = async (riderId) => {
  try {
    const response = await api.get(`/riders/${riderId}/earnings`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch rider earnings"
    );
  }
};

// Get user ride history
export const getUserRideHistory = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/rides`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch ride history"
    );
  }
};

export const getRides = async () => {
  try {
    const response = await api.get("/rides");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch rides");
  }
};

export const getRideById = async (rideId) => {
  try {
    const response = await api.get(`/rides/${rideId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch ride");
  }
};

export const acceptRide = async (rideId) => {
  try {
    const response = await api.put(`/rides/${rideId}/accept`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to accept ride");
  }
};

export const startRide = async (rideId, otp) => {
  try {
    const response = await api.put(`/rides/${rideId}/start`, {otp});
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to start ride");
  }
};

export const completeRide = async (rideId) => {
  try {
    const response = await api.put(`/rides/${rideId}/complete`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to complete ride");
  }
};

export const cancelRide = async (rideId) => {
  try {
    const response = await api.put(`/rides/${rideId}/cancel`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to cancel ride");
  }
};

export const rateRide = async (rideId, rating) => {
  try {
    const response = await api.put(`/rides/${rideId}/rate`, {rating});
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to rate ride");
  }
};

// User API calls
export const getNearbyRiders = async (
  longitude,
  latitude,
  maxDistance = 10000
) => {
  try {
    const response = await api.get(
      `/users/riders?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch nearby riders"
    );
  }
};

export const updateUserLocation = async (location) => {
  try {
    const response = await api.put("/users/profile", {location});
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update location"
    );
  }
};

export const updateRiderAvailability = async (isAvailable) => {
  try {
    const response = await api.put("/users/profile", {isAvailable});
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update availability"
    );
  }
};

export default api;
