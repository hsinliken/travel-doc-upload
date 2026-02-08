import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [groupId, setGroupId] = useState('2026-JP-001');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name || !phone) {
      alert('請填寫所有欄位並選擇檔案！');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('groupId', groupId);
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUploadSuccess(true);
        setMessage('✅ 證件上傳成功！我們已收到您的資料。');
      } else {
        setMessage('❌ 上傳失敗：' + (data.error || '請重試'));
      }
    } catch (err) {
      setMessage('❌ 發生錯誤：' + err.message);
    }
    setLoading(false);
  };

  // 成功畫面
  if (uploadSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✅</div>
          <h1 style={styles.successTitle}>上傳成功！</h1>
          <p style={styles.successText}>
            {name} 您好，<br/>
            我們已收到您的證件資料。
          </p>
          
          <div style={styles.divider}></div>
          
          <p style={styles.linePrompt}>📱 連結 LINE 接收即時通知</p>
          <a 
            href="https://line.me/R/ti/p/@521unlhh" 
            style={styles.lineButton}
          >
            加入官方 LINE
          </a>
          
          <button 
            onClick={() => {
              setUploadSuccess(false);
              setName('');
              setPhone('');
              setFile(null);
            }}
            style={styles.resetButton}
          >
            上傳另一份證件
          </button>
        </div>
      </div>
    );
  }

  // 上傳表單
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📸 旅遊證件上傳</h1>
        <p style={styles.subtitle}>請上傳您的護照或身分證件，系統將自動加密保護。</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>團號 (Group ID)</label>
            <input 
              type="text" 
              value={groupId} 
              onChange={(e) => setGroupId(e.target.value)}
              style={styles.input}
              placeholder="例如：2026-JP-001"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>姓名 *</label>
            <input 
              type="text" 
              placeholder="請輸入真實姓名"
              value={name} 
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>聯絡電話 *</label>
            <input 
              type="tel" 
              placeholder="例如：0912-345-678"
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>
              {file ? (
                <span>📄 已選取：{file.name}</span>
              ) : (
                <span>📂 點此選擇檔案 / 手機拍照</span>
              )}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.submitButton,
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {loading ? '處理中...' : '🚀 確認上傳'}
          </button>

          {message && <p style={styles.message}>{message}</p>}
        </form>

        <p style={styles.privacy}>
          🔒 您的資料將被加密處理，僅供本次簽證申請使用。
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px 30px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '28px',
    marginBottom: '10px',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#444',
  },
  input: {
    padding: '14px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  uploadBox: {
    border: '2px dashed #ccc',
    borderRadius: '10px',
    padding: '30px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  uploadLabel: {
    display: 'block',
    cursor: 'pointer',
    color: '#666',
  },
  submitButton: {
    padding: '16px',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  message: {
    textAlign: 'center',
    fontWeight: '600',
    padding: '10px',
  },
  privacy: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    marginTop: '20px',
  },
  // 成功畫面樣式
  successBox: {
    background: 'white',
    borderRadius: '20px',
    padding: '50px 30px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  successIcon: {
    fontSize: '60px',
    marginBottom: '20px',
  },
  successTitle: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '15px',
  },
  successText: {
    color: '#666',
    fontSize: '16px',
    lineHeight: '1.6',
  },
  divider: {
    height: '1px',
    background: '#eee',
    margin: '30px 0',
  },
  linePrompt: {
    color: '#666',
    marginBottom: '15px',
  },
  lineButton: {
    display: 'block',
    background: '#06C755',
    color: 'white',
    padding: '14px 30px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
  },
  resetButton: {
    background: 'transparent',
    border: '2px solid #ddd',
    padding: '12px 25px',
    borderRadius: '10px',
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
