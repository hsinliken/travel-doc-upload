import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { google } from 'googleapis';
import os from 'os';

// Next.js API config
export const config = {
  api: {
    bodyParser: false,
  },
};

// OAuth2 Credentials (從環境變數讀取)
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_FOLDER_ID;

// 設定 OAuth2 Client
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function uploadToGoogleDrive(filePath, fileName, mimeType) {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [FOLDER_ID],
    },
    media: {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    },
    fields: 'id, name, webViewLink',
  });

  return response.data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 使用系統暫存目錄 (/tmp on Vercel)
  const tmpDir = os.tmpdir();

  const form = formidable({ 
    uploadDir: tmpDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, 
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Upload Error:', err);
      return res.status(500).json({ error: 'File upload failed: ' + err.message });
    }

    const file = files.file?.[0];
    const name = fields.name?.[0] || 'Unknown';
    const groupId = fields.groupId?.[0] || 'DEFAULT';

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const originalPath = file.filepath;
      // 檔名規則: 團號_姓名_時間戳.jpg
      const filename = `${groupId}_${name}_${Date.now()}.jpg`;
      const outputPath = path.join(tmpDir, `watermarked_${filename}`);

      // 浮水印設定
      const watermarkText = `僅供 XX 旅遊辦理簽證使用 ${new Date().toISOString().split('T')[0]}`;
      const width = 800;
      const svgImage = `
        <svg width="${width}" height="200">
          <style>
            .title { fill: rgba(255, 255, 255, 0.5); font-size: 40px; font-weight: bold; }
          </style>
          <text x="50%" y="50%" text-anchor="middle" class="title">${watermarkText}</text>
        </svg>
      `;
      const svgBuffer = Buffer.from(svgImage);

      // 影像處理
      await sharp(originalPath)
        .resize({ width: 800 })
        .composite([{ input: svgBuffer, gravity: 'center', blend: 'over' }])
        .toFile(outputPath);

      // 上傳到 Google Drive
      console.log('正在上傳到 Google Drive...');
      const driveFile = await uploadToGoogleDrive(outputPath, filename, 'image/jpeg');
      console.log('✅ Google Drive Upload Success:', driveFile.webViewLink);

      // 清除本地暫存檔
      try {
        if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch (e) {
        console.error('清除暫存檔失敗:', e);
      }

      return res.status(200).json({ 
        success: true, 
        message: 'File uploaded to Google Drive successfully',
        driveLink: driveFile.webViewLink 
      });

    } catch (error) {
      console.error('Processing Error:', error);
      return res.status(500).json({ error: 'Image processing or upload failed: ' + error.message });
    }
  });
}
