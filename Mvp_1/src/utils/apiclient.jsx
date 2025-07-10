import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL; // Your Django backend base URL

// Create an Axios instance
const apiClient = axios.create({
    baseURL: BASE_URL,
});

/**
 * Add request interceptor to include Authorization token in every request
 */ 
apiClient.interceptors.request.use(             //adds a request interceptor to the axios instance

    (config) => {                                  //config is the object that contains the request configuration and it is present in every request
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;   //f a token is found, it adds an Authorization header to the request with the token in the format Bearer <token>.
        } 

        // Auto-detect Content-Type based on request data type
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Add response interceptor to handle token refresh
 */
apiClient.interceptors.response.use(
    (response) => response,  //if the response is successful, it returns the response as it is
    async (error) => {     //if the response is an error, it checks if the error is due to an expired token and tries to refresh the token
        const originalRequest = error.config;   //originalRequest is the request that failed due to an expired token

        // Handle Unauthorized Error (401) - Token Expired
        if (error.response?.status === 401 && !originalRequest._retry) {  //if the error is due to an expired token and the request has not been retried yet, it retries the request with a new token
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error("No refresh token found");
            
                // Request a new access token using the refresh token
                const response = await axios.post(`${BASE_URL}api/token/refresh/`, {
                    refresh: refreshToken               //sends a POST request to the refresh token endpoint with the refresh token to get a new access token
                });

                // Store the new access token
                localStorage.setItem('access_token', response.data.access);

                // Retry the failed request with the new token
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                return apiClient(originalRequest);
            } catch (refreshError) {                   //if the token refresh fails, it logs the error and redirects the user to the login page
                console.error("Token refresh failed:", refreshError);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('username');
                window.location.href = '/SignIN'; // Redirect to login
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Handles GET requests with optional params
 * @param {string} endpoint - API endpoint
 * @param {object} params - Optional query parameters
 * @returns {Promise<object>} - JSON response from the server
 */
export const getRequest = async (endpoint, params = {}) => {
    try {
        const response = await apiClient.get(endpoint, { params }); //sends a GET request to the specified endpoint with the optional query parameters
        return response.data??response; 
    } catch (error) {
        console.error(`GET request failed: ${error.message}`);
        throw error;
    }
};

/**
 * Handles POST requests, including file uploads
 * @param {string} endpoint - API endpoint
 * @param {object|FormData} data - Data to send in the POST request
 * @returns {Promise<object>} - Response from the server
 */
export const postRequest = async (endpoint, data) => {
    try {
        const response = await apiClient.post(endpoint, data);
        return response;
    } catch (error) {
        console.error(`POST request failed: ${error.message}`);
        throw error;
    }
};

/**
 * Handles PATCH requests
 * @param {string} endpoint - API endpoint
 * @param {object} data - Data to send in the PATCH request
 * @returns {Promise<object>} - Response from the server
 */
export const patchRequest = async (endpoint, data) => {
    try {
        const response = await apiClient.patch(endpoint, data);
        return response;
    } catch (error) {
        console.error(`PATCH request failed: ${error.message}`);
        throw error;
    }
};

/**
 * Handles DELETE requests
 * @param {string} endpoint - API endpoint
 * @returns {Promise<object>} - Response from the server
 */
export const deleteRequest = async (endpoint) => {
    try {
        const response = await apiClient.delete(endpoint);
        return response.data !== undefined ? response.data : response;
    } catch (error) {
        console.error(`DELETE request failed: ${error.message}`);
        throw error;
    }
};

export default apiClient;
