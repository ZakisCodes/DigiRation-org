import { dbConnection } from '../database/connection';
import { RationItem, RationItemRow, Language } from '../types';
import { logger } from '../utils/logger';

export class RationItemModel {
  private static db = dbConnection.getDatabase();

  // Convert database row to RationItem object
  private static rowToRationItem(row: RationItemRow): RationItem {
    return {
      id: row.id,
      name: row.name,
      nameTranslations: {
        en: row.name,
        hi: row.name_hi || row.name,
        ta: row.name_ta || row.name,
        te: row.name_te || row.name
      },
      category: row.category as any,
      unit: row.unit as any,
      pricePerUnit: row.price_per_unit,
      imageUrl: row.image_url,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at)
    };
  }

  // Get all active ration items
  static findAllActive(): RationItem[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM ration_items 
        WHERE is_active = 1 
        ORDER BY category, name
      `);
      
      const rows = stmt.all() as RationItemRow[];
      
      return rows.map(row => this.rowToRationItem(row));
    } catch (error) {
      logger.error('Error finding active ration items:', error);
      throw error;
    }
  }

  // Find ration item by ID
  static findById(id: string): RationItem | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM ration_items WHERE id = ?
      `);
      
      const row = stmt.get(id) as RationItemRow | undefined;
      
      if (!row) {
        return null;
      }
      
      return this.rowToRationItem(row);
    } catch (error) {
      logger.error('Error finding ration item by ID:', error);
      throw error;
    }
  }

  // Find items by category
  static findByCategory(category: string): RationItem[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM ration_items 
        WHERE category = ? AND is_active = 1 
        ORDER BY name
      `);
      
      const rows = stmt.all(category) as RationItemRow[];
      
      return rows.map(row => this.rowToRationItem(row));
    } catch (error) {
      logger.error('Error finding ration items by category:', error);
      throw error;
    }
  }

  // Get item with localized name
  static getLocalizedName(item: RationItem, language: Language): string {
    return item.nameTranslations[language] || item.name;
  }

  // Get all categories
  static getCategories(): string[] {
    try {
      const stmt = this.db.prepare(`
        SELECT DISTINCT category FROM ration_items 
        WHERE is_active = 1 
        ORDER BY category
      `);
      
      const rows = stmt.all() as { category: string }[];
      
      return rows.map(row => row.category);
    } catch (error) {
      logger.error('Error getting ration item categories:', error);
      throw error;
    }
  }

  // Search items by name
  static searchByName(searchTerm: string, language: Language = 'en'): RationItem[] {
    try {
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      
      let stmt;
      if (language === 'en') {
        stmt = this.db.prepare(`
          SELECT * FROM ration_items 
          WHERE LOWER(name) LIKE ? AND is_active = 1 
          ORDER BY name
        `);
      } else {
        const langColumn = `name_${language}`;
        stmt = this.db.prepare(`
          SELECT * FROM ration_items 
          WHERE (LOWER(name) LIKE ? OR LOWER(${langColumn}) LIKE ?) AND is_active = 1 
          ORDER BY name
        `);
      }
      
      const rows = language === 'en' 
        ? stmt.all(searchPattern) as RationItemRow[]
        : stmt.all(searchPattern, searchPattern) as RationItemRow[];
      
      return rows.map(row => this.rowToRationItem(row));
    } catch (error) {
      logger.error('Error searching ration items by name:', error);
      throw error;
    }
  }
}