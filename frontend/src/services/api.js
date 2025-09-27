import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tutorconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tutorconnect_token');
      localStorage.removeItem('tutorconnect_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const tutorAPI = {
  getAllTutors: (params) => api.get('/tutors', { params }),
  getTutorById: (id) => api.get(`/tutors/${id}`),
  updateProfile: (data) => api.put('/tutors/profile', data),
};

export const studentAPI = {
  getBookings: () => api.get('/students/bookings'),
  createBooking: (booking) => api.post('/students/bookings', booking),
};

export const messageAPI = {
  getMessages: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (message) => api.post('/messages', message),
};

export default api;
