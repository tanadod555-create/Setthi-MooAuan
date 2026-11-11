import React, { useState } from 'react';
import { Search, Trash2, Calendar, Plus, Wallet } from 'lucide-react';
import { Transaction, Category } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  onOpenManualAdd: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onDelete,
  onOpenManualAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.amount.toString().includes(searchTerm);

    const matchesCategory =
      selectedCategory === 'ALL' || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-yajok-card border border-yajok-border rounded-3xl p-5 shadow-lg">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            ประวัติการบันทึก ({transactions.length} รายการ)
          </h3>
          <p className="text-xs text-yajok-textMuted">
            ค้นหา ตรวจสอบ และแก้ไขรายการได้ตลอดเวลา
          </p>
        </div>

        {/* Manual Add Button */}
        <button
          onClick={onOpenManualAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-yajok-yellow/10 border border-yajok-yellow/30 text-yajok-yellow hover:bg-yajok-yellow/20 font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>จดรายจ่ายเอง (เงินสด)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อร้าน, ยอดเงิน, แท็ก หรือโน้ต..."
            className="w-full bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none transition-all"
          />
        </div>

        {/* Category Filter Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-yajok-dark border border-yajok-border focus:border-yajok-yellow rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition-all cursor-pointer"
        >
          <option value="ALL">ทุกหมวดหมู่</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          {searchTerm || selectedCategory !== 'ALL'
            ? 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'
            : 'ยังไม่มีรายการบันทึก เริ่มอัปโหลดสลิปใบแรกเลยเหมียว!'}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((t) => {
            const catObj = categories.find((c) => c.name === t.category);
            const isExpense = t.type === 'EXPENSE';

            return (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-yajok-dark/60 border border-yajok-border/80 hover:border-slate-600 transition-all flex items-center justify-between gap-3 group"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${catObj?.color || '#F59E0B'}20` }}
                  >
                    {catObj?.icon || '📦'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                        {t.merchant}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium shrink-0">
                        {t.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {t.date} {t.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-slate-500" />
                        {t.wallet}
                      </span>
                      {t.note && (
                        <span className="text-slate-300 italic truncate max-w-xs">
                          "{t.note}"
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {t.tags && t.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {t.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-bold font-mono ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}฿{t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm(`ต้องการลบรายการ "${t.merchant}" ฿${t.amount} หรือไม่?`)) {
                        onDelete(t.id);
                      }
                    }}
                    title="ลบรายการ"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-60 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
