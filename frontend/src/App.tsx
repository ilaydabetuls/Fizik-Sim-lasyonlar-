import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import PreTest from './pages/PreTest';
import PostTest from './pages/PostTest';
import AdminDashboard from './pages/AdminDashboard';
import ParticipantDetail from './pages/ParticipantDetail';
import AdvancedAnalysis from './pages/AdvancedAnalysis';
import AdminLogin from './pages/AdminLogin'; // YENİ EKLENDİ

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/pre-test" element={<PreTest />} />
        <Route path="/post-test" element={<PostTest />} />
        
        {/* Yönetici Giriş Rotası */}
        <Route path="/admin-login" element={<AdminLogin />} /> 
        
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/participant/:code" element={<ParticipantDetail />} />
        <Route path="/admin/analysis" element={<AdvancedAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}
