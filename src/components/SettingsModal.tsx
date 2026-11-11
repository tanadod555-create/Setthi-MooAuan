import React, { useState } from 'react';
import { X, Key, Cloud, DollarSign, CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw, Save } from 'lucide-react';
import { AppSettings } from '../types';
import { sheetsService } from '../services/sheetsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [scriptUrl, setScriptUrl] = useState(settings.googleAppsScriptUrl);
  const [budget, setBudget] = useState(settings.monthlyBudget.toString());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleTestSheets = async () => {
    if (!scriptUrl) {
      setTestResult({ success: false, message: 'กรุณากรอก Web App URL ก่อนกดทดสอบ' });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    const res = await sheetsService.fetchAll(scriptUrl);
    setTestingConnection(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: `เชื่อมต่อ Google Sheets สำเร็จ! (พบ ${res.transactions?.length || 0} รายการในชีต)`
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'เชื่อมต่อไม่สำเร็จ ตรวจสอบสิทธิ์เป็น Anyone'
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...settings,
      geminiApiKey: apiKey.trim(),
      googleAppsScriptUrl: scriptUrl.trim(),
      monthlyBudget: parseFloat(budget) || 17000,
    });
    onClose();
  };

  const copyScriptInstructions = () => {
    navigator.clipboard.writeText(`// เปิดไฟล์ src/google-apps-script/Code.gs ในโฟลเดอร์โปรเจกต์ นำโค้ดไปวางใน Extensions > Apps Script`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-yajok-card border border-yajok-border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-yajok-yellow/20 text-yajok-yellow flex items-center justify-center text-xl">
            ⚙️
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">ตั้งค่าระบบ ยาจก</h3>
            <p className="text-xs text-yajok-textMuted">
              กำหนด Gemini Vision API และการเชื่อมต่อ Google Sheets
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-yajok-yellow" />
                Gemini API Key (สำหรับอ่านสลิป & ใบเสร็จ)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                รับคีย์ฟรี <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none transition-all font-mono"
            />
            <p className="text-[11px] text-slate-400">
              * คีย์จะถูกบันทึกไว้ในเบราว์เซอร์ของคุณอย่างปลอดภัย ไม่มีการส่งต่อไปยังเซิร์ฟเวอร์อื่น
            </p>
          </div>

          {/* Google Apps Script Web App URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-400" />
                Google Apps Script Web App URL (ฐานข้อมูลชีต)
              </label>
              <button
                type="button"
                onClick={copyScriptInstructions}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                {copiedCode ? 'คัดลอกคำแนะนำแล้ว!' : 'วิธีติดตั้งสคริปต์'} <Copy className="w-3 h-3" />
              </button>
            </div>
            <input
              type="url"
              value={scriptUrl}
              onChange={(e) => setScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full bg-yajok-dark border border-yajok-border focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none transition-all font-mono"
            />

            {/* Test Connection Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestSheets}
                disabled={testingConnection || !scriptUrl}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 border border-slate-700 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                <span>{testingConnection ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ Sheets'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Monthly Budget Setup */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-yajok-yellow" />
              งบประมาณรายจ่ายต่อเดือน (บาท)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-100 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400">
              * สำหรับให้น้องแมวคำนวณแถบสถานะงบประมาณคงเหลือและอารมณ์ของแมว
            </p>
          </div>

          {/* Instructions Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300">
              💡 วิธีตั้งค่า Google Sheets ให้เป็นดาต้าเบสส่วนตัว:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>เปิด Google Sheets ใหม่ใน Google Drive ของคุณ</li>
              <li>ไปที่เมนู <b>Extensions &gt; Apps Script</b></li>
              <li>เปิดไฟล์ <code className="text-amber-300">src/google-apps-script/Code.gs</code> ในโฟลเดอร์นี้ แล้วคัดลอกโค้ดไปแปะแทนที่</li>
              <li>กด <b>Deploy &gt; New deployment &gt; Web app</b></li>
              <li>เลือก Access: <b>Anyone</b> แล้วคัดลอก Web App URL มาใส่ที่นี่</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm transition-all"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-yajok-yellow hover:bg-yajok-yellowHover text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-yajok-yellow/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
