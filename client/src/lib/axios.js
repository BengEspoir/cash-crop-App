import axios from 'axios';
import { supabase } from './supabaseClient';
import { getPhoneVerificationRoute } from './authRoutes';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor — attach access token
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — auto refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const errorCode = error.response?.data?.error?.code;

    if (
      error.response?.status === 503 &&
      errorCode === 'SYSTEM_MAINTENANCE' &&
      typeof window !== 'undefined'
    ) {
      window.dispatchEvent(new CustomEvent('agriculnet:maintenance', {
        detail: {
          message: error.response?.data?.message,
          startedAt: error.response?.data?.error?.details?.startedAt
        }
      }));
    }

    if (
      error.response?.status === 403 &&
      errorCode === 'PHONE_NOT_VERIFIED' &&
      !original?.skipPhoneVerificationRedirect &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/verify-phone'
    ) {
      const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.assign(getPhoneVerificationRoute(returnTo));
    }

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !data.session?.access_token) throw refreshError || new Error('Session expired');
        original.headers.Authorization = `Bearer ${data.session.access_token}`;
        return api(original);
      } catch {
        await supabase.auth.signOut({ scope: 'local' });
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Legacy mock function for compatibility during transition
export async function mockAuthRequest(payload, options = {}) {
  console.warn('mockAuthRequest is deprecated, use api directly');
  return { ok: true, payload };
}
