import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import PreTest from './pages/PreTest';
import PostTest from './pages/PostTest';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/pre-test" element={<PreTest />} />
        <Route path="/post-test" element={<PostTest />} />
      </Routes>
    </BrowserRouter>
  );
}
