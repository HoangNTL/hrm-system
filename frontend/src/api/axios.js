import axios from 'axios';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token || null;
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
                const response = await apiClient.post('/auth/refresh-token');

                // const { accessToken } = response.data?.data || response.data || {};
                // if (accessToken) {
                //     localStorage.setItem('accessToken', accessToken);

                //     // Retry original request with new token
                //     originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                //     return apiClient(originalRequest);
                // }
                
                        const { accessToken: newAccessToken } = response.data?.data || response.data || {};
        if (newAccessToken) {
          // Update axios-level token
          setAccessToken(newAccessToken);

          // Attach new token and retry
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
            } catch (refreshError) {
                // Refresh failed - logout user
                // localStorage.removeItem('accessToken');
                // localStorage.removeItem('isAuthenticated');

                console.error('Refresh token failed: ', refreshError);
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
