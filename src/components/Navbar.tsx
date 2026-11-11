import React from 'react';
import { Settings, Sparkles, Flame, RefreshCw, CloudCheck, CloudOff } from 'lucide-react';

interface NavbarProps {
  streak: number;
  onOpenSettings: () => void;
  onOpenTarot: () => void;
  isSyncing: boolean;
  onSync: () => void;
  hasSheetsConfigured: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  streak,
  onOpenSettings,
  onOpenTarot,
  isSyncing,
  onSync,
  hasSheetsConfigured,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-yajok-dark/90 backdrop-blur-md border-b border-yajok-border px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yajok-yellow flex items-center justify-center shadow-lg shadow-amber-500/20 text-xl font-bold">
            🐱
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                ยาจก <span className="text-yajok-yellow text-sm font-normal">Yajok</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yajok-yellow/20 text-yajok-yellow font-medium">
                AI Pro
              </span>
            </div>
            <p className="text-[11px] text-yajok-textMuted leading-none">
              แมวจดบันทึกรายรับรายจ่ายอัจฉริยะ
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          {/* Streak Badge */}
          <div 
            title="จดต่อเนื่องเพื่อสะสม Streak"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{streak} วัน</span>
          </div>

          {/* Sync Button */}
          {hasSheetsConfigured && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              title={isSyncing ? 'กำลังซิงค์กับ Google Sheets...' : 'ซิงค์ข้อมูลกับ Google Sheets'}
              className="p-2 rounded-xl bg-yajok-card border border-yajok-border hover:border-slate-500 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-yajok-yellow' : ''}`} />
            </button>
          )}

          {/* Cloud Indicator */}
          <div
            title={hasSheetsConfigured ? 'เชื่อมต่อ Google Sheets แล้ว' : 'ยังไม่ได้เชื่อมต่อ Google Sheets (บันทึกในเครื่อง)'}
            className="hidden sm:flex items-center"
          >
            {hasSheetsConfigured ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <CloudCheck className="w-3.5 h-3.5" />
                <span>Sheets Sync</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                <CloudOff className="w-3.5 h-3.5" />
                <span>Local DB</span>
              </span>
            )}
          </div>

          {/* Meow Tarot Recap Button */}
          <button
            onClick={onOpenTarot}
            title="เหมียวดู: ดวงการเงินประจำเดือน"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-medium hover:bg-purple-500/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">เหมียวดู</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="ตั้งค่า API & Google Sheets"
            className="p-2 rounded-xl bg-yajok-card border border-yajok-border hover:border-yajok-yellow text-slate-300 hover:text-yajok-yellow transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
