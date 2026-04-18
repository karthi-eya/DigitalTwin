// ─── Client-Side Food Parser (ported from Python) ───

const NUTRITION_DB = {
    // Grains & Cereals
    'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, unit: '100g' },
    'brown rice': { calories: 112, protein: 2.3, carbs: 24, fats: 0.8, fiber: 1.8, unit: '100g' },
    'roti': { calories: 120, protein: 3.5, carbs: 20, fats: 3.5, fiber: 1.5, unit: '1 piece' },
    'chapati': { calories: 120, protein: 3.5, carbs: 20, fats: 3.5, fiber: 1.5, unit: '1 piece' },
    'naan': { calories: 260, protein: 9, carbs: 45, fats: 5, fiber: 2, unit: '1 piece' },
    'paratha': { calories: 200, protein: 4, carbs: 28, fats: 8, fiber: 1.5, unit: '1 piece' },
    'bread': { calories: 80, protein: 2.7, carbs: 15, fats: 1, fiber: 1, unit: '1 slice' },
    'oats': { calories: 150, protein: 5, carbs: 27, fats: 3, fiber: 4, unit: '1 cup' },
    'poha': { calories: 180, protein: 3, carbs: 32, fats: 5, fiber: 1.5, unit: '1 plate' },
    'upma': { calories: 200, protein: 4, carbs: 30, fats: 7, fiber: 2, unit: '1 plate' },
    'idli': { calories: 60, protein: 2, carbs: 12, fats: 0.4, fiber: 0.5, unit: '1 piece' },
    'dosa': { calories: 130, protein: 3, carbs: 20, fats: 4, fiber: 1, unit: '1 piece' },
    'pasta': { calories: 200, protein: 7, carbs: 40, fats: 1.5, fiber: 2, unit: '1 cup' },
    'noodles': { calories: 220, protein: 5, carbs: 40, fats: 3, fiber: 1, unit: '1 plate' },
    'cereal': { calories: 120, protein: 3, carbs: 25, fats: 1, fiber: 3, unit: '1 cup' },

    // Pulses & Legumes
    'dal': { calories: 120, protein: 9, carbs: 20, fats: 1, fiber: 3, unit: '1 cup' },
    'rajma': { calories: 130, protein: 9, carbs: 22, fats: 0.5, fiber: 6, unit: '1 cup' },
    'chole': { calories: 160, protein: 9, carbs: 27, fats: 3, fiber: 7, unit: '1 cup' },
    'chana': { calories: 160, protein: 9, carbs: 27, fats: 3, fiber: 7, unit: '1 cup' },
    'moong dal': { calories: 100, protein: 7, carbs: 18, fats: 0.4, fiber: 2, unit: '1 cup' },
    'lentils': { calories: 115, protein: 9, carbs: 20, fats: 0.4, fiber: 8, unit: '1 cup' },
    'tofu': { calories: 80, protein: 8, carbs: 2, fats: 4.5, fiber: 0.5, unit: '100g' },

    // Proteins
    'chicken': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, unit: '100g' },
    'chicken breast': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, unit: '100g' },
    'chicken curry': { calories: 240, protein: 18, carbs: 8, fats: 15, fiber: 1, unit: '1 cup' },
    'fish': { calories: 140, protein: 26, carbs: 0, fats: 4, fiber: 0, unit: '100g' },
    'salmon': { calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0, unit: '100g' },
    'egg': { calories: 78, protein: 6, carbs: 0.6, fats: 5, fiber: 0, unit: '1 whole' },
    'boiled egg': { calories: 78, protein: 6, carbs: 0.6, fats: 5, fiber: 0, unit: '1 whole' },
    'omelette': { calories: 154, protein: 11, carbs: 1, fats: 12, fiber: 0, unit: '2 eggs' },
    'paneer': { calories: 265, protein: 18, carbs: 3, fats: 21, fiber: 0, unit: '100g' },
    'mutton': { calories: 250, protein: 25, carbs: 0, fats: 16, fiber: 0, unit: '100g' },

    // Dairy
    'milk': { calories: 120, protein: 8, carbs: 12, fats: 5, fiber: 0, unit: '1 cup' },
    'curd': { calories: 100, protein: 5, carbs: 8, fats: 5, fiber: 0, unit: '1 cup' },
    'yogurt': { calories: 100, protein: 5, carbs: 8, fats: 5, fiber: 0, unit: '1 cup' },
    'cheese': { calories: 113, protein: 7, carbs: 0.4, fats: 9, fiber: 0, unit: '1 slice' },
    'butter': { calories: 102, protein: 0.1, carbs: 0, fats: 11.5, fiber: 0, unit: '1 tbsp' },
    'ghee': { calories: 120, protein: 0, carbs: 0, fats: 14, fiber: 0, unit: '1 tbsp' },
    'buttermilk': { calories: 40, protein: 3, carbs: 5, fats: 1, fiber: 0, unit: '1 cup' },
    'lassi': { calories: 160, protein: 4, carbs: 26, fats: 4, fiber: 0, unit: '1 glass' },

    // Fruits
    'banana': { calories: 105, protein: 1.3, carbs: 27, fats: 0.4, fiber: 3, unit: '1 medium' },
    'apple': { calories: 95, protein: 0.5, carbs: 25, fats: 0.3, fiber: 4, unit: '1 medium' },
    'mango': { calories: 100, protein: 1, carbs: 25, fats: 0.5, fiber: 3, unit: '1 cup' },
    'orange': { calories: 62, protein: 1.2, carbs: 15, fats: 0.2, fiber: 3, unit: '1 medium' },
    'grapes': { calories: 70, protein: 0.7, carbs: 18, fats: 0.2, fiber: 1, unit: '1 cup' },
    'watermelon': { calories: 46, protein: 1, carbs: 12, fats: 0.2, fiber: 0.6, unit: '1 cup' },
    'papaya': { calories: 55, protein: 0.6, carbs: 14, fats: 0.1, fiber: 2.5, unit: '1 cup' },
    'pomegranate': { calories: 83, protein: 1.7, carbs: 19, fats: 1, fiber: 4, unit: '1 cup' },
    'guava': { calories: 68, protein: 2.6, carbs: 14, fats: 1, fiber: 5, unit: '1 medium' },
    'pineapple': { calories: 82, protein: 0.9, carbs: 22, fats: 0.2, fiber: 2, unit: '1 cup' },

    // Vegetables
    'salad': { calories: 30, protein: 2, carbs: 5, fats: 0.3, fiber: 2, unit: '1 bowl' },
    'sabzi': { calories: 80, protein: 3, carbs: 10, fats: 3, fiber: 3, unit: '1 cup' },
    'potato': { calories: 160, protein: 4, carbs: 37, fats: 0.2, fiber: 4, unit: '1 medium' },
    'aloo': { calories: 160, protein: 4, carbs: 37, fats: 0.2, fiber: 4, unit: '1 medium' },
    'sweet potato': { calories: 115, protein: 2, carbs: 27, fats: 0.1, fiber: 4, unit: '1 medium' },

    // Snacks
    'samosa': { calories: 260, protein: 4, carbs: 32, fats: 14, fiber: 2, unit: '1 piece' },
    'pakora': { calories: 180, protein: 4, carbs: 15, fats: 12, fiber: 1, unit: '4 pieces' },
    'vada pav': { calories: 290, protein: 5, carbs: 40, fats: 12, fiber: 2, unit: '1 piece' },
    'burger': { calories: 350, protein: 17, carbs: 35, fats: 15, fiber: 2, unit: '1 piece' },
    'pizza': { calories: 270, protein: 12, carbs: 34, fats: 10, fiber: 2, unit: '1 slice' },
    'fries': { calories: 320, protein: 3, carbs: 42, fats: 15, fiber: 3, unit: '1 serving' },
    'sandwich': { calories: 250, protein: 10, carbs: 30, fats: 10, fiber: 2, unit: '1 piece' },
    'biscuits': { calories: 70, protein: 1, carbs: 10, fats: 3, fiber: 0.3, unit: '2 pieces' },
    'chips': { calories: 160, protein: 2, carbs: 15, fats: 10, fiber: 1, unit: '1 packet' },
    'popcorn': { calories: 110, protein: 3, carbs: 22, fats: 1.3, fiber: 4, unit: '2 cups' },
    'peanuts': { calories: 170, protein: 7, carbs: 5, fats: 14, fiber: 2, unit: '30g' },
    'almonds': { calories: 164, protein: 6, carbs: 6, fats: 14, fiber: 3.5, unit: '30g' },

    // Beverages
    'tea': { calories: 30, protein: 0, carbs: 7, fats: 0.5, fiber: 0, unit: '1 cup' },
    'coffee': { calories: 50, protein: 0.3, carbs: 8, fats: 1.5, fiber: 0, unit: '1 cup' },
    'juice': { calories: 110, protein: 0.5, carbs: 27, fats: 0.2, fiber: 0.5, unit: '1 glass' },
    'smoothie': { calories: 200, protein: 5, carbs: 35, fats: 4, fiber: 3, unit: '1 glass' },
    'protein shake': { calories: 180, protein: 25, carbs: 10, fats: 3, fiber: 1, unit: '1 glass' },
    'soft drink': { calories: 140, protein: 0, carbs: 39, fats: 0, fiber: 0, unit: '1 can' },
    'soda': { calories: 140, protein: 0, carbs: 39, fats: 0, fiber: 0, unit: '1 can' },
    'beer': { calories: 150, protein: 1, carbs: 13, fats: 0, fiber: 0, unit: '1 pint' },

    // Sweets
    'gulab jamun': { calories: 150, protein: 2, carbs: 25, fats: 5, fiber: 0.5, unit: '1 piece' },
    'rasgulla': { calories: 130, protein: 3, carbs: 22, fats: 3, fiber: 0, unit: '1 piece' },
    'ladoo': { calories: 180, protein: 3, carbs: 25, fats: 8, fiber: 1, unit: '1 piece' },
    'ice cream': { calories: 200, protein: 4, carbs: 25, fats: 10, fiber: 0.5, unit: '1 scoop' },
    'chocolate': { calories: 230, protein: 3, carbs: 25, fats: 14, fiber: 2, unit: '1 bar' },
    'cake': { calories: 250, protein: 3, carbs: 35, fats: 11, fiber: 1, unit: '1 slice' },
    'jalebi': { calories: 150, protein: 1, carbs: 30, fats: 4, fiber: 0, unit: '2 pieces' },
};

export function parseFood(text) {
    if (!text || !text.trim()) return { items: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 } };

    const parts = text.toLowerCase().split(/[,+&]|\band\b/).map(p => p.trim()).filter(Boolean);
    const items = [];
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };

    for (const part of parts) {
        // Try to extract quantity: "2 roti", "100g rice", "1 cup milk"
        const qtyMatch = part.match(/^(\d+\.?\d*)\s*(g|gm|gram|grams|cup|cups|glass|slice|slices|piece|pieces|plate|plates|bowl|bowls|tbsp|serving)?\s*(.+)/i);
        let quantity = 1;
        let foodName = part;

        if (qtyMatch) {
            quantity = parseFloat(qtyMatch[1]) || 1;
            const unit = qtyMatch[2]?.toLowerCase() || '';
            foodName = qtyMatch[3].trim();
            // If unit is grams, convert to per-100g multiplier
            if (['g', 'gm', 'gram', 'grams'].includes(unit)) {
                quantity = quantity / 100;
            }
        }

        // Find best match in DB
        let matched = null;
        let matchedKey = '';

        // Try exact match first
        for (const key of Object.keys(NUTRITION_DB)) {
            if (foodName === key || foodName.includes(key) || key.includes(foodName)) {
                matched = NUTRITION_DB[key];
                matchedKey = key;
                break;
            }
        }

        // Partial match
        if (!matched) {
            for (const key of Object.keys(NUTRITION_DB)) {
                const words = foodName.split(' ');
                if (words.some(w => key.includes(w) && w.length > 2)) {
                    matched = NUTRITION_DB[key];
                    matchedKey = key;
                    break;
                }
            }
        }

        if (matched) {
            const item = {
                rawText: part,
                name: matchedKey,
                quantity,
                unit: matched.unit,
                calories: Math.round(matched.calories * quantity),
                protein: Math.round(matched.protein * quantity * 10) / 10,
                carbs: Math.round(matched.carbs * quantity * 10) / 10,
                fats: Math.round(matched.fats * quantity * 10) / 10,
                fiber: Math.round((matched.fiber || 0) * quantity * 10) / 10,
            };
            items.push(item);
            totals.calories += item.calories;
            totals.protein += item.protein;
            totals.carbs += item.carbs;
            totals.fats += item.fats;
            totals.fiber += item.fiber;
        } else {
            // Unknown food — estimate
            items.push({
                rawText: part, name: part, quantity: 1, unit: 'serving',
                calories: 150, protein: 5, carbs: 20, fats: 5, fiber: 1, estimated: true
            });
            totals.calories += 150; totals.protein += 5; totals.carbs += 20; totals.fats += 5; totals.fiber += 1;
        }
    }

    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;
    totals.fats = Math.round(totals.fats * 10) / 10;
    totals.fiber = Math.round(totals.fiber * 10) / 10;

    return { items, totals };
}

export default parseFood;
