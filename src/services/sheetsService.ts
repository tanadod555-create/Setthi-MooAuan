import { Transaction, Category } from '../types';

export const sheetsService = {
  async fetchAll(scriptUrl: string): Promise<{ success: boolean; transactions?: Transaction[]; categories?: Category[]; error?: string }> {
    if (!scriptUrl) {
      return { success: false, error: 'ยังไม่ได้ระบุ Google Apps Script Web App URL' };
    }

    try {
      const url = `${scriptUrl}?action=get_all&t=${Date.now()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        transactions: data.transactions || [],
        categories: data.categories || [],
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `เชื่อมต่อ Google Sheets ไม่สำเร็จ: ${errorMessage}`,
      };
    }
  },

  async addTransaction(scriptUrl: string, txn: Transaction): Promise<{ success: boolean; error?: string }> {
    if (!scriptUrl) {
      return { success: false, error: 'ยังไม่ได้ระบุ Google Apps Script Web App URL' };
    }

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Bypass CORS preflight in Apps Script
        },
        body: JSON.stringify({
          action: 'add_transaction',
          transaction: txn,
        }),
      });

      const resText = await response.text();
      let resJson;
      try {
        resJson = JSON.parse(resText);
      } catch {
        // Apps script sometimes returns redirect or raw text
        return { success: true };
      }

      return {
        success: resJson.success !== false,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `บันทึกไป Google Sheets ล้มเหลว: ${errorMessage}`,
      };
    }
  },

  async deleteTransaction(scriptUrl: string, id: string): Promise<{ success: boolean; error?: string }> {
    if (!scriptUrl) {
      return { success: false, error: 'ยังไม่ได้ระบุ URL' };
    }

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'delete_transaction',
          id: id,
        }),
      });

      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMessage };
    }
  }
};
