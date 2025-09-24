'use client';

import { ApiResponse } from '@/types';
import { API_BASE_URL, TIMEOUTS } from './constants';

// API Client Configuration
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = TIMEOUTS.API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('digiration_auth_token') 
      : null;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Network error');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// API Endpoints
export const authApi = {
  initiate: (data: { rationCardId: string; phoneNumber: string }) =>
    apiClient.post('/api/auth/initiate', data),
  
  verifyOtp: (data: { sessionId: string; otpCode: string }) =>
    apiClient.post('/api/auth/verify-otp', data),
  
  selectMember: (data: { sessionId: string; memberId: string }) =>
    apiClient.post('/api/auth/select-member', data),
  
  verifyAadhaar: (data: { sessionId: string; aadhaarNumber: string }) =>
    apiClient.post('/api/auth/verify-aadhaar', data),
  
  resendOtp: (data: { sessionId: string }) =>
    apiClient.post('/api/auth/resend-otp', data),
  
  logout: () =>
    apiClient.post('/api/auth/logout'),
};

export const userApi = {
  getProfile: () =>
    apiClient.get('/api/user/profile'),
  
  updateProfile: (data: any) =>
    apiClient.put('/api/user/profile', data),
  
  getFamily: () =>
    apiClient.get('/api/user/family'),
  
  getFamilyMember: (memberId: string) =>
    apiClient.get(`/api/user/family/${memberId}`),
  
  updateFamilyMember: (memberId: string, data: any) =>
    apiClient.put(`/api/user/family/${memberId}`, data),
  
  switchMember: (data: { memberId: string }) =>
    apiClient.post('/api/user/switch-member', data),
  
  getDashboard: () =>
    apiClient.get('/api/user/dashboard'),
  
  getPreferences: () =>
    apiClient.get('/api/user/preferences'),
  
  updatePreferences: (data: any) =>
    apiClient.put('/api/user/preferences', data),
};

export const rationApi = {
  getItems: (params?: { category?: string; search?: string; language?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.language) searchParams.append('language', params.language);
    
    const query = searchParams.toString();
    return apiClient.get(`/api/rations/items${query ? `?${query}` : ''}`);
  },
  
  getMemberQuota: (memberId: string) =>
    apiClient.get(`/api/rations/quota/${memberId}`),
  
  getShopStock: (shopId: string) =>
    apiClient.get(`/api/rations/stock/${shopId}`),
  
  getShops: (params?: { city?: string; pincode?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.city) searchParams.append('city', params.city);
    if (params?.pincode) searchParams.append('pincode', params.pincode);
    
    const query = searchParams.toString();
    return apiClient.get(`/api/rations/shops${query ? `?${query}` : ''}`);
  },
  
  checkAvailability: (params: { itemId: string; quantity: number; shopId: string }) => {
    const searchParams = new URLSearchParams({
      itemId: params.itemId,
      quantity: params.quantity.toString(),
      shopId: params.shopId,
    });
    
    return apiClient.get(`/api/rations/availability?${searchParams.toString()}`);
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};