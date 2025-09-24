'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { VALIDATION_PATTERNS } from '@/lib/constants';

interface AadhaarFormData {
  aadhaarNumber: string;
}

export default function VerifyAadhaarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyAadhaar, selectedMember, sessionId } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  
  const currentSessionId = searchParams.get('sessionId') || sessionId;
  const memberId = searchParams.get('memberId');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AadhaarFormData>();

  const onSubmit = async (data: AadhaarFormData) => {
    if (!currentSessionId) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);

    const result = await verifyAadhaar({
      sessionId: currentSessionId,
      aadhaarNumber: data.aadhaarNumber.replace(/\s/g, ''), // Remove spaces
    });

    if (result.success) {
      router.push('/dashboard');
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    router.push(`/auth/select-member?sessionId=${currentSessionId}`);
  };

  if (!currentSessionId) {
    router.push('/auth/login');
    return null;
  }

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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Identity</h1>
          <p className="text-gray-600">
            Enter your Aadhaar number for verification
          </p>
          {selectedMember && (
            <p className="text-sm text-gray-500 mt-2">
              Verifying for: {selectedMember.name}
            </p>
          )}
        </div>

        {/* Aadhaar Form */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Demo Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Demo Mode</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is a demo. Enter any 12-digit number to continue.
                  </p>
                </div>
              </div>
            </div>

            <Input
              label="Aadhaar Number"
              placeholder="Enter your 12-digit Aadhaar number"
              {...register('aadhaarNumber', {
                required: 'Aadhaar number is required',
                pattern: {
                  value: VALIDATION_PATTERNS.AADHAAR_NUMBER,
                  message: 'Please enter a valid 12-digit Aadhaar number',
                },
                validate: (value) => {
                  const cleaned = value.replace(/\s/g, '');
                  if (cleaned.length !== 12) {
                    return 'Aadhaar number must be exactly 12 digits';
                  }
                  return true;
                },
              })}
              error={errors.aadhaarNumber?.message}
              helperText="Your Aadhaar number is kept secure and encrypted"
              maxLength={14} // Allow for spaces
              onChange={(e) => {
                // Format with spaces for better readability
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value;
              }}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              Verify & Continue
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0"
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
              <div>
                <h4 className="text-sm font-medium text-gray-800">Secure Verification</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Your Aadhaar details are encrypted and used only for identity verification.
                </p>
              </div>
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
            Back to Member Selection
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact support for assistance with verification
          </p>
        </div>
      </div>
    </div>
  );
}