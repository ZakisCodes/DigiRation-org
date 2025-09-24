import { z } from 'zod';

// Validation schemas for authentication endpoints

export const loginRequestSchema = z.object({
  rationCardId: z.string()
    .min(10, 'Ration card ID must be at least 10 characters')
    .max(20, 'Ration card ID must not exceed 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Ration card ID must contain only uppercase letters and numbers'),
  phoneNumber: z.string()
    .regex(/^\+91[6-9]\d{9}$/, 'Phone number must be a valid Indian mobile number (+91XXXXXXXXXX)')
});

export const verifyOtpRequestSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  otpCode: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits')
});

export const selectMemberRequestSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  memberId: z.string().uuid('Invalid member ID format')
});

export const verifyAadhaarRequestSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  aadhaarNumber: z.string()
    .length(12, 'Aadhaar number must be exactly 12 digits')
    .regex(/^\d{12}$/, 'Aadhaar number must contain only digits')
});

export const resendOtpRequestSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format')
});

// User profile validation schemas
export const updateProfileSchema = z.object({
  familyName: z.string().min(2, 'Family name must be at least 2 characters').optional(),
  address: z.object({
    line1: z.string().min(5, 'Address line 1 must be at least 5 characters').optional(),
    line2: z.string().optional(),
    city: z.string().min(2, 'City must be at least 2 characters').optional(),
    state: z.string().min(2, 'State must be at least 2 characters').optional(),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits').optional()
  }).optional(),
  language: z.enum(['en', 'hi', 'ta', 'te']).optional()
});

// Family member validation schemas
export const updateFamilyMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  age: z.number().min(1, 'Age must be at least 1').max(150, 'Age must not exceed 150').optional(),
  gender: z.enum(['M', 'F', 'O']).optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional()
});

// Utility functions for validation
export function validateRationCardId(rationCardId: string): boolean {
  return /^[A-Z0-9]{10,20}$/.test(rationCardId);
}

export function validatePhoneNumber(phoneNumber: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(phoneNumber);
}

export function validateAadhaarNumber(aadhaarNumber: string): boolean {
  // Basic format validation
  if (!/^\d{12}$/.test(aadhaarNumber)) {
    return false;
  }
  
  // Aadhaar checksum validation (Verhoeff algorithm)
  // For demo purposes, we'll skip the complex checksum validation
  // In production, implement proper Aadhaar validation
  
  // Check for invalid patterns (all same digits, sequential numbers)
  const invalidPatterns = [
    '000000000000', '111111111111', '222222222222', '333333333333',
    '444444444444', '555555555555', '666666666666', '777777777777',
    '888888888888', '999999999999', '123456789012', '012345678901'
  ];
  
  return !invalidPatterns.includes(aadhaarNumber);
}

export function sanitizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If starts with 91, add +
  if (digits.startsWith('91') && digits.length === 12) {
    return '+' + digits;
  }
  
  // If 10 digits, add +91
  if (digits.length === 10) {
    return '+91' + digits;
  }
  
  return phoneNumber; // Return as-is if can't sanitize
}

export function sanitizeRationCardId(rationCardId: string): string {
  // Convert to uppercase and remove non-alphanumeric characters
  return rationCardId.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Error response helper
export function createValidationError(message: string, field?: string) {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
      field,
      timestamp: new Date().toISOString()
    }
  };
}

// Middleware for request validation
export function validateRequest(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const firstError = result.error.errors[0];
        return res.status(400).json(createValidationError(
          firstError.message,
          firstError.path.join('.')
        ));
      }
      
      // Replace req.body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      return res.status(400).json(createValidationError('Invalid request format'));
    }
  };
}