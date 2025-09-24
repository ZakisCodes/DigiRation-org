'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import QRScanner from '@/components/scanner/QRScanner';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { useNotifications } from '@/store/notificationStore';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import { ScanIcon, QRCodeIcon, AlertIcon } from '@/lib/icons';

interface QRData {
  type: 'transaction' | 'shop' | 'item';
  shopId?: string;
  shopName?: string;
  itemId?: string;
  itemName?: string;
  quantity?: number;
  price?: number;
  transactionId?: string;
}

export default function ScanPage() {
  const router = useRouter();
  const { selectedMember } = useAuthStore();
  const { showSuccess, showError } = useNotifications();
  
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedData, setScannedData] = useState<QRData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleStartScan = () => {
    if (!selectedMember) {
      showError('Member Required', 'Please select a family member before scanning');
      return;
    }
    setIsScannerActive(true);
  };

  const handleScanResult = (result: string) => {
    setIsScannerActive(false);
    
    try {
      // Parse QR code data
      const qrData = parseQRCode(result);
      
      if (qrData) {
        setScannedData(qrData);
        setShowConfirmModal(true);
        showSuccess('QR Code Scanned', 'Transaction details loaded successfully');
      } else {
        showError('Invalid QR Code', 'This QR code is not recognized by DigiRation');
      }
    } catch (error) {
      showError('Scan Error', 'Failed to process QR code data');
    }
  };

  const parseQRCode = (data: string): QRData | null => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(data);
      
      // Validate required fields
      if (parsed.type && ['transaction', 'shop', 'item'].includes(parsed.type)) {
        return parsed as QRData;
      }
    } catch {
      // If not JSON, try to parse as URL or simple format
      if (data.startsWith('digiration://')) {
        return parseDigiRationURL(data);
      }
    }
    
    // For demo purposes, create mock data for any QR code
    return {
      type: 'transaction',
      shopId: 'shop-1',
      shopName: 'Gandhi Street Ration Shop',
      itemId: 'item-1',
      itemName: 'Rice',
      quantity: 5,
      price: 10.00,
      transactionId: `txn-${Date.now()}`,
    };
  };

  const parseDigiRationURL = (url: string): QRData | null => {
    try {
      const urlObj = new URL(url);
      const type = urlObj.pathname.split('/')[1] as QRData['type'];
      
      const qrData: QRData = { type };
      
      // Extract parameters based on type
      urlObj.searchParams.forEach((value, key) => {
        (qrData as any)[key] = value;
      });
      
      return qrData;
    } catch {
      return null;
    }
  };

  const handleConfirmTransaction = () => {
    if (!scannedData) return;
    
    setShowConfirmModal(false);
    
    // Navigate to payment flow with transaction data
    const params = new URLSearchParams({
      shopId: scannedData.shopId || '',
      itemId: scannedData.itemId || '',
      quantity: scannedData.quantity?.toString() || '1',
      price: scannedData.price?.toString() || '0',
    });
    
    router.push(`/payment?${params.toString()}`);
  };

  const handleCloseScanner = () => {
    setIsScannerActive(false);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setScannedData(null);
  };

  return (
    <>
      <MainLayout
        title="QR Scanner"
        navigationItems={NAVIGATION_ITEMS}
      >
        <div className="p-4 space-y-6">
          {/* Member Check */}
          {!selectedMember ? (
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-yellow-900 mb-1">
                    Select Family Member
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Please select a family member before scanning QR codes for transactions.
                  </p>
                  <Button
                    onClick={() => router.push('/profile')}
                    variant="secondary"
                    size="sm"
                  >
                    Go to Profile
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-primary-50 border-primary-200">
              <div className="text-center">
                <h3 className="font-medium text-primary-900 mb-1">
                  Scanning for {selectedMember.name}
                </h3>
                <p className="text-sm text-primary-700">
                  Transactions will be processed for this family member
                </p>
              </div>
            </Card>
          )}

          {/* Scanner Instructions */}
          <Card>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <QRCodeIcon className="w-10 h-10 text-primary-600" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Scan QR Code
                </h2>
                <p className="text-gray-600">
                  Point your camera at the QR code displayed at the ration shop to verify and authorize your transaction.
                </p>
              </div>

              <Button
                onClick={handleStartScan}
                variant="primary"
                fullWidth
                disabled={!selectedMember}
                className="flex items-center justify-center space-x-2"
              >
                <ScanIcon className="w-5 h-5" />
                <span>Start Scanning</span>
              </Button>
            </div>
          </Card>

          {/* How it Works */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">How it Works</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  1
                </div>
                <p className="text-sm text-gray-600">
                  Visit your nearest ration shop and select the items you want to purchase
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  2
                </div>
                <p className="text-sm text-gray-600">
                  Ask the shop owner to generate a QR code for your transaction
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  3
                </div>
                <p className="text-sm text-gray-600">
                  Scan the QR code to verify transaction details and proceed with payment
                </p>
              </div>
            </div>
          </Card>

          {/* Demo QR Code */}
          <Card className="bg-gray-50">
            <div className="text-center space-y-4">
              <h3 className="font-medium text-gray-900">Demo QR Code</h3>
              <p className="text-sm text-gray-600">
                For testing purposes, scan this demo QR code:
              </p>
              
              {/* Demo QR Code Image/Placeholder */}
              <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                <div className="text-center">
                  <QRCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Demo QR</p>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                This will simulate a rice purchase transaction
              </p>
            </div>
          </Card>
        </div>
      </MainLayout>

      {/* QR Scanner Overlay */}
      <QRScanner
        isActive={isScannerActive}
        onScan={handleScanResult}
        onClose={handleCloseScanner}
      />

      {/* Transaction Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        title="Confirm Transaction"
      >
        {scannedData && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ScanIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                QR Code Scanned Successfully
              </h3>
            </div>

            {/* Transaction Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Shop:</span>
                <span className="font-medium">{scannedData.shopName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span className="font-medium">{scannedData.itemName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{scannedData.quantity} kg</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">₹{scannedData.price?.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-semibold text-primary-600">
                    ₹{((scannedData.quantity || 0) * (scannedData.price || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Member Info */}
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="info">
                Transaction for {selectedMember?.name}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleCloseModal}
                variant="ghost"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmTransaction}
                variant="primary"
                fullWidth
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}