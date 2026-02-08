import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('2026-JP-001'); // 預設團號，之後可從 URL 帶入
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name) {
      alert('請填寫姓名並選擇檔案！');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('groupId', groupId);
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setMessage('✅ 上傳成功！請稍候...');
        // 模擬跳轉至官方 LINE
        setTimeout(() => {
          window.location.href = 'https://line.me/R/ti/p/@your_line_id'; 
        }, 2000);
      } else {
        setMessage('❌ 上傳失敗，請重試。');
      }
    } catch (err) {
      setMessage('❌ 發生錯誤：' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>📸 旅遊證件上傳系統</h1>
      <p style={{ color: '#666' }}>請上傳您的護照或身分證件，系統將自動加密與加上浮水印。</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label>團號 (Group ID)</label>
          <input 
            type="text" 
            value={groupId} 
            onChange={(e) => setGroupId(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>

        <div>
          <label>姓名 (Name)</label>
          <input 
            type="text" 
            placeholder="請輸入真實姓名"
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>

        <div style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
          <label style={{ display: 'block', cursor: 'pointer' }}>
            {file ? `📄 已選取：${file.name}` : '📂 點此選擇檔案 / 手機拍照'}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '15px', 
            background: loading ? '#ccc' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            fontSize: '18px', 
            cursor: 'pointer' 
          }}
        >
          {loading ? '處理中...' : '🚀 確認上傳'}
        </button>

        {message && <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}
      </form>
    </div>
  );
}
