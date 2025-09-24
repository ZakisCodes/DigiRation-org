'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { VALIDATION_PATTERNS } from '@/lib/constants';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, resendOtp, sessionId } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const currentSessionId = searchParams.get('sessionId') || sessionId;

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (otpCode?: string) => {
    if (!currentSessionId) {
      router.push('/auth/login');
      return;
    }

    const otpToSubmit = otpCode || otp.join('');
    
    if (!VALIDATION_PATTERNS.OTP.test(otpToSubmit)) {
      return;
    }

    setIsLoading(true);

    const result = await verifyOtp({
      sessionId: currentSessionId,
      otpCode: otpToSubmit,
    });

    if (result.success && result.familyMembers) {
      router.push(`/auth/select-member?sessionId=${currentSessionId}`);
    }

    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    
    const result = await resendOtp();
    
    if (result.success) {
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    
    setIsResending(false);
  };

  const handleBack = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h1>
          <p className="text-gray-600">
            Enter the 6-digit code sent to your mobile number
          </p>
        </div>

        {/* OTP Form */}
        <Card>
          <div className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter OTP
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => handleSubmit()}
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading || otp.some(digit => digit === '')}
            >
              Verify OTP
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend OTP in {countdown} seconds
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Back Button */}
        <div className="mt-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            fullWidth
          >
            Back to Login
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code? Check your SMS or try resending
          </p>
        </div>
      </div>
    </div>
  );
}