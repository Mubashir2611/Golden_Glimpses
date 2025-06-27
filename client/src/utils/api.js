import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
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
  login: async (email, password) => {
    console.log('🔐 Attempting login for:', email);
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login successful');
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  },
  register: async (name, email, password) => {
    console.log('📝 Attempting registration for:', email);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      console.log('✅ Registration successful');
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      throw error;
    }
  },
  getProfile: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Variable to prevent multiple concurrent refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for API calls
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest); // Use global axios for retrying to avoid self-interception loop with 'api'
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      const localRefreshToken = localStorage.getItem('refreshToken');
      if (!localRefreshToken) {
        isRefreshing = false;
        // logoutUser(); // Implement a global logoutUser function or event
        console.error("No refresh token available, logging out.");
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/'; // Redirect to login
        return Promise.reject(error);
      }

      try {
        const rs = await authAPI.refreshToken(localRefreshToken);
        const { accessToken } = rs.data;
        localStorage.setItem('token', accessToken);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        processQueue(null, accessToken);
        return api(originalRequest); // Retry with the main 'api' instance
      } catch (_error) {
        processQueue(_error, null);
        // logoutUser(); // Implement a global logoutUser function or event
        console.error("Refresh token failed or expired, logging out.", _error.response?.data || _error.message);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/'; // Redirect to login
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Capsules API calls
export const capsuleAPI = {
  getAllCapsules: () => api.get('/capsules/my-capsules'),
  getCapsuleById: (id) => api.get(`/capsules/${id}`),
  createCapsule: (capsuleData) => api.post('/capsules', capsuleData),
  sealCapsule: (id) => api.put(`/capsules/${id}/seal`),
  updateCapsule: (id, capsuleData) => api.put(`/capsules/${id}`, capsuleData),
  deleteCapsule: (id) => api.delete(`/capsules/${id}`),
  unlockCapsule: (id) => api.post(`/capsules/${id}/unlock`),
  likeCapsule: (id) => api.post(`/capsules/${id}/like`),
  unlikeCapsule: (id) => api.post(`/capsules/${id}/unlike`),
  getPublicCapsules: (page = 1, limit = 10, search = '') => // Added limit
    api.get('/capsules/explore', { params: { page, limit, search } }), // Corrected endpoint
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

// Media API calls
export const mediaAPI = {
  uploadFile: (formData, onUploadProgress) => 
    api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    }),
  deleteFile: (publicId) => api.delete(`/media/${publicId}`),
};

// Stories API calls
export const storiesAPI = {
  getStoriesTray: () => api.get('/stories/tray'),
  getUserStories: (userId) => api.get(`/stories/user/${userId}`),
  getMyStories: () => api.get('/stories/my-stories'),
  createStory: (formData) => 
    api.post('/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteStory: (storyId) => api.delete(`/stories/${storyId}`),
  likeStory: (storyId) => api.put(`/stories/${storyId}/like`),
};

export default api;
