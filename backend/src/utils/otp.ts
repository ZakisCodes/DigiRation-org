import { logger } from './logger';

// Generate random OTP
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
}

// Simulate sending OTP via SMS
export async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    // In a real implementation, this would integrate with SMS service like Twilio, AWS SNS, etc.
    // For demo purposes, we'll just log the OTP
    
    logger.info(`SMS OTP Simulation - Phone: ${phoneNumber}, OTP: ${otp}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In development, always return success
    // In production, this would return the actual SMS service response
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔐 OTP for ${phoneNumber}: ${otp}\n`);
      return true;
    }
    
    // Simulate 95% success rate for demo
    return Math.random() > 0.05;
    
  } catch (error) {
    logger.error('Error sending OTP:', error);
    return false;
  }
}

// Validate OTP format
export function isValidOTPFormat(otp: string): boolean {
  // Check if OTP is 6 digits
  return /^\d{6}$/.test(otp);
}

// Check if OTP is expired
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

// Generate secure OTP for production use
export function generateSecureOTP(length: number = 6): string {
  if (process.env.NODE_ENV === 'development') {
    // Use predictable OTP in development for testing
    return '123456';
  }
  
  // Use crypto for production
  const crypto = require('crypto');
  const buffer = crypto.randomBytes(length);
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += (buffer[i] % 10).toString();
  }
  
  return otp;
}

// Rate limiting for OTP requests
const otpRequestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkOTPRateLimit(phoneNumber: string, maxRequests: number = 3, windowMinutes: number = 15): boolean {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  const record = otpRequestCounts.get(phoneNumber);
  
  if (!record || now > record.resetTime) {
    // First request or window expired
    otpRequestCounts.set(phoneNumber, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    logger.warn(`OTP rate limit exceeded for phone: ${phoneNumber}`);
    return false;
  }
  
  record.count++;
  return true;
}

// Clean up old rate limit records
export function cleanupOTPRateLimit(): void {
  const now = Date.now();
  
  for (const [phoneNumber, record] of otpRequestCounts.entries()) {
    if (now > record.resetTime) {
      otpRequestCounts.delete(phoneNumber);
    }
  }
}