import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: () => api.get('/api/health'),

  // Components
  getComponents: () => api.get('/api/components'),
  getComponent: (id) => api.get(`/api/components/${id}`),
  getComponentsByCategory: (category) => api.get(`/api/components/category/${category}`),

  // User Preferences
  getUserPreferences: () => api.get('/api/preferences'),
  saveUserPreferences: (preferences) => api.post('/api/preferences', preferences),

  // Saved Ideas
  getSavedIdeas: () => api.get('/api/ideas'),
  saveIdea: (idea) => api.post('/api/ideas', idea),
  updateIdea: (id, idea) => api.put(`/api/ideas/${id}`, idea),
  deleteIdea: (id) => api.delete(`/api/ideas/${id}`),
  toggleFavorite: (id, isFavorite) => api.patch(`/api/ideas/${id}/favorite?is_favorite=${isFavorite}`),
  searchIdeas: (query) => api.get(`/api/ideas/search?query=${encodeURIComponent(query)}`),

  // AI Idea Generation
  generateIdeas: (request) => api.post('/api/generate-ideas', request),

  // User Stats
  getUserStats: () => api.get('/api/stats'),
};

export default apiService;