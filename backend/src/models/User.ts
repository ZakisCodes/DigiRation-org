import { dbConnection } from '../database/connection';
import { User, UserRow, Address, Language } from '../types';
import { logger } from '../utils/logger';

export class UserModel {
  private static db = dbConnection.getDatabase();

  // Convert database row to User object
  private static rowToUser(row: UserRow): User {
    return {
      id: row.id,
      rationCardId: row.ration_card_id,
      familyName: row.family_name,
      phoneNumber: row.phone_number,
      address: {
        line1: row.address_line1,
        line2: row.address_line2,
        city: row.city,
        state: row.state,
        pincode: row.pincode
      },
      language: row.language as Language,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  // Find user by ration card ID
  static findByRationCardId(rationCardId: string): User | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users WHERE ration_card_id = ?
      `);
      
      const row = stmt.get(rationCardId) as UserRow | undefined;
      
      if (!row) {
        return null;
      }
      
      return this.rowToUser(row);
    } catch (error) {
      logger.error('Error finding user by ration card ID:', error);
      throw error;
    }
  }

  // Find user by phone number
  static findByPhoneNumber(phoneNumber: string): User | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users WHERE phone_number = ?
      `);
      
      const row = stmt.get(phoneNumber) as UserRow | undefined;
      
      if (!row) {
        return null;
      }
      
      return this.rowToUser(row);
    } catch (error) {
      logger.error('Error finding user by phone number:', error);
      throw error;
    }
  }

  // Find user by ID
  static findById(id: string): User | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users WHERE id = ?
      `);
      
      const row = stmt.get(id) as UserRow | undefined;
      
      if (!row) {
        return null;
      }
      
      return this.rowToUser(row);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Validate ration card ID and phone number combination
  static validateCredentials(rationCardId: string, phoneNumber: string): User | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users 
        WHERE ration_card_id = ? AND phone_number = ?
      `);
      
      const row = stmt.get(rationCardId, phoneNumber) as UserRow | undefined;
      
      if (!row) {
        return null;
      }
      
      return this.rowToUser(row);
    } catch (error) {
      logger.error('Error validating user credentials:', error);
      throw error;
    }
  }

  // Create new user
  static create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    try {
      const id = require('uuid').v4();
      const now = new Date().toISOString();
      
      const stmt = this.db.prepare(`
        INSERT INTO users (
          id, ration_card_id, family_name, phone_number,
          address_line1, address_line2, city, state, pincode,
          language, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        userData.rationCardId,
        userData.familyName,
        userData.phoneNumber,
        userData.address.line1,
        userData.address.line2,
        userData.address.city,
        userData.address.state,
        userData.address.pincode,
        userData.language,
        now,
        now
      );
      
      const newUser = this.findById(id);
      if (!newUser) {
        throw new Error('Failed to create user');
      }
      
      logger.info(`User created successfully: ${id}`);
      return newUser;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  static update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): User | null {
    try {
      const existingUser = this.findById(id);
      if (!existingUser) {
        return null;
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.familyName !== undefined) {
        updateFields.push('family_name = ?');
        updateValues.push(updates.familyName);
      }

      if (updates.phoneNumber !== undefined) {
        updateFields.push('phone_number = ?');
        updateValues.push(updates.phoneNumber);
      }

      if (updates.address !== undefined) {
        if (updates.address.line1 !== undefined) {
          updateFields.push('address_line1 = ?');
          updateValues.push(updates.address.line1);
        }
        if (updates.address.line2 !== undefined) {
          updateFields.push('address_line2 = ?');
          updateValues.push(updates.address.line2);
        }
        if (updates.address.city !== undefined) {
          updateFields.push('city = ?');
          updateValues.push(updates.address.city);
        }
        if (updates.address.state !== undefined) {
          updateFields.push('state = ?');
          updateValues.push(updates.address.state);
        }
        if (updates.address.pincode !== undefined) {
          updateFields.push('pincode = ?');
          updateValues.push(updates.address.pincode);
        }
      }

      if (updates.language !== undefined) {
        updateFields.push('language = ?');
        updateValues.push(updates.language);
      }

      if (updateFields.length === 0) {
        return existingUser;
      }

      updateFields.push('updated_at = ?');
      updateValues.push(new Date().toISOString());
      updateValues.push(id);

      const stmt = this.db.prepare(`
        UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
      `);
      
      stmt.run(...updateValues);
      
      const updatedUser = this.findById(id);
      logger.info(`User updated successfully: ${id}`);
      return updatedUser;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user (soft delete by setting inactive)
  static delete(id: string): boolean {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM users WHERE id = ?
      `);
      
      const result = stmt.run(id);
      
      if (result.changes > 0) {
        logger.info(`User deleted successfully: ${id}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get all users (for admin purposes)
  static findAll(limit: number = 100, offset: number = 0): User[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `);
      
      const rows = stmt.all(limit, offset) as UserRow[];
      
      return rows.map(row => this.rowToUser(row));
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw error;
    }
  }
}