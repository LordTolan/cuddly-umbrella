import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const getProfile = () => api.get('/auth/me');

// Sites
export const getSites = () => api.get('/sites');
export const createSite = (data) => api.post('/sites', data);

// Devices
export const getDevices = (siteId) => api.get(`/devices?siteId=${siteId}`);
export const addDevice = (data) => api.post('/devices', data);

// Energy
export const getDashboard = (siteId) => api.get(`/energy/dashboard/${siteId}`);
export const getHistory = (siteId, params) => api.get(`/energy/history/${siteId}`, { params });

// Solar
export const getSolarSummary = (siteId) => api.get(`/solar/summary/${siteId}`);
export const getSolarOffset = (siteId, params) => api.get(`/solar/offset/${siteId}`, { params });

// Billing
export const uploadBill = (siteId, file) => {
  const formData = new FormData();
  formData.append('bill', file);
  formData.append('siteId', siteId);
  return api.post('/billing/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const getBills = (siteId) => api.get(`/billing/bills/${siteId}`);
export const validateBill = (billId) => api.get(`/billing/validate/${billId}`);

// Alerts
export const getAlerts = (siteId) => api.get(`/alerts?siteId=${siteId}`);
export const dismissAlert = (alertId) => api.patch(`/alerts/${alertId}/dismiss`);

export default api;
