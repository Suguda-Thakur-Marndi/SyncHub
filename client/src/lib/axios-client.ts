import { CustomError } from "@/types/custom-error.type";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
};

const API = axios.create(options);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const data = error.response?.data;
    const status = error.response?.status;

    if ((data === "Unauthorized" || data?.message === "Unauthorized") && status === 401) {
      window.location.href = "/";
    }

    const customError: CustomError = {
      ...error,
      message: data?.message || error.message || "An unexpected network error occurred",
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

export default API;
