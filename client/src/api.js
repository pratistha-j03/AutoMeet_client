import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

//Login
export const login = (formData) => API.post('/auth/login', formData);

export const register = (formData) => API.post('/auth/register', formData);

// 1. Upload Audio
export const uploadMeeting = (formData) => API.post('/meetings/upload-audio', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// 2. Get Single Meeting Details
export const getMeeting = (id) => API.get(`/meetings/${id}`);

// 3. Trigger Transcription (Phase 1)
export const transcribeMeeting = (id) => API.post(`/ai/${id}/transcribe`);

// 4. Trigger Summary (Phase 2)
export const generateSummary = (id) => API.post(`/ai/${id}/generate-summary`);

export default API;