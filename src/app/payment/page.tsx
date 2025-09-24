'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { useNotifications } from '@/store/notificationStore';
import { PAYMENT_METHODS } from '@/lib/constants';
import { PaymentIcon, CheckIcon } from '@/lib/icons';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedMember } = useAuthStore();
  const { showSuccess, showError } = useNotifications();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get transaction details from URL params
  const shopId = searchParams.get('shopId') || '';
  const itemId = searchParams.get('itemId') || '';
  const quantity = parseFloat(searchParams.get('quantity') || '1');
  const price = parseFloat(searchParams.get('price') || '0');
  const totalAmount = quantity * price;

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: '📱',
      description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
      enabled: true,
    },
    {
      id: 'qr',
      name: 'QR Code Payment',
      icon: '📷',
      description: 'Scan merchant QR code to pay',
      enabled: true,
    },
    {
      id: 'card',
      name: 'Debit/Credit Card',
      icon: '💳',
      description: 'Pay using your bank card',
      enabled: true,
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: '💵',
      description: 'Pay with cash at the shop',
      enabled: true,
    },
  ];

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleProceedPayment = () => {
    if (!selectedPaymentMethod) {
      showError('Payment Method Required', 'Please select a payment method to continue');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        showSuccess('Payment Successful', 'Your transaction has been completed successfully');
        
        // Navigate to success page
        router.push(`/payment/success?transactionId=txn-${Date.now()}&amount=${totalAmount}`);
      } else {
        throw new Error('Payment failed due to network issues');
      }
    } catch (error) {
      showError('Payment Failed', 'Please try again or use a different payment method');
      setShowPaymentModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    if (!isProcessing) {
      setShowPaymentModal(false);
    }
  };

  const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);

  return (
    <>
      <MainLayout
        title="Payment"
        showBack
        onBack={() => router.back()}
      >
        <div className="p-4 space-y-6">
          {/* Transaction Summary */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Transaction Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span className="font-medium">Rice</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity} kg</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Price per kg:</span>
                <span className="font-medium">₹{price.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Member:</span>
                <span className="font-medium">{selectedMember?.name}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-lg font-semibold text-primary-600">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method.id)}
                  disabled={!method.enabled}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 min-h-touch ${
                    selectedPaymentMethod === method.id
                      ? 'border-primary-500 bg-primary-50'
                      : method.enabled
                      ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{method.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">
                          {method.name}
                        </h4>
                        {!method.enabled && (
                          <Badge variant="neutral" size="sm">Coming Soon</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {method.description}
                      </p>
                    </div>
                    {selectedPaymentMethod === method.id && (
                      <div className="text-primary-600">
                        <CheckIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Security Notice */}
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">Secure Payment</h4>
                <p className="text-sm text-green-700">
                  All payments are processed securely through encrypted channels. Your financial information is protected.
                </p>
              </div>
            </div>
          </Card>

          {/* Proceed Button */}
          <Button
            onClick={handleProceedPayment}
            variant="primary"
            fullWidth
            disabled={!selectedPaymentMethod}
            className="flex items-center justify-center space-x-2"
          >
            <PaymentIcon className="w-5 h-5" />
            <span>Proceed to Pay ₹{totalAmount.toFixed(2)}</span>
          </Button>
        </div>
      </MainLayout>

      {/* Payment Processing Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={handleCloseModal}
        title={`${selectedMethod?.name} Payment`}
      >
        <div className="space-y-6">
          {!isProcessing ? (
            <>
              {/* Payment Method Specific UI */}
              {selectedPaymentMethod === 'upi' && (
                <UPIPaymentInterface 
                  amount={totalAmount}
                  onConfirm={handleConfirmPayment}
                  onCancel={handleCloseModal}
                />
              )}
              
              {selectedPaymentMethod === 'qr' && (
                <QRPaymentInterface 
                  amount={totalAmount}
                  onConfirm={handleConfirmPayment}
                  onCancel={handleCloseModal}
                />
              )}
              
              {selectedPaymentMethod === 'card' && (
                <CardPaymentInterface 
                  amount={totalAmount}
                  onConfirm={handleConfirmPayment}
                  onCancel={handleCloseModal}
                />
              )}
              
              {selectedPaymentMethod === 'cash' && (
                <CashPaymentInterface 
                  amount={totalAmount}
                  onConfirm={handleConfirmPayment}
                  onCancel={handleCloseModal}
                />
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processing Payment
              </h3>
              <p className="text-gray-600">
                Please wait while we process your payment...
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

// Payment Method Components
const UPIPaymentInterface: React.FC<{
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ amount, onConfirm, onCancel }) => (
  <div className="space-y-4">
    <div className="text-center">
      <div className="text-4xl mb-4">📱</div>
      <h3 className="text-lg font-semibold mb-2">UPI Payment</h3>
      <p className="text-gray-600 mb-4">
        You will be redirected to your UPI app to complete the payment
      </p>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">Amount to Pay</p>
        <p className="text-2xl font-bold text-primary-600">₹{amount.toFixed(2)}</p>
      </div>
    </div>
    
    <div className="flex space-x-3">
      <Button onClick={onCancel} variant="ghost" fullWidth>Cancel</Button>
      <Button onClick={onConfirm} variant="primary" fullWidth>Pay with UPI</Button>
    </div>
  </div>
);

const QRPaymentInterface: React.FC<{
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ amount, onConfirm, onCancel }) => (
  <div className="space-y-4">
    <div className="text-center">
      <div className="text-4xl mb-4">📷</div>
      <h3 className="text-lg font-semibold mb-2">QR Code Payment</h3>
      <p className="text-gray-600 mb-4">
        Scan the merchant's QR code to complete payment
      </p>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-xs text-gray-500">Merchant QR</p>
        </div>
      </div>
      <p className="text-sm text-gray-600">Amount: ₹{amount.toFixed(2)}</p>
    </div>
    
    <div className="flex space-x-3">
      <Button onClick={onCancel} variant="ghost" fullWidth>Cancel</Button>
      <Button onClick={onConfirm} variant="primary" fullWidth>Confirm Payment</Button>
    </div>
  </div>
);

const CardPaymentInterface: React.FC<{
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ amount, onConfirm, onCancel }) => (
  <div className="space-y-4">
    <div className="text-center">
      <div className="text-4xl mb-4">💳</div>
      <h3 className="text-lg font-semibold mb-2">Card Payment</h3>
      <p className="text-gray-600 mb-4">
        Enter your card details to complete payment
      </p>
    </div>
    
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Card Number"
        className="w-full p-3 border border-gray-300 rounded-lg"
        maxLength={19}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="MM/YY"
          className="w-full p-3 border border-gray-300 rounded-lg"
          maxLength={5}
        />
        <input
          type="text"
          placeholder="CVV"
          className="w-full p-3 border border-gray-300 rounded-lg"
          maxLength={3}
        />
      </div>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <p className="text-sm text-gray-600">Amount to Pay</p>
      <p className="text-xl font-bold text-primary-600">₹{amount.toFixed(2)}</p>
    </div>
    
    <div className="flex space-x-3">
      <Button onClick={onCancel} variant="ghost" fullWidth>Cancel</Button>
      <Button onClick={onConfirm} variant="primary" fullWidth>Pay Now</Button>
    </div>
  </div>
);

const CashPaymentInterface: React.FC<{
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ amount, onConfirm, onCancel }) => (
  <div className="space-y-4">
    <div className="text-center">
      <div className="text-4xl mb-4">💵</div>
      <h3 className="text-lg font-semibold mb-2">Cash Payment</h3>
      <p className="text-gray-600 mb-4">
        Pay the exact amount in cash to the shop owner
      </p>
    </div>
    
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="text-center">
        <p className="text-sm text-yellow-700 mb-2">Amount to Pay in Cash</p>
        <p className="text-3xl font-bold text-yellow-800">₹{amount.toFixed(2)}</p>
      </div>
    </div>
    
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-blue-700">
        <strong>Note:</strong> Please ensure you have the exact amount. 
        Confirm with the shop owner before proceeding.
      </p>
    </div>
    
    <div className="flex space-x-3">
      <Button onClick={onCancel} variant="ghost" fullWidth>Cancel</Button>
      <Button onClick={onConfirm} variant="primary" fullWidth>Confirm Cash Payment</Button>
    </div>
  </div>
);