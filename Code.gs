/**
 * ============================================================
 * แอป "เศรษฐีหมูอ้วน" (Setthi MooAuan) 🐷💰
 * Google Apps Script Backend Gateway (Cloud Database ฟรี 100%)
 * ============================================================
 * 
 * 📌 ขั้นตอนการติดตั้ง (ทำครั้งเดียว 2 นาที):
 * 1. เปิดเว็บ https://sheets.google.com/ แล้วกดสร้าง Google Sheet ใหม่ (ตั้งชื่อว่า "เศรษฐีหมูอ้วน DB")
 * 2. ไปที่เมนูด้านบน: "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเริ่มต้นในหน้าต่าง Apps Script ออกให้หมด แล้วคัดลอกโค้ดทั้งหมดนี้ไปวางแทนที่
 * 4. กดปุ่ม "บันทึก" 💾 (รูปแผ่นดิสก์)
 * 5. กดปุ่มสีน้ำเงินด้านบนขวา "ทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้ใหม่" (New deployment)
 * 6. เลือกประเภท (รูปฟันเฟือง): เลือก "เว็บแอป" (Web app)
 * 7. ตั้งค่าสำคัญ 2 จุด:
 *    - เรียกใช้ในฐานะ (Execute as): "ฉัน" (Me - บัญชี Google ของคุณ)
 *    - ผู้มีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone)  <--- สำคัญมาก! เพื่อให้เบราว์เซอร์ส่งข้อมูลมาได้
 * 8. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) และกดอนุญาตสิทธิ์ (Authorize access)
 * 9. คัดลอก "URL เว็บแอป" (Web App URL) ที่ลงท้ายด้วย /exec
 * 10. นำ URL นั้นไปวางในปุ่ม ⚙️ (ตั้งค่า) ของแอปเศรษฐีหมูอ้วน
 */

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Transactions Sheet (ตารางบันทึกรายรับรายจ่าย)
  let txnSheet = ss.getSheetByName('Transactions');
  if (!txnSheet) {
    txnSheet = ss.insertSheet('Transactions');
    txnSheet.appendRow([
      'ID', 'ผู้ใช้ (User)', 'วันที่ (Date)', 'เวลา (Time)', 'ประเภท (Type)', 
      'หมวดหมู่ (Category)', 'ยอดเงิน (Amount)', 'กระเป๋า/ธนาคาร (Wallet)', 
      'ร้านค้า/ผู้รับ (Merchant)', 'บันทึกช่วยจำ (Note)', 'เลขอ้างอิงสลิป (SlipRef)', 'บันทึกเมื่อ (CreatedAt)'
    ]);
    // Format Header Row
    txnSheet.getRange('A1:L1')
      .setFontWeight('bold')
      .setBackground('#1E293B')
      .setFontColor('#F8FAFC')
      .setHorizontalAlignment('center');
    txnSheet.setFrozenRows(1);
    txnSheet.setColumnWidth(1, 140); // ID
    txnSheet.setColumnWidth(2, 100); // User
    txnSheet.setColumnWidth(3, 110); // Date
    txnSheet.setColumnWidth(4, 80);  // Time
    txnSheet.setColumnWidth(5, 90);  // Type
    txnSheet.setColumnWidth(6, 160); // Category
    txnSheet.setColumnWidth(7, 120); // Amount
    txnSheet.setColumnWidth(8, 110); // Wallet
    txnSheet.setColumnWidth(9, 180); // Merchant
    txnSheet.setColumnWidth(10, 200); // Note
    txnSheet.setColumnWidth(11, 150); // SlipRef
    txnSheet.setColumnWidth(12, 160); // CreatedAt
  }
  
  // 2. Categories Sheet (ตารางหมวดหมู่)
  let catSheet = ss.getSheetByName('Categories');
  if (!catSheet) {
    catSheet = ss.insertSheet('Categories');
    catSheet.appendRow(['ID', 'ชื่อหมวดหมู่ (Name)', 'ประเภท (Type)', 'ไอคอน (Icon)', 'สี (Color)']);
    catSheet.getRange('A1:E1')
      .setFontWeight('bold')
      .setBackground('#1E293B')
      .setFontColor('#F8FAFC')
      .setHorizontalAlignment('center');
    
    // Default Categories (รายจ่าย & รายรับ แยกกันชัดเจน)
    const defaults = [
      // หมวดหมู่รายจ่าย (Expense)
      ['exp-1', 'อาหารและเครื่องดื่ม', 'EXPENSE', '🍜', '#ff6584'],
      ['exp-2', 'ของใช้ & ช้อปปิ้ง', 'EXPENSE', '🛍️', '#ec4899'],
      ['exp-3', 'เดินทาง / น้ำมัน', 'EXPENSE', '🚗', '#38bdf8'],
      ['exp-4', 'บิล & ค่าน้ำค่าไฟ', 'EXPENSE', '💡', '#a855f7'],
      ['exp-5', 'สุขภาพ / ยา / คลินิก', 'EXPENSE', '💊', '#10b981'],
      ['exp-6', 'บันเทิง & สังสรรค์', 'EXPENSE', '🎮', '#6366f1'],
      ['exp-7', 'ค่าใช้จ่ายอื่นๆ', 'EXPENSE', '📦', '#64748b'],

      // หมวดหมู่รายรับ (Income)
      ['inc-1', 'เงินเดือนประจำ', 'INCOME', '💰', '#10b981'],
      ['inc-2', 'ธุรกิจ / ค้าขาย / กำไร', 'INCOME', '💼', '#059669'],
      ['inc-3', 'โบนัส & คอมมิชชั่น', 'INCOME', '🎁', '#f59e0b'],
      ['inc-4', 'รับโอนเงิน / เพื่อนคืน', 'INCOME', '💸', '#3b82f6'],
      ['inc-5', 'เงินปันผล & ดอกเบี้ย', 'INCOME', '📈', '#8b5cf6'],
      ['inc-6', 'รายรับพิเศษ / อื่นๆ', 'INCOME', '🪙', '#64748b']
    ];
    defaults.forEach(r => catSheet.appendRow(r));
    catSheet.setFrozenRows(1);
  }
}

// ========================================================
// API: ดึงข้อมูล (GET)
// ========================================================
function doGet(e) {
  setupDatabase();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userFilter = (e && e.parameter && e.parameter.user) ? e.parameter.user.toLowerCase() : null;
  
  const txnSheet = ss.getSheetByName('Transactions');
  const catSheet = ss.getSheetByName('Categories');
  
  const txnData = txnSheet.getDataRange().getValues();
  const transactions = [];
  if (txnData.length > 1) {
    for (let i = 1; i < txnData.length; i++) {
      const row = txnData[i];
      if (!row[0]) continue;
      
      const rowUser = String(row[1] || '').toLowerCase();
      // หากระบุ user ให้กรองเฉพาะของ user นั้น
      if (userFilter && rowUser && rowUser !== userFilter) continue;
      
      transactions.push({
        id: String(row[0]),
        user: String(row[1] || 'general'),
        date: formatDate(row[2]),
        time: String(row[3] || ''),
        type: String(row[4] || 'EXPENSE'),
        category: String(row[5] || 'อื่นๆ'),
        amount: Number(row[6] || 0),
        wallet: String(row[7] || 'เงินสด'),
        merchant: String(row[8] || ''),
        note: String(row[9] || ''),
        slipRef: String(row[10] || ''),
        createdAt: String(row[11] || '')
      });
    }
  }
  
  return createJsonResponse({
    success: true,
    message: 'Setthi MooAuan DB Ready',
    transactions: transactions
  });
}

// ========================================================
// API: บันทึก / ลบข้อมูล (POST)
// ========================================================
function doPost(e) {
  setupDatabase();
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const txnSheet = ss.getSheetByName('Transactions');
    
    // บันทึกรายการใหม่
    if (action === 'addTransaction' || action === 'add_transaction') {
      const txn = data.transaction;
      txnSheet.appendRow([
        txn.id,
        txn.user || 'general',
        txn.date,
        txn.time || '',
        txn.type || 'EXPENSE',
        txn.category || 'อื่นๆ',
        txn.amount || 0,
        txn.wallet || 'เงินสด',
        txn.merchant || '',
        txn.note || '',
        txn.slipRef || '',
        txn.createdAt || new Date().toISOString()
      ]);
      return createJsonResponse({ success: true, message: 'บันทึกสำเร็จอู๊ด!' });
    }
    
    // ลบรายการ
    if (action === 'deleteTransaction' || action === 'delete_transaction') {
      const id = String(data.id);
      const rows = txnSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === id) {
          txnSheet.deleteRow(i + 1);
          return createJsonResponse({ success: true, message: 'ลบรายการสำเร็จ' });
        }
      }
      return createJsonResponse({ success: false, message: 'ไม่พบรหัสรายการนี้' });
    }
    
    return createJsonResponse({ success: false, message: 'ไม่รู้จัก action นี้' });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

// Helper: Format Date
function formatDate(val) {
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(val);
}

// Helper: Output JSON
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
