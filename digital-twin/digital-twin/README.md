# Human Body Digital Twin Simulator

This platform was bootstrapped according to the master prompt. It includes:
- Vite + React + Tailwind + Three.js frontend
- Node + Express + MongoDB + Socket.io backend
- Python FastAPI AI microservice

## How to run locally

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (running locally on port 27017 or update `.env`)

### 1. Backend (Server)
```bash
cd server
npm install
npm run dev
```

### 2. Frontend (Client)
```bash
cd client
npm install
npm run dev
```

### 3. AI Service
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
