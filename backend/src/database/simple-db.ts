import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { logger } from '../utils/logger';

// Simple JSON-based database for development (no native compilation required)
class SimpleDatabase {
  private data: any = {};
  private dbPath: string;
  private static instance: SimpleDatabase;

  private constructor() {
    this.dbPath = process.env.DB_PATH || './data/digiration.json';
    this.ensureDataDir();
    this.loadData();
    this.initializeSchema();
  }

  public static getInstance(): SimpleDatabase {
    if (!SimpleDatabase.instance) {
      SimpleDatabase.instance = new SimpleDatabase();
    }
    return SimpleDatabase.instance;
  }

  private ensureDataDir(): void {
    const dataDir = dirname(this.dbPath);
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (existsSync(this.dbPath)) {
        const fileContent = readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(fileContent);
        logger.info('Database loaded from file');
      } else {
        this.data = {};
        logger.info('New database created');
      }
    } catch (error) {
      logger.error('Failed to load database:', error);
      this.data = {};
    }
  }

  private saveData(): void {
    try {
      writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      logger.error('Failed to save database:', error);
    }
  }

  private initializeSchema(): void {
    // Initialize tables if they don't exist
    const tables = [
      'users', 'family_members', 'ration_items', 'shops', 'shop_stock',
      'member_quotas', 'transactions', 'transaction_items', 'complaints',
      'complaint_responses', 'complaint_attachments', 'auth_sessions',
      'demand_forecasts'
    ];

    tables.forEach(table => {
      if (!this.data[table]) {
        this.data[table] = [];
      }
    });

    // Add seed data if tables are empty
    if (this.data.users.length === 0) {
      this.seedData();
    }

    this.saveData();
    logger.info('Database schema initialized');
  }

  private seedData(): void {
    // Seed users
    this.data.users = [
      {
        id: 'user-1',
        ration_card_id: 'RC001234567890',
        family_name: 'Sharma Family',
        phone_number: '+919876543210',
        address_line1: '123 Gandhi Street',
        address_line2: 'Near City Hospital',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-2',
        ration_card_id: 'RC001234567891',
        family_name: 'Kumar Family',
        phone_number: '+919876543211',
        address_line1: '456 Nehru Road',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        language: 'hi',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Seed family members
    this.data.family_members = [
      {
        id: 'member-1',
        user_id: 'user-1',
        name: 'Rajesh Sharma',
        age: 45,
        gender: 'M',
        aadhaar_number: '123456789012',
        avatar_url: '/avatars/male-1.png',
        is_head: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'member-2',
        user_id: 'user-1',
        name: 'Priya Sharma',
        age: 40,
        gender: 'F',
        aadhaar_number: '123456789013',
        avatar_url: '/avatars/female-1.png',
        is_head: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'member-3',
        user_id: 'user-1',
        name: 'Arjun Sharma',
        age: 18,
        gender: 'M',
        aadhaar_number: '123456789014',
        avatar_url: '/avatars/male-2.png',
        is_head: 0,
        created_at: new Date().toISOString()
      }
    ];

    // Seed ration items
    this.data.ration_items = [
      {
        id: 'item-1',
        name: 'Rice',
        name_hi: 'चावल',
        name_ta: 'அரிசி',
        name_te: 'బియ్యం',
        category: 'grains',
        unit: 'kg',
        price_per_unit: 2.00,
        image_url: '/items/rice.jpg',
        is_active: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'item-2',
        name: 'Wheat',
        name_hi: 'गेहूं',
        name_ta: 'கோதுமை',
        name_te: 'గోధుమ',
        category: 'grains',
        unit: 'kg',
        price_per_unit: 2.50,
        image_url: '/items/wheat.jpg',
        is_active: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'item-3',
        name: 'Sugar',
        name_hi: 'चीनी',
        name_ta: 'சர்க்கரை',
        name_te: 'చక్కెర',
        category: 'sugar',
        unit: 'kg',
        price_per_unit: 20.00,
        image_url: '/items/sugar.jpg',
        is_active: 1,
        created_at: new Date().toISOString()
      }
    ];

    // Seed member quotas
    this.data.member_quotas = [
      {
        id: 'quota-1',
        member_id: 'member-1',
        item_id: 'item-1',
        monthly_limit: 10,
        current_used: 3,
        reset_date: '2025-10-01',
        created_at: new Date().toISOString()
      },
      {
        id: 'quota-2',
        member_id: 'member-1',
        item_id: 'item-2',
        monthly_limit: 8,
        current_used: 2,
        reset_date: '2025-10-01',
        created_at: new Date().toISOString()
      }
    ];

    logger.info('Seed data added to database');
  }

  // Database operations
  public async get(table: string, id: string): Promise<any> {
    return this.data[table]?.find((item: any) => item.id === id) || null;
  }

  public async getAll(table: string): Promise<any[]> {
    return this.data[table] || [];
  }

  public async findOne(table: string, criteria: any): Promise<any> {
    return this.data[table]?.find((item: any) => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    }) || null;
  }

  public async findMany(table: string, criteria: any = {}): Promise<any[]> {
    if (Object.keys(criteria).length === 0) {
      return this.data[table] || [];
    }
    
    return this.data[table]?.filter((item: any) => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    }) || [];
  }

  public async insert(table: string, data: any): Promise<any> {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    
    const item = { ...data, created_at: new Date().toISOString() };
    this.data[table].push(item);
    this.saveData();
    return item;
  }

  public async update(table: string, id: string, data: any): Promise<any> {
    const index = this.data[table]?.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      this.data[table][index] = { 
        ...this.data[table][index], 
        ...data, 
        updated_at: new Date().toISOString() 
      };
      this.saveData();
      return this.data[table][index];
    }
    return null;
  }

  public async delete(table: string, id: string): Promise<boolean> {
    const index = this.data[table]?.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      this.data[table].splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  public async isHealthy(): Promise<boolean> {
    return true;
  }
}

// Export singleton instance
export const simpleDb = SimpleDatabase.getInstance();
export default simpleDb;