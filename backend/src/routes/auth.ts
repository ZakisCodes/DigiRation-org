import express from 'express';
import { UserModel } from '../models/SimpleUser';
import { FamilyMemberModel } from '../models/FamilyMember';
import { AuthSessionModel } from '../models/AuthSession';
import { generateToken } from '../middleware/auth';
import { generateSecureOTP, sendOTP, checkOTPRateLimit } from '../utils/otp';
import { 
  validateRequest,
  loginRequestSchema,
  verifyOtpRequestSchema,
  selectMemberRequestSchema,
  verifyAadhaarRequestSchema,
  resendOtpRequestSchema,
  sanitizePhoneNumber,
  sanitizeRationCardId,
  validateAadhaarNumber
} from '../utils/validation';
import { logger } from '../utils/logger';
import { ApiResponse, AuthResponse } from '../types';

const router = express.Router();

// POST /api/auth/initiate - Start authentication with Ration ID + Phone
router.post('/initiate', validateRequest(loginRequestSchema), async (req, res) => {
  try {
    const { rationCardId, phoneNumber } = req.body;
    
    // Sanitize inputs
    const cleanRationCardId = sanitizeRationCardId(rationCardId);
    const cleanPhoneNumber = sanitizePhoneNumber(phoneNumber);
    
    logger.info(`Authentication initiated for ration card: ${cleanRationCardId}`);
    
    // Validate credentials
    const user = await UserModel.validateCredentials(cleanRationCardId, cleanPhoneNumber);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid ration card ID or phone number',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // Check OTP rate limiting
    if (!checkOTPRateLimit(cleanPhoneNumber)) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many OTP requests. Please try again later.',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // Create auth session
    const session = AuthSessionModel.create(user.id, cleanPhoneNumber);
    
    // Generate and send OTP
    const otp = generateSecureOTP();
    AuthSessionModel.setOTP(session.id, otp, 10); // 10 minutes expiry
    
    const otpSent = await sendOTP(cleanPhoneNumber, otp);
    
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'OTP_SEND_FAILED',
          message: 'Failed to send OTP. Please try again.',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    res.json({
      success: true,
      sessionId: session.id,
      message: 'OTP sent successfully'
    } as AuthResponse);
    
  } catch (error) {
    logger.error('Error in auth initiate:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication initiation failed',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', validateRequest(verifyOtpRequestSchema), async (req, res) => {
  try {
    const { sessionId, otpCode } = req.body;
    
    logger.info(`OTP verification attempted for session: ${sessionId}`);
    
    // Verify OTP
    const isValidOTP = AuthSessionModel.verifyOTP(sessionId, otpCode);
    
    if (!isValidOTP) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Invalid or expired OTP',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // Get session to retrieve user info
    const session = AuthSessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // Get user and family members
    const user = await UserModel.findById(session.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    const familyMembers = FamilyMemberModel.findByUserId(user.id);
    
    res.json({
      success: true,
      sessionId: session.id,
      user: {
        id: user.id,
        rationCardId: user.rationCardId,
        familyName: user.familyName,
        phoneNumber: user.phoneNumber,
        language: user.language
      },
      familyMembers: familyMembers.map(member => ({
        id: member.id,
        name: member.name,
        age: member.age,
        gender: member.gender,
        avatarUrl: member.avatarUrl,
        isHead: member.isHead
      })),
      message: 'OTP verified successfully'
    } as AuthResponse);
    
  } catch (error) {
    logger.error('Error in OTP verification:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'OTP verification failed',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// POST /api/auth/select-member - Select family member
router.post('/select-member', validateRequest(selectMemberRequestSchema), async (req, res) => {
  try {
    const { sessionId, memberId } = req.body;
    
    logger.info(`Member selection attempted for session: ${sessionId}, member: ${memberId}`);
    
    // Validate session
    if (!AuthSessionModel.isValidSession(sessionId)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Invalid or expired session',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    const session = AuthSessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // Validate member belongs to user
    const isValidMember = FamilyMemberModel.validateMemberBelongsToUser(memberId, session.userId);
    if (!isValidMember) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INVALID_MEMBER',
          message: 'Selected member does not belong to this family',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // Set member in session
    const memberSet = AuthSessionModel.setMember(sessionId, memberId);
    if (!memberSet) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'MEMBER_SELECTION_FAILED',
          message: 'Failed to select member',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // Get member details
    const member = FamilyMemberModel.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEMBER_NOT_FOUND',
          message: 'Member not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    res.json({
      success: true,
      sessionId: session.id,
      member: {
        id: member.id,
        name: member.name,
        age: member.age,
        gender: member.gender,
        avatarUrl: member.avatarUrl,
        isHead: member.isHead
      },
      message: 'Member selected successfully'
    } as AuthResponse);
    
  } catch (error) {
    logger.error('Error in member selection:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Member selection failed',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// POST /api/auth/verify-aadhaar - Verify Aadhaar (bypassed for demo)
router.post('/verify-aadhaar', validateRequest(verifyAadhaarRequestSchema), async (req, res) => {
  try {
    const { sessionId, aadhaarNumber } = req.body;
    
    logger.info(`Aadhaar verification attempted for session: ${sessionId}`);
    
    // Validate session
    if (!AuthSessionModel.isValidSession(sessionId)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Invalid or expired session',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    const session = AuthSessionModel.findById(sessionId);
    if (!session || !session.memberId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MEMBER_NOT_SELECTED',
          message: 'Please select a family member first',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // Basic Aadhaar validation
    if (!validateAadhaarNumber(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AADHAAR',
          message: 'Invalid Aadhaar number format',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // For demo purposes, we bypass actual Aadhaar verification
    // In production, this would integrate with UIDAI APIs
    
    // Generate JWT token
    const token = generateToken({
      userId: session.userId,
      memberId: session.memberId,
      sessionId: session.id
    });
    
    // Store token in session
    AuthSessionModel.setJWTToken(session.id, token);
    
    // Get user and member details
    const user = UserModel.findById(session.userId);
    const member = FamilyMemberModel.findById(session.memberId);
    
    if (!user || !member) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_OR_MEMBER_NOT_FOUND',
          message: 'User or member not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        rationCardId: user.rationCardId,
        familyName: user.familyName,
        phoneNumber: user.phoneNumber,
        language: user.language,
        address: user.address
      },
      member: {
        id: member.id,
        name: member.name,
        age: member.age,
        gender: member.gender,
        avatarUrl: member.avatarUrl,
        isHead: member.isHead
      },
      message: 'Authentication completed successfully'
    } as AuthResponse);
    
  } catch (error) {
    logger.error('Error in Aadhaar verification:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Aadhaar verification failed',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// POST /api/auth/resend-otp - Resend OTP
router.post('/resend-otp', validateRequest(resendOtpRequestSchema), async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    logger.info(`OTP resend requested for session: ${sessionId}`);
    
    const session = AuthSessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // Check rate limiting
    if (!checkOTPRateLimit(session.phoneNumber)) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many OTP requests. Please try again later.',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    // Generate and send new OTP
    const otp = generateSecureOTP();
    AuthSessionModel.setOTP(session.id, otp, 10);
    
    const otpSent = await sendOTP(session.phoneNumber, otp);
    
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'OTP_SEND_FAILED',
          message: 'Failed to send OTP. Please try again.',
          timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    }
    
    res.json({
      success: true,
      message: 'OTP resent successfully'
    } as ApiResponse);
    
  } catch (error) {
    logger.error('Error in OTP resend:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'OTP resend failed',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

// POST /api/auth/logout - Logout and invalidate session
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // In a more sophisticated implementation, you might want to blacklist the token
      // For now, we'll just log the logout
      logger.info('User logged out');
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    } as ApiResponse);
    
  } catch (error) {
    logger.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Logout failed',
        timestamp: new Date().toISOString()
      }
    } as ApiResponse);
  }
});

export default router;