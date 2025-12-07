import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refresh_token');

                if (refreshToken) {
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
                        { refresh_token: refreshToken }
                    );

                    const { access_token } = response.data;
                    localStorage.setItem('access_token', access_token);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('isAuthenticated');
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