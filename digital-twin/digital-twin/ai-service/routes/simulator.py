from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class SimulationRequest(BaseModel):
    currentWeight: float
    age: int
    gender: str
    tdee: float
    avgCalories: float
    avgSteps: float
    medicalHistory: Optional[List[str]] = []
    bmi: Optional[float] = None

class RiskScores(BaseModel):
    weight: float
    bmi: float
    obesityRisk: float
    diabetesRisk: float
    cardiovascularRisk: float

class PredictionResult(BaseModel):
    days30: RiskScores
    days60: RiskScores
    days90: RiskScores

class SimulationResponse(BaseModel):
    predictions: PredictionResult

def clamp(val, min_val=0, max_val=100):
    return max(min_val, min(max_val, val))

@router.post("/simulate", response_model=SimulationResponse)
async def simulate(req: SimulationRequest):
    """
    Rule-based simulation engine:
    - Caloric surplus/deficit → weight change projection
    - Activity level → metabolic rate adjustment
    - Risk score calculation based on BMI, activity, age, and medical history
    """
    current_weight = req.currentWeight
    age = req.age
    gender = req.gender
    tdee = req.tdee
    avg_calories = req.avgCalories
    avg_steps = req.avgSteps
    medical_history = req.medicalHistory or []
    
    # Calculate height from BMI (reverse BMI = weight / height^2)
    bmi = req.bmi if req.bmi else 25.0
    height_m = (current_weight / bmi) ** 0.5
    
    # Daily caloric balance
    daily_deficit = tdee - avg_calories  # Positive = deficit (weight loss)
    
    # Activity adjustment factor
    activity_factor = 1.0
    if avg_steps >= 10000:
        activity_factor = 1.15  # Higher metabolism
    elif avg_steps >= 7000:
        activity_factor = 1.05
    elif avg_steps < 3000:
        activity_factor = 0.90  # Lower metabolism
    
    # Effective daily deficit (adjusted for activity)
    effective_deficit = daily_deficit * activity_factor
    
    # Weight change: 7700 kcal ≈ 1 kg fat
    weekly_weight_change = (effective_deficit * 7) / 7700
    
    # Medical history risk modifiers
    has_diabetes = any(h.lower() in ['diabetes', 'type 2 diabetes', 'type 1 diabetes'] for h in medical_history)
    has_heart = any(h.lower() in ['heart disease', 'cardiovascular', 'hypertension'] for h in medical_history)
    has_thyroid = any(h.lower() in ['thyroid', 'hypothyroidism', 'hyperthyroidism'] for h in medical_history)
    
    predictions = {}
    
    for days, label in [(30, "days30"), (60, "days60"), (90, "days90")]:
        weeks = days / 7
        weight_change = weekly_weight_change * weeks
        
        # Thyroid slows weight loss
        if has_thyroid and weight_change < 0:
            weight_change *= 0.7
        
        new_weight = round(current_weight + weight_change, 1)
        new_bmi = round(new_weight / (height_m ** 2), 1)
        
        # ─── Risk Calculations ───
        
        # Obesity Risk: BMI + caloric trend
        obesity_risk = clamp(
            (new_bmi - 18.5) * 4.5 +
            (max(0, avg_calories - tdee) / 100) * 3
        )
        
        # Diabetes Risk: BMI + sugar intake proxy + low activity + history
        diabetes_base = (new_bmi - 22) * 3 + (max(0, avg_calories - tdee) / 150) * 4
        if avg_steps < 5000:
            diabetes_base += 12
        if has_diabetes:
            diabetes_base += 25
        diabetes_risk = clamp(diabetes_base)
        
        # Cardiovascular Risk: age + BMI + activity + history
        cardio_base = (age - 25) * 0.8 + (new_bmi - 22) * 2.5
        if avg_steps < 4000:
            cardio_base += 15
        if has_heart:
            cardio_base += 20
        cardiovascular_risk = clamp(cardio_base)
        
        predictions[label] = RiskScores(
            weight=new_weight,
            bmi=new_bmi,
            obesityRisk=round(obesity_risk, 1),
            diabetesRisk=round(diabetes_risk, 1),
            cardiovascularRisk=round(cardiovascular_risk, 1)
        )
    
    return SimulationResponse(predictions=PredictionResult(**predictions))
