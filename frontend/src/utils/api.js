import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const workerAPI = {
  getNearby: (params) => api.get('/api/workers/nearby', { params }),
  getById: (id) => api.get(`/api/workers/${id}`),
  getReviews: (id) => api.get(`/api/workers/${id}/reviews`),
  updateProfile: (data) => api.put('/api/workers/profile', data),
  updateLocation: (data) => api.put('/api/workers/location', data),
};

export const bookingAPI = {
  create: (data) => api.post('/api/bookings', data),
  getMyBookings: () => api.get('/api/bookings/my'),
  getById: (id) => api.get(`/api/bookings/${id}`),
  updateStatus: (id, data) => api.put(`/api/bookings/${id}/status`, data),
};

export const paymentAPI = {
  createOrder: (bookingId) => api.post('/api/payments/create-order', { bookingId }),
  verifyPayment: (data) => api.post('/api/payments/verify', data),
};

export const reviewAPI = {
  create: (data) => api.post('/api/reviews', data),
};

export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getWorkers: () => api.get('/api/admin/workers'),
  verifyWorker: (id) => api.put(`/api/admin/workers/${id}/verify`),
  getBookings: () => api.get('/api/admin/bookings'),
};

export default api;
