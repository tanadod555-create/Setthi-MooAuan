import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, PieChart } from 'lucide-react';
import { Transaction, Category } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  monthlyBudget: number;
  streak: number;
  streakEasyMode: boolean;
  onToggleStreakEasyMode: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  categories,
  monthlyBudget,
  streak,
  streakEasyMode,
  onToggleStreakEasyMode,
}) => {
  // Current month filter (YYYY-MM)
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTxns = transactions.filter(t => t.date.startsWith(currentMonthStr));

  const totalExpense = currentMonthTxns
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = currentMonthTxns
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingBudget = monthlyBudget - totalExpense;
  const spentPercent = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;

  // Category spending aggregation
  const catSpending: Record<string, number> = {};
  currentMonthTxns.filter(t => t.type === 'EXPENSE').forEach(t => {
    catSpending[t.category] = (catSpending[t.category] || 0) + t.amount;
  });

  const sortedCatEntries = Object.entries(catSpending).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      {/* Budget & Balance Overview Card */}
      <div className="bg-yajok-card border border-yajok-border rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-yajok-textMuted uppercase tracking-wider font-semibold">
            ภาพรวมการเงินเดือนนี้
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
            {now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Total Expense */}
          <div className="p-3.5 rounded-2xl bg-yajok-dark/70 border border-rose-500/20">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>รายจ่ายทั้งหมด</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-400">
              ฿{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {currentMonthTxns.filter(t => t.type === 'EXPENSE').length} รายการ
            </div>
          </div>

          {/* Remaining Budget */}
          <div className={`p-3.5 rounded-2xl bg-yajok-dark/70 border ${
            remainingBudget < 0 ? 'border-red-500/40 bg-red-500/5' : 'border-emerald-500/20'
          }`}>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>งบคงเหลือ</span>
            </div>
            <div className={`text-xl sm:text-2xl font-bold ${
              remainingBudget < 0 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              ฿{remainingBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              งบตั้งไว้: ฿{monthlyBudget.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-yajok-yellow" />
              อัตราการใช้งบประมาณ
            </span>
            <span className={`font-bold ${
              spentPercent > 100 ? 'text-red-400 animate-pulse' :
              spentPercent > 80 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {spentPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                spentPercent > 100 ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                spentPercent > 80 ? 'bg-gradient-to-r from-amber-500 to-red-500' :
                'bg-gradient-to-r from-emerald-500 to-yajok-yellow'
              }`}
              style={{ width: `${Math.min(spentPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Income Card Row */}
        {totalIncome > 0 && (
          <div className="mt-3.5 pt-3 border-t border-yajok-border flex items-center justify-between text-xs">
            <span className="text-slate-400">รายรับเดือนนี้ (Income):</span>
            <span className="text-emerald-400 font-bold">
              +฿{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* Streak & Easy Mode Card */}
      <div className="bg-yajok-card border border-yajok-border rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-2xl">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                จดต่อเนื่องวันที่ {streak} (Streak)
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                วินัยสร้างความรวย
              </span>
            </div>
            <p className="text-xs text-yajok-textMuted mt-0.5">
              เปิดแอปหรืออัปโหลดสลิปทุกวันเพื่อรักษาวินัยการเงิน
            </p>
          </div>
        </div>

        {/* Streak Easy Mode Toggle */}
        <div className="flex items-center gap-2 bg-yajok-dark/80 px-3 py-2 rounded-2xl border border-yajok-border w-full sm:w-auto justify-between sm:justify-start">
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-200">Streak Easy Mode</div>
            <div className="text-[10px] text-slate-400">นับ streak แม้ยังไม่จัดหมวด</div>
          </div>
          <button
            onClick={onToggleStreakEasyMode}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              streakEasyMode ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${
                streakEasyMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="bg-yajok-card border border-yajok-border rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-yajok-yellow" />
            <h3 className="text-sm font-bold text-white">
              สัดส่วนค่าใช้จ่ายตามหมวดหมู่
            </h3>
          </div>
          <span className="text-xs text-yajok-textMuted">
            {sortedCatEntries.length} หมวดหมู่
          </span>
        </div>

        {sortedCatEntries.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            ยังไม่มีรายการรายจ่ายในเดือนนี้ สแกนสลิปแรกได้เลยเหมียว!
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCatEntries.map(([catName, amount]) => {
              const catObj = categories.find(c => c.name === catName);
              const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
              const catColor = catObj?.color || '#F59E0B';

              return (
                <div key={catName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{catObj?.icon || '📦'}</span>
                      <span className="text-slate-200 font-medium">{catName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-mono">
                        ({percent.toFixed(1)}%)
                      </span>
                      <span className="text-slate-100 font-bold">
                        ฿{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Category Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: catColor
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
