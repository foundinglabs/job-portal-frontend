import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

if (!API_URL) {
  console.error("Backend API URL is missing from environment variables. Please check your .env.local file.");
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let getAuthToken = () => null;

export const setAuthTokenGetter = (getTokenFn) => {
  getAuthToken = getTokenFn;
};

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle common API errors (e.g., 401 Unauthorized, 403 Forbidden)
      if (error.response.status === 401) {
        console.warn('API Response 401: Unauthorized. User might need to log in again.');
        // TODO: In a real app, dispatch a logout action or redirect to login.
        // E.g., if you have access to a global logout function: globalLogoutFunction();
      } else if (error.response.status === 403) {
        console.warn('API Response 403: Forbidden. User does not have permission.');
        // TODO: Redirect to a permission denied page or show a toast.
      }
    }
    return Promise.reject(error);
  }
);

export default api;