import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const API_SECRET_KEY = process.env.API_SECRET_KEY || 'default-secret-key';

// 設定 OAuth2 Client
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  // 1. API Key 驗證
  if (req.headers['x-api-key'] !== API_SECRET_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // 讀取 Sheet1!A:I 的資料
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:I',
    });

    const rows = response.data.values || [];

    // 解析資料為 JSON 陣列
    // 欄位順序: 時間, 團號, 姓名, 電話, LINE_ID, 檔案連結, 狀態, 用途, 申請日期
    const data = rows.map((row, index) => ({
      id: index, // Row Index
      time: row[0],
      groupId: row[1],
      name: row[2],
      phone: row[3],
      lineUserId: row[4],
      fileLink: row[5],
      status: row[6],
      purpose: row[7],
      applyDate: row[8],
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('List Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
