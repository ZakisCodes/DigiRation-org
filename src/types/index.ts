// Frontend types for DigiRation PWA

export interface User {
  id: string;
  rationCardId: string;
  familyName: string;
  phoneNumber: string;
  address: Address;
  language: Language;
  createdAt: string;
  updatedAt: string;
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
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  avatarUrl?: string;
  isHead: boolean;
  createdAt?: string;
}

export interface RationItem {
  id: string;
  name: string;
  nameTranslations?: Record<Language, string>;
  category: ItemCategory;
  unit: ItemUnit;
  pricePerUnit: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface MemberQuota {
  id: string;
  itemId: string;
  itemName: string;
  itemUnit: string;
  monthlyLimit: number;
  currentUsed: number;
  remainingQuota: number;
  usagePercent: number;
  resetDate: string;
  status: 'available' | 'low' | 'exhausted';
}

export interface Shop {
  id: string;
  name: string;
  address: Address;
  phoneNumber?: string;
  stockSummary?: StockSummary;
}

export interface StockSummary {
  totalItems: number;
  inStockItems: number;
  outOfStockItems: number;
  lowStockItems: number;
  totalValue: number;
}

export interface ShopStock {
  id: string;
  itemId: string;
  itemName: string;
  itemUnit: string;
  itemCategory: string;
  availableQuantity: number;
  basePrice: number;
  effectivePrice: number;
  priceOverride?: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Transaction {
  id: string;
  userId: string;
  memberId: string;
  memberName: string;
  shopId: string;
  shopName: string;
  items: TransactionItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: TransactionStatus;
  qrCode?: string;
  paymentReference?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransactionItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
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

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
  message?: string;
  timestamp: string;
}

// Authentication Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  selectedMember: FamilyMember | null;
  token: string | null;
  sessionId: string | null;
}

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

// UI Component Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'password' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  options?: { value: string; label: string }[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}