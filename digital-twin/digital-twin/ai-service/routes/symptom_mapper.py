from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SymptomRequest(BaseModel):
    symptom: str

class SymptomResponse(BaseModel):
    specialists: List[str]
    urgency: str
    message: str

# Keyword → specialist mapping with weights and urgency
SYMPTOM_MAP = {
    # Cardiology (urgent)
    "chest pain": {"specialist": "Cardiologist", "urgency": "high", "weight": 10},
    "heart pain": {"specialist": "Cardiologist", "urgency": "high", "weight": 10},
    "breathlessness": {"specialist": "Cardiologist", "urgency": "high", "weight": 9},
    "shortness of breath": {"specialist": "Cardiologist", "urgency": "high", "weight": 9},
    "palpitations": {"specialist": "Cardiologist", "urgency": "medium", "weight": 7},
    "irregular heartbeat": {"specialist": "Cardiologist", "urgency": "high", "weight": 9},
    
    # Orthopedic
    "joint pain": {"specialist": "Orthopedic", "urgency": "medium", "weight": 6},
    "back pain": {"specialist": "Orthopedic", "urgency": "medium", "weight": 6},
    "knee pain": {"specialist": "Orthopedic", "urgency": "medium", "weight": 6},
    "fracture": {"specialist": "Orthopedic", "urgency": "high", "weight": 9},
    "broken bone": {"specialist": "Orthopedic", "urgency": "high", "weight": 9},
    "sprain": {"specialist": "Orthopedic", "urgency": "medium", "weight": 5},
    "injury": {"specialist": "Orthopedic", "urgency": "medium", "weight": 6},
    "muscle pain": {"specialist": "Physiotherapist", "urgency": "low", "weight": 4},
    
    # Dermatology
    "skin rash": {"specialist": "Dermatologist", "urgency": "low", "weight": 4},
    "rash": {"specialist": "Dermatologist", "urgency": "low", "weight": 4},
    "acne": {"specialist": "Dermatologist", "urgency": "low", "weight": 3},
    "itching": {"specialist": "Dermatologist", "urgency": "low", "weight": 3},
    "skin allergy": {"specialist": "Dermatologist", "urgency": "medium", "weight": 5},
    "hair loss": {"specialist": "Dermatologist", "urgency": "low", "weight": 3},
    
    # Gastroenterology
    "stomach pain": {"specialist": "Gastroenterologist", "urgency": "medium", "weight": 6},
    "abdominal pain": {"specialist": "Gastroenterologist", "urgency": "medium", "weight": 6},
    "nausea": {"specialist": "Gastroenterologist", "urgency": "medium", "weight": 5},
    "vomiting": {"specialist": "Gastroenterologist", "urgency": "medium", "weight": 6},
    "diarrhea": {"specialist": "Gastroenterologist", "urgency": "medium", "weight": 5},
    "constipation": {"specialist": "Gastroenterologist", "urgency": "low", "weight": 3},
    "acidity": {"specialist": "Gastroenterologist", "urgency": "low", "weight": 4},
    "bloating": {"specialist": "Gastroenterologist", "urgency": "low", "weight": 3},
    
    # General Physician
    "fever": {"specialist": "General Physician", "urgency": "medium", "weight": 5},
    "cold": {"specialist": "General Physician", "urgency": "low", "weight": 3},
    "cough": {"specialist": "General Physician", "urgency": "low", "weight": 3},
    "flu": {"specialist": "General Physician", "urgency": "medium", "weight": 4},
    "fatigue": {"specialist": "General Physician", "urgency": "low", "weight": 3},
    "weakness": {"specialist": "General Physician", "urgency": "medium", "weight": 4},
    "headache": {"specialist": "General Physician", "urgency": "low", "weight": 3},
    "body ache": {"specialist": "General Physician", "urgency": "low", "weight": 3},
    "sore throat": {"specialist": "General Physician", "urgency": "low", "weight": 3},
    
    # Psychiatry
    "anxiety": {"specialist": "Psychiatrist", "urgency": "medium", "weight": 6},
    "depression": {"specialist": "Psychiatrist", "urgency": "medium", "weight": 7},
    "stress": {"specialist": "Psychiatrist", "urgency": "low", "weight": 4},
    "insomnia": {"specialist": "Psychiatrist", "urgency": "medium", "weight": 5},
    "panic attack": {"specialist": "Psychiatrist", "urgency": "high", "weight": 8},
    "suicidal": {"specialist": "Psychiatrist", "urgency": "emergency", "weight": 10},
    
    # Neurology
    "seizure": {"specialist": "Neurologist", "urgency": "high", "weight": 9},
    "numbness": {"specialist": "Neurologist", "urgency": "medium", "weight": 6},
    "tingling": {"specialist": "Neurologist", "urgency": "medium", "weight": 5},
    "migraine": {"specialist": "Neurologist", "urgency": "medium", "weight": 6},
    "dizziness": {"specialist": "Neurologist", "urgency": "medium", "weight": 5},
    "fainting": {"specialist": "Neurologist", "urgency": "high", "weight": 8},
    
    # Pediatrics
    "child": {"specialist": "Pediatrician", "urgency": "medium", "weight": 5},
    "baby": {"specialist": "Pediatrician", "urgency": "medium", "weight": 5},
    "infant": {"specialist": "Pediatrician", "urgency": "medium", "weight": 5},
    
    # ENT
    "ear pain": {"specialist": "ENT Specialist", "urgency": "medium", "weight": 5},
    "hearing loss": {"specialist": "ENT Specialist", "urgency": "medium", "weight": 6},
    "nose bleed": {"specialist": "ENT Specialist", "urgency": "medium", "weight": 5},
    "sinus": {"specialist": "ENT Specialist", "urgency": "low", "weight": 4},
    
    # Ophthalmology
    "eye pain": {"specialist": "Ophthalmologist", "urgency": "medium", "weight": 5},
    "blurred vision": {"specialist": "Ophthalmologist", "urgency": "medium", "weight": 6},
    "vision loss": {"specialist": "Ophthalmologist", "urgency": "high", "weight": 9},
    
    # Emergency
    "unconscious": {"specialist": "Emergency Medicine", "urgency": "emergency", "weight": 10},
    "bleeding": {"specialist": "Emergency Medicine", "urgency": "high", "weight": 9},
    "severe pain": {"specialist": "Emergency Medicine", "urgency": "high", "weight": 8},
    "accident": {"specialist": "Emergency Medicine", "urgency": "emergency", "weight": 10},
    "poisoning": {"specialist": "Emergency Medicine", "urgency": "emergency", "weight": 10},
    "burn": {"specialist": "Emergency Medicine", "urgency": "high", "weight": 8},
}

URGENCY_MESSAGES = {
    "emergency": "EMERGENCY: Please seek immediate medical attention or call emergency services (112/108).",
    "high": "This appears to be urgent. Please consult a specialist as soon as possible, ideally within 24 hours.",
    "medium": "You should schedule an appointment with a specialist within the next few days.",
    "low": "This doesn't appear critical, but a consultation is recommended at your convenience."
}

URGENCY_ORDER = {"emergency": 4, "high": 3, "medium": 2, "low": 1}

@router.post("/map-symptom", response_model=SymptomResponse)
async def map_symptom(request: SymptomRequest):
    """
    Map natural language symptom description to specialists with urgency scoring.
    Uses weighted keyword matching for accurate specialist recommendation.
    """
    symptom_text = request.symptom.lower().strip()
    
    matched = []
    
    for keyword, data in SYMPTOM_MAP.items():
        if keyword in symptom_text:
            matched.append(data)
    
    if not matched:
        return SymptomResponse(
            specialists=["General Physician"],
            urgency="low",
            message="Based on your description, we recommend consulting a General Physician for an initial evaluation."
        )
    
    # Determine highest urgency
    max_urgency = max(matched, key=lambda x: URGENCY_ORDER.get(x["urgency"], 0))["urgency"]
    
    # Collect unique specialists sorted by weight
    specialist_scores = {}
    for m in matched:
        spec = m["specialist"]
        specialist_scores[spec] = specialist_scores.get(spec, 0) + m["weight"]
    
    sorted_specialists = sorted(specialist_scores.keys(), key=lambda s: specialist_scores[s], reverse=True)
    
    # Always include General Physician as fallback if not already present
    if "General Physician" not in sorted_specialists:
        sorted_specialists.append("General Physician")
    
    message = URGENCY_MESSAGES.get(max_urgency, URGENCY_MESSAGES["low"])
    
    return SymptomResponse(
        specialists=sorted_specialists[:4],
        urgency=max_urgency,
        message=message
    )
