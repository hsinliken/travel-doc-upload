const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const http = require('http');
const FormData = require('form-data');

// 1. 產生測試圖片
const testImage = 'test-passport.png';
sharp({
  create: {
    width: 800,
    height: 600,
    channels: 4,
    background: { r: 200, g: 200, b: 255, alpha: 1 }
  }
})
.composite([{
  input: Buffer.from('<svg><text x="200" y="300" font-size="60" fill="black">Passport Photo</text></svg>'),
  gravity: 'center'
}])
.png()
.toFile(testImage)
.then(async () => {
  console.log('✅ 測試圖片已產生:', testImage);

  // 2. 上傳測試
  const form = new FormData();
  form.append('name', 'TestUser');
  form.append('groupId', 'TEST-001');
  form.append('file', fs.createReadStream(testImage));

  const request = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/upload',
    method: 'POST',
    headers: form.getHeaders()
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('📡 API 回應:', data);
      
      try {
        const result = JSON.parse(data);
        if (result.success && result.path) {
          console.log('🎉 上傳成功！浮水印檔案路徑:', result.path);
        } else {
          console.error('❌ 上傳失敗:', result.error);
        }
      } catch (e) {
        console.error('❌ 解析回應失敗:', e);
      }
    });
  });

  form.pipe(request);
})
.catch(err => console.error('❌ 錯誤:', err));
