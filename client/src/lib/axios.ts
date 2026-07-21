import axios from "axios";
import { store } from "@/store/store";
import { clearUser } from "@/store/slices/authSlice";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as any;

    // Check if the error status is 401 (Unauthorized) and the request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If the error is from login, register, or refresh, do not retry and bypass to prevent loops
      const bypassUrls = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"];
      const isBypassUrl = bypassUrls.some((url) => originalRequest.url?.includes(url));

      if (isBypassUrl) {
        if (originalRequest.url?.includes("/api/auth/refresh")) {
          store.dispatch(clearUser());
          if (typeof window !== "undefined") {
            const publicPaths = ["/login", "/register", "/register/candidate", "/register/recruiter", "/", "/test", "/forgot-password", "/reset-password"];
            const currentPath = window.location.pathname;
            if (!publicPaths.includes(currentPath)) {
              window.location.href = "/login";
            }
          }
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Post request to silent refresh endpoint
        await axiosInstance.post("/api/auth/refresh");
        isRefreshing = false;
        processQueue(null);
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        store.dispatch(clearUser());
        if (typeof window !== "undefined") {
          const publicPaths = ["/login", "/register", "/register/candidate", "/register/recruiter", "/", "/test", "/forgot-password", "/reset-password"];
          const currentPath = window.location.pathname;
          if (!publicPaths.includes(currentPath)) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
