// ─── Health Score Calculator (35% diet + 30% activity + 25% hydration + 10% sleep) ───

export function calculateHealthScore({ totalCalories, tdee, steps, workoutDuration, workoutType, sleepHours, sleepQuality, waterGlasses }) {
    const breakdown = { diet: 0, activity: 0, hydration: 0, sleep: 0 };
    const feedback = [];

    // ─── Diet Score (max 35) ───
    const calorieDiff = Math.abs(totalCalories - (tdee || 2000));
    if (calorieDiff <= 100) {
        breakdown.diet = 35;
    } else if (calorieDiff <= 200) {
        breakdown.diet = 30;
    } else if (calorieDiff <= 400) {
        breakdown.diet = 22;
    } else if (calorieDiff <= 600) {
        breakdown.diet = 15;
    } else {
        breakdown.diet = 8;
    }

    if (totalCalories > (tdee || 2000) + 300) {
        feedback.push(`You consumed ${totalCalories - (tdee || 2000)} kcal more than your target. Try reducing portion sizes.`);
    } else if (totalCalories < (tdee || 2000) - 500) {
        feedback.push(`Your calorie intake is ${(tdee || 2000) - totalCalories} kcal below target. Make sure you're eating enough.`);
    } else {
        feedback.push('Great calorie balance today! 🎯');
    }

    // ─── Activity Score (max 30) ───
    let activityPoints = 0;
    // Steps contribution (max 20)
    if (steps >= 10000) activityPoints += 20;
    else if (steps >= 7000) activityPoints += 16;
    else if (steps >= 5000) activityPoints += 12;
    else if (steps >= 3000) activityPoints += 8;
    else activityPoints += 3;

    // Workout contribution (max 10)
    if (workoutType && workoutType !== 'none' && workoutDuration > 0) {
        if (workoutDuration >= 45) activityPoints += 10;
        else if (workoutDuration >= 30) activityPoints += 8;
        else if (workoutDuration >= 15) activityPoints += 5;
        else activityPoints += 3;
    }

    breakdown.activity = Math.min(30, activityPoints);

    if (steps < 5000) {
        feedback.push(`Only ${steps.toLocaleString()} steps today. Try to hit at least 7,000! 🚶`);
    } else if (steps >= 10000) {
        feedback.push(`Amazing! ${steps.toLocaleString()} steps today! Keep it up! 🏃`);
    }

    // ─── Hydration Score (max 25) ───
    if (waterGlasses >= 8) breakdown.hydration = 25;
    else if (waterGlasses >= 6) breakdown.hydration = 20;
    else if (waterGlasses >= 4) breakdown.hydration = 14;
    else if (waterGlasses >= 2) breakdown.hydration = 8;
    else breakdown.hydration = 3;

    if (waterGlasses < 6) {
        feedback.push(`Only ${waterGlasses} glasses of water. Aim for 8 glasses daily! 💧`);
    }

    // ─── Sleep Score (max 10) ───
    if (sleepHours >= 7 && sleepHours <= 9 && sleepQuality === 'good') {
        breakdown.sleep = 10;
    } else if (sleepHours >= 6 && sleepHours <= 9) {
        breakdown.sleep = sleepQuality === 'good' ? 9 : sleepQuality === 'fair' ? 7 : 5;
    } else {
        breakdown.sleep = 3;
    }

    if (sleepHours < 6) {
        feedback.push(`${sleepHours} hours of sleep is insufficient. Adults need 7-9 hours. 😴`);
    }

    const totalScore = breakdown.diet + breakdown.activity + breakdown.hydration + breakdown.sleep;

    // Overall feedback
    if (totalScore >= 80) feedback.unshift('Excellent health day! You\'re crushing it! 🌟');
    else if (totalScore >= 60) feedback.unshift('Good day overall. A few areas to improve. 👍');
    else if (totalScore >= 40) feedback.unshift('Average day. Focus on diet and activity tomorrow. 💪');
    else feedback.unshift('Below average. Let\'s make tomorrow a better day! 🎯');

    return { healthScore: totalScore, scoreBreakdown: breakdown, feedbackMessages: feedback };
}

export default calculateHealthScore;
