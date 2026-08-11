import axios from "axios";
import { API_URL } from "@/constants";
import { getToken, setToken, removeToken, removeUser, getRefreshToken, removeRefreshToken, setTokenCookie, removeTokenCookie, setUserCookie, removeUserCookie, setUser } from "@/lib/auth";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== "undefined" ? getRefreshToken() : null;
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          setToken(data.access_token);
          setTokenCookie(data.access_token);
          // Synchronise l'utilisateur stocké avec la réponse du refresh :
          // la photo de profil (et sa version) est ainsi conservée/rafraîchie
          // même après expiration du jeton.
          if (data.user) {
            setUser(data.user);
            setUserCookie(data.user);
          }
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        }
      } catch {
        removeToken();
        removeTokenCookie();
        removeUserCookie();
        if (typeof window !== "undefined") {
          removeRefreshToken();
          removeUser();
          window.location.href = "/login";
        }
      }
    }

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Une erreur est survenue";

    return Promise.reject(new Error(typeof message === "string" ? message : JSON.stringify(message)));
  }
);

export default api;
