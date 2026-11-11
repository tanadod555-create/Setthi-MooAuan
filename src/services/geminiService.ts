import { GeminiParsedSlip } from '../types';

export const geminiService = {
  async parseSlipOrReceipt(base64Image: string, mimeType: string, apiKey: string): Promise<GeminiParsedSlip> {
    if (!apiKey) {
      return {
        success: false,
        error: 'กรุณากรอก Gemini API Key ในหน้าตั้งค่า (Settings) ก่อนใช้งานเหมียวสแกน'
      };
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const prompt = `
คุณคือ AI ผู้ช่วยตรวจสอบสลิปโอนเงินธนาคารไทย ใบเสร็จรับเงิน และบิลค่าใช้จ่ายของแอป "ยาจก"
จงวิเคราะห์ภาพที่แนบมานี้อย่างละเอียดที่สุด และแปลงผลลัพธ์เป็น JSON Object เท่านั้น (ห้ามมี Markdown หรือคำอธิบายเสริมใดๆ นอกเหนือจาก JSON):

โครงสร้าง JSON ที่ต้องการ:
{
  "bank": "ชื่อธนาคารต้นทางหรือผู้ให้บริการ เช่น KBank, SCB, KTB, BBL, TTB, GSB, TrueMoney, บัตรเครดิต, หรือ ใบเสร็จร้านค้า",
  "merchant": "ชื่อผู้รับเงิน ร้านค้า หรือปลายทางที่ชำระ เช่น 7-Eleven, Grab, ปตท., นายสมชาย ใจดี",
  "amount": 0.00, // ยอดเงินสุทธิที่จ่าย เป็นตัวเลขทศนิยม เช่น 150.00 หรือ 59.50
  "datetime": "YYYY-MM-DD HH:mm", // วันที่และเวลาที่ทำรายการ เช่น "2026-11-11 12:30" (หากไม่พบเวลาให้ใส่วันที่และเวลา 12:00)
  "slipRef": "เลขอ้างอิงสลิปการโอน หรือ Transaction Ref ถ้ามี",
  "suggestedCategory": "เลือก 1 หมวดหมู่ที่เหมาะสมที่สุดจาก: [อาหารและเครื่องดื่ม, เดินทาง / น้ำมัน, ช้อปปิ้ง, บิล & ค่าใช้จ่ายบ้าน, สุขภาพ / ยา, ความบันเทิง, อื่นๆ]",
  "type": "EXPENSE", // โดยทั่วไปคือ EXPENSE ยกเว้นเป็นสลิปเงินเข้าให้ระบุ INCOME
  "note": "ข้อความบันทึกช่วยจำ (ถ้ามีระบุในสลิป เช่น ค่าข้าว, ค่าหวย, หารค่าเน็ต)",
  "confidence": 0.95
}

คำแนะนำพิเศษ:
1. หากเป็นสลิป PromptPay โอนเงิน ให้ตรวจสอบชื่อผู้รับและยอดเงินให้ถูกต้อง
2. หากเป็นใบเสร็จ 7-Eleven หรือบิลห้าง ให้ดูยอด "ยอดรวมสุทธิ / Total / Grand Total"
3. หากเป็นใบแจ้งหนี้หรือบิลค่าน้ำค่าไฟ ให้เลือกหมวดหมู่ "บิล & ค่าใช้จ่ายบ้าน"
4. ส่งผลลัพธ์เป็น Raw JSON string เท่านั้น
`;

    try {
      // Use the official Gemini v1beta endpoint with gemini-2.5-flash (or fall back to 1.5-flash)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const body = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType || 'image/jpeg',
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('ไม่พบข้อมูลข้อความที่ตอบกลับจาก Gemini API');
      }

      // Parse JSON from text
      const cleanJson = rawText.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleanJson);

      return {
        success: true,
        bank: parsed.bank || 'สลิป/ใบเสร็จ',
        merchant: parsed.merchant || 'ไม่ทราบชื่อร้าน',
        amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || 0,
        datetime: parsed.datetime || new Date().toISOString().replace('T', ' ').substring(0, 16),
        slipRef: parsed.slipRef || '',
        suggestedCategory: parsed.suggestedCategory || 'อื่นๆ',
        type: parsed.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        note: parsed.note || '',
        confidence: parsed.confidence || 0.9
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Gemini สแกนไม่สำเร็จ: ${errorMessage}`
      };
    }
  }
};
