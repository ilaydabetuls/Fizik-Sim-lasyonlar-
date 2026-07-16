# Fizik Simülasyonları Araştırması

Bu proje, fizik konularında eğik atış ve serbest düşme gibi konseptleri öğrenmek için tasarlanmış web tabanlı bir araştırma platformudur.

## Kurulum

### Backend Kurulumu

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend `http://localhost:8000` adresinde çalışacaktır.

### Frontend Kurulumu

```bash
cd frontend
npm install
npm start
```

Frontend `http://localhost:3000` adresinde çalışacaktır.

## Proje Yapısı

- `backend/` - FastAPI uygulaması
- `frontend/` - React uygulaması

## API Endpoints

### Öğrenci Rotaları
- `POST /api/login` - Giriş yap
- `POST /api/student/status` - Durum kontrol et
- `POST /api/pre-test/submit` - Ön testi gönder
- `POST /api/post-test/submit` - Son testi gönder

### Admin Rotaları
- `GET /api/admin/hierarchy` - Hiyerarşi görüntüle
- `GET /api/admin/participants` - Katılımcıları listele
- `GET /api/admin/participant/{code}` - Katılımcı detayı
- `POST /api/admin/participant/{code}/unlock` - Testi kilit aç
- `POST /api/admin/participant/{code}/reset` - Testi sıfırla
- `GET /api/admin/advanced-analysis` - Analiz ver
