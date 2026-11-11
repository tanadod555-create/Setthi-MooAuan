import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MascotCat } from './components/MascotCat';
import { SlipUploader } from './components/SlipUploader';
import { SlipVerifyModal } from './components/SlipVerifyModal';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { SettingsModal } from './components/SettingsModal';
import { TarotRecapModal } from './components/TarotRecapModal';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { sheetsService } from './services/sheetsService';
import { Transaction, Category, AppSettings, GeminiParsedSlip } from './types';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [categories, setCategories] = useState<Category[]>(storageService.getCategories());
  const [transactions, setTransactions] = useState<Transaction[]>(storageService.getTransactions());

  // UI Modals State
  const [showSettings, setShowSettings] = useState(false);
  const [showTarot, setShowTarot] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Scanning & Sync State
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [parsedSlip, setParsedSlip] = useState<GeminiParsedSlip | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Filter for uncategorized
  const uncategorizedCount = transactions.filter(t => !t.isCategorized).length;

  // Sync with Google Sheets on initial load if URL is available
  useEffect(() => {
    if (settings.googleAppsScriptUrl) {
      handleSync();
    }
  }, []);

  const handleSync = async () => {
    if (!settings.googleAppsScriptUrl) return;
    setIsSyncing(true);
    const res = await sheetsService.fetchAll(settings.googleAppsScriptUrl);
    setIsSyncing(false);

    if (res.success) {
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
        storageService.saveCategories(res.categories);
      }
      if (res.transactions) {
        // Merge unique transactions
        const existingIds = new Set(transactions.map(t => t.id));
        const newFromSheets = res.transactions.filter(t => !existingIds.has(t.id));
        if (newFromSheets.length > 0 || res.transactions.length !== transactions.length) {
          const merged = [...transactions, ...newFromSheets];
          setTransactions(merged);
          storageService.saveTransactions(merged);
        }
      }
    }
  };

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setImagePreview(base64);

    if (!settings.geminiApiKey) {
      alert('กรุณากรอก Gemini API Key ในหน้าตั้งค่าก่อนเริ่มต้นสแกนสลิปนะเหมียว!');
      setShowSettings(true);
      return;
    }

    setIsScanning(true);
    const result = await geminiService.parseSlipOrReceipt(base64, mimeType, settings.geminiApiKey);
    setIsScanning(false);

    if (result.success) {
      setParsedSlip(result);
      setShowVerifyModal(true);
    } else {
      alert(result.error || 'ไม่สามารถสแกนสลิปได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleConfirmTransaction = async (txn: Transaction) => {
    const updated = storageService.addTransaction(txn);
    setTransactions(updated);
    setSettings(storageService.getSettings()); // Update streak

    // Sync to Google Sheets in background
    if (settings.googleAppsScriptUrl) {
      sheetsService.addTransaction(settings.googleAppsScriptUrl, txn).catch(err => {
        console.warn('Background sync error:', err);
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const updated = storageService.deleteTransaction(id);
    setTransactions(updated);

    if (settings.googleAppsScriptUrl) {
      sheetsService.deleteTransaction(settings.googleAppsScriptUrl, id).catch(err => {
        console.warn('Background delete error:', err);
      });
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
    if (newSettings.googleAppsScriptUrl && newSettings.googleAppsScriptUrl !== settings.googleAppsScriptUrl) {
      handleSync();
    }
  };

  const handleToggleStreakEasyMode = () => {
    const updated = { ...settings, streakEasyMode: !settings.streakEasyMode };
    handleSaveSettings(updated);
  };

  const handleOpenManualAdd = () => {
    setParsedSlip({
      success: true,
      bank: 'เงินสด',
      merchant: '',
      amount: 0,
      datetime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      suggestedCategory: 'อาหารและเครื่องดื่ม',
      type: 'EXPENSE',
      note: 'จดด้วยตัวเอง'
    });
    setImagePreview(null);
    setShowVerifyModal(true);
  };

  // Calculate percentage of budget used this month
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const totalExpense = transactions
    .filter(t => t.date.startsWith(currentMonthStr) && t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const spentPercent = settings.monthlyBudget > 0
    ? (totalExpense / settings.monthlyBudget) * 100
    : 0;

  return (
    <div className="min-h-screen bg-yajok-dark text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        streak={settings.streakCount}
        onOpenSettings={() => setShowSettings(true)}
        onOpenTarot={() => setShowTarot(true)}
        isSyncing={isSyncing}
        onSync={handleSync}
        hasSheetsConfigured={Boolean(settings.googleAppsScriptUrl)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Cat Mascot Section */}
        <MascotCat
          uncategorizedCount={uncategorizedCount}
          spentPercent={spentPercent}
          streak={settings.streakCount}
          onBowlClick={() => {
            if (uncategorizedCount > 0) {
              alert(`มีรายการค้างในชามข้าว ${uncategorizedCount} รายการ ตรวจสอบในรายการด้านล่างได้เลยเหมียว!`);
            } else {
              handleOpenManualAdd();
            }
          }}
        />

        {/* AI Vision Slip & Receipt Uploader */}
        <SlipUploader
          onImageSelected={handleImageSelected}
          isScanning={isScanning}
        />

        {/* Financial Dashboard & Budget Meter */}
        <Dashboard
          transactions={transactions}
          categories={categories}
          monthlyBudget={settings.monthlyBudget}
          streak={settings.streakCount}
          streakEasyMode={settings.streakEasyMode}
          onToggleStreakEasyMode={handleToggleStreakEasyMode}
        />

        {/* Transaction History & Records */}
        <TransactionList
          transactions={transactions}
          categories={categories}
          onDelete={handleDeleteTransaction}
          onOpenManualAdd={handleOpenManualAdd}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-yajok-border/60 py-6 text-center text-xs text-yajok-textMuted">
        <p className="flex items-center justify-center gap-1.5">
          <span>ยาจก (Yajok)</span> • <span>พลัง Gemini 2.5 Flash + Google Sheets</span>
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          แรงบันดาลใจจาก เหมียวจด & หมูอ้วน — ปลดล็อคฟังก์ชันฟรี 100% สำหรับการใช้งานส่วนตัว
        </p>
      </footer>

      {/* Modals */}
      <SlipVerifyModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        parsedData={parsedSlip}
        imagePreview={imagePreview}
        categories={categories}
        onConfirm={handleConfirmTransaction}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <TarotRecapModal
        isOpen={showTarot}
        onClose={() => setShowTarot(false)}
        transactions={transactions}
      />
    </div>
  );
};
