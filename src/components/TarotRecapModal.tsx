import React, { useState } from 'react';
import { X, Sparkles, Share2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction } from '../types';

interface TarotRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

interface TarotCard {
  title: string;
  subtitle: string;
  emoji: string;
  advice: string;
  vibeColor: string;
}

const TAROT_CARDS: TarotCard[] = [
  {
    title: 'ไพ่เทพเจ้าชาบู & ชานม',
    subtitle: 'กระเป๋าแฟบแต่พุงนำหน้า',
    emoji: '🍲🧋',
    advice: 'พี่มนุษย์จ่ายค่ากินแหลกลานมากเดือนนี้! แมวแนะนำให้สลับมากินไข่ต้มบ้าง กระเป๋าเงินจะได้หายใจออกเหมียว',
    vibeColor: 'from-amber-500 to-rose-600',
  },
  {
    title: 'ไพ่เศรษฐีเอฟของออนไลน์',
    subtitle: 'พัสดุมาส่งจนนึกว่าเปิดโกดัง',
    emoji: '🛍️📦',
    advice: 'กล่องพัสดุกองเต็มบ้าน แมวมีที่นอนใหม่เพียบ แต่พี่มนุษย์อย่าลืมดูยอดเงินคงเหลือด้วยนะเหมียว!',
    vibeColor: 'from-pink-500 to-purple-600',
  },
  {
    title: 'ไพ่ยาจกผู้มีวินัยเลิศ',
    subtitle: 'ประหยัดสุดขีด น้องแมวยกนิ้วให้',
    emoji: '🏆🐾',
    advice: 'ยอดเยี่ยมมากพี่มนุษย์! คุมงบได้อยู่หมัด ไม่ว่อกแว่ก แมวให้ 10/10 แบบนี้มีเงินซื้อปลาทูให้แมวแน่นอน!',
    vibeColor: 'from-emerald-500 to-teal-700',
  },
  {
    title: 'ไพ่คาเฟ่ดูดวิญญาณ',
    subtitle: 'เงินไหลไปกับลาเต้แก้วละร้อย',
    emoji: '☕✨',
    advice: 'ค่ากาแฟรวมกันซื้อทองได้ครึ่งสลึงแล้วพี่มนุษย์! ลองชงเองที่บ้านดูบ้าง แมวจะคอยยืนให้กำลังใจเหมียว',
    vibeColor: 'from-amber-600 to-yellow-500',
  },
];

export const TarotRecapModal: React.FC<TarotRecapModalProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  if (!isOpen) return null;

  const drawCard = () => {
    setIsRevealing(true);
    setTimeout(() => {
      // Pick card based on random or top category
      const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
      setSelectedCard(randomCard);
      setIsRevealing(false);

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFC93C', '#A855F7', '#EC4899', '#10B981']
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-yajok-card border border-yajok-border rounded-3xl max-w-sm w-full shadow-2xl p-6 relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-500/30">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>เหมียวดู (MeowSense Tarot)</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          เปิดไพ่ส่องดวงการเงิน
        </h3>
        <p className="text-xs text-yajok-textMuted mb-6">
          วิเคราะห์นิสัยการใช้เงินจาก {transactions.length} รายการที่พี่มนุษย์บันทึกไว้
        </p>

        {/* Tarot Card Display */}
        {!selectedCard ? (
          <div className="py-6 flex flex-col items-center">
            <div
              onClick={drawCard}
              className="w-48 h-72 rounded-3xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-900 border-2 border-purple-500/50 shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors" />
              <div className="text-5xl mb-3 animate-wiggle">🔮</div>
              <span className="text-sm font-bold text-purple-200">
                {isRevealing ? 'กำลังสื่อจิต...' : 'แตะเพื่อเปิดไพ่'}
              </span>
              <span className="text-[10px] text-purple-400 mt-1">
                ให้น้องแมวทำนาย
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 animate-in zoom-in-95 duration-300">
            {/* Story Card Result */}
            <div className={`p-6 rounded-3xl bg-gradient-to-b ${selectedCard.vibeColor} text-white shadow-2xl relative overflow-hidden mb-4 border-2 border-white/20`}>
              <div className="text-5xl mb-3">{selectedCard.emoji}</div>
              <h4 className="text-xl font-black mb-0.5 tracking-tight">
                {selectedCard.title}
              </h4>
              <p className="text-xs text-white/80 font-medium mb-4">
                "{selectedCard.subtitle}"
              </p>
              <div className="p-3 bg-black/30 rounded-2xl backdrop-blur-sm text-xs leading-relaxed text-white/95">
                {selectedCard.advice}
              </div>
              <div className="mt-4 text-[10px] text-white/60 uppercase tracking-widest font-mono">
                — ทำนายโดย น้องแมวยาจก —
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={drawCard}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>จับไพ่อีกใบ</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`ดวงการเงินเดือนนี้ของฉันได้: "${selectedCard.title}" — ทำนายโดยแอปยาจก`);
                  alert('คัดลอกคำทำนายแล้ว นำไปแชร์ลง Story ได้เลย!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-600/30"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>แชร์ดวงการเงิน</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
