import { dbConnection } from '../database/connection';
import { ShopStock, Shop } from '../types';
import { logger } from '../utils/logger';

export class ShopStockModel {
  private static db = dbConnection.getDatabase();

  // Convert database row to ShopStock object
  private static rowToShopStock(row: any): ShopStock {
    return {
      id: row.id,
      shopId: row.shop_id,
      itemId: row.item_id,
      availableQuantity: row.available_quantity,
      priceOverride: row.price_override,
      lastUpdated: new Date(row.last_updated)
    };
  }

  // Get stock for a specific shop
  static findByShopId(shopId: string): ShopStock[] {
    try {
      const stmt = this.db.prepare(`
        SELECT ss.*, ri.name as item_name, ri.unit as item_unit, ri.price_per_unit as base_price
        FROM shop_stock ss
        JOIN ration_items ri ON ss.item_id = ri.id
        WHERE ss.shop_id = ? AND ri.is_active = 1
        ORDER BY ri.category, ri.name
      `);
      
      const rows = stmt.all(shopId);
      
      return rows.map(row => this.rowToShopStock(row));
    } catch (error) {
      logger.error('Error finding shop stock:', error);
      throw error;
    }
  }

  // Get stock for specific shop and item
  static findByShopAndItem(shopId: string, itemId: string): ShopStock | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM shop_stock 
        WHERE shop_id = ? AND item_id = ?
      `);
      
      const row = stmt.get(shopId, itemId);
      
      if (!row) {
        return null;
      }
      
      return this.rowToShopStock(row);
    } catch (error) {
      logger.error('Error finding shop stock by shop and item:', error);
      throw error;
    }
  }

  // Update stock quantity
  static updateQuantity(shopId: string, itemId: string, newQuantity: number): boolean {
    try {
      const stmt = this.db.prepare(`
        UPDATE shop_stock 
        SET available_quantity = ?, last_updated = ?
        WHERE shop_id = ? AND item_id = ?
      `);
      
      const result = stmt.run(
        newQuantity,
        new Date().toISOString(),
        shopId,
        itemId
      );
      
      if (result.changes > 0) {
        logger.info(`Stock updated for shop ${shopId}, item ${itemId}: ${newQuantity}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error updating stock quantity:', error);
      throw error;
    }
  }

  // Reduce stock (for transactions)
  static reduceStock(shopId: string, itemId: string, quantity: number): boolean {
    try {
      const stmt = this.db.prepare(`
        UPDATE shop_stock 
        SET available_quantity = available_quantity - ?, last_updated = ?
        WHERE shop_id = ? AND item_id = ? AND available_quantity >= ?
      `);
      
      const result = stmt.run(
        quantity,
        new Date().toISOString(),
        shopId,
        itemId,
        quantity
      );
      
      if (result.changes > 0) {
        logger.info(`Stock reduced for shop ${shopId}, item ${itemId}: -${quantity}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error reducing stock:', error);
      throw error;
    }
  }

  // Check if item is available in sufficient quantity
  static checkAvailability(shopId: string, itemId: string, requestedQuantity: number): {
    available: boolean;
    availableQuantity: number;
    requestedQuantity: number;
  } {
    try {
      const stock = this.findByShopAndItem(shopId, itemId);
      
      if (!stock) {
        return {
          available: false,
          availableQuantity: 0,
          requestedQuantity
        };
      }

      return {
        available: stock.availableQuantity >= requestedQuantity,
        availableQuantity: stock.availableQuantity,
        requestedQuantity
      };
    } catch (error) {
      logger.error('Error checking stock availability:', error);
      return {
        available: false,
        availableQuantity: 0,
        requestedQuantity
      };
    }
  }

  // Get low stock items for a shop
  static getLowStockItems(shopId: string, threshold: number = 10): ShopStock[] {
    try {
      const stmt = this.db.prepare(`
        SELECT ss.*, ri.name as item_name, ri.unit as item_unit
        FROM shop_stock ss
        JOIN ration_items ri ON ss.item_id = ri.id
        WHERE ss.shop_id = ? AND ss.available_quantity <= ? AND ri.is_active = 1
        ORDER BY ss.available_quantity ASC
      `);
      
      const rows = stmt.all(shopId, threshold);
      
      return rows.map(row => this.rowToShopStock(row));
    } catch (error) {
      logger.error('Error finding low stock items:', error);
      throw error;
    }
  }

  // Get stock summary for a shop
  static getStockSummary(shopId: string): {
    totalItems: number;
    inStockItems: number;
    outOfStockItems: number;
    lowStockItems: number;
    totalValue: number;
  } {
    try {
      const stmt = this.db.prepare(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN ss.available_quantity > 0 THEN 1 END) as in_stock_items,
          COUNT(CASE WHEN ss.available_quantity = 0 THEN 1 END) as out_of_stock_items,
          COUNT(CASE WHEN ss.available_quantity > 0 AND ss.available_quantity <= 10 THEN 1 END) as low_stock_items,
          SUM(ss.available_quantity * COALESCE(ss.price_override, ri.price_per_unit)) as total_value
        FROM shop_stock ss
        JOIN ration_items ri ON ss.item_id = ri.id
        WHERE ss.shop_id = ? AND ri.is_active = 1
      `);
      
      const result = stmt.get(shopId) as any;
      
      return {
        totalItems: result.total_items || 0,
        inStockItems: result.in_stock_items || 0,
        outOfStockItems: result.out_of_stock_items || 0,
        lowStockItems: result.low_stock_items || 0,
        totalValue: result.total_value || 0
      };
    } catch (error) {
      logger.error('Error getting stock summary:', error);
      return {
        totalItems: 0,
        inStockItems: 0,
        outOfStockItems: 0,
        lowStockItems: 0,
        totalValue: 0
      };
    }
  }
}

export class ShopModel {
  private static db = dbConnection.getDatabase();

  // Convert database row to Shop object
  private static rowToShop(row: any): Shop {
    return {
      id: row.id,
      name: row.name,
      address: {
        line1: row.address_line1,
        line2: row.address_line2,
        city: row.city,
        state: row.state,
        pincode: row.pincode
      },
      phoneNumber: row.phone_number,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at)
    };
  }

  // Get all active shops
  static findAllActive(): Shop[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM shops 
        WHERE is_active = 1 
        ORDER BY name
      `);
      
      const rows = stmt.all();
      
      return rows.map(row => this.rowToShop(row));
    } catch (error) {
      logger.error('Error finding active shops:', error);
      throw error;
    }
  }

  // Find shop by ID
  static findById(id: string): Shop | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM shops WHERE id = ?
      `);
      
      const row = stmt.get(id);
      
      if (!row) {
        return null;
      }
      
      return this.rowToShop(row);
    } catch (error) {
      logger.error('Error finding shop by ID:', error);
      throw error;
    }
  }

  // Find shops by city
  static findByCity(city: string): Shop[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM shops 
        WHERE city = ? AND is_active = 1 
        ORDER BY name
      `);
      
      const rows = stmt.all(city);
      
      return rows.map(row => this.rowToShop(row));
    } catch (error) {
      logger.error('Error finding shops by city:', error);
      throw error;
    }
  }

  // Find shops by pincode
  static findByPincode(pincode: string): Shop[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM shops 
        WHERE pincode = ? AND is_active = 1 
        ORDER BY name
      `);
      
      const rows = stmt.all(pincode);
      
      return rows.map(row => this.rowToShop(row));
    } catch (error) {
      logger.error('Error finding shops by pincode:', error);
      throw error;
    }
  }
}