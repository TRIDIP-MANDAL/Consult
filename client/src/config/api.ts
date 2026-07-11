import axios, { type AxiosRequestConfig, type Method } from 'axios';

interface ApiResponse {
    success: boolean;
    message: string;
    error?: boolean;
    data?:any;
}

// 1. Create a centralized Axios instance
const api = axios.create({
    // Adjust this to match your backend URL
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5100',

    // Important if you are sending HTTP-only cookies
    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
    },
    validateStatus: (status) => status < 600
});

// 2. (Optional Request Interceptor)
// Since you are using httpOnly cookies, you DO NOT need to manually attach the token here!
// The browser will automatically send the cookie with every request because we set `withCredentials: true` above.
// You can leave this interceptor empty or use it for other things later (like logging).
api.interceptors.request.use((config) => { // we can remove this part if we dont need the console.log
    console.log("config in api request ", config)
    return config;
});

// 3. Add an Interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        // Just return the response if it was successful
        console.log("response inside interceptor ", response)
        return response;
    },
    (error) => {
        // If the server returns a 401, they are unauthorized. 
        if (error.response?.status === 401) {
            console.error('Session expired or unauthorized. Redirecting to login...');
            // Force the browser to redirect to the login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 4. A generalized wrapper function (Typed properly!)
export const callApi = async <T = ApiResponse>(
    url: string,
    method: Method,
    data?: any,
    config?: AxiosRequestConfig
): Promise<T> => {
    try {
        // Axios handles the method dynamically, no switch statement needed!
        const response = await api({
            url,
            method,
            data,
            ...config, // allow overriding headers/configs for specific calls
        });
        console.log(" Response received after api call ", response)
        // We can just return the data directly, stripping away Axios's wrapper
        return response.data;
    } catch (error) {
        console.log("Eror during api call ", error)
        throw error;
    }
};