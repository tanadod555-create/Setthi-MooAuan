/**
 * ============================================================
 * แอป "ยาจก" (Yajok) - Google Apps Script Backend Gateway
 * ============================================================
 * วิธีติดตั้ง:
 * 1. สร้าง Google Sheet ใหม่ (ตั้งชื่อว่า "ยาจก DB" หรือตามใจชอบ)
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมด แล้วคัดลอกโค้ดนี้ทั้งหมดไปวางแทนที่
 * 4. กด "บันทึก" (รูปแผ่นดิสก์)
 * 5. กดปุ่มสีน้ำเงิน "ทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้ใหม่" (New deployment)
 * 6. เลือกประเภท: "เว็บแอป" (Web app)
 * 7. ตั้งค่า:
 *    - คำอธิบาย: Yajok Backend
 *    - เรียกใช้ในฐานะ: ฉัน (Me - อีเมลของคุณ)
 *    - ผู้มีสิทธิ์เข้าถึง: ทุกคน (Anyone)  <--- สำคัญมาก เพื่อให้เว็บแอปส่งข้อมูลเข้ามาได้
 * 8. กด "ทำให้ใช้งานได้" (Deploy) แล้วคัดลอก "URL เว็บแอป" (Web App URL)
 * 9. นำ URL ไปวางในช่อง Settings ของแอป "ยาจก"
 */

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Transactions Sheet
  let txnSheet = ss.getSheetByName('Transactions');
  if (!txnSheet) {
    txnSheet = ss.insertSheet('Transactions');
    txnSheet.appendRow([
      'ID', 'Date', 'Time', 'Type', 'Category', 
      'Amount', 'Wallet', 'Merchant', 'Tags', 
      'Note', 'SlipRef', 'RawJSON', 'CreatedAt'
    ]);
    txnSheet.getRange('A1:M1').setFontWeight('bold').setBackground('#1E293B').setFontColor('#F8FAFC');
    txnSheet.setFrozenRows(1);
  }
  
  // 2. Categories Sheet
  let catSheet = ss.getSheetByName('Categories');
  if (!catSheet) {
    catSheet = ss.insertSheet('Categories');
    catSheet.appendRow(['ID', 'Name', 'Type', 'Budget', 'Icon', 'Color']);
    catSheet.getRange('A1:F1').setFontWeight('bold').setBackground('#1E293B').setFontColor('#F8FAFC');
    
    // Default Categories
    const defaults = [
      ['cat-1', 'อาหารและเครื่องดื่ม', 'EXPENSE', 6000, '🍜', '#F59E0B'],
      ['cat-2', 'เดินทาง / น้ำมัน', 'EXPENSE', 3000, '🚗', '#3B82F6'],
      ['cat-3', 'ช้อปปิ้ง', 'EXPENSE', 2500, '🛍️', '#EC4899'],
      ['cat-4', 'บิล & ค่าใช้จ่ายบ้าน', 'EXPENSE', 2000, '💡', '#8B5CF6'],
      ['cat-5', 'สุขภาพ / ยา', 'EXPENSE', 1000, '💊', '#10B981'],
      ['cat-6', 'ความบันเทิง', 'EXPENSE', 1500, '🎮', '#6366F1'],
      ['cat-7', 'อื่นๆ', 'EXPENSE', 1000, '📦', '#64748B'],
      ['cat-8', 'เงินเดือน / รายได้', 'INCOME', 0, '💰', '#22C55E']
    ];
    defaults.forEach(r => catSheet.appendRow(r));
    catSheet.setFrozenRows(1);
  }
}

function doGet(e) {
  setupDatabase();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_all';
  
  if (action === 'get_all') {
    const txnSheet = ss.getSheetByName('Transactions');
    const catSheet = ss.getSheetByName('Categories');
    
    const txnData = txnSheet.getDataRange().getValues();
    const transactions = [];
    if (txnData.length > 1) {
      for (let i = 1; i < txnData.length; i++) {
        const row = txnData[i];
        if (!row[0]) continue;
        transactions.push({
          id: String(row[0]),
          date: formatDate(row[1]),
          time: String(row[2] || ''),
          type: String(row[3] || 'EXPENSE'),
          category: String(row[4] || 'อื่นๆ'),
          amount: Number(row[5] || 0),
          wallet: String(row[6] || 'เงินสด'),
          merchant: String(row[7] || ''),
          tags: row[8] ? String(row[8]).split(',').map(t => t.trim()) : [],
          note: String(row[9] || ''),
          slipRef: String(row[10] || ''),
          rawJson: String(row[11] || ''),
          createdAt: String(row[12] || '')
        });
      }
    }
    
    const catData = catSheet.getDataRange().getValues();
    const categories = [];
    if (catData.length > 1) {
      for (let i = 1; i < catData.length; i++) {
        const row = catData[i];
        if (!row[0]) continue;
        categories.push({
          id: String(row[0]),
          name: String(row[1]),
          type: String(row[2]),
          budget: Number(row[3] || 0),
          icon: String(row[4] || '📦'),
          color: String(row[5] || '#64748B')
        });
      }
    }
    
    return createJsonResponse({
      success: true,
      transactions: transactions,
      categories: categories
    });
  }
  
  return createJsonResponse({ success: true, message: 'Yajok Backend is ready!' });
}

function doPost(e) {
  setupDatabase();
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const txnSheet = ss.getSheetByName('Transactions');
    
    if (action === 'add_transaction') {
      const txn = data.transaction;
      txnSheet.appendRow([
        txn.id,
        txn.date,
        txn.time || '',
        txn.type || 'EXPENSE',
        txn.category || 'อื่นๆ',
        txn.amount || 0,
        txn.wallet || 'เงินสด',
        txn.merchant || '',
        (txn.tags && txn.tags.length) ? txn.tags.join(', ') : '',
        txn.note || '',
        txn.slipRef || '',
        txn.rawJson || '',
        txn.createdAt || new Date().toISOString()
      ]);
      return createJsonResponse({ success: true, message: 'Transaction saved' });
    }
    
    if (action === 'delete_transaction') {
      const id = String(data.id);
      const rows = txnSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === id) {
          txnSheet.deleteRow(i + 1);
          return createJsonResponse({ success: true, message: 'Transaction deleted' });
        }
      }
      return createJsonResponse({ success: false, message: 'ID not found' });
    }
    
    return createJsonResponse({ success: false, message: 'Unknown action' });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function formatDate(val) {
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(val);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
