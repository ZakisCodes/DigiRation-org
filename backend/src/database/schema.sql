-- DigiRation Database Schema
-- SQLite database for ration management system

-- Users and Family Management
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  ration_card_id TEXT UNIQUE NOT NULL,
  family_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  language TEXT DEFAULT 'en' CHECK(language IN ('en', 'hi', 'ta', 'te')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS family_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK(age > 0 AND age < 150),
  gender TEXT CHECK(gender IN ('M', 'F', 'O')),
  aadhaar_number TEXT UNIQUE,
  avatar_url TEXT,
  is_head BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ration Items Management
CREATE TABLE IF NOT EXISTS ration_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_hi TEXT, -- Hindi translation
  name_ta TEXT, -- Tamil translation
  name_te TEXT, -- Telugu translation
  category TEXT NOT NULL CHECK(category IN ('grains', 'pulses', 'oil', 'sugar', 'other')),
  unit TEXT NOT NULL CHECK(unit IN ('kg', 'liter', 'piece')),
  price_per_unit DECIMAL(10,2) NOT NULL CHECK(price_per_unit >= 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Shops and Stock Management
CREATE TABLE IF NOT EXISTS shops (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  phone_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_stock (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  available_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK(available_quantity >= 0),
  price_override DECIMAL(10,2) CHECK(price_override >= 0),
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES ration_items(id) ON DELETE CASCADE,
  UNIQUE(shop_id, item_id)
);

-- Member Quotas
CREATE TABLE IF NOT EXISTS member_quotas (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  monthly_limit DECIMAL(10,2) NOT NULL CHECK(monthly_limit >= 0),
  current_used DECIMAL(10,2) DEFAULT 0 CHECK(current_used >= 0),
  reset_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES family_members(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES ration_items(id) ON DELETE CASCADE,
  UNIQUE(member_id, item_id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  shop_id TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL CHECK(total_amount >= 0),
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'upi', 'card', 'qr')),
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  status TEXT DEFAULT 'initiated' CHECK(status IN ('initiated', 'verified', 'completed', 'cancelled')),
  qr_code TEXT,
  payment_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES family_members(id) ON DELETE CASCADE,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL CHECK(quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK(unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK(total_price >= 0),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES ration_items(id) ON DELETE CASCADE
);

-- Complaints and Feedback
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('stock', 'quality', 'pricing', 'service', 'technical', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS complaint_responses (
  id TEXT PRIMARY KEY,
  complaint_id TEXT NOT NULL,
  response_text TEXT NOT NULL,
  is_staff_response BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS complaint_attachments (
  id TEXT PRIMARY KEY,
  complaint_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Authentication and Sessions
CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  member_id TEXT,
  phone_number TEXT NOT NULL,
  otp_code TEXT,
  otp_expires_at DATETIME,
  is_verified BOOLEAN DEFAULT FALSE,
  jwt_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES family_members(id) ON DELETE SET NULL
);

-- Demand Forecasting Data
CREATE TABLE IF NOT EXISTS demand_forecasts (
  id TEXT PRIMARY KEY,
  area_code TEXT NOT NULL,
  item_id TEXT NOT NULL,
  forecast_date DATE NOT NULL,
  predicted_demand DECIMAL(10,2) NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK(confidence_score >= 0 AND confidence_score <= 1),
  historical_avg DECIMAL(10,2),
  seasonal_factor DECIMAL(3,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES ration_items(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_ration_card ON users(ration_card_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_aadhaar ON family_members(aadhaar_number);
CREATE INDEX IF NOT EXISTS idx_shop_stock_shop ON shop_stock(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_stock_item ON shop_stock(item_id);
CREATE INDEX IF NOT EXISTS idx_member_quotas_member ON member_quotas(member_id);
CREATE INDEX IF NOT EXISTS idx_member_quotas_item ON member_quotas(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_shop ON transactions(shop_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_phone ON auth_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_area ON demand_forecasts(area_code);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_item ON demand_forecasts(item_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_date ON demand_forecasts(forecast_date);