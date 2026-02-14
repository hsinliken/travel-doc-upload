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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // 1. API Key 驗證
  if (req.headers['x-api-key'] !== API_SECRET_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { ids, purpose, applyDate } = req.body;
  if (!ids || ids.length === 0) return res.status(400).json({ error: 'Missing data' });

  try {
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    const data = ids.map(id => ({
      // id 已經是 1-based (從 1 開始)
      // 如果 id = 1，代表第一筆資料，也就是 Row 2 (因為 Row 1 是 Header)
      // 所以 Row Number = id + 1
      range: `Sheet1!G${id + 1}:I${id + 1}`, 
      values: [['已處理', purpose, applyDate]],
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: data,
      },
    });

    res.status(200).json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
