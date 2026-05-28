import axios from 'axios';
import toast from 'react-hot-toast';

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  return null;
}

let accessToken = getStorage()?.getItem('accessToken') || null;

export function setAccessToken(token) {
  const storage = getStorage();
  accessToken = token || null;

  if (!storage) {
    return;
  }

  if (token) {
    storage.setItem('accessToken', token);
  } else {
    storage.removeItem('accessToken');
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

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
  },
);

apiClient.interceptors.response.use(
  (response) => {
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

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await apiClient.post('/auth/refresh-token');
        const newAccessToken = response.data?.data?.accessToken;

        if (newAccessToken) {
          setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }

        throw new Error('No access token in refresh response');
      } catch (refreshError) {
        console.error('Refresh token failed: ', refreshError);
        setAccessToken(null);
        toast.error('Your session has expired. Please log in again!');
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
        return Promise.reject({
          status: 403,
          message: 'Your session has expired. Please log in again!',
        });
      }
    }

    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
    });

    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      errors: error.response?.data?.errors || {},
      data: error.response?.data,
    });
  },
);

export default apiClient;
