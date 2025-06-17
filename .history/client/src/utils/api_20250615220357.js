import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Format time remaining for capsules
export const formatTimeRemaining = (unlockDate) => {
  const now = new Date();
  const unlock = new Date(unlockDate);
  const diffMs = unlock - now;
  
  if (diffMs <= 0) return 'Ready to unlock';
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 365) {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} remaining`;
  } else if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} remaining`;
  } else if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} remaining`;
  } else {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} remaining`;
  }
};

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getProfile: () => api.get('/auth/me'),
};

// Capsules API calls
export const capsuleAPI = {
  getAllCapsules: () => api.get('/capsules'),
  getCapsuleById: (id) => api.get(`/capsules/${id}`),
  createCapsule: (capsuleData) => api.post('/capsules', capsuleData),
  updateCapsule: (id, capsuleData) => api.put(`/capsules/${id}`, capsuleData),
  deleteCapsule: (id) => api.delete(`/capsules/${id}`),
  unlockCapsule: (id) => api.post(`/capsules/${id}/unlock`),
};

// Memories API calls
export const memoryAPI = {
  getMemoriesByCapsuleId: (capsuleId) => api.get(`/memories?capsule=${capsuleId}`),
  createMemory: (memoryData) => api.post('/memories', memoryData),
  uploadFile: (formData, onUploadProgress) => 
    api.post('/memories/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    }),
  deleteMemory: (id) => api.delete(`/memories/${id}`),
};

export default api;
