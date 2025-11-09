// API utility functions
const backend_Url = import.meta.env.VITE_BACKEND_URL || "http://localhost:3002";

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  return fetch(url, { ...defaultOptions, ...options });
};

export { backend_Url };
