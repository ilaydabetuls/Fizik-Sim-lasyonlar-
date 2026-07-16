import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:8000/api/login', { code });
      localStorage.setItem('participantCode', data.participantCode);
      if (!data.preTestCompleted) navigate('/pre-test');
      else navigate('/post-test');
    } catch (err: any) { setError(err.response?.data?.detail || "Bağlantı hatası."); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-96 text-center">
        <h2 className="text-2xl font-bold mb-6">Araştırma Girişi</h2>
        <input type="text" placeholder="Kodunuz" className="w-full px-4 py-2 border rounded text-center uppercase tracking-widest mb-4" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold">Giriş Yap</button>
      </form>
    </div>
  );
}
