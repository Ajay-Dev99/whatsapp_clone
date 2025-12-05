import axios from "axios";
import { showToast } from "../utils/toast";
import { clearAuth, getAuthToken } from "../utils/authStorage";

const API_URL = "https://chatappclone-backend.onrender.com"
// const API_URL = "http://localhost:3000/api/v1"
// const API_URL = "https://chat-appclone-backend.vercel.app" || import.meta.env.VITE_API_URL || import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000/api/v1";

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (import.meta.env.DEV) {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                data: config.data,
                params: config.params
            });
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {

        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data
            });
        }

        return response;
    },
    (error) => {
        // Handle different types of errors
        let errorMessage = 'An unexpected error occurred';

        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            console.log(data, "data in error response")

            switch (status) {
                case 400:
                    errorMessage = data.message || 'Bad Request';
                    showToast.error('Bad Request', errorMessage);
                    break;
                case 401:
                    errorMessage = 'Unauthorized. Please login again.';
                    showToast.error('Session Expired', 'Please login again to continue');
                    // Clear auth token if unauthorized
                    clearAuth();
                    // Optionally redirect to login
                    if (window.location.pathname !== '/login') {
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 2000);
                    }
                    break;
                case 403:
                    errorMessage = 'Forbidden. You do not have permission to access this resource.';
                    showToast.error('Access Denied', errorMessage);
                    break;
                case 404:
                    errorMessage = 'Resource not found';
                    showToast.error('Not Found', errorMessage);
                    break;
                case 422:
                    errorMessage = data.message || 'Validation error';
                    showToast.error('Validation Error', errorMessage);
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please try again later.';
                    showToast.warning('Rate Limited', 'Please wait a moment before trying again');
                    break;
                case 500:
                    errorMessage = 'Internal server error. Please try again later.';
                    showToast.error('Server Error', 'Something went wrong. Please try again later');
                    break;
                case 503:
                    errorMessage = 'Service unavailable. Please try again later.';
                    showToast.error('Service Unavailable', 'The service is temporarily down. Please try again later');
                    break;
                default:
                    errorMessage = data.message || `Error ${status}`;
                    showToast.error('Error', errorMessage);
            }

            console.error(`❌ API Error: ${status} - ${errorMessage}`, {
                url: error?.config?.url,
                method: error?.config?.method,
                data: data
            });

        } else if (error.request) {
            // Network error
            errorMessage = 'Network error. Please check your internet connection.';
            showToast.error('Network Error', 'Please check your internet connection and try again');
            console.error('❌ Network Error:', error.request);

        } else {
            // Something else happened
            errorMessage = error.message || 'An unexpected error occurred';
            showToast.error('Unexpected Error', errorMessage);
            console.error('❌ Request Setup Error:', error.message);
        }

        // Create a standardized error object
        const standardizedError = new Error(errorMessage);
        standardizedError.status = error.response?.status;
        standardizedError.data = error.response?.data;
        standardizedError.isNetworkError = !error.response;

        return Promise.reject(standardizedError);
    }
);

export default axiosInstance;