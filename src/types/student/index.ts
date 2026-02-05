// Student Types for Univibe Student Platform

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  faculty: string;
  group: string;
  year: number;
  coins: number;
  rank: number;
  previousRank?: number;
  badges: Badge[];
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'academic' | 'event' | 'urgent';
  createdAt: string;
  author: string;
  isPinned: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  capacity: number;
  registeredCount: number;
  registrationDeadline: string;
  category: EventCategory;
  tags: string[];
  coinReward: number;
  badgeReward?: string;
  status: EventStatus;
}

export type EventCategory = 
  | 'academic'
  | 'sports'
  | 'cultural'
  | 'workshop'
  | 'career'
  | 'social'
  | 'volunteer';

export type EventStatus = 'open' | 'registered' | 'closed' | 'cancelled';

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  status: RegistrationStatus;
  registeredAt: string;
  attendedAt?: string;
  coinsEarned?: number;
}

export type RegistrationStatus = 
  | 'registered'
  | 'attended'
  | 'cancelled'
  | 'no-show';

export interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  student: {
    id: string;
    name: string;
    avatar?: string;
    faculty: string;
  };
  coins: number;
  eventsAttended: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: ShopCategory;
  coinCost: number;
  stock: number;
  rules?: string;
  isAvailable: boolean;
}

export type ShopCategory = 'merch' | 'services' | 'privileges';

export interface Transaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  source: TransactionSource;
  referenceId?: string;
  createdAt: string;
}

export type TransactionSource = 
  | 'event_attendance'
  | 'achievement'
  | 'bonus'
  | 'shop_redemption'
  | 'refund';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  referenceId?: string;
}

export type NotificationType = 
  | 'announcement'
  | 'event_reminder'
  | 'registration_update'
  | 'coins_received'
  | 'redeem_status'
  | 'achievement';

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Filter types
export interface EventFilters {
  search?: string;
  category?: EventCategory;
  status?: EventStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'newest' | 'popular';
}

export interface ShopFilters {
  search?: string;
  category?: ShopCategory;
  minCost?: number;
  maxCost?: number;
  availableOnly?: boolean;
}

export interface TransactionFilters {
  type?: 'earned' | 'spent' | 'all';
  dateFrom?: string;
  dateTo?: string;
}
