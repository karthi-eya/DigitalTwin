# Nutrition database with ~60 common Indian + international foods
# Values per 100g unless otherwise noted

NUTRITION_DB = {
    # ─── GRAINS & CEREALS ───
    "rice": {"calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3, "fiber": 0.4, "serving": 150},
    "brown rice": {"calories": 112, "protein": 2.6, "carbs": 24, "fats": 0.9, "fiber": 1.8, "serving": 150},
    "roti": {"calories": 264, "protein": 8.7, "carbs": 50, "fats": 3.7, "fiber": 2.7, "serving": 40},
    "chapati": {"calories": 264, "protein": 8.7, "carbs": 50, "fats": 3.7, "fiber": 2.7, "serving": 40},
    "naan": {"calories": 262, "protein": 9.0, "carbs": 45, "fats": 5.0, "fiber": 2.0, "serving": 90},
    "paratha": {"calories": 326, "protein": 7.0, "carbs": 45, "fats": 13, "fiber": 2.5, "serving": 60},
    "bread": {"calories": 265, "protein": 9.0, "carbs": 49, "fats": 3.2, "fiber": 2.7, "serving": 30},
    "oats": {"calories": 389, "protein": 16.9, "carbs": 66, "fats": 6.9, "fiber": 10.6, "serving": 40},
    "pasta": {"calories": 131, "protein": 5.0, "carbs": 25, "fats": 1.1, "fiber": 1.8, "serving": 200},
    "noodles": {"calories": 138, "protein": 4.5, "carbs": 25, "fats": 2.1, "fiber": 1.2, "serving": 200},
    "poha": {"calories": 110, "protein": 2.5, "carbs": 22, "fats": 1.5, "fiber": 1.0, "serving": 150},
    "upma": {"calories": 125, "protein": 3.5, "carbs": 18, "fats": 4.0, "fiber": 1.5, "serving": 200},
    "dosa": {"calories": 168, "protein": 3.9, "carbs": 25, "fats": 5.8, "fiber": 0.8, "serving": 100},
    "idli": {"calories": 58, "protein": 2.0, "carbs": 12, "fats": 0.2, "fiber": 0.6, "serving": 40},
    "cornflakes": {"calories": 357, "protein": 7.0, "carbs": 84, "fats": 0.4, "fiber": 1.2, "serving": 30},

    # ─── PULSES & LEGUMES ───
    "dal": {"calories": 104, "protein": 7.0, "carbs": 17, "fats": 0.4, "fiber": 4.0, "serving": 150},
    "moong dal": {"calories": 105, "protein": 7.0, "carbs": 18, "fats": 0.4, "fiber": 5.0, "serving": 150},
    "chana": {"calories": 164, "protein": 8.9, "carbs": 27, "fats": 2.6, "fiber": 7.6, "serving": 100},
    "rajma": {"calories": 127, "protein": 8.7, "carbs": 22, "fats": 0.5, "fiber": 6.4, "serving": 150},
    "chole": {"calories": 164, "protein": 8.9, "carbs": 27, "fats": 2.6, "fiber": 7.6, "serving": 150},
    "soybean": {"calories": 173, "protein": 16.6, "carbs": 10, "fats": 9.0, "fiber": 6.0, "serving": 100},

    # ─── VEGETABLES ───
    "aloo": {"calories": 77, "protein": 2.0, "carbs": 17, "fats": 0.1, "fiber": 2.2, "serving": 150},
    "potato": {"calories": 77, "protein": 2.0, "carbs": 17, "fats": 0.1, "fiber": 2.2, "serving": 150},
    "aloo curry": {"calories": 120, "protein": 2.5, "carbs": 18, "fats": 5.0, "fiber": 2.0, "serving": 200},
    "salad": {"calories": 20, "protein": 1.5, "carbs": 3.5, "fats": 0.2, "fiber": 1.5, "serving": 150},
    "palak": {"calories": 23, "protein": 2.9, "carbs": 3.6, "fats": 0.4, "fiber": 2.2, "serving": 100},
    "spinach": {"calories": 23, "protein": 2.9, "carbs": 3.6, "fats": 0.4, "fiber": 2.2, "serving": 100},
    "sabzi": {"calories": 80, "protein": 3.0, "carbs": 10, "fats": 3.5, "fiber": 3.0, "serving": 150},
    "mixed vegetables": {"calories": 65, "protein": 2.5, "carbs": 12, "fats": 0.5, "fiber": 3.0, "serving": 150},
    "bhindi": {"calories": 33, "protein": 1.9, "carbs": 7.5, "fats": 0.2, "fiber": 3.2, "serving": 100},
    "broccoli": {"calories": 34, "protein": 2.8, "carbs": 7.0, "fats": 0.4, "fiber": 2.6, "serving": 100},

    # ─── DAIRY ───
    "milk": {"calories": 42, "protein": 3.4, "carbs": 5.0, "fats": 1.0, "fiber": 0, "serving": 250},
    "curd": {"calories": 61, "protein": 3.5, "carbs": 4.7, "fats": 3.3, "fiber": 0, "serving": 150},
    "yogurt": {"calories": 61, "protein": 3.5, "carbs": 4.7, "fats": 3.3, "fiber": 0, "serving": 150},
    "paneer": {"calories": 265, "protein": 18.3, "carbs": 1.2, "fats": 20.8, "fiber": 0, "serving": 100},
    "cheese": {"calories": 402, "protein": 25.0, "carbs": 1.3, "fats": 33, "fiber": 0, "serving": 30},
    "butter": {"calories": 717, "protein": 0.9, "carbs": 0.1, "fats": 81, "fiber": 0, "serving": 10},
    "ghee": {"calories": 900, "protein": 0, "carbs": 0, "fats": 100, "fiber": 0, "serving": 10},
    "lassi": {"calories": 70, "protein": 3.0, "carbs": 12, "fats": 1.5, "fiber": 0, "serving": 250},

    # ─── NON-VEG ───
    "chicken": {"calories": 239, "protein": 27.3, "carbs": 0, "fats": 13.6, "fiber": 0, "serving": 150},
    "chicken breast": {"calories": 165, "protein": 31.0, "carbs": 0, "fats": 3.6, "fiber": 0, "serving": 150},
    "chicken curry": {"calories": 180, "protein": 18.0, "carbs": 5.0, "fats": 10, "fiber": 0.5, "serving": 200},
    "egg": {"calories": 155, "protein": 12.6, "carbs": 1.1, "fats": 11.5, "fiber": 0, "serving": 50},
    "boiled egg": {"calories": 155, "protein": 12.6, "carbs": 1.1, "fats": 11.5, "fiber": 0, "serving": 50},
    "omelette": {"calories": 196, "protein": 13.6, "carbs": 1.6, "fats": 15, "fiber": 0, "serving": 60},
    "fish": {"calories": 206, "protein": 22.0, "carbs": 0, "fats": 12, "fiber": 0, "serving": 150},
    "mutton": {"calories": 294, "protein": 25.0, "carbs": 0, "fats": 21, "fiber": 0, "serving": 150},
    "prawn": {"calories": 99, "protein": 24.0, "carbs": 0.2, "fats": 0.3, "fiber": 0, "serving": 100},

    # ─── FRUITS ───
    "banana": {"calories": 89, "protein": 1.1, "carbs": 23, "fats": 0.3, "fiber": 2.6, "serving": 120},
    "apple": {"calories": 52, "protein": 0.3, "carbs": 14, "fats": 0.2, "fiber": 2.4, "serving": 180},
    "mango": {"calories": 60, "protein": 0.8, "carbs": 15, "fats": 0.4, "fiber": 1.6, "serving": 200},
    "orange": {"calories": 47, "protein": 0.9, "carbs": 12, "fats": 0.1, "fiber": 2.4, "serving": 150},
    "papaya": {"calories": 43, "protein": 0.5, "carbs": 11, "fats": 0.3, "fiber": 1.7, "serving": 150},
    "watermelon": {"calories": 30, "protein": 0.6, "carbs": 8, "fats": 0.2, "fiber": 0.4, "serving": 200},
    "grapes": {"calories": 69, "protein": 0.7, "carbs": 18, "fats": 0.2, "fiber": 0.9, "serving": 100},
    "pomegranate": {"calories": 83, "protein": 1.7, "carbs": 19, "fats": 1.2, "fiber": 4.0, "serving": 150},
    "guava": {"calories": 68, "protein": 2.6, "carbs": 14, "fats": 1.0, "fiber": 5.4, "serving": 150},
    "pineapple": {"calories": 50, "protein": 0.5, "carbs": 13, "fats": 0.1, "fiber": 1.4, "serving": 150},
    "strawberry": {"calories": 32, "protein": 0.7, "carbs": 8, "fats": 0.3, "fiber": 2.0, "serving": 100},

    # ─── SNACKS & MISC ───
    "samosa": {"calories": 262, "protein": 4.0, "carbs": 28, "fats": 15, "fiber": 1.5, "serving": 80},
    "pakora": {"calories": 175, "protein": 5.5, "carbs": 18, "fats": 9.5, "fiber": 1.5, "serving": 60},
    "biryani": {"calories": 200, "protein": 8.0, "carbs": 28, "fats": 7, "fiber": 1.0, "serving": 250},
    "pizza": {"calories": 266, "protein": 11.0, "carbs": 33, "fats": 10, "fiber": 2.3, "serving": 107},
    "burger": {"calories": 295, "protein": 17.0, "carbs": 24, "fats": 14, "fiber": 1.3, "serving": 200},
    "french fries": {"calories": 365, "protein": 4.0, "carbs": 50, "fats": 17, "fiber": 3.8, "serving": 100},
    "sandwich": {"calories": 250, "protein": 10.0, "carbs": 30, "fats": 10, "fiber": 2.0, "serving": 150},
    "maggi": {"calories": 205, "protein": 4.5, "carbs": 28, "fats": 8.5, "fiber": 1.0, "serving": 140},

    # ─── BEVERAGES ───
    "tea": {"calories": 2, "protein": 0, "carbs": 0.5, "fats": 0, "fiber": 0, "serving": 200},
    "chai": {"calories": 50, "protein": 2.0, "carbs": 8, "fats": 1.5, "fiber": 0, "serving": 200},
    "coffee": {"calories": 2, "protein": 0.3, "carbs": 0, "fats": 0, "fiber": 0, "serving": 200},
    "juice": {"calories": 45, "protein": 0.5, "carbs": 11, "fats": 0.1, "fiber": 0.2, "serving": 250},
    "smoothie": {"calories": 80, "protein": 3.0, "carbs": 15, "fats": 1.5, "fiber": 2.0, "serving": 300},
    "protein shake": {"calories": 120, "protein": 25.0, "carbs": 5, "fats": 1.5, "fiber": 1.0, "serving": 300},
    "coconut water": {"calories": 19, "protein": 0.7, "carbs": 3.7, "fats": 0.2, "fiber": 1.1, "serving": 250},

    # ─── NUTS & DRY FRUITS ───
    "almonds": {"calories": 579, "protein": 21.0, "carbs": 22, "fats": 50, "fiber": 12.5, "serving": 30},
    "peanuts": {"calories": 567, "protein": 25.8, "carbs": 16, "fats": 49, "fiber": 8.5, "serving": 30},
    "cashews": {"calories": 553, "protein": 18.2, "carbs": 30, "fats": 44, "fiber": 3.3, "serving": 30},
    "walnuts": {"calories": 654, "protein": 15.2, "carbs": 14, "fats": 65, "fiber": 6.7, "serving": 30},
    "dates": {"calories": 277, "protein": 1.8, "carbs": 75, "fats": 0.2, "fiber": 6.7, "serving": 30},

    # ─── SWEETS ───
    "jalebi": {"calories": 380, "protein": 2.0, "carbs": 68, "fats": 12, "fiber": 0.5, "serving": 50},
    "gulab jamun": {"calories": 387, "protein": 5.0, "carbs": 55, "fats": 17, "fiber": 0.3, "serving": 50},
    "ice cream": {"calories": 207, "protein": 3.5, "carbs": 24, "fats": 11, "fiber": 0.7, "serving": 100},
    "chocolate": {"calories": 546, "protein": 5.0, "carbs": 60, "fats": 31, "fiber": 7.0, "serving": 40},
}
