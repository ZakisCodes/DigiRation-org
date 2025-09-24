import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { UserModel } from '../models/SimpleUser';
import { FamilyMemberModel } from '../models/FamilyMember';

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        rationCardId: string;
        familyName: string;
        phoneNumber: string;
      };
      member?: {
        id: string;
        name: string;
        userId: string;
      };
    }
  }
}

export interface JWTPayload {
  userId: string;
  memberId?: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Generate JWT token
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
    issuer: 'digiration-api',
    audience: 'digiration-app'
  });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'digiration-api',
      audience: 'digiration-app'
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    logger.warn('JWT verification failed:', error);
    return null;
  }
}

// Authentication middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'MISSING_TOKEN',
        message: 'Access token is required',
        timestamp: new Date().toISOString()
      }
    });
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Load user data
  const user = UserModel.findById(payload.userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Add user to request
  req.user = {
    id: user.id,
    rationCardId: user.rationCardId,
    familyName: user.familyName,
    phoneNumber: user.phoneNumber
  };

  // Load member data if memberId is present
  if (payload.memberId) {
    const member = FamilyMemberModel.findById(payload.memberId);
    if (member && member.userId === user.id) {
      req.member = {
        id: member.id,
        name: member.name,
        userId: member.userId
      };
    }
  }

  next();
}

// Optional authentication middleware (doesn't fail if no token)
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  const payload = verifyToken(token);
  
  if (payload) {
    const user = UserModel.findById(payload.userId);
    if (user) {
      req.user = {
        id: user.id,
        rationCardId: user.rationCardId,
        familyName: user.familyName,
        phoneNumber: user.phoneNumber
      };

      if (payload.memberId) {
        const member = FamilyMemberModel.findById(payload.memberId);
        if (member && member.userId === user.id) {
          req.member = {
            id: member.id,
            name: member.name,
            userId: member.userId
          };
        }
      }
    }
  }

  next();
}

// Middleware to ensure member is selected
export function requireMember(req: Request, res: Response, next: NextFunction) {
  if (!req.member) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MEMBER_NOT_SELECTED',
        message: 'Family member must be selected for this operation',
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
}