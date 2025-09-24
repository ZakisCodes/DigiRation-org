import { dbConnection } from '../database/connection';
import { MemberQuota } from '../types';
import { logger } from '../utils/logger';

export class MemberQuotaModel {
  private static db = dbConnection.getDatabase();

  // Convert database row to MemberQuota object
  private static rowToMemberQuota(row: any): MemberQuota {
    return {
      id: row.id,
      memberId: row.member_id,
      itemId: row.item_id,
      monthlyLimit: row.monthly_limit,
      currentUsed: row.current_used,
      resetDate: new Date(row.reset_date),
      createdAt: new Date(row.created_at)
    };
  }

  // Get quotas for a family member
  static findByMemberId(memberId: string): MemberQuota[] {
    try {
      const stmt = this.db.prepare(`
        SELECT mq.*, ri.name as item_name, ri.unit as item_unit
        FROM member_quotas mq
        JOIN ration_items ri ON mq.item_id = ri.id
        WHERE mq.member_id = ?
        ORDER BY ri.category, ri.name
      `);
      
      const rows = stmt.all(memberId);
      
      return rows.map(row => this.rowToMemberQuota(row));
    } catch (error) {
      logger.error('Error finding member quotas:', error);
      throw error;
    }
  }

  // Get quota for specific member and item
  static findByMemberAndItem(memberId: string, itemId: string): MemberQuota | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM member_quotas 
        WHERE member_id = ? AND item_id = ?
      `);
      
      const row = stmt.get(memberId, itemId);
      
      if (!row) {
        return null;
      }
      
      return this.rowToMemberQuota(row);
    } catch (error) {
      logger.error('Error finding member quota by member and item:', error);
      throw error;
    }
  }

  // Update quota usage
  static updateUsage(memberId: string, itemId: string, usedAmount: number): boolean {
    try {
      const stmt = this.db.prepare(`
        UPDATE member_quotas 
        SET current_used = current_used + ?
        WHERE member_id = ? AND item_id = ?
      `);
      
      const result = stmt.run(usedAmount, memberId, itemId);
      
      if (result.changes > 0) {
        logger.info(`Quota usage updated for member ${memberId}, item ${itemId}: +${usedAmount}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error updating quota usage:', error);
      throw error;
    }
  }

  // Check if member has sufficient quota
  static checkAvailableQuota(memberId: string, itemId: string, requestedAmount: number): {
    available: boolean;
    remainingQuota: number;
    monthlyLimit: number;
    currentUsed: number;
  } {
    try {
      const quota = this.findByMemberAndItem(memberId, itemId);
      
      if (!quota) {
        return {
          available: false,
          remainingQuota: 0,
          monthlyLimit: 0,
          currentUsed: 0
        };
      }

      const remainingQuota = quota.monthlyLimit - quota.currentUsed;
      const available = remainingQuota >= requestedAmount;

      return {
        available,
        remainingQuota,
        monthlyLimit: quota.monthlyLimit,
        currentUsed: quota.currentUsed
      };
    } catch (error) {
      logger.error('Error checking available quota:', error);
      return {
        available: false,
        remainingQuota: 0,
        monthlyLimit: 0,
        currentUsed: 0
      };
    }
  }

  // Reset monthly quotas (typically run on first day of month)
  static resetMonthlyQuotas(): number {
    try {
      const today = new Date();
      const stmt = this.db.prepare(`
        UPDATE member_quotas 
        SET current_used = 0, reset_date = ?
        WHERE reset_date <= ?
      `);
      
      // Set next reset date to first day of next month
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const result = stmt.run(
        nextMonth.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      
      if (result.changes > 0) {
        logger.info(`Reset ${result.changes} monthly quotas`);
      }
      
      return result.changes;
    } catch (error) {
      logger.error('Error resetting monthly quotas:', error);
      throw error;
    }
  }

  // Get quota summary for a member
  static getQuotaSummary(memberId: string): {
    totalItems: number;
    itemsWithQuota: number;
    totalQuotaUsed: number;
    averageUsagePercent: number;
  } {
    try {
      const stmt = this.db.prepare(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN monthly_limit > 0 THEN 1 END) as items_with_quota,
          SUM(current_used) as total_quota_used,
          AVG(CASE WHEN monthly_limit > 0 THEN (current_used * 100.0 / monthly_limit) ELSE 0 END) as avg_usage_percent
        FROM member_quotas 
        WHERE member_id = ?
      `);
      
      const result = stmt.get(memberId) as any;
      
      return {
        totalItems: result.total_items || 0,
        itemsWithQuota: result.items_with_quota || 0,
        totalQuotaUsed: result.total_quota_used || 0,
        averageUsagePercent: result.avg_usage_percent || 0
      };
    } catch (error) {
      logger.error('Error getting quota summary:', error);
      return {
        totalItems: 0,
        itemsWithQuota: 0,
        totalQuotaUsed: 0,
        averageUsagePercent: 0
      };
    }
  }
}