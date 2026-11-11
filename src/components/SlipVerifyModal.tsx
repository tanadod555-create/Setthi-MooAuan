import React, { useState, useEffect } from 'react';
import { X, Check, Tag, DollarSign, Calendar, Store, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GeminiParsedSlip, Transaction, Category, TransactionType } from '../types';

interface SlipVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: GeminiParsedSlip | null;
  imagePreview: string | null;
  categories: Category[];
  onConfirm: (transaction: Transaction) => void;
}

const WALLET_OPTIONS = [
  'KBank (กสิกรไทย)',
  'SCB (ไทยพาณิชย์)',
  'Krungthai (กรุงไทย)',
  'Bangkok Bank (กรุงเทพ)',
  'TTB (ทีทีบี)',
  'GSB (ออมสิน)',
  'TrueMoney Wallet',
  'บัตรเครดิต',
  'เงินสด',
  'อื่นๆ'
];

export const SlipVerifyModal: React.FC<SlipVerifyModalProps> = ({
  isOpen,
  onClose,
  parsedData,
  imagePreview,
  categories,
  onConfirm,
}) => {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState<string>('0');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('');
  const [wallet, setWallet] = useState('KBank (กสิกรไทย)');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');

  useEffect(() => {
    if (parsedData && isOpen) {
      setMerchant(parsedData.merchant || 'ไม่ระบุชื่อร้าน');
      setAmount(parsedData.amount ? parsedData.amount.toFixed(2) : '0.00');
      
      const dt = parsedData.datetime || new Date().toISOString();
      const parts = dt.split(' ');
      setDate(parts[0] || new Date().toISOString().split('T')[0]);
      setTime(parts[1] || '12:00');
      
      // Auto pick category
      const matchedCat = categories.find(c => c.name === parsedData.suggestedCategory);
      setCategory(matchedCat ? matchedCat.name : (categories[0]?.name || 'อาหารและเครื่องดื่ม'));
      
      // Auto pick wallet if bank is recognized
      if (parsedData.bank) {
        const foundWallet = WALLET_OPTIONS.find(w => w.toLowerCase().includes(parsedData.bank!.toLowerCase()));
        if (foundWallet) setWallet(foundWallet);
      }

      setNote(parsedData.note || '');
      setType(parsedData.type || 'EXPENSE');
      setTags([]);
      setTagInput('');
    }
  }, [parsedData, isOpen, categories]);

  if (!isOpen || !parsedData) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, `#${trimmed}`]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = parseFloat(amount) || 0;
    if (finalAmount <= 0) {
      alert('กรุณาระบุยอดเงินที่ถูกต้อง');
      return;
    }

    const newTxn: Transaction = {
      id: `TXN-${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '12:00',
      type: type,
      category: category,
      amount: finalAmount,
      wallet: wallet.split(' ')[0], // Take short name
      merchant: merchant || 'ไม่ระบุ',
      tags: tags,
      note: note,
      slipRef: parsedData.slipRef || '',
      isCategorized: true,
      rawJson: JSON.stringify(parsedData),
      createdAt: new Date().toISOString(),
    };

    // Trigger Salmon celebration confetti!
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFC93C', '#FF6B6B', '#10B981']
    });

    onConfirm(newTxn);
    onClose();
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

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
            🐟
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              ตรวจสอบ & ให้อาหารน้องแมว
              <Sparkles className="w-4 h-4 text-yajok-yellow" />
            </h3>
            <p className="text-xs text-yajok-textMuted">
              Gemini อ่านข้อมูลเรียบร้อย ตรวจสอบความถูกต้องก่อนกดบันทึก
            </p>
          </div>
        </div>

        {/* Image Preview Thumbnail */}
        {imagePreview && (
          <div className="mb-5 rounded-2xl overflow-hidden max-h-36 bg-black/40 border border-yajok-border flex items-center justify-center relative group">
            <img
              src={imagePreview}
              alt="Slip Preview"
              className="object-contain h-36 w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2.5">
              <span className="text-[11px] text-slate-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                ตรวจพบโดย Gemini Vision (ความมั่นใจ {(parsedData.confidence ? parsedData.confidence * 100 : 95).toFixed(0)}%)
              </span>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-yajok-dark rounded-xl border border-yajok-border">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Field (Highlighted) */}
          <div>
            <label className="text-xs text-yajok-textMuted flex items-center gap-1 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-yajok-yellow" />
              ยอดเงินสุทธิ (บาท) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-yajok-dark border-2 border-yajok-yellow/60 focus:border-yajok-yellow rounded-2xl px-4 py-3 text-2xl font-bold text-yajok-yellow tracking-tight outline-none transition-all"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                THB ฿
              </span>
            </div>
          </div>

          {/* Merchant / Receiver Name */}
          <div>
            <label className="text-xs text-yajok-textMuted flex items-center gap-1 mb-1">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              ชื่อร้านค้า / ผู้รับเงิน *
            </label>
            <input
              type="text"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all"
              placeholder="เช่น 7-Eleven, นายสมชาย, ค่าไฟ"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="text-xs text-yajok-textMuted flex items-center gap-1 mb-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              หมวดหมู่ (MeowSense แนะนำ) *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name} className="bg-slate-900 text-slate-100">
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-yajok-textMuted flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันที่ทำรายการ
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-yajok-textMuted flex items-center gap-1 mb-1">
                เวลา
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Wallet / Source */}
          <div>
            <label className="text-xs text-yajok-textMuted flex items-center gap-1 mb-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              บัญชี / ธนาคารต้นทาง
            </label>
            <select
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all cursor-pointer"
            >
              {WALLET_OPTIONS.map((w) => (
                <option key={w} value={w} className="bg-slate-900 text-slate-100">
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-xs text-yajok-textMuted flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                แท็กเฉพาะเรื่อง (#Tag)
              </span>
              <span className="text-[10px] text-slate-500">พิมพ์แล้วกด Enter</span>
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="เช่น เที่ยวญี่ปุ่น, มื้อเที่ยง, ให้แม่"
              className="w-full bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl px-3.5 py-2 text-xs text-slate-100 outline-none transition-all"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    onClick={() => handleRemoveTag(t)}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 cursor-pointer hover:bg-amber-500/20"
                  >
                    {t} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-yajok-textMuted mb-1 block">
              บันทึกช่วยจำ (Note)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น กินกับเพื่อนที่ออฟฟิศ"
              className="w-full bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl px-3.5 py-2 text-xs text-slate-100 outline-none transition-all"
            />
          </div>

          {parsedData.slipRef && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>เลขอ้างอิงสลิป: {parsedData.slipRef}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yajok-yellow hover:from-amber-600 hover:to-yajok-yellowHover active:scale-95 text-black font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>🐟 ให้อาหารน้องแมว (บันทึก)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
