import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Em produção "tudo junto" (Render), o frontend é servido pelo mesmo
// domínio da API, então '/api' relativo já funciona. Quando o frontend
// está num domínio separado (ex: Vercel), defina VITE_API_URL apontando
// para a API completa (ex: https://smartshield-xxxx.onrender.com/api).
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await api.post('/auth/refresh');
    useAuthStore.getState().setSession(data.user, data.accessToken);
    return data.accessToken as string;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
