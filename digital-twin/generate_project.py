import os
import json

base_dir = "digital-twin"

dirs = [
    "client/src/components/patient",
    "client/src/components/doctor",
    "client/src/components/avatar",
    "client/src/pages/auth",
    "client/src/pages/patient",
    "client/src/pages/doctor",
    "client/src/context",
    "client/src/hooks",
    "client/src/utils",
    "client/src/services",
    "client/public/models",
    "server/src/models",
    "server/src/routes",
    "server/src/controllers",
    "server/src/middleware",
    "server/src/services",
    "server/src/utils",
    "ai-service/routes",
    "ai-service/models",
    "ai-service/utils"
]

for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

files_to_create = {
    "docker-compose.yml": """version: '3.8'
services:
  frontend:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:5000/api
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/digitaltwin
      - JWT_SECRET=your_jwt_secret
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - mongodb
  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
volumes:
  mongodb_data:
""",
    ".env.example": """MONGO_URI=mongodb://localhost:27017/digitaltwin
JWT_SECRET=supersecretjwtkey
PORT=5000
AI_SERVICE_URL=http://localhost:8000
""",
    "server/package.json": json.dumps({
        "name": "digital-twin-server",
        "version": "1.0.0",
        "main": "src/index.js",
        "scripts": {
            "start": "node src/index.js",
            "dev": "nodemon src/index.js"
        },
        "dependencies": {
            "axios": "^1.6.0",
            "bcryptjs": "^2.4.3",
            "cors": "^2.8.5",
            "dotenv": "^16.3.1",
            "express": "^4.18.2",
            "jsonwebtoken": "^9.0.2",
            "mongoose": "^8.0.0",
            "multer": "^1.4.5-lts.1",
            "nodemailer": "^6.9.7",
            "pdfkit": "^0.13.0",
            "socket.io": "^4.7.2"
        },
        "devDependencies": {
            "nodemon": "^3.0.1"
        }
    }, indent=4),
    "client/package.json": json.dumps({
        "name": "digital-twin-client",
        "private": True,
        "version": "0.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
        },
        "dependencies": {
            "@react-three/drei": "^9.88.0",
            "@react-three/fiber": "^8.15.0",
            "axios": "^1.6.0",
            "framer-motion": "^10.16.4",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-hot-toast": "^2.4.1",
            "react-icons": "^4.11.0",
            "react-router-dom": "^6.18.0",
            "recharts": "^2.9.0",
            "socket.io-client": "^4.7.2",
            "three": "^0.158.0"
        },
        "devDependencies": {
            "@vitejs/plugin-react": "^4.2.0",
            "autoprefixer": "^10.4.16",
            "postcss": "^8.4.31",
            "tailwindcss": "^3.3.5",
            "vite": "^5.0.0"
        }
    }, indent=4),
    "ai-service/requirements.txt": """fastapi==0.104.1
uvicorn==0.24.0.post1
spacy==3.7.2
requests==2.31.0
pydantic==2.4.2
python-dotenv==1.0.0
""",
    "server/src/index.js": """const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

app.get('/', (req, res) => res.send('Digital Twin API Runner'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/digitaltwin')
    .then(() => {
        console.log('MongoDB connected');
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error(err));
""",
    "ai-service/main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Digital Twin AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Service is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
""",
    "client/src/App.jsx": """import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1>Human Body Digital Twin Simulator</h1>
        <p>Frontend is running successfully.</p>
      </div>
    </BrowserRouter>
  );
}

export default App;
""",
    "client/index.html": """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Digital Twin Simulator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""",
    "client/src/main.jsx": """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
""",
    "client/src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

body {
    background-color: #f0fdf4;
    color: #1e293b;
    font-family: 'Inter', sans-serif;
}
""",
    "client/vite.config.js": """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
""",
    "client/tailwind.config.js": """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
""",
    "client/postcss.config.js": """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""",
    "README.md": """# Human Body Digital Twin Simulator

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
""",
}

empty_files = [
    # Server Models
    "server/src/models/User.js", "server/src/models/PatientProfile.js", "server/src/models/HealthLog.js",
    "server/src/models/SimulationResult.js", "server/src/models/DoctorProfile.js", "server/src/models/Appointment.js",
    "server/src/models/EmergencyAlert.js", "server/src/models/MonitoringLog.js",
    
    # Server Middleware and Controllers
    "server/src/middleware/auth.js", "server/src/controllers/authController.js", "server/src/controllers/patientController.js",
    "server/src/controllers/doctorController.js", "server/src/routes/authRoutes.js", "server/src/routes/patientRoutes.js",
    "server/src/routes/doctorRoutes.js", "server/src/utils/jwt.js", "server/src/services/socketService.js",
    "server/src/utils/notificationHelper.js", "server/src/services/cronService.js", "server/src/services/pdfExportService.js",
    
    # AI Service
    "ai-service/routes/food_parser.py", "ai-service/routes/simulator.py", "ai-service/routes/symptom_mapper.py",
    "ai-service/utils/nutrition_db.py",
    
    # Frontend Pages & Components
    "client/src/pages/auth/LandingPage.jsx", "client/src/pages/auth/PatientLogin.jsx", "client/src/pages/auth/PatientRegister.jsx",
    "client/src/pages/auth/DoctorLogin.jsx", "client/src/pages/auth/DoctorRegister.jsx", "client/src/context/AuthContext.jsx",
    "client/src/components/ProtectedRoute.jsx", "client/src/pages/patient/ProfileSetup.jsx", "client/src/pages/patient/Dashboard.jsx",
    "client/src/components/patient/TodayScore.jsx", "client/src/components/patient/WeeklySummary.jsx", 
    "client/src/components/patient/QuickStats.jsx", "client/src/pages/patient/DailyLog.jsx", 
    "client/src/components/patient/AvatarDisplay.jsx", "client/src/pages/patient/MyTwin.jsx", 
    "client/src/pages/patient/HealthChat.jsx", "client/src/pages/doctor/DoctorDashboard.jsx",
    "client/src/components/doctor/PatientList.jsx", "client/src/components/doctor/PatientDetail.jsx",
    "client/src/components/doctor/AppointmentsPanel.jsx", "client/src/components/doctor/EmergencyCenter.jsx",
    "client/src/components/avatar/AvatarViewer.jsx", "client/src/hooks/useAvatarMorph.js", "client/src/components/avatar/AvatarFallback.jsx",
    "client/src/hooks/useSocket.js", "client/src/services/api.js"
]

for file_path, content in files_to_create.items():
    with open(os.path.join(base_dir, file_path), "w") as f:
        f.write(content)
        
for file_path in empty_files:
    open(os.path.join(base_dir, file_path), "w").close()

print(f"✅ Successfully bootstrapped project in {base_dir}")
