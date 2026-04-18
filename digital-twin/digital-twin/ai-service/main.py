from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routes.food_parser import router as food_router
from routes.simulator import router as sim_router
from routes.symptom_mapper import router as symptom_router

app = FastAPI(
    title="Human Body Digital Twin - AI Service",
    description="AI-powered food parsing, health simulation, and symptom mapping",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules
app.include_router(food_router, tags=["Food Parser"])
app.include_router(sim_router, tags=["Simulator"])
app.include_router(symptom_router, tags=["Symptom Mapper"])

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Digital Twin AI Service", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
