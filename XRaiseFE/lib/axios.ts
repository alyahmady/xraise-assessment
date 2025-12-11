import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: backendBase,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get fresh session (this will trigger token refresh in next-auth)
        const session = await getSession();
        
        if (session?.accessToken) {
          // Update the authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
          // Retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
