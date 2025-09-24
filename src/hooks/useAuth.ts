'use client';

import { useAuthStore } from '@/store/authStore';
import { useNotifications } from '@/store/notificationStore';
import { authApi, handleApiError } from '@/lib/api';
import { 
  LoginRequest, 
  VerifyOtpRequest, 
  SelectMemberRequest, 
  VerifyAadhaarRequest,
  AuthResponse 
} from '@/types';

export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    selectedMember,
    token,
    sessionId,
    setUser,
    setSelectedMember,
    setToken,
    setSessionId,
    login,
    logout: logoutStore,
    clearSession,
  } = useAuthStore();

  const { showSuccess, showError } = useNotifications();

  const initiateLogin = async (data: LoginRequest) => {
    try {
      const response = await authApi.initiate(data);
      
      if (response.success && response.sessionId) {
        setSessionId(response.sessionId);
        showSuccess('OTP Sent', 'Please check your phone for the OTP');
        return { success: true, sessionId: response.sessionId };
      }
      
      throw new Error(response.error?.message || 'Failed to send OTP');
    } catch (error) {
      const message = handleApiError(error);
      showError('Login Failed', message);
      return { success: false, error: message };
    }
  };

  const verifyOtp = async (data: VerifyOtpRequest) => {
    try {
      const response = await authApi.verifyOtp(data) as AuthResponse;
      
      if (response.success && response.user && response.familyMembers) {
        setUser(response.user);
        showSuccess('OTP Verified', 'Please select a family member');
        return { 
          success: true, 
          user: response.user, 
          familyMembers: response.familyMembers 
        };
      }
      
      throw new Error(response.error?.message || 'OTP verification failed');
    } catch (error) {
      const message = handleApiError(error);
      showError('Verification Failed', message);
      return { success: false, error: message };
    }
  };

  const selectMember = async (data: SelectMemberRequest) => {
    try {
      const response = await authApi.selectMember(data) as AuthResponse;
      
      if (response.success && response.member) {
        setSelectedMember(response.member);
        showSuccess('Member Selected', `Selected ${response.member.name}`);
        return { success: true, member: response.member };
      }
      
      throw new Error(response.error?.message || 'Member selection failed');
    } catch (error) {
      const message = handleApiError(error);
      showError('Selection Failed', message);
      return { success: false, error: message };
    }
  };

  const verifyAadhaar = async (data: VerifyAadhaarRequest) => {
    try {
      const response = await authApi.verifyAadhaar(data) as AuthResponse;
      
      if (response.success && response.token && response.user && response.member) {
        login(response.user, response.member, response.token);
        showSuccess('Login Successful', 'Welcome to DigiRation!');
        return { success: true, user: response.user, member: response.member };
      }
      
      throw new Error(response.error?.message || 'Aadhaar verification failed');
    } catch (error) {
      const message = handleApiError(error);
      showError('Verification Failed', message);
      return { success: false, error: message };
    }
  };

  const resendOtp = async () => {
    if (!sessionId) {
      showError('Error', 'No active session found');
      return { success: false, error: 'No active session' };
    }

    try {
      const response = await authApi.resendOtp({ sessionId });
      
      if (response.success) {
        showSuccess('OTP Resent', 'Please check your phone for the new OTP');
        return { success: true };
      }
      
      throw new Error(response.error?.message || 'Failed to resend OTP');
    } catch (error) {
      const message = handleApiError(error);
      showError('Resend Failed', message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      logoutStore();
      clearSession();
      showSuccess('Logged Out', 'You have been logged out successfully');
    }
  };

  const switchMember = (member: any) => {
    setSelectedMember(member);
    showSuccess('Member Switched', `Switched to ${member.name}`);
  };

  return {
    // State
    isAuthenticated,
    user,
    selectedMember,
    token,
    sessionId,
    
    // Actions
    initiateLogin,
    verifyOtp,
    selectMember,
    verifyAadhaar,
    resendOtp,
    logout,
    switchMember,
    clearSession,
  };
};