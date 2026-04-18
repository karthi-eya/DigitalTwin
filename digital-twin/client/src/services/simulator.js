// ─── Client-Side Simulation Engine ───

function clamp(val, min = 0, max = 100) {
    return Math.max(min, Math.min(max, val));
}

export function runSimulation({ currentWeight, age, gender, tdee, avgCalories, avgSteps, medicalHistory = [], bmi }) {
    const currentBmi = bmi || 25;
    const heightM = Math.sqrt(currentWeight / currentBmi);

    // Daily caloric balance
    const dailyDeficit = tdee - avgCalories;

    // Activity adjustment
    let activityFactor = 1.0;
    if (avgSteps >= 10000) activityFactor = 1.15;
    else if (avgSteps >= 7000) activityFactor = 1.05;
    else if (avgSteps < 3000) activityFactor = 0.90;

    const effectiveDeficit = dailyDeficit * activityFactor;
    const weeklyWeightChange = (effectiveDeficit * 7) / 7700;

    // Medical history flags
    const hasDiabetes = medicalHistory.some(h => ['diabetes', 'type 2 diabetes', 'type 1 diabetes'].includes(h.toLowerCase()));
    const hasHeart = medicalHistory.some(h => ['heart disease', 'cardiovascular', 'hypertension'].includes(h.toLowerCase()));
    const hasThyroid = medicalHistory.some(h => ['thyroid', 'hypothyroidism', 'hyperthyroidism'].includes(h.toLowerCase()));

    const predictions = {};

    for (const [days, label] of [[30, 'days30'], [60, 'days60'], [90, 'days90']]) {
        const weeks = days / 7;
        let weightChange = weeklyWeightChange * weeks;

        if (hasThyroid && weightChange < 0) weightChange *= 0.7;

        const newWeight = Math.round((currentWeight + weightChange) * 10) / 10;
        const newBmi = Math.round((newWeight / (heightM * heightM)) * 10) / 10;

        // Risk calculations
        let obesityRisk = clamp((newBmi - 18.5) * 4.5 + Math.max(0, avgCalories - tdee) / 100 * 3);
        let diabetesBase = (newBmi - 22) * 3 + Math.max(0, avgCalories - tdee) / 150 * 4;
        if (avgSteps < 5000) diabetesBase += 12;
        if (hasDiabetes) diabetesBase += 25;

        let cardioBase = (age - 25) * 0.8 + (newBmi - 22) * 2.5;
        if (avgSteps < 4000) cardioBase += 15;
        if (hasHeart) cardioBase += 20;

        predictions[label] = {
            weight: newWeight,
            bmi: newBmi,
            obesityRisk: Math.round(clamp(obesityRisk) * 10) / 10,
            diabetesRisk: Math.round(clamp(diabetesBase) * 10) / 10,
            cardiovascularRisk: Math.round(clamp(cardioBase) * 10) / 10
        };
    }

    return { currentWeight, currentBmi, predictions };
}

export function runScenario(baseSimInput, scenario) {
    const modified = { ...baseSimInput };

    switch (scenario) {
        case 'stop_exercise':
            modified.avgSteps = 1000;
            modified.avgCalories = modified.avgCalories + 200;
            break;
        case 'eat_less_300':
            modified.avgCalories = modified.avgCalories - 300;
            break;
        case 'sleep_8hrs':
            // Sleep doesn't directly affect weight sim, but improves metabolic efficiency
            modified.tdee = modified.tdee * 1.05;
            break;
        case 'walk_10k':
            modified.avgSteps = 10000;
            break;
        case 'all_above':
            modified.avgSteps = 10000;
            modified.avgCalories = modified.avgCalories - 300;
            modified.tdee = modified.tdee * 1.05;
            break;
        default:
            break;
    }

    return runSimulation(modified);
}

export default { runSimulation, runScenario };
