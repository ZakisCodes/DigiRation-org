'use client';

import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import Button from '@/components/ui/Button';
import { XIcon, ScanIcon } from '@/lib/icons';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isActive: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const initScanner = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setHasCamera(false);
          setError('No camera found on this device');
          setIsLoading(false);
          return;
        }

        // Create scanner instance
        const scanner = new QrScanner(
          videoRef.current!,
          (result) => {
            onScan(result.data);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment', // Use back camera
            maxScansPerSecond: 5,
          }
        );

        scannerRef.current = scanner;

        // Start scanning
        await scanner.start();

        // Check for torch/flashlight support
        const hasTorchSupport = await scanner.hasFlash();
        setHasTorch(hasTorchSupport);

        setIsLoading(false);
      } catch (err) {
        console.error('Scanner initialization error:', err);
        setError('Failed to access camera. Please check permissions.');
        setIsLoading(false);
      }
    };

    initScanner();

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, [isActive, onScan]);

  const toggleTorch = async () => {
    if (scannerRef.current && hasTorch) {
      try {
        await scannerRef.current.toggleFlash();
        setTorchEnabled(!torchEnabled);
      } catch (err) {
        console.error('Failed to toggle torch:', err);
      }
    }
  };

  const handleManualInput = () => {
    const input = prompt('Enter QR code data manually:');
    if (input && input.trim()) {
      onScan(input.trim());
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 safe-top">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-white text-lg font-semibold">Scan QR Code</h1>
          <button
            onClick={onClose}
            className="text-white p-2 hover:bg-white/20 rounded-lg transition-colors min-h-touch min-w-touch flex items-center justify-center"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading ? (
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p>Initializing camera...</p>
          </div>
        ) : error ? (
          <div className="text-center text-white p-6">
            <ScanIcon className="w-16 h-16 mx-auto mb-4 text-white/60" />
            <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
            <p className="text-white/80 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={handleManualInput}
                variant="secondary"
                fullWidth
              >
                Enter Code Manually
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                fullWidth
                className="text-white border-white/30 hover:bg-white/20"
              >
                Close Scanner
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning Frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64 border-2 border-white rounded-lg">
                  {/* Corner indicators */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
                  
                  {/* Scanning line animation */}
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <div className="absolute w-full h-0.5 bg-primary-500 animate-pulse" 
                         style={{ 
                           top: '50%',
                           animation: 'scan-line 2s ease-in-out infinite alternate'
                         }} />
                  </div>
                </div>
              </div>

              {/* Dark overlay with cutout */}
              <div className="absolute inset-0 bg-black/60">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-transparent border border-transparent rounded-lg"
                       style={{
                         boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
                       }} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 safe-bottom">
        <div className="p-6">
          <div className="flex items-center justify-center space-x-6">
            {/* Torch Toggle */}
            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`p-4 rounded-full transition-colors min-h-touch min-w-touch flex items-center justify-center ${
                  torchEnabled ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Manual Input */}
            <button
              onClick={handleManualInput}
              className="p-4 bg-white/20 text-white rounded-full transition-colors min-h-touch min-w-touch flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-4 bg-red-500 text-white rounded-full transition-colors min-h-touch min-w-touch flex items-center justify-center"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center mt-4">
            <p className="text-white text-sm">
              Position the QR code within the frame to scan
            </p>
          </div>
        </div>
      </div>

      {/* CSS for scanning animation */}
      <style jsx>{`
        @keyframes scan-line {
          0% { top: 10%; }
          100% { top: 90%; }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;