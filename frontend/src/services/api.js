import axios from 'axios';

// Get base URL from environment or fallback to relative URL (leveraging Vite dev proxy)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const SmartTempAPI = {
  // Check backend and database status
  getStatus: async () => {
    const response = await api.get('/api/status');
    return response.data;
  },

  // Get the most recent sensor reading
  getLatestReading: async () => {
    const response = await api.get('/api/readings/latest');
    return response.data;
  },

  // Get all readings from today for chronological charts
  getTodayReadings: async () => {
    const response = await api.get('/api/readings/today');
    return response.data;
  },

  // Get historical readings with pagination and filters
  getHistoricalReadings: async (page = 1, limit = 10, startDate = null, endDate = null) => {
    const params = { page, limit };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get('/api/readings', { params });
    return response.data;
  },

  // Get today's min, max, avg statistics
  getStats: async () => {
    const response = await api.get('/api/stats');
    return response.data;
  },

  // Get recent alerts
  getAlerts: async (limit = 20, activeOnly = false) => {
    const params = { limit, active_only: activeOnly };
    const response = await api.get('/api/alerts', { params });
    return response.data;
  },

  // Send a test reading from frontend
  sendReading: async (data) => {
    const response = await api.post('/api/readings', data);
    return response.data;
  },
};

export default SmartTempAPI;
