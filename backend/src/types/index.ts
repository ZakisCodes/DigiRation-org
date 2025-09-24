// Core data types for DigiRation system

export interface User {
  id: string;
  rationCardId: string;
  familyName: string;
  phoneNumber: string;
  address: Address;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  aadhaarNumber?: string;
  avatarUrl?: string;
  isHead: boolean;
  createdAt: Date;
}

export interface RationItem {
  id: string;
  name: string;
  nameTranslations: Record<Language, string>;
  category: ItemCategory;
  unit: ItemUnit;
  pricePerUnit: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Shop {
  id: string;
  name: string;
  address: Address;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ShopStock {
  id: string;
  shopId: string;
  itemId: string;
  availableQuantity: number;
  priceOverride?: number;
  lastUpdated: Date;
}

export interface MemberQuota {
  id: string;
  memberId: string;
  itemId: string;
  monthlyLimit: number;
  currentUsed: number;
  resetDate: Date;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  memberId: string;
  shopId: string;
  items: TransactionItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: TransactionStatus;
  qrCode?: string;
  paymentReference?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Complaint {
  id: string;
  userId: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  attachments: ComplaintAttachment[];
  responses: ComplaintResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplaintResponse {
  id: string;
  complaintId: string;
  responseText: string;
  isStaffResponse: boolean;
  createdAt: Date;
}

export interface ComplaintAttachment {
  id: string;
  complaintId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  memberId?: string;
  phoneNumber: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  isVerified: boolean;
  jwtToken?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface DemandForecast {
  id: string;
  areaCode: string;
  itemId: string;
  forecastDate: Date;
  predictedDemand: number;
  confidenceScore: number;
  historicalAvg?: number;
  seasonalFactor?: number;
  createdAt: Date;
}

// Enums and Union Types
export type Language = 'en' | 'hi' | 'ta' | 'te';

export type ItemCategory = 'grains' | 'pulses' | 'oil' | 'sugar' | 'other';

export type ItemUnit = 'kg' | 'liter' | 'piece';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'qr';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type TransactionStatus = 'initiated' | 'verified' | 'completed' | 'cancelled';

export type ComplaintCategory = 'stock' | 'quality' | 'pricing' | 'service' | 'technical' | 'other';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// API Request/Response Types
export interface LoginRequest {
  rationCardId: string;
  phoneNumber: string;
}

export interface VerifyOtpRequest {
  sessionId: string;
  otpCode: string;
}

export interface SelectMemberRequest {
  sessionId: string;
  memberId: string;
}

export interface VerifyAadhaarRequest {
  sessionId: string;
  aadhaarNumber: string;
}

export interface AuthResponse {
  success: boolean;
  sessionId?: string;
  token?: string;
  user?: User;
  member?: FamilyMember;
  familyMembers?: FamilyMember[];
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Database row types (snake_case from SQLite)
export interface UserRow {
  id: string;
  ration_card_id: string;
  family_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMemberRow {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  aadhaar_number?: string;
  avatar_url?: string;
  is_head: number; // SQLite boolean as integer
  created_at: string;
}

export interface RationItemRow {
  id: string;
  name: string;
  name_hi?: string;
  name_ta?: string;
  name_te?: string;
  category: string;
  unit: string;
  price_per_unit: number;
  image_url?: string;
  is_active: number; // SQLite boolean as integer
  created_at: string;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  member_id: string;
  shop_id: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  qr_code?: string;
  payment_reference?: string;
  created_at: string;
  completed_at?: string;
}