import React from 'react';
import { MeowMood } from '../types';

interface MascotCatProps {
  uncategorizedCount: number;
  spentPercent: number;
  onBowlClick: () => void;
  streak: number;
}

export const MascotCat: React.FC<MascotCatProps> = ({
  uncategorizedCount,
  spentPercent,
  onBowlClick,
  streak,
}) => {
  // Determine Cat mood and funny dialogue based on financial reality
  const getMood = (): MeowMood => {
    if (uncategorizedCount > 0) {
      return {
        status: 'hungry',
        expression: '🥺',
        message: `พี่มนุษย์! มีสลิปค้างในชามข้าว ${uncategorizedCount} ใบ รีบมาจัดหมวดหมู่ให้แมวได้กินแซลมอนเหมียว!`,
      };
    }
    if (spentPercent >= 100) {
      return {
        status: 'beggar',
        expression: '😱',
        message: 'พี่มนุษย์! งบเดือนนี้ทะลุ 100% แล้ว! ยาจกของจริงแล้วเหมียว ต้องเปิดกระป๋องขอข้าววัดแล้ว!',
      };
    }
    if (spentPercent >= 80) {
      return {
        status: 'worried',
        expression: '😰',
        message: `งบหมดไป ${Math.round(spentPercent)}% แล้วนะพี่มนุษย์ เพลาๆ มือหน่อย แมวใจคอไม่ดีเลยเหมียว...`,
      };
    }
    if (spentPercent >= 50) {
      return {
        status: 'happy',
        expression: '😺',
        message: `ใช้ไปครึ่งทางแล้ว (${Math.round(spentPercent)}%) สู้ต่อไปนะพี่มนุษย์ เราจะรอดไปด้วยกัน!`,
      };
    }
    return {
      status: 'celebrate',
      expression: '😻',
      message: `จดต่อเนื่องวันที่ ${streak} แล้ว! เงินยังเหลือเพียบ แมวนั่งเคี้ยวปลาแซลมอนสบายใจเฉิบเหมียว!`,
    };
  };

  const mood = getMood();

  return (
    <div className="relative bg-gradient-to-b from-yajok-card to-yajok-dark border border-yajok-border rounded-3xl p-4 sm:p-6 shadow-xl overflow-hidden">
      {/* Background radial glow */}
      <div 
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
          mood.status === 'beggar' ? 'bg-red-500' :
          mood.status === 'worried' ? 'bg-amber-500' :
          mood.status === 'hungry' ? 'bg-blue-500' : 'bg-yajok-yellow'
        }`} 
      />

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
        {/* Cat Avatar + Food Bowl Container */}
        <div className="relative flex items-center justify-center shrink-0">
          {/* Cute SVG Animated Cat */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative">
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full drop-shadow-lg animate-bounce-slow"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Ears */}
              <polygon points="25,45 15,15 45,30" fill="#FFC93C" stroke="#282B3A" strokeWidth="3" />
              <polygon points="25,40 20,20 40,30" fill="#FF8B8B" />
              <polygon points="95,45 105,15 75,30" fill="#FFC93C" stroke="#282B3A" strokeWidth="3" />
              <polygon points="95,40 100,20 80,30" fill="#FF8B8B" />

              {/* Head */}
              <circle cx="60" cy="60" r="42" fill="#FFC93C" stroke="#282B3A" strokeWidth="3" />
              
              {/* Cheeks */}
              <circle cx="36" cy="68" r="6" fill="#FFA5A5" opacity="0.6" />
              <circle cx="84" cy="68" r="6" fill="#FFA5A5" opacity="0.6" />

              {/* Eyes depending on mood */}
              {mood.status === 'beggar' ? (
                <>
                  <circle cx="44" cy="54" r="7" fill="#282B3A" />
                  <circle cx="76" cy="54" r="7" fill="#282B3A" />
                  <circle cx="42" cy="52" r="2.5" fill="#FFFFFF" />
                  <circle cx="74" cy="52" r="2.5" fill="#FFFFFF" />
                  <path d="M 40 43 Q 45 47 50 45" stroke="#282B3A" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 80 43 Q 75 47 70 45" stroke="#282B3A" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : mood.status === 'worried' ? (
                <>
                  <circle cx="44" cy="55" r="5" fill="#282B3A" />
                  <circle cx="76" cy="55" r="5" fill="#282B3A" />
                  <path d="M 38 48 Q 45 44 50 49" stroke="#282B3A" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 82 48 Q 75 44 70 49" stroke="#282B3A" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : mood.status === 'hungry' ? (
                <>
                  <circle cx="44" cy="55" r="6" fill="#282B3A" />
                  <circle cx="76" cy="55" r="6" fill="#282B3A" />
                  <circle cx="42" cy="53" r="2" fill="#FFFFFF" />
                  <circle cx="74" cy="53" r="2" fill="#FFFFFF" />
                </>
              ) : (
                <>
                  {/* Happy closed eyes curved */}
                  <path d="M 38 56 Q 44 50 50 56" stroke="#282B3A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M 70 56 Q 76 50 82 56" stroke="#282B3A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </>
              )}

              {/* Nose */}
              <polygon points="60,64 56,60 64,60" fill="#FF6B6B" />

              {/* Mouth */}
              <path d="M 54 67 Q 60 72 60 66 Q 60 72 66 67" stroke="#282B3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Whiskers */}
              <line x1="22" y1="58" x2="36" y2="61" stroke="#282B3A" strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="67" x2="35" y2="67" stroke="#282B3A" strokeWidth="2" strokeLinecap="round" />
              <line x1="98" y1="58" x2="84" y2="61" stroke="#282B3A" strokeWidth="2" strokeLinecap="round" />
              <line x1="100" y1="67" x2="85" y2="67" stroke="#282B3A" strokeWidth="2" strokeLinecap="round" />
              
              {/* Bell Collar */}
              <rect x="42" y="93" width="36" height="8" rx="4" fill="#FF4757" />
              <circle cx="60" cy="101" r="5" fill="#FFEAA7" stroke="#282B3A" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Interactive Cat Food Bowl ("ชามข้าวน้องแมว") */}
          <button
            onClick={onBowlClick}
            title={uncategorizedCount > 0 ? `มี ${uncategorizedCount} สลิปคอยให้อาหาร` : 'ชามข้าวเต็มอิ่มแล้ว'}
            className="absolute -bottom-2 -right-2 bg-slate-800 hover:bg-slate-700 border-2 border-yajok-border p-1.5 rounded-2xl shadow-lg transition-transform hover:scale-110 active:scale-95 group"
          >
            <div className="relative text-2xl">
              🥣
              {/* Fish / Salmon inside bowl */}
              {uncategorizedCount === 0 ? (
                <span className="absolute -top-1 -right-1 text-xs">🐟</span>
              ) : (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                  {uncategorizedCount}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 bg-yajok-dark/80 border border-yajok-border rounded-2xl p-3.5 sm:p-4 relative">
          {/* Bubble tail */}
          <div className="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-yajok-dark border-l border-b border-yajok-border transform rotate-45" />

          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{mood.expression}</span>
            <span className="text-xs font-semibold text-yajok-yellow uppercase tracking-wider">
              น้องแมวยาจก (Yajok Cat)
            </span>
            <span className="text-[10px] text-yajok-textMuted ml-auto">
              {mood.status === 'hungry' ? 'ต้องการอาหารด่วน!' : 'เป็นกำลังใจให้'}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            "{mood.message}"
          </p>

          {uncategorizedCount > 0 && (
            <div className="mt-2.5 pt-2 border-t border-yajok-border/60 flex items-center justify-between">
              <span className="text-xs text-blue-400 font-medium">
                กดที่ชามข้าวเพื่อให้อาหารน้องแมว
              </span>
              <button
                onClick={onBowlClick}
                className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium transition-colors"
              >
                เคลียร์สลิป ({uncategorizedCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
