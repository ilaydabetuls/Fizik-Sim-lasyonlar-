import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const preTest1Questions = [
  {
    id: 'q1',
    text: 'Serbest düşüşte, hava direnci yokken, bir cismin ivmesi nedir?',
    options: [
      { id: 'A', text: '0 m/s²' },
      { id: 'B', text: '9.8 m/s²' },
      { id: 'C', text: '19.6 m/s²' },
      { id: 'D', text: 'Cismin kütlesine bağlıdır' }
    ]
  }
];

export default function PreTest() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<Record<string, any>>({});
  const testStartTime = useRef(Date.now());
  const entryTime = useRef(Date.now());

  useEffect(() => {
    const qId = preTest1Questions[currentIndex].id;
    entryTime.current = Date.now();
    setLogs(p => ({ ...p, [qId]: { ...(p[qId] || { questionId: qId, changeCount: 0, timeSpentMs: 0 }), openedAt: p[qId]?.openedAt || Date.now() } }));
    return () => {
      setLogs(p => ({ ...p, [qId]: { ...p[qId], closedAt: Date.now(), timeSpentMs: p[qId].timeSpentMs + (Date.now() - entryTime.current) } }));
    };
  }, [currentIndex]);

  const selectAnswer = (qId: string, optId: string) => {
    setAnswers(p => ({ ...p, [qId]: optId }));
    setLogs(p => ({ ...p, [qId]: { ...p[qId], firstAnsweredAt: p[qId].firstAnsweredAt || Date.now(), lastAnsweredAt: Date.now(), changeCount: p[qId].selectedAnswer !== optId ? p[qId].changeCount + 1 : p[qId].changeCount, selectedAnswer: optId } }));
  };

  const submit = async () => {
    if (Object.keys(answers).length < preTest1Questions.length) return alert("Tüm soruları yanıtlayın.");
    try {
      await axios.post(`${API_BASE_URL}/api/pre-test/submit`, { participantCode: localStorage.getItem('participantCode'), answers, logs: Object.values(logs), startedAt: new Date(testStartTime.current).toISOString(), finishedAt: new Date().toISOString(), totalDuration: (Date.now() - testStartTime.current)/1000 });
      setIsCompleted(true);
    } catch (error) {
      console.error('Test gönderme hatası:', error);
    }
  };

  if (isCompleted) return <div className="p-20 text-center"><div className="text-green-500 text-5xl">✔</div><h2 className="text-xl font-bold">Ön testiniz başarıyla tamamlandı.</h2><p>Son testiniz 7 gün sonra erişime açılacaktır.</p><button onClick={() => navigate('/')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Çıkış</button></div>;

  const q = preTest1Questions[currentIndex];
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow p-4 flex justify-between items-center max-w-4xl mx-auto w-full"><span className="font-bold">Soru {currentIndex + 1}/{preTest1Questions.length}</span><div className="flex space-x-2">{preTest1Questions.map((_, i) => <button key={i} onClick={() => setCurrentIndex(i)} className={`w-8 h-8 rounded-full border ${i === currentIndex ? 'border-blue-600 bg-blue-50' : answers[preTest1Questions[i].id] ? 'bg-blue-600 text-white' : 'bg-white'}`}>{i + 1}</button>)}</div></header>
      <main className="flex-grow p-8 max-w-4xl mx-auto w-full">
        <div className="bg-white p-8 rounded shadow text-lg font-medium mb-6">{q.text}</div>
        {q.image && <img src={q.image} alt="" className="mx-auto mb-6 rounded border max-h-64" />}
        <div className="space-y-3">{q.options.map(opt => <label key={opt.id} className={`block p-4 border rounded cursor-pointer ${answers[q.id] === opt.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white hover:bg-gray-50'}`}><input type="radio" className="hidden" checked={answers[q.id] === opt.id} onChange={() => selectAnswer(q.id, opt.id)} /><span className="font-bold mr-2">{opt.id})</span> {opt.text}</label>)}</div>
      </main>
      <footer className="bg-white border-t p-4 flex justify-between max-w-4xl mx-auto w-full"><button onClick={() => setCurrentIndex(p => p - 1)} disabled={currentIndex === 0} className="px-6 py-2 bg-gray-200 rounded disabled:opacity-50">Önceki</button>{currentIndex === preTest1Questions.length - 1 ? <button onClick={submit} className="px-6 py-2 bg-green-600 text-white rounded font-bold">Bitir</button> : <button onClick={() => setCurrentIndex(p => p + 1)} className="px-6 py-2 bg-blue-600 text-white rounded">Sonraki</button>}</footer>
    </div>
  );
}
