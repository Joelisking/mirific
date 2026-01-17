import {
    BaseQueryFn,
    createApi,
    FetchArgs,
    fetchBaseQuery,
    FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';
import type { RootState } from '../store';

// Use the correct localhost URL based on platform
// iOS simulator with Expo Go: use computer's local IP
// Android emulator: needs 10.0.2.2
// Physical device: needs your computer's IP (update this for your network)
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001';
    }
    // For iOS simulator with Expo Go, use local network IP
    // This allows Expo Go to reach your backend
    return 'http://192.168.86.29:3001';
  }
  // Production URL (update this when deploying)
  return 'https://your-production-api.com';
};

const BASE_URL = getBaseUrl();

// Debug: Log the base URL being used
console.log('🌐 API Base URL:', BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🔧 __DEV__:', __DEV__);

// Get Clerk token function - will be set by app
let getClerkToken: (() => Promise<string | null>) | null = null;

export const setClerkTokenGetter = (getter: () => Promise<string | null>) => {
  getClerkToken = getter;
};

// Define the baseQuery with authorization header
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    // Try to get Clerk token first
    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`);
          return headers;
        }
      } catch (error) {
        console.error('Error getting Clerk token:', error);
      }
    }

    // Fallback to Redux token (for backwards compatibility)
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

// Middleware function with error handling
const baseQueryWithErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - clear auth state
  if (result.error && result.error.status === 401) {
    const { authActions } = await import('../slices/authSlice');
    api.dispatch(authActions.logout());
  }

  return result;
};

// Define API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    'User',
    'Habit',
    'Goal',
  ],
  endpoints: (_builder) => ({}),
});
