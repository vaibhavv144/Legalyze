# Indian Legal AI Platform

Full-stack MVP legal assistant focused on Indian law with:
- React + TypeScript + Tailwind frontend
- FastAPI + MongoDB backend
- Gemini-ready legal chat and contract intelligence pipeline

## Features
- JWT auth (register/login/refresh/profile)
- Legal chat with source citations and chat history
- Contract upload (PDF/DOCX/JPG/PNG) with OCR-ready extraction flow
- Clause extraction, red flag detection, safer recommendations
- Contract summary generation and clause explainer
- Search across chats, contracts, clauses, and risks
- Notifications for uploads and analysis completion

## Run with Docker
```bash
docker compose up --build
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8000/docs`

## Run locally

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Set API URL in `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```
