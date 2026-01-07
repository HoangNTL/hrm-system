import axios from 'axios';
import toast from 'react-hot-toast';

let accessToken = localStorage.getItem('accessToken') || null;

export function setAccessToken(token) {
    accessToken = token || null;
    if (token) {
        localStorage.setItem('accessToken', token);
    } else {
        localStorage.removeItem('accessToken');
    }
}

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000, // 30 seconds timeout for slow cloud DB connections
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        // const token = localStorage.getItem('accessToken');

        // Attach token to Authorization header
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Log request in development
        if (import.meta.env.DEV) {
            console.log('API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
    (response) => {
        // Log response in development
        if (import.meta.env.DEV) {
            console.log('API Response:', {
                status: response.status,
                url: response.config.url,
                data: response.data,
            });
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized or 403 Forbidden (token expired/invalid)
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                // refresh token is stored in HttpOnly cookie; call refresh-token endpoint
                console.log('Token expired, refreshing...');
                const response = await apiClient.post('/auth/refresh-token');

                console.log('Refresh response:', response.data);

                const newAccessToken = response.data?.data?.accessToken;
                console.log('New access token:', newAccessToken ? 'obtained' : 'not found');

                if (newAccessToken) {
                  // Update axios-level token
                  setAccessToken(newAccessToken);
                  console.log('Token updated, retrying original request');

                  // Attach new token and retry
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                  return apiClient(originalRequest);
                } else {
                  throw new Error('No access token in refresh response');
                }
            } catch (refreshError) {
                // Refresh failed - logout user
                console.error('Refresh token failed: ', refreshError);
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

        console.error('API Error:', {
            status: error.response?.status,
            message: errorMessage,
            url: error.config?.url,
        });

        // Format error for components
        const formattedError = {
            status: error.response?.status,
            message: errorMessage,
            errors: error.response?.data?.errors || {},
            data: error.response?.data,
        };

        return Promise.reject(formattedError);
    }
);

export default apiClient;
