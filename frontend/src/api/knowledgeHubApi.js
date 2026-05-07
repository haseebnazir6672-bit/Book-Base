import axios from "axios";

// ✅ Use Render backend in production
const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://book-base-1.onrender.com/api"
    : "http://localhost:5000/api";

const HUB_TOKEN_KEY = "knowledgeHubToken";
const HUB_USER_KEY = "knowledgeHubUser";

export const knowledgeHubApi = axios.create({
  baseURL,
});

export const setHubSession = (token) => {
  if (token) {
    localStorage.setItem(HUB_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(HUB_TOKEN_KEY);
  }
};

export const getHubToken = () => localStorage.getItem(HUB_TOKEN_KEY);

export const setHubUser = (user) => {
  if (user) {
    localStorage.setItem(HUB_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(HUB_USER_KEY);
  }
};

export const getHubUser = () => {
  try {
    const user = localStorage.getItem(HUB_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const clearHubSession = () => {
  localStorage.removeItem(HUB_TOKEN_KEY);
  localStorage.removeItem(HUB_USER_KEY);
};

// Attach token automatically
knowledgeHubApi.interceptors.request.use((config) => {
  const token = getHubToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});