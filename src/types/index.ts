export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: TransactionType;
  category: string;
  amount: number;
  wallet: string; // e.g. KBank, SCB, KTB, BBL, TrueMoney, บัตรเครดิต, เงินสด
  merchant: string;
  tags: string[];
  note: string;
  slipRef?: string;
  isCategorized: boolean;
  rawJson?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number; // Monthly budget
  type: 'EXPENSE' | 'INCOME';
}

export interface AppSettings {
  geminiApiKey: string;
  googleAppsScriptUrl: string;
  monthlyBudget: number;
  streakCount: number;
  lastActiveDate: string;
  streakEasyMode: boolean;
  soundEnabled: boolean;
}

export interface GeminiParsedSlip {
  success: boolean;
  bank?: string;
  merchant?: string;
  amount?: number;
  datetime?: string; // ISO 8601 or YYYY-MM-DD HH:mm
  slipRef?: string;
  suggestedCategory?: string;
  type?: TransactionType;
  note?: string;
  confidence?: number;
  error?: string;
}

export interface MeowMood {
  message: string;
  status: 'happy' | 'hungry' | 'worried' | 'beggar' | 'celebrate';
  expression: string;
}
