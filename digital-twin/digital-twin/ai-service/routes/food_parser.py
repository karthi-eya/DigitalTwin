import re
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from ..utils.nutrition_db import NUTRITION_DB

router = APIRouter()

class FoodParseRequest(BaseModel):
    text: str

class FoodItem(BaseModel):
    name: str
    quantity_g: float
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber: float

class NutritionTotals(BaseModel):
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber: float

class FoodParseResponse(BaseModel):
    items: List[FoodItem]
    totals: NutritionTotals

def parse_quantity(text: str) -> float:
    """Extract quantity in grams from text like '100g', '2 cups', '1 plate', '3 pieces'"""
    # Match patterns like "100g", "100 g", "100gm", "100 grams"
    gram_match = re.search(r'(\d+\.?\d*)\s*(?:g|gm|grams?)\b', text, re.IGNORECASE)
    if gram_match:
        return float(gram_match.group(1))
    
    # Match quantity multipliers
    qty_match = re.search(r'(\d+\.?\d*)\s*(?:x|pieces?|pcs?|nos?|units?|servings?|plates?|bowls?|cups?|glasses?)\b', text, re.IGNORECASE)
    if qty_match:
        return float(qty_match.group(1)) * -1  # Negative signals "use multiplier, not grams"
    
    # Match plain numbers at the start
    num_match = re.search(r'^(\d+\.?\d*)\s+', text.strip())
    if num_match:
        return float(num_match.group(1)) * -1  # Multiplier
    
    return -1  # Default: 1 serving

def find_food(text: str) -> Optional[str]:
    """Find the best matching food from database"""
    text_lower = text.lower().strip()
    
    # Direct match
    if text_lower in NUTRITION_DB:
        return text_lower
    
    # Partial match — check if any DB key is in the text
    best_match = None
    best_len = 0
    for food_name in NUTRITION_DB:
        if food_name in text_lower and len(food_name) > best_len:
            best_match = food_name
            best_len = len(food_name)
    
    return best_match

@router.post("/parse-food", response_model=FoodParseResponse)
async def parse_food(request: FoodParseRequest):
    """
    Parse natural language food description into nutritional breakdown.
    Input: "100g rice + 50g dal + 1 banana"
    """
    text = request.text
    
    # Split by common delimiters
    parts = re.split(r'[+,\n;]|(?:\band\b)', text)
    
    items = []
    totals = {"calories": 0, "protein": 0, "carbs": 0, "fats": 0, "fiber": 0}
    
    for part in parts:
        part = part.strip()
        if not part:
            continue
        
        food_name = find_food(part)
        if not food_name:
            # Try removing numbers and units
            cleaned = re.sub(r'\d+\.?\d*\s*(?:g|gm|grams?|ml|pieces?|cups?|bowls?|plates?|servings?|x)\s*', '', part, flags=re.IGNORECASE).strip()
            food_name = find_food(cleaned)
        
        if not food_name:
            # Unknown food — estimate
            items.append(FoodItem(
                name=part,
                quantity_g=100,
                calories=150,
                protein=5,
                carbs=20,
                fats=5,
                fiber=2
            ))
            totals["calories"] += 150
            totals["protein"] += 5
            totals["carbs"] += 20
            totals["fats"] += 5
            totals["fiber"] += 2
            continue
        
        food_data = NUTRITION_DB[food_name]
        quantity = parse_quantity(part)
        
        if quantity > 0:
            # Quantity in grams
            factor = quantity / 100.0
        else:
            # Multiplier-based (use default serving)
            multiplier = abs(quantity) if quantity != -1 else 1
            factor = (food_data.get("serving", 100) * multiplier) / 100.0
            quantity = food_data.get("serving", 100) * multiplier
        
        cal = round(food_data["calories"] * factor, 1)
        prot = round(food_data["protein"] * factor, 1)
        carb = round(food_data["carbs"] * factor, 1)
        fat = round(food_data["fats"] * factor, 1)
        fib = round(food_data["fiber"] * factor, 1)
        
        items.append(FoodItem(
            name=food_name,
            quantity_g=quantity if quantity > 0 else food_data.get("serving", 100),
            calories=cal,
            protein=prot,
            carbs=carb,
            fats=fat,
            fiber=fib
        ))
        
        totals["calories"] += cal
        totals["protein"] += prot
        totals["carbs"] += carb
        totals["fats"] += fat
        totals["fiber"] += fib
    
    return FoodParseResponse(
        items=items,
        totals=NutritionTotals(**{k: round(v, 1) for k, v in totals.items()})
    )
