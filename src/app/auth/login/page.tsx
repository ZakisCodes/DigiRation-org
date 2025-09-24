'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { LoginRequest } from '@/types';
import { VALIDATION_PATTERNS } from '@/lib/constants';

interface LoginFormData {
  rationCardId: string;
  phoneNumber: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { initiateLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    // Clean and validate inputs
    const cleanData: LoginRequest = {
      rationCardId: data.rationCardId.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      phoneNumber: data.phoneNumber.startsWith('+91') 
        ? data.phoneNumber 
        : `+91${data.phoneNumber.replace(/\D/g, '')}`,
    };

    const result = await initiateLogin(cleanData);
    
    if (result.success && result.sessionId) {
      router.push(`/auth/verify-otp?sessionId=${result.sessionId}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">DigiRation</h1>
          <p className="text-gray-600">
            Enter your ration card details to continue
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Ration Card ID"
              placeholder="Enter your ration card ID"
              {...register('rationCardId', {
                required: 'Ration card ID is required',
                pattern: {
                  value: VALIDATION_PATTERNS.RATION_CARD_ID,
                  message: 'Please enter a valid ration card ID',
                },
                minLength: {
                  value: 10,
                  message: 'Ration card ID must be at least 10 characters',
                },
                maxLength: {
                  value: 20,
                  message: 'Ration card ID must not exceed 20 characters',
                },
              })}
              error={errors.rationCardId?.message}
              autoCapitalize="characters"
              autoComplete="off"
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter your mobile number"
              {...register('phoneNumber', {
                required: 'Phone number is required',
                validate: (value) => {
                  const cleaned = value.replace(/\D/g, '');
                  if (cleaned.length === 10) return true;
                  if (cleaned.length === 12 && cleaned.startsWith('91')) return true;
                  return 'Please enter a valid 10-digit mobile number';
                },
              })}
              error={errors.phoneNumber?.message}
              helperText="We'll send an OTP to this number"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              Send OTP
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have a ration card?{' '}
              <a
                href="#"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Contact your local office
              </a>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}