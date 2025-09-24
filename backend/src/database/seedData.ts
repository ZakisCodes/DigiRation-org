import { dbConnection } from './connection';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

interface SeedData {
  users: any[];
  familyMembers: any[];
  rationItems: any[];
  shops: any[];
  shopStock: any[];
  memberQuotas: any[];
}

export function seedDatabase(): void {
  const db = dbConnection.getDatabase();
  
  try {
    // Check if data already exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count > 0) {
      logger.info('Database already seeded, skipping...');
      return;
    }

    logger.info('Seeding database with initial data...');

    const seedData = generateSeedData();
    
    // Seed in transaction for consistency
    dbConnection.transaction(() => {
      seedUsers(db, seedData.users);
      seedFamilyMembers(db, seedData.familyMembers);
      seedRationItems(db, seedData.rationItems);
      seedShops(db, seedData.shops);
      seedShopStock(db, seedData.shopStock);
      seedMemberQuotas(db, seedData.memberQuotas);
    })();

    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error('Failed to seed database:', error);
    throw error;
  }
}

function generateSeedData(): SeedData {
  const users = [
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
      language: 'en'
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
      language: 'hi'
    },
    {
      id: 'user-3',
      ration_card_id: 'RC001234567892',
      family_name: 'Raman Family',
      phone_number: '+919876543212',
      address_line1: '789 Anna Salai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      language: 'ta'
    }
  ];

  const familyMembers = [
    // Sharma Family
    {
      id: 'member-1',
      user_id: 'user-1',
      name: 'Rajesh Sharma',
      age: 45,
      gender: 'M',
      aadhaar_number: '123456789012',
      avatar_url: '/avatars/male-1.png',
      is_head: 1
    },
    {
      id: 'member-2',
      user_id: 'user-1',
      name: 'Priya Sharma',
      age: 40,
      gender: 'F',
      aadhaar_number: '123456789013',
      avatar_url: '/avatars/female-1.png',
      is_head: 0
    },
    {
      id: 'member-3',
      user_id: 'user-1',
      name: 'Arjun Sharma',
      age: 18,
      gender: 'M',
      aadhaar_number: '123456789014',
      avatar_url: '/avatars/male-2.png',
      is_head: 0
    },
    // Kumar Family
    {
      id: 'member-4',
      user_id: 'user-2',
      name: 'Suresh Kumar',
      age: 50,
      gender: 'M',
      aadhaar_number: '123456789015',
      avatar_url: '/avatars/male-3.png',
      is_head: 1
    },
    {
      id: 'member-5',
      user_id: 'user-2',
      name: 'Sunita Kumar',
      age: 45,
      gender: 'F',
      aadhaar_number: '123456789016',
      avatar_url: '/avatars/female-2.png',
      is_head: 0
    },
    // Raman Family
    {
      id: 'member-6',
      user_id: 'user-3',
      name: 'Venkat Raman',
      age: 55,
      gender: 'M',
      aadhaar_number: '123456789017',
      avatar_url: '/avatars/male-4.png',
      is_head: 1
    }
  ];

  const rationItems = [
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
      is_active: 1
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
      is_active: 1
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
      is_active: 1
    },
    {
      id: 'item-4',
      name: 'Cooking Oil',
      name_hi: 'खाना पकाने का तेल',
      name_ta: 'சமையல் எண்ணெய்',
      name_te: 'వంట నూనె',
      category: 'oil',
      unit: 'liter',
      price_per_unit: 80.00,
      image_url: '/items/oil.jpg',
      is_active: 1
    },
    {
      id: 'item-5',
      name: 'Toor Dal',
      name_hi: 'तूर दाल',
      name_ta: 'துவரம் பருப்பு',
      name_te: 'కంది పప్పు',
      category: 'pulses',
      unit: 'kg',
      price_per_unit: 60.00,
      image_url: '/items/toor-dal.jpg',
      is_active: 1
    }
  ];

  const shops = [
    {
      id: 'shop-1',
      name: 'Gandhi Street Ration Shop',
      address_line1: '100 Gandhi Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone_number: '+912212345678',
      is_active: 1
    },
    {
      id: 'shop-2',
      name: 'Central Delhi Ration Center',
      address_line1: '200 Nehru Road',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone_number: '+911112345678',
      is_active: 1
    },
    {
      id: 'shop-3',
      name: 'Anna Salai Ration Store',
      address_line1: '300 Anna Salai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      phone_number: '+914412345678',
      is_active: 1
    }
  ];

  const shopStock = [];
  const memberQuotas = [];

  // Generate shop stock for all items in all shops
  for (const shop of shops) {
    for (const item of rationItems) {
      shopStock.push({
        id: uuidv4(),
        shop_id: shop.id,
        item_id: item.id,
        available_quantity: Math.floor(Math.random() * 1000) + 100, // 100-1100 units
        price_override: null,
        last_updated: new Date().toISOString()
      });
    }
  }

  // Generate member quotas for all family members and items
  for (const member of familyMembers) {
    for (const item of rationItems) {
      let monthlyLimit = 0;
      
      // Set realistic quotas based on item type
      switch (item.category) {
        case 'grains':
          monthlyLimit = 10; // 10 kg per month
          break;
        case 'sugar':
          monthlyLimit = 1; // 1 kg per month
          break;
        case 'oil':
          monthlyLimit = 1; // 1 liter per month
          break;
        case 'pulses':
          monthlyLimit = 2; // 2 kg per month
          break;
        default:
          monthlyLimit = 5;
      }

      memberQuotas.push({
        id: uuidv4(),
        member_id: member.id,
        item_id: item.id,
        monthly_limit: monthlyLimit,
        current_used: Math.floor(Math.random() * monthlyLimit * 0.7), // 0-70% used
        reset_date: getNextMonthFirstDay()
      });
    }
  }

  return {
    users,
    familyMembers,
    rationItems,
    shops,
    shopStock,
    memberQuotas
  };
}

function seedUsers(db: any, users: any[]): void {
  const stmt = db.prepare(`
    INSERT INTO users (id, ration_card_id, family_name, phone_number, address_line1, address_line2, city, state, pincode, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of users) {
    stmt.run(
      user.id,
      user.ration_card_id,
      user.family_name,
      user.phone_number,
      user.address_line1,
      user.address_line2,
      user.city,
      user.state,
      user.pincode,
      user.language
    );
  }
}

function seedFamilyMembers(db: any, members: any[]): void {
  const stmt = db.prepare(`
    INSERT INTO family_members (id, user_id, name, age, gender, aadhaar_number, avatar_url, is_head)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const member of members) {
    stmt.run(
      member.id,
      member.user_id,
      member.name,
      member.age,
      member.gender,
      member.aadhaar_number,
      member.avatar_url,
      member.is_head
    );
  }
}

function seedRationItems(db: any, items: any[]): void {
  const stmt = db.prepare(`
    INSERT INTO ration_items (id, name, name_hi, name_ta, name_te, category, unit, price_per_unit, image_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    stmt.run(
      item.id,
      item.name,
      item.name_hi,
      item.name_ta,
      item.name_te,
      item.category,
      item.unit,
      item.price_per_unit,
      item.image_url,
      item.is_active
    );
  }
}

function seedShops(db: any, shops: any[]): void {
  const stmt = db.prepare(`
    INSERT INTO shops (id, name, address_line1, address_line2, city, state, pincode, phone_number, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const shop of shops) {
    stmt.run(
      shop.id,
      shop.name,
      shop.address_line1,
      shop.address_line2,
      shop.city,
      shop.state,
      shop.pincode,
      shop.phone_number,
      shop.is_active
    );
  }
}

function seedShopStock(db: any, stock: any[]): void {
  const stmt = db.prepare(`
    INSERT INTO shop_stock (id, shop_id, item_id, available_quantity, price_override, last_updated)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const item of stock) {
    stmt.run(
      item.id,
      item.shop_id,
      item.item_id,
      item.available_quantity,
      item.price_override,
      item.last_updated
    );
  }
}

function seedMemberQuotas(db: any, quotas: any[]): void {
  const stmt = db.prepare(`
    INSERT INTO member_quotas (id, member_id, item_id, monthly_limit, current_used, reset_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const quota of quotas) {
    stmt.run(
      quota.id,
      quota.member_id,
      quota.item_id,
      quota.monthly_limit,
      quota.current_used,
      quota.reset_date
    );
  }
}

function getNextMonthFirstDay(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().split('T')[0];
}