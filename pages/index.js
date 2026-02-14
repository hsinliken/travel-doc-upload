const translations = {
  'zh-TW': {
    title: '📸 旅遊證件上傳',
    subtitle: '請選擇您的登入方式',
    lineLogin: 'LINE 一鍵登入上傳 (推薦)',
    manualLogin: '手動輸入資料上傳',
    or: '或是',
    back: '⬅️ 返回',
    groupId: '團號 (Group ID)',
    groupIdPlaceholder: '例如：2026-JP-001',
    name: '姓名 *',
    namePlaceholder: '請輸入真實姓名',
    phone: '聯絡電話 *',
    phonePlaceholder: '例如：0912-345-678',
    selectFile: '📂 點此選擇檔案 / 手機拍照',
    fileSelected: '📄 已選取：',
    submit: '🚀 確認上傳',
    processing: '處理中...',
    privacy: '🔒 您的資料將被加密保護，僅供本次簽證申請使用。',
    successTitle: '上傳成功！',
    successText: '您好，我們已收到您的證件資料。',
    uploadAnother: '上傳另一份證件',
    welcome: '歡迎！',
    fillAllFields: '請填寫所有欄位並選擇檔案！',
    uploadSuccess: '✅ 證件上傳成功！',
    uploadFailed: '❌ 上傳失敗：',
    error: '❌ 發生錯誤：',
    lineLoginFailed: '❌ LINE 登入失敗，請手動填寫資料',
  },
  // ... (其他語言略，邏輯相同)
};

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState('zh-TW');
  const [mode, setMode] = useState('landing'); // 'landing', 'form', 'success'
  const [loginMethod, setLoginMethod] = useState(null); // 'line', 'manual'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [groupId, setGroupId] = useState('2026-JP-001');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lineUser, setLineUser] = useState(null);

  const t = translations[lang] || translations['zh-TW'];

  // ... (語言切換邏輯維持不變)

  // LINE Login 回調處理
  useEffect(() => {
    const { lineUserId, lineName, linePicture, error } = router.query;
    
    if (error) {
      setMessage(t.lineLoginFailed);
      setMode('landing');
    }
    
    if (lineUserId && lineName) {
      setLineUser({
        userId: lineUserId,
        name: lineName,
        picture: linePicture,
      });
      setName(lineName); // 自動帶入 LINE 暱稱
      setLoginMethod('line');
      setMode('form'); // 直接進入表單
      router.replace('/', undefined, { shallow: true });
    }
  }, [router.query]);

  // LINE Login URL
  const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
    `response_type=code` +
    `&client_id=${process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '2009075717'}` +
    `&redirect_uri=${encodeURIComponent((process.env.NEXT_PUBLIC_BASE_URL || 'https://travel-doc-upload.vercel.app') + '/api/line-callback')}` +
    `&state=upload` +
    `&scope=profile%20openid`;

  const handleManualLogin = () => {
    setLoginMethod('manual');
    setMode('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name || !phone) {
      alert(t.fillAllFields);
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('groupId', groupId);
    formData.append('file', file);
    // 只有 LINE 登入才帶 UserId
    if (lineUser && loginMethod === 'line') {
      formData.append('lineUserId', lineUser.userId);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY || 'default-secret-key',
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMode('success');
        setMessage(t.uploadSuccess);
      } else {
        setMessage(t.uploadFailed + (data.error || ''));
      }
    } catch (err) {
      setMessage(t.error + err.message);
    }
    setLoading(false);
  };

  // 渲染邏輯區分
  if (mode === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.successBox}>
          {/* ... (成功畫面維持不變) ... */}
          <div style={styles.successIcon}>✅</div>
          <h1 style={styles.successTitle}>{t.successTitle}</h1>
          <p style={styles.successText}>{name} {t.successText}</p>
          
          {loginMethod === 'line' && (
            <p style={styles.lineConnected}>✅ LINE 通知已發送！</p>
          )}

          <button 
            onClick={() => {
              setMode('landing'); // 回到首頁重新選擇
              setName('');
              setPhone('');
              setFile(null);
              setLineUser(null);
              setLoginMethod(null);
            }}
            style={styles.resetButton}
          >
            {t.uploadAnother}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'form') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <button onClick={() => setMode('landing')} style={styles.backButton}>{t.back}</button>
          
          <h1 style={styles.title}>{t.title}</h1>
          
          {loginMethod === 'line' && lineUser && (
            <div style={styles.lineUserBox}>
              {lineUser.picture && <img src={lineUser.picture} style={styles.lineAvatar} />}
              <span>👋 {lineUser.name}，{t.welcome}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* ... (表單欄位維持不變) ... */}
            {/* ... (略: groupId, name, phone, file, submit button) ... */}
             <div style={styles.inputGroup}>
                <label style={styles.label}>{t.groupId}</label>
                <input 
                  type="text" 
                  value={groupId} 
                  onChange={(e) => setGroupId(e.target.value)}
                  style={styles.input}
                  placeholder={t.groupIdPlaceholder}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>{t.name}</label>
                <input 
                  type="text" 
                  placeholder={t.namePlaceholder}
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    ...styles.input,
                    backgroundColor: loginMethod === 'line' ? '#f0f9f0' : 'white',
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>{t.phone}</label>
                <input 
                  type="tel" 
                  placeholder={t.phonePlaceholder}
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.uploadBox}>
                <label style={styles.uploadLabel}>
                  {file ? (
                    <span>{t.fileSelected}{file.name}</span>
                  ) : (
                    <span>{t.selectFile}</span>
                  )}
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
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
                {loading ? t.processing : t.submit}
              </button>
          </form>
        </div>
      </div>
    );
  }

  // 預設 Landing Page
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}><br/>{t.title}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>

        <div style={styles.buttonGroup}>
          <a href={lineLoginUrl} style={styles.lineLoginButtonBig}>
            <span style={{fontSize: '24px', marginRight: '10px'}}>💬</span>
            {t.lineLogin}
          </a>
          
          <div style={styles.dividerText}>{t.or}</div>

          <button onClick={handleManualLogin} style={styles.manualLoginButton}>
            ✍️ {t.manualLogin}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  // ... (保留原有樣式)
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
    position: 'relative',
    textAlign: 'center', // 讓 Landing Page 置中
  },
  // 新增樣式
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '30px',
  },
  lineLoginButtonBig: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#06C755',
    color: 'white',
    padding: '18px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(6, 199, 85, 0.3)',
    transition: 'transform 0.2s',
  },
  manualLoginButton: {
    background: '#f5f5f5',
    color: '#666',
    border: '2px solid #ddd',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  dividerText: {
    color: '#aaa',
    fontSize: '14px',
    margin: '10px 0',
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '16px',
  },
  // ... (其他樣式與之前相同，略)
  // 為了縮減篇幅，這裡假設已有原有樣式定義
  title: { fontSize: '28px', marginBottom: '10px', color: '#333' },
  subtitle: { color: '#666', marginBottom: '25px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }, // 表單左對齊
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#444' },
  input: { padding: '14px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '10px', outline: 'none' },
  uploadBox: { border: '2px dashed #ccc', borderRadius: '10px', padding: '30px 20px', textAlign: 'center', cursor: 'pointer' },
  submitButton: { padding: '16px', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: '600', cursor: 'pointer' },
  successBox: { background: 'white', borderRadius: '20px', padding: '50px 30px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  successIcon: { fontSize: '60px', marginBottom: '20px' },
  successTitle: { fontSize: '28px', color: '#333', marginBottom: '15px' },
  successText: { color: '#666', fontSize: '16px', lineHeight: '1.6' },
  resetButton: { background: 'transparent', border: '2px solid #ddd', padding: '12px 25px', borderRadius: '10px', color: '#666', cursor: 'pointer', fontSize: '14px', marginTop: '20px' },
  lineUserBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#f0f9f0', padding: '14px', borderRadius: '10px', marginBottom: '20px', color: '#2e7d32', fontWeight: '600' },
  lineAvatar: { width: '30px', height: '30px', borderRadius: '50%' },
  lineConnected: { color: '#2e7d32', marginTop: '20px', fontWeight: 'bold' },
};
