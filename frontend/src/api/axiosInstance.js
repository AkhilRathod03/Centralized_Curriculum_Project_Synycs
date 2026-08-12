import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Request Interceptor: Attach access token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle 401 (Unauthorized) and refresh token
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // SILENT MODE: Log errors to console but do not trigger UI alerts
        console.error("Neural Network Handshake:", error.message);

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // Try to get a new access token
                    const res = await axios.post(`${API_BASE_URL}auth/token/refresh/`, {
                        refresh: refreshToken
                    });

                    if (res.status === 200) {
                        localStorage.setItem('access_token', res.data.access);
                        
                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                        return axiosInstance(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh token is also expired, log out
                    console.error("Session expired. Please log in again.");
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
