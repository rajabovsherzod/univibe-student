// Student API Service Layer
import {
  Student,
  Announcement,
  Event,
  Registration,
  LeaderboardEntry,
  ShopItem,
  Transaction,
  Notification,
  EventFilters,
  ShopFilters,
  TransactionFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types/student';

import {
  mockStudent,
  mockAnnouncements,
  mockEvents,
  mockRegistrations,
  mockLeaderboard,
  mockShopItems,
  mockTransactions,
  mockNotifications,
} from './data';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Student Profile
export async function getStudent(): Promise<Student> {
  await delay(200);
  return mockStudent;
}

// Announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  await delay(300);
  return mockAnnouncements.sort((a, b) => {
    // Pinned first, then by date
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Events
export async function getEvents(filters?: EventFilters): Promise<Event[]> {
  await delay(300);
  let events = [...mockEvents];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    events = events.filter(
      e =>
        e.title.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search) ||
        e.tags.some(t => t.toLowerCase().includes(search))
    );
  }

  if (filters?.category) {
    events = events.filter(e => e.category === filters.category);
  }

  if (filters?.status) {
    events = events.filter(e => e.status === filters.status);
  }

  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'date':
        events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'newest':
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'popular':
        events.sort((a, b) => b.registeredCount - a.registeredCount);
        break;
    }
  }

  return events;
}

export async function getEvent(id: string): Promise<Event | null> {
  await delay(200);
  return mockEvents.find(e => e.id === id) || null;
}

export async function getSimilarEvents(eventId: string, category: string): Promise<Event[]> {
  await delay(200);
  return mockEvents.filter(e => e.id !== eventId && e.category === category).slice(0, 3);
}

// Registrations
export async function registerForEvent(eventId: string): Promise<ApiResponse<Registration>> {
  await delay(500);

  const event = mockEvents.find(e => e.id === eventId);
  if (!event) {
    return { success: false, error: 'Event not found' };
  }

  if (event.status === 'closed') {
    return { success: false, error: 'Event registration is closed' };
  }

  if (event.registeredCount >= event.capacity) {
    return { success: false, error: 'Event is full' };
  }

  const registration: Registration = {
    id: `reg-${Date.now()}`,
    eventId,
    studentId: mockStudent.id,
    status: 'registered',
    registeredAt: new Date().toISOString(),
  };

  // Update event status in mock data
  event.status = 'registered';
  event.registeredCount++;

  return { success: true, data: registration };
}

export async function cancelRegistration(eventId: string): Promise<ApiResponse<void>> {
  await delay(500);

  const event = mockEvents.find(e => e.id === eventId);
  if (event) {
    event.status = 'open';
    event.registeredCount = Math.max(0, event.registeredCount - 1);
  }

  return { success: true };
}

export async function getMyEvents(status?: 'registered' | 'attended' | 'past'): Promise<Event[]> {
  await delay(300);

  // Filter based on registration status
  const registeredEventIds = mockRegistrations
    .filter(r => !status || r.status === status || (status === 'past' && r.status === 'attended'))
    .map(r => r.eventId);

  return mockEvents.filter(e =>
    registeredEventIds.includes(e.id) || e.status === 'registered'
  );
}

// Leaderboard
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  await delay(300);
  return mockLeaderboard;
}

export async function getCurrentUserRank(): Promise<LeaderboardEntry | null> {
  await delay(100);
  return mockLeaderboard.find(e => e.student.id === mockStudent.id) || null;
}

// Shop
export async function getShopItems(filters?: ShopFilters): Promise<ShopItem[]> {
  await delay(300);
  let items = [...mockShopItems];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    items = items.filter(
      i =>
        i.name.toLowerCase().includes(search) ||
        i.description.toLowerCase().includes(search)
    );
  }

  if (filters?.category) {
    items = items.filter(i => i.category === filters.category);
  }

  if (filters?.availableOnly) {
    items = items.filter(i => i.isAvailable && i.stock > 0);
  }

  if (filters?.minCost !== undefined) {
    items = items.filter(i => i.coinCost >= filters.minCost!);
  }

  if (filters?.maxCost !== undefined) {
    items = items.filter(i => i.coinCost <= filters.maxCost!);
  }

  return items;
}

export async function getShopItem(id: string): Promise<ShopItem | null> {
  await delay(200);
  return mockShopItems.find(i => i.id === id) || null;
}

export async function redeemItem(itemId: string): Promise<ApiResponse<Transaction>> {
  await delay(500);

  const item = mockShopItems.find(i => i.id === itemId);
  if (!item) {
    return { success: false, error: 'Item not found' };
  }

  if (!item.isAvailable || item.stock <= 0) {
    return { success: false, error: 'Item is not available' };
  }

  if (mockStudent.coins < item.coinCost) {
    return { success: false, error: 'Insufficient coins' };
  }

  // Update stock and user coins
  item.stock--;
  mockStudent.coins -= item.coinCost;

  const transaction: Transaction = {
    id: `tx-${Date.now()}`,
    type: 'spent',
    amount: item.coinCost,
    description: `Redeemed ${item.name}`,
    source: 'shop_redemption',
    referenceId: itemId,
    createdAt: new Date().toISOString(),
  };

  mockTransactions.unshift(transaction);

  return { success: true, data: transaction };
}

// Wallet / Transactions
export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  await delay(300);
  let transactions = [...mockTransactions];

  if (filters?.type && filters.type !== 'all') {
    transactions = transactions.filter(t => t.type === filters.type);
  }

  if (filters?.dateFrom) {
    transactions = transactions.filter(
      t => new Date(t.createdAt) >= new Date(filters.dateFrom!)
    );
  }

  if (filters?.dateTo) {
    transactions = transactions.filter(
      t => new Date(t.createdAt) <= new Date(filters.dateTo!)
    );
  }

  return transactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Notifications
export async function getNotifications(): Promise<Notification[]> {
  await delay(200);
  return mockNotifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getUnreadNotificationCount(): Promise<number> {
  await delay(100);
  return mockNotifications.filter(n => !n.isRead).length;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await delay(100);
  const notification = mockNotifications.find(n => n.id === id);
  if (notification) {
    notification.isRead = true;
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await delay(200);
  mockNotifications.forEach(n => (n.isRead = true));
}
