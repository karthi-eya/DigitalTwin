import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
});

// JWT interceptor — attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('dt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and format errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('dt_token');
            window.location.href = '/';
        }
        const message = error.response?.data?.error || error.message || 'Something went wrong';
        return Promise.reject({ message, status: error.response?.status });
    }
);

export default api;
