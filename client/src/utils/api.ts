import axios from "axios";
import { storeInstance as store } from "@/redux/store";
import { setTokens, loggedOut } from "@/redux/reducers/AuthReducer";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = store.getState().auth.refreshToken;
  if (!refreshToken) return null;

  try {
    const response = await axios.post("/api/auth/refresh", { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    store.dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }));
    return accessToken as string;
  } catch {
    store.dispatch(loggedOut());
    return null;
  }
}

export async function logout() {
  const refreshToken = store.getState().auth.refreshToken;

  if (refreshToken) {
    try {
      await api.post("/Auth/revoke", { refreshToken });
    } catch (error) {
      console.error(error);
    }
  }

  store.dispatch(loggedOut());
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return api(originalRequest);
  },
);
