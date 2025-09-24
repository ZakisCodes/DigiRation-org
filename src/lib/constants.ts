import { NavItem } from '@/types';
import { 
  HomeIcon, 
  ItemsIcon, 
  HistoryIcon, 
  ScanIcon, 
  ProfileIcon 
} from './icons';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Navigation Items
export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: HomeIcon,
    href: '/dashboard',
  },
  {
    id: 'items',
    label: 'Items',
    icon: ItemsIcon,
    href: '/items',
  },
  {
    id: 'history',
    label: 'History',
    icon: HistoryIcon,
    href: '/history',
  },
  {
    id: 'scan',
    label: 'Scan',
    icon: ScanIcon,
    href: '/scan',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: ProfileIcon,
    href: '/profile',
  },
];

// Language Options
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
] as const;

// Item Categories
export const ITEM_CATEGORIES = [
  { id: 'grains', name: 'Grains', icon: '🌾' },
  { id: 'pulses', name: 'Pulses', icon: '🫘' },
  { id: 'oil', name: 'Oil', icon: '🫒' },
  { id: 'sugar', name: 'Sugar', icon: '🍯' },
  { id: 'other', name: 'Other', icon: '📦' },
] as const;

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'upi', name: 'UPI', icon: '📱' },
  { id: 'qr', name: 'QR Code', icon: '📷' },
  { id: 'card', name: 'Card', icon: '💳' },
  { id: 'cash', name: 'Cash', icon: '💵' },
] as const;

// Status Colors
export const STATUS_COLORS = {
  // Transaction Status
  initiated: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  
  // Payment Status
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  
  // Stock Status
  in_stock: 'bg-green-100 text-green-800',
  low_stock: 'bg-yellow-100 text-yellow-800',
  out_of_stock: 'bg-red-100 text-red-800',
  
  // Quota Status
  available: 'bg-green-100 text-green-800',
  low: 'bg-yellow-100 text-yellow-800',
  exhausted: 'bg-red-100 text-red-800',
  
  // Complaint Status
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'digiration_auth_token',
  USER_DATA: 'digiration_user_data',
  SELECTED_MEMBER: 'digiration_selected_member',
  LANGUAGE: 'digiration_language',
  OFFLINE_QUEUE: 'digiration_offline_queue',
} as const;

// App Configuration
export const APP_CONFIG = {
  name: 'DigiRation',
  version: '1.0.0',
  description: 'Digital Ration Management System',
  supportEmail: 'support@digiration.gov.in',
  supportPhone: '+91-1800-XXX-XXXX',
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  RATION_CARD_ID: /^[A-Z0-9]{10,20}$/,
  PHONE_NUMBER: /^\+91[6-9]\d{9}$/,
  AADHAAR_NUMBER: /^\d{12}$/,
  OTP: /^\d{6}$/,
  PINCODE: /^\d{6}$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid ration card ID or phone number.',
  INVALID_OTP: 'Invalid or expired OTP.',
  SESSION_EXPIRED: 'Session expired. Please login again.',
  MEMBER_NOT_SELECTED: 'Please select a family member.',
  INSUFFICIENT_QUOTA: 'Insufficient quota for this item.',
  OUT_OF_STOCK: 'Item is out of stock.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  OTP_SENT: 'OTP sent successfully.',
  LOGIN_SUCCESS: 'Login successful.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  TRANSACTION_COMPLETED: 'Transaction completed successfully.',
  COMPLAINT_SUBMITTED: 'Complaint submitted successfully.',
} as const;

// Timeouts and Intervals
export const TIMEOUTS = {
  OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes
  SESSION_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  API_TIMEOUT: 30 * 1000, // 30 seconds
  RETRY_DELAY: 1000, // 1 second
  DEBOUNCE_DELAY: 300, // 300ms
} as const;