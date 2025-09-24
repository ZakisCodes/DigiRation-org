'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { CheckIcon, HistoryIcon, HomeIcon } from '@/lib/icons';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedMember } = useAuthStore();

  const transactionId = searchParams.get('transactionId') || '';
  const amount = searchParams.get('amount') || '0';

  // Auto-redirect after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your transaction has been completed successfully
          </p>
        </div>

        {/* Transaction Details */}
        <Card className="mb-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Badge variant="success">Completed</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium font-mono text-sm">
                  {transactionId}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-green-600">
                  ₹{parseFloat(amount).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Member:</span>
                <span className="font-medium">{selectedMember?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">
                  {new Date().toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-900">What's Next?</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <p>Collect your items from the ration shop</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <p>Keep this transaction ID for your records</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <p>Your quota will be updated automatically</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleGoHome}
            variant="primary"
            fullWidth
            className="flex items-center justify-center space-x-2"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </Button>
          
          <Button
            onClick={handleViewHistory}
            variant="secondary"
            fullWidth
            className="flex items-center justify-center space-x-2"
          >
            <HistoryIcon className="w-5 h-5" />
            <span>View Transaction History</span>
          </Button>
        </div>

        {/* Auto-redirect Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            You will be automatically redirected to the dashboard in 10 seconds
          </p>
        </div>

        {/* Receipt Download */}
        <Card className="mt-6 bg-gray-50">
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-2">Digital Receipt</h4>
            <p className="text-sm text-gray-600 mb-4">
              A digital receipt has been saved to your transaction history
            </p>
            <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
              Download Receipt →
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}