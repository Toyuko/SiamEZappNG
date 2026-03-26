import axios from 'axios';

import { appConfig } from '../config';
import { clearAccessToken } from '../storage/session-storage';
import { useAuthStore } from '../../store/auth-store';

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearAccessToken();
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);
