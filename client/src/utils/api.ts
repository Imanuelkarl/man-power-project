import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // 1. Check if the response follows your NestJS global envelope layout
    if (response.data && response.data.success === true) {
      console.log(response.data.data);
      // If your API returns a paginated list, you may want to return both data and pagination
      // if (response.data.pagination) {
      //   return {
      //     data: response.data.data,
      //     pagination: response.data.pagination
      //   } as any;
      // }
      const responseData = {
        status: response.data.success,
        statusText: response.data.message,
        data: response.data.data,
      };
      // Standard success: Forward ONLY the core data payload
      return responseData as any;
    }

    return response;
  },
  (error) => {
    // 2. Handle Errors globally based on your NestJS HttpExceptionFilter format
    const apiError = error.response?.data;

    const formattedError = {
      message: apiError?.message || "An unexpected error occurred.",
      errors: apiError?.errors || [], // Your array of field validation errors
      status: error.response?.status || 500,
    };

    // Pro-Tip: Trigger global UI alerts/toasts here if needed
    console.error(
      `API Error [${formattedError.status}]:`,
      formattedError.message,
    );

    // Reject the promise so your UI can still catch it if it wants local error states
    return Promise.reject(formattedError);
  },
);
export default api;
