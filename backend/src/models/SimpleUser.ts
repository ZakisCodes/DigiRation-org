import { simpleDb } from '../database/simple-db';
import { User, UserRow, Address, Language } from '../types';
import { logger } from '../utils/logger';

export class UserModel {
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
  static async findByRationCardId(rationCardId: string): Promise<User | null> {
    try {
      const row = await simpleDb.findOne('users', { ration_card_id: rationCardId });
      return row ? this.rowToUser(row) : null;
    } catch (error) {
      logger.error('Error finding user by ration card ID:', error);
      throw error;
    }
  }

  // Find user by phone number
  static async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    try {
      const row = await simpleDb.findOne('users', { phone_number: phoneNumber });
      return row ? this.rowToUser(row) : null;
    } catch (error) {
      logger.error('Error finding user by phone number:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    try {
      const row = await simpleDb.get('users', id);
      return row ? this.rowToUser(row) : null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Validate ration card ID and phone number combination
  static async validateCredentials(rationCardId: string, phoneNumber: string): Promise<User | null> {
    try {
      const row = await simpleDb.findOne('users', { 
        ration_card_id: rationCardId, 
        phone_number: phoneNumber 
      });
      return row ? this.rowToUser(row) : null;
    } catch (error) {
      logger.error('Error validating user credentials:', error);
      throw error;
    }
  }

  // Create new user
  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const id = require('uuid').v4();
      const now = new Date().toISOString();
      
      const userRow = {
        id,
        ration_card_id: userData.rationCardId,
        family_name: userData.familyName,
        phone_number: userData.phoneNumber,
        address_line1: userData.address.line1,
        address_line2: userData.address.line2,
        city: userData.address.city,
        state: userData.address.state,
        pincode: userData.address.pincode,
        language: userData.language,
        created_at: now,
        updated_at: now
      };
      
      const newRow = await simpleDb.insert('users', userRow);
      logger.info(`User created successfully: ${id}`);
      return this.rowToUser(newRow);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  static async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    try {
      const updateData: any = {};

      if (updates.familyName !== undefined) {
        updateData.family_name = updates.familyName;
      }

      if (updates.phoneNumber !== undefined) {
        updateData.phone_number = updates.phoneNumber;
      }

      if (updates.address !== undefined) {
        if (updates.address.line1 !== undefined) {
          updateData.address_line1 = updates.address.line1;
        }
        if (updates.address.line2 !== undefined) {
          updateData.address_line2 = updates.address.line2;
        }
        if (updates.address.city !== undefined) {
          updateData.city = updates.address.city;
        }
        if (updates.address.state !== undefined) {
          updateData.state = updates.address.state;
        }
        if (updates.address.pincode !== undefined) {
          updateData.pincode = updates.address.pincode;
        }
      }

      if (updates.language !== undefined) {
        updateData.language = updates.language;
      }

      if (Object.keys(updateData).length === 0) {
        return await this.findById(id);
      }

      const updatedRow = await simpleDb.update('users', id, updateData);
      if (updatedRow) {
        logger.info(`User updated successfully: ${id}`);
        return this.rowToUser(updatedRow);
      }
      
      return null;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async delete(id: string): Promise<boolean> {
    try {
      const result = await simpleDb.delete('users', id);
      if (result) {
        logger.info(`User deleted successfully: ${id}`);
      }
      return result;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get all users (for admin purposes)
  static async findAll(limit: number = 100, offset: number = 0): Promise<User[]> {
    try {
      const rows = await simpleDb.getAll('users');
      return rows.slice(offset, offset + limit).map(row => this.rowToUser(row));
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw error;
    }
  }
}