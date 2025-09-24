'use client';

import { useState, useEffect } from 'react';
import { ApiResponse, LoadingState } from '@/types';
import { handleApiError } from '@/lib/api';
import { useNotifications } from '@/store/notificationStore';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
}

export const useApi = <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) => {
  const [state, setState] = useState<LoadingState & { data: T | null }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const { showSuccess, showError } = useNotifications();

  const execute = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setState({
          isLoading: false,
          error: null,
          data: response.data,
        });

        if (options.showSuccessNotification && options.successMessage) {
          showSuccess('Success', options.successMessage);
        }

        options.onSuccess?.(response.data);
      } else {
        throw new Error(response.error?.message || 'API call failed');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      setState({
        isLoading: false,
        error: errorMessage,
        data: null,
      });

      if (options.showErrorNotification !== false) {
        showError('Error', errorMessage);
      }

      options.onError?.(errorMessage);
    }
  };

  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
  };

  return {
    ...state,
    execute,
    reset,
  };
};

// Hook for automatic API calls on mount
export const useApiQuery = <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  options: UseApiOptions<T> = {}
) => {
  const api = useApi(apiCall, options);

  useEffect(() => {
    api.execute();
  }, dependencies);

  return api;
};

// Hook for mutations (POST, PUT, DELETE)
export const useApiMutation = <T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const { showSuccess, showError } = useNotifications();

  const mutate = async (params: P): Promise<{ success: boolean; data?: T; error?: string }> => {
    setState({ isLoading: true, error: null });

    try {
      const response = await apiCall(params);
      
      if (response.success) {
        setState({ isLoading: false, error: null });

        if (options.showSuccessNotification && options.successMessage) {
          showSuccess('Success', options.successMessage);
        }

        options.onSuccess?.(response.data);
        
        return { success: true, data: response.data };
      } else {
        throw new Error(response.error?.message || 'API call failed');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      setState({ isLoading: false, error: errorMessage });

      if (options.showErrorNotification !== false) {
        showError('Error', errorMessage);
      }

      options.onError?.(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  const reset = () => {
    setState({ isLoading: false, error: null });
  };

  return {
    ...state,
    mutate,
    reset,
  };
};