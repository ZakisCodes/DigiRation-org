import { dbConnection } from '../database/connection';
import { FamilyMember, FamilyMemberRow } from '../types';
import { logger } from '../utils/logger';

export class FamilyMemberModel {
  private static db = dbConnection.getDatabase();

  // Convert database row to FamilyMember object
  private static rowToFamilyMember(row: FamilyMemberRow): FamilyMember {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      age: row.age,
      gender: row.gender as 'M' | 'F' | 'O',
      aadhaarNumber: row.aadhaar_number,
      avatarUrl: row.avatar_url,
      isHead: Boolean(row.is_head),
      createdAt: new Date(row.created_at)
    };
  }

  // Find family members by user ID
  static findByUserId(userId: string): FamilyMember[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM family_members 
        WHERE user_id = ? 
        ORDER BY is_head DESC, age DESC
      `);
      
      const rows = stmt.all(userId) as FamilyMemberRow[];
      
      return rows.map(row => this.rowToFamilyMember(row));
    } catch (error) {
      logger.error('Error finding family members by user ID:', error);
      throw error;
    }
  }

  // Find family member by ID
  static findById(id: string): FamilyMember | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM family_members WHERE id = ?
      `);
      
      const row = stmt.get(id) as FamilyMemberRow | undefined;
      
      if (!row) {
        return null;
      }
      
      return this.rowToFamilyMember(row);
    } catch (error) {
      logger.error('Error finding family member by ID:', error);
      throw error;
    }
  }

  // Find family member by Aadhaar number
  static findByAadhaarNumber(aadhaarNumber: string): FamilyMember | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM family_members WHERE aadhaar_number = ?
      `);
      
      const row = stmt.get(aadhaarNumber) as FamilyMemberRow | undefined;
      
      if (!row) {
        return null;
      }
      
      return this.rowToFamilyMember(row);
    } catch (error) {
      logger.error('Error finding family member by Aadhaar number:', error);
      throw error;
    }
  }

  // Validate family member belongs to user
  static validateMemberBelongsToUser(memberId: string, userId: string): boolean {
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM family_members 
        WHERE id = ? AND user_id = ?
      `);
      
      const result = stmt.get(memberId, userId) as { count: number };
      
      return result.count > 0;
    } catch (error) {
      logger.error('Error validating family member ownership:', error);
      throw error;
    }
  }

  // Get family head
  static getFamilyHead(userId: string): FamilyMember | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM family_members 
        WHERE user_id = ? AND is_head = 1
        LIMIT 1
      `);
      
      const row = stmt.get(userId) as FamilyMemberRow | undefined;
      
      if (!row) {
        return null;
      }
      
      return this.rowToFamilyMember(row);
    } catch (error) {
      logger.error('Error finding family head:', error);
      throw error;
    }
  }

  // Create new family member
  static create(memberData: Omit<FamilyMember, 'id' | 'createdAt'>): FamilyMember {
    try {
      const id = require('uuid').v4();
      const now = new Date().toISOString();
      
      const stmt = this.db.prepare(`
        INSERT INTO family_members (
          id, user_id, name, age, gender, aadhaar_number, 
          avatar_url, is_head, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        memberData.userId,
        memberData.name,
        memberData.age,
        memberData.gender,
        memberData.aadhaarNumber,
        memberData.avatarUrl,
        memberData.isHead ? 1 : 0,
        now
      );
      
      const newMember = this.findById(id);
      if (!newMember) {
        throw new Error('Failed to create family member');
      }
      
      logger.info(`Family member created successfully: ${id}`);
      return newMember;
    } catch (error) {
      logger.error('Error creating family member:', error);
      throw error;
    }
  }

  // Update family member
  static update(id: string, updates: Partial<Omit<FamilyMember, 'id' | 'userId' | 'createdAt'>>): FamilyMember | null {
    try {
      const existingMember = this.findById(id);
      if (!existingMember) {
        return null;
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(updates.name);
      }

      if (updates.age !== undefined) {
        updateFields.push('age = ?');
        updateValues.push(updates.age);
      }

      if (updates.gender !== undefined) {
        updateFields.push('gender = ?');
        updateValues.push(updates.gender);
      }

      if (updates.aadhaarNumber !== undefined) {
        updateFields.push('aadhaar_number = ?');
        updateValues.push(updates.aadhaarNumber);
      }

      if (updates.avatarUrl !== undefined) {
        updateFields.push('avatar_url = ?');
        updateValues.push(updates.avatarUrl);
      }

      if (updates.isHead !== undefined) {
        updateFields.push('is_head = ?');
        updateValues.push(updates.isHead ? 1 : 0);
      }

      if (updateFields.length === 0) {
        return existingMember;
      }

      updateValues.push(id);

      const stmt = this.db.prepare(`
        UPDATE family_members SET ${updateFields.join(', ')} WHERE id = ?
      `);
      
      stmt.run(...updateValues);
      
      const updatedMember = this.findById(id);
      logger.info(`Family member updated successfully: ${id}`);
      return updatedMember;
    } catch (error) {
      logger.error('Error updating family member:', error);
      throw error;
    }
  }

  // Delete family member
  static delete(id: string): boolean {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM family_members WHERE id = ?
      `);
      
      const result = stmt.run(id);
      
      if (result.changes > 0) {
        logger.info(`Family member deleted successfully: ${id}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error deleting family member:', error);
      throw error;
    }
  }

  // Count family members for a user
  static countByUserId(userId: string): number {
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM family_members WHERE user_id = ?
      `);
      
      const result = stmt.get(userId) as { count: number };
      
      return result.count;
    } catch (error) {
      logger.error('Error counting family members:', error);
      throw error;
    }
  }
}