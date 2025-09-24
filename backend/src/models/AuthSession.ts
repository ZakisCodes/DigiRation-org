import { dbConnection } from '../database/connection';
import { AuthSession } from '../types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class AuthSessionModel {
  private static db = dbConnection.getDatabase();

  // Convert database row to AuthSession object
  private static rowToAuthSession(row: any): AuthSession {
    return {
      id: row.id,
      userId: row.user_id,
      memberId: row.member_id,
      phoneNumber: row.phone_number,
      otpCode: row.otp_code,
      otpExpiresAt: row.otp_expires_at ? new Date(row.otp_expires_at) : undefined,
      isVerified: Boolean(row.is_verified),
      jwtToken: row.jwt_token,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at)
    };
  }

  // Create new auth session
  static create(userId: string, phoneNumber: string): AuthSession {
    try {
      const id = uuidv4();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      const stmt = this.db.prepare(`
        INSERT INTO auth_sessions (
          id, user_id, phone_number, is_verified, created_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        userId,
        phoneNumber,
        0, // false
        now.toISOString(),
        expiresAt.toISOString()
      );

      const session = this.findById(id);
      if (!session) {
        throw new Error('Failed to create auth session');
      }

      logger.info(`Auth session created: ${id}`);
      return session;
    } catch (error) {
      logger.error('Error creating auth session:', error);
      throw error;
    }
  }

  // Find session by ID
  static findById(id: string): AuthSession | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM auth_sessions WHERE id = ?
      `);

      const row = stmt.get(id);
      if (!row) {
        return null;
      }

      return this.rowToAuthSession(row);
    } catch (error) {
      logger.error('Error finding auth session by ID:', error);
      throw error;
    }
  }

  // Set OTP for session
  static setOTP(sessionId: string, otpCode: string, expiresInMinutes: number = 10): boolean {
    try {
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

      const stmt = this.db.prepare(`
        UPDATE auth_sessions 
        SET otp_code = ?, otp_expires_at = ?
        WHERE id = ?
      `);

      const result = stmt.run(otpCode, expiresAt.toISOString(), sessionId);
      
      if (result.changes > 0) {
        logger.info(`OTP set for session: ${sessionId}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error setting OTP:', error);
      throw error;
    }
  }

  // Verify OTP
  static verifyOTP(sessionId: string, otpCode: string): boolean {
    try {
      const session = this.findById(sessionId);
      
      if (!session) {
        logger.warn(`Session not found for OTP verification: ${sessionId}`);
        return false;
      }

      if (!session.otpCode || !session.otpExpiresAt) {
        logger.warn(`No OTP set for session: ${sessionId}`);
        return false;
      }

      if (new Date() > session.otpExpiresAt) {
        logger.warn(`OTP expired for session: ${sessionId}`);
        return false;
      }

      if (session.otpCode !== otpCode) {
        logger.warn(`Invalid OTP for session: ${sessionId}`);
        return false;
      }

      // Mark session as verified
      const stmt = this.db.prepare(`
        UPDATE auth_sessions 
        SET is_verified = 1, otp_code = NULL, otp_expires_at = NULL
        WHERE id = ?
      `);

      stmt.run(sessionId);
      
      logger.info(`OTP verified for session: ${sessionId}`);
      return true;
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      throw error;
    }
  }

  // Set member for session
  static setMember(sessionId: string, memberId: string): boolean {
    try {
      const stmt = this.db.prepare(`
        UPDATE auth_sessions 
        SET member_id = ?
        WHERE id = ? AND is_verified = 1
      `);

      const result = stmt.run(memberId, sessionId);
      
      if (result.changes > 0) {
        logger.info(`Member set for session: ${sessionId}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error setting member for session:', error);
      throw error;
    }
  }

  // Set JWT token for session
  static setJWTToken(sessionId: string, jwtToken: string): boolean {
    try {
      const stmt = this.db.prepare(`
        UPDATE auth_sessions 
        SET jwt_token = ?
        WHERE id = ?
      `);

      const result = stmt.run(jwtToken, sessionId);
      
      if (result.changes > 0) {
        logger.info(`JWT token set for session: ${sessionId}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error setting JWT token:', error);
      throw error;
    }
  }

  // Check if session is valid and verified
  static isValidSession(sessionId: string): boolean {
    try {
      const session = this.findById(sessionId);
      
      if (!session) {
        return false;
      }

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        return false;
      }

      return session.isVerified;
    } catch (error) {
      logger.error('Error checking session validity:', error);
      return false;
    }
  }

  // Clean up expired sessions
  static cleanupExpiredSessions(): number {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM auth_sessions 
        WHERE expires_at < ? OR (otp_expires_at IS NOT NULL AND otp_expires_at < ?)
      `);

      const now = new Date().toISOString();
      const result = stmt.run(now, now);
      
      if (result.changes > 0) {
        logger.info(`Cleaned up ${result.changes} expired sessions`);
      }

      return result.changes;
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }

  // Delete session
  static delete(sessionId: string): boolean {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM auth_sessions WHERE id = ?
      `);

      const result = stmt.run(sessionId);
      
      if (result.changes > 0) {
        logger.info(`Auth session deleted: ${sessionId}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error deleting auth session:', error);
      throw error;
    }
  }

  // Find active sessions by user ID
  static findActiveByUserId(userId: string): AuthSession[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM auth_sessions 
        WHERE user_id = ? AND expires_at > ? AND is_verified = 1
        ORDER BY created_at DESC
      `);

      const rows = stmt.all(userId, new Date().toISOString());
      
      return rows.map(row => this.rowToAuthSession(row));
    } catch (error) {
      logger.error('Error finding active sessions by user ID:', error);
      throw error;
    }
  }
}