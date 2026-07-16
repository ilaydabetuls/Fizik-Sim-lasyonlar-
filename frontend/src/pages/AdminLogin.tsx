import React, { useState } from 'react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const url = '/api/admin/login';
    console.log('[AdminLogin] POST', url);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      console.log('[AdminLogin] response status', res.status);

      const text = await res.text();
      let body: any = null;
      try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }

      if (!res.ok) {
        // Show server-provided message when available
        const serverMsg = body && typeof body === 'object' && body.message ? body.message : (typeof body === 'string' ? body : null);
        setError(serverMsg || `Giriş başarısız (kod: ${res.status})`);
        setLoading(false);
        return;
      }

      if (body && typeof body === 'object' && body.token) {
        localStorage.setItem('admin_token', body.token);
        setInfo('Giriş başarılı, yönlendiriliyorsunuz...');
        // small delay to let user see message
        setTimeout(() => { window.location.href = '/admin'; }, 700);
      } else {
        setError('Sunucudan geçerli token alınamadı.');
      }
    } catch (err: any) {
      console.error('[AdminLogin] fetch error', err);
      // Network/CORS errors usually show up here
      if (err && err.message) setError(`Bağlantı hatası: ${err.message}`);
      else setError('Sunucuya bağlanırken bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: 12 }}>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 18 }}>Araştırma Girişi</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="Kullanıcı adı veya kod"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', fontSize: 16, borderRadius: 6, border: '1px solid #e6e6e6' }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', fontSize: 16, borderRadius: 6, border: '1px solid #e6e6e6' }}
            />
          </div>

          {error && (
            <div style={{ color: '#c0392b', marginBottom: 12, textAlign: 'center' }}>
              {error}
            </div>
          )}

          {info && (
            <div style={{ color: '#2d8659', marginBottom: 12, textAlign: 'center' }}>
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#2563eb',
              color: 'white',
              padding: '12px 16px',
              borderRadius: 8,
              border: 'none',
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: '#666', textAlign: 'center' }}>
        Eğer bağlantı hatası devam ederse, sayfayı yenileyin veya site yöneticisine başvurun.
      </div>
    </div>
  );
};

export default AdminLogin;
