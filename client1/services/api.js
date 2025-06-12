// filepath: c:\game\rproject\client\services\api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://192.168.1.5:5000/api' }); // Replace with your .env variable if using dotenv

export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = (token) => 
  API.get('/profile', { headers: { Authorization: `Bearer ${token}` } });
export const getDietPlan = (token, week, forceRegenerate = false) =>
  API.get(`/diet?week=${week}${forceRegenerate ? '&regenerate=true' : ''}`, 
    { headers: { Authorization: `Bearer ${token}` } });
export const getTimeline = (token, week) =>
  API.get(`/timeline?week=${week}`, { headers: { Authorization: `Bearer ${token}` } });
export const saveDailyLog = (token, data) =>
  API.post('/logs', data, { headers: { Authorization: `Bearer ${token}` } });