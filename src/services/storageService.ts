import { Transaction, Category, AppSettings } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'yajok_transactions',
  CATEGORIES: 'yajok_categories',
  SETTINGS: 'yajok_settings',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'อาหารและเครื่องดื่ม', icon: '🍜', color: '#F59E0B', budget: 6000, type: 'EXPENSE' },
  { id: 'cat-2', name: 'เดินทาง / น้ำมัน', icon: '🚗', color: '#3B82F6', budget: 3000, type: 'EXPENSE' },
  { id: 'cat-3', name: 'ช้อปปิ้ง', icon: '🛍️', color: '#EC4899', budget: 2500, type: 'EXPENSE' },
  { id: 'cat-4', name: 'บิล & ค่าใช้จ่ายบ้าน', icon: '💡', color: '#8B5CF6', budget: 2000, type: 'EXPENSE' },
  { id: 'cat-5', name: 'สุขภาพ / ยา', icon: '💊', color: '#10B981', budget: 1000, type: 'EXPENSE' },
  { id: 'cat-6', name: 'ความบันเทิง', icon: '🎮', color: '#6366F1', budget: 1500, type: 'EXPENSE' },
  { id: 'cat-7', name: 'อื่นๆ', icon: '📦', color: '#64748B', budget: 1000, type: 'EXPENSE' },
  { id: 'cat-8', name: 'เงินเดือน / รายได้', icon: '💰', color: '#22C55E', budget: 0, type: 'INCOME' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  googleAppsScriptUrl: '',
  monthlyBudget: 17000,
  streakCount: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  streakEasyMode: true,
  soundEnabled: true,
};

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-INIT-001',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    type: 'EXPENSE',
    category: 'อาหารและเครื่องดื่ม',
    amount: 120.00,
    wallet: 'KBank',
    merchant: 'Cafe Amazon (คาเฟ่ อเมซอน)',
    tags: ['#กาแฟเช้า', '#ทำงานนอกบ้าน'],
    note: 'อเมริกาโน่เย็นหวาน 0%',
    slipRef: '2026111108300012',
    isCategorized: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'TXN-INIT-002',
    date: new Date().toISOString().split('T')[0],
    time: '12:15',
    type: 'EXPENSE',
    category: 'อาหารและเครื่องดื่ม',
    amount: 65.00,
    wallet: 'TrueMoney',
    merchant: '7-Eleven สาขาหน้าปากซอย',
    tags: ['#มื้อเที่ยง'],
    note: 'ข้าวกะเพราไก่ + น้ำดื่ม',
    slipRef: '2026111112150034',
    isCategorized: true,
    createdAt: new Date().toISOString()
  }
];

export const storageService = {
  getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) return DEFAULT_CATEGORIES;
    try {
      const parsed = JSON.parse(raw);
      return parsed.length ? parsed : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return DEFAULT_TRANSACTIONS;
    try {
      const parsed = JSON.parse(raw);
      return parsed.length ? parsed : DEFAULT_TRANSACTIONS;
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  },

  saveTransactions(txns: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
  },

  addTransaction(txn: Transaction): Transaction[] {
    const list = this.getTransactions();
    // Prepend new transaction
    const updated = [txn, ...list];
    this.saveTransactions(updated);
    this.updateStreak();
    return updated;
  },

  deleteTransaction(id: string): Transaction[] {
    const list = this.getTransactions();
    const updated = list.filter(t => t.id !== id);
    this.saveTransactions(updated);
    return updated;
  },

  updateTransaction(txn: Transaction): Transaction[] {
    const list = this.getTransactions();
    const updated = list.map(t => t.id === txn.id ? txn : t);
    this.saveTransactions(updated);
    return updated;
  },

  updateStreak(): number {
    const settings = this.getSettings();
    const today = new Date().toISOString().split('T')[0];
    const lastActive = settings.lastActiveDate;

    if (lastActive === today) {
      return settings.streakCount;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = settings.streakCount;
    if (lastActive === yesterdayStr) {
      newStreak += 1;
    } else {
      // Missed more than 1 day
      newStreak = 1;
    }

    settings.streakCount = newStreak;
    settings.lastActiveDate = today;
    this.saveSettings(settings);
    return newStreak;
  }
};
