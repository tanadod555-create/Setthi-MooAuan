import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Loader2, FileText } from 'lucide-react';

interface SlipUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  isScanning: boolean;
}

export const SlipUploader: React.FC<SlipUploaderProps> = ({
  onImageSelected,
  isScanning,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;

    // Check if file is image
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพสลิปหรือใบเสร็จ (JPG, PNG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onImageSelected(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-yajok-card border border-yajok-border rounded-3xl p-5 shadow-lg relative overflow-hidden">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />

      {isScanning ? (
        // Scanning State
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-3xl bg-yajok-yellow/20 flex items-center justify-center animate-pulse">
              <span className="text-3xl animate-bounce">🔍</span>
            </div>
            <Loader2 className="w-6 h-6 text-yajok-yellow animate-spin absolute -top-1 -right-1" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yajok-yellow animate-spin" />
            Gemini กำลังเพ่งอ่านสลิป...
          </h3>
          <p className="text-xs text-yajok-textMuted max-w-xs">
            กำลังตรวจหาชื่อร้าน ยอดเงิน และวันที่ เพื่อจัดหมวดหมู่อัตโนมัติให้พี่มนุษย์
          </p>
        </div>
      ) : (
        // Ready State
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-yajok-yellow animate-ping" />
              <h2 className="text-sm font-semibold text-white tracking-wide">
                สแกนสลิป & ใบเสร็จอัจฉริยะ (AI Vision)
              </h2>
            </div>
            <span className="text-[11px] text-yajok-yellow bg-yajok-yellow/10 border border-yajok-yellow/20 px-2 py-0.5 rounded-full font-medium">
              สลิปไทย 20 ธนาคาร + 7-Eleven
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragOver
                ? 'border-yajok-yellow bg-yajok-yellow/5 scale-[1.01]'
                : 'border-yajok-border hover:border-slate-500 bg-yajok-dark/40'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-yajok-card border border-yajok-border flex items-center justify-center text-2xl shadow-inner">
                🧾
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                ลากรูปสลิปหรือใบเสร็จมาวางที่นี่
              </p>
              <p className="text-[11px] text-yajok-textMuted">
                หรือกดปุ่มด้านล่างเพื่อเลือกรูปภาพจากมือถือ
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {/* Photo Gallery Picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yajok-yellow hover:bg-yajok-yellowHover active:scale-95 text-black font-semibold text-xs sm:text-sm shadow-md shadow-yajok-yellow/20 transition-all"
              >
                <ImageIcon className="w-4 h-4" />
                <span>เลือกรูปสลิปจากอัลบั้ม</span>
              </button>

              {/* Direct Camera Button (Mobile) */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 transition-all"
              >
                <Camera className="w-4 h-4 text-yajok-yellow" />
                <span>ถ่ายรูปใบเสร็จ</span>
              </button>
            </div>
          </div>

          {/* Supported Types Info */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-yajok-textMuted px-1">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              รองรับสลิปโอน, บิลกระดาษ, และใบแจ้งหนี้
            </span>
            <span className="text-slate-500">
              ปลอดภัย ประมวลผลตรงสู่ Gemini API
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
