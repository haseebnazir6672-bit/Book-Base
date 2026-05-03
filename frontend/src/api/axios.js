import axios from "axios";

// ✅ Use Render backend in production
const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://book-base.onrender.com/api" // Render backend
    : "http://localhost:5000/api";       // local dev

export const axiosInstance = axios.create({
  baseURL,
});

// Attach token automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});