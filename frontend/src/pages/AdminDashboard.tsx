import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Accordion from '../components/Accordion';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard() {
  const [hierarchy, setHierarchy] = useState<Record<string, any[]>>({});
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Şifre kontrolü: Giriş yapılmamışsa login sayfasına at
    const adminCode = localStorage.getItem('adminCode');
    if (adminCode !== 'SUPER_ADMIN_428') {
      navigate('/admin-login');
      return; // Şifre yoksa alttaki kodları çalıştırma ve fonksiyondan çık
    }

    // 2. Şifre doğruysa veritabanından listeyi (hiyerarşiyi) çek
    const fetchHierarchy = async () => {
      try {
        const { data } = await axios.get('http://localhost:8000/api/admin/hierarchy');
        setHierarchy(data);
        setLoading(false);
      } catch (error) {
        console.error('Hiyerarşi yüklenemedi', error);
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, [navigate]);

  const fetchParticipants = async (level: string, grade: string, page: number = 1, searchQuery: string = "") => {
    const key = `${level}-${grade}`;
    try {
      const { data } = await axios.get(`http://localhost:8000/api/admin/participants?level=${level}&grade=${grade}&page=${page}&search=${searchQuery}`);
      setParticipants(prev => ({ ...prev, [key]: data }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (level: string, grade: string) => {
    fetchParticipants(level, grade, 1, search);
  };

  if (loading) return <div className="p-10 text-center font-bold">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Üst Kısım: Başlık ve Analiz Butonu */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Yönetici Paneli</h1>
          <button 
            onClick={() => navigate('/admin/analysis')} 
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
          >
            Gelişmiş Analiz Raporu
          </button>
        </div>

        {/* Hiyerarşi Akordeonları */}
        {Object.keys(hierarchy).map(level => (
          <Accordion key={level} title={level}>
            {hierarchy[level].map(gradeObj => (
              <Accordion 
                key={gradeObj.grade} 
                title={`${gradeObj.grade}. Sınıf`}
                onOpen={() => fetchParticipants(level, gradeObj.grade)}
              >
                
                {/* Arama Kutusu */}
                <div className="mb-4 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Kod ile ara..." 
                    className="border p-2 rounded w-full max-w-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button 
                    onClick={() => handleSearch(level, gradeObj.grade)} 
                    className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
                  >
                    Ara
                  </button>
                </div>

                {!participants[`${level}-${gradeObj.grade}`] ? (
                  <div className="text-sm text-gray-500">Yükleniyor...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left bg-white rounded-lg shadow">
                      <thead className="bg-gray-200 text-gray-700">
                        <tr>
                          <th className="px-4 py-3">Kod</th>
                          <th className="px-4 py-3">Bölüm</th>
                          <th className="px-4 py-3">Cinsiyet</th>
                          <th className="px-4 py-3">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants[`${level}-${gradeObj.grade}`].data.map((p: any) => (
                          <tr 
                            key={p.participantCode} 
                            onClick={() => navigate(`/admin/participant/${p.participantCode}`)} 
                            className="border-b hover:bg-blue-50 cursor-pointer"
                          >
                            <td className="px-4 py-3 font-mono font-bold text-blue-600">{p.participantCode}</td>
                            <td className="px-4 py-3">{p.department || '-'}</td>
                            <td className="px-4 py-3">{p.gender || '-'}</td>
                            <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Sayfalama (Pagination) */}
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                      <span>Toplam: {participants[`${level}-${gradeObj.grade}`].total} kayıt</span>
                      <div className="flex gap-2">
                        <button 
                          disabled={participants[`${level}-${gradeObj.grade}`].page === 1}
                          onClick={() => fetchParticipants(level, gradeObj.grade, participants[`${level}-${gradeObj.grade}`].page - 1, search)}
                          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          &larr; Önceki
                        </button>
                        <button 
                          disabled={participants[`${level}-${gradeObj.grade}`].page === participants[`${level}-${gradeObj.grade}`].totalPages}
                          onClick={() => fetchParticipants(level, gradeObj.grade, participants[`${level}-${gradeObj.grade}`].page + 1, search)}
                          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sonraki &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Accordion>
            ))}
          </Accordion>
        ))}
      </div>
    </div>
  );
}
