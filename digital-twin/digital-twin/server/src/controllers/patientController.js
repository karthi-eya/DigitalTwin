const PatientProfile = require('../models/PatientProfile');
const HealthLog = require('../models/HealthLog');
const SimulationResult = require('../models/SimulationResult');
const EmergencyAlert = require('../models/EmergencyAlert');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Calculate TDEE using Harris-Benedict formula
 */
const calculateTDEE = (weight, height, age, gender, activityLevel) => {
    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725
    };

    return Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
};

/**
 * Calculate baseline health score (rule-based)
 */
const calculateBaselineScore = (bmi, activityLevel, medicalHistory) => {
    let score = 70; // Start at 70

    // BMI factor
    if (bmi >= 18.5 && bmi < 25) score += 15;
    else if (bmi >= 25 && bmi < 30) score -= 5;
    else if (bmi >= 30) score -= 15;
    else score -= 10; // Underweight

    // Activity factor
    const activityBonus = { sedentary: -10, light: 0, moderate: 10, active: 15 };
    score += activityBonus[activityLevel] || 0;

    // Medical history penalty
    if (medicalHistory && medicalHistory.length > 0) {
        score -= medicalHistory.length * 3;
    }

    return Math.max(0, Math.min(100, score));
};

/**
 * Setup patient profile
 * POST /api/patient/profile
 */
const setupProfile = async (req, res) => {
    try {
        const { age, gender, height, weight, medicalHistory, currentMedications, activityLevel, goal, avatarBodyType } = req.body;

        if (!age || !gender || !height || !weight) {
            return res.status(400).json({ error: 'Age, gender, height, and weight are required.' });
        }

        const heightM = height / 100;
        const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
        let bmiCategory;
        if (bmi < 18.5) bmiCategory = 'Underweight';
        else if (bmi < 25) bmiCategory = 'Normal';
        else if (bmi < 30) bmiCategory = 'Overweight';
        else bmiCategory = 'Obese';

        const tdee = calculateTDEE(weight, height, age, gender, activityLevel || 'sedentary');
        const baselineHealthScore = calculateBaselineScore(bmi, activityLevel, medicalHistory);

        const profile = await PatientProfile.findOneAndUpdate(
            { userId: req.user.id },
            {
                age, gender, height, weight, bmi, bmiCategory, tdee,
                medicalHistory: medicalHistory || [],
                currentMedications: currentMedications || [],
                activityLevel: activityLevel || 'sedentary',
                goal: goal || 'maintain',
                baselineHealthScore,
                avatarBodyType: avatarBodyType || 'lean'
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({
            message: 'Profile setup complete',
            profile,
            computed: { bmi, bmiCategory, tdee, baselineHealthScore }
        });
    } catch (error) {
        console.error('Setup profile error:', error);
        res.status(500).json({ error: 'Server error setting up profile.' });
    }
};

/**
 * Submit daily health log
 * POST /api/patient/log
 */
const submitDailyLog = async (req, res) => {
    try {
        const { foodText, steps, workoutType, workoutDuration, sleepHours, sleepQuality, waterGlasses } = req.body;

        const profile = await PatientProfile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(400).json({ error: 'Please set up your profile first.' });
        }

        // Parse food via AI service
        let foodData = { items: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 } };
        if (foodText) {
            try {
                const aiResponse = await axios.post(`${AI_SERVICE_URL}/parse-food`, { text: foodText });
                foodData = aiResponse.data;
            } catch (aiErr) {
                console.error('AI food parse error, using fallback:', aiErr.message);
                // Fallback estimation
                foodData.totals = { calories: 500, protein: 20, carbs: 60, fats: 15, fiber: 5 };
            }
        }

        // Calculate health score
        const tdee = profile.tdee || 2000;
        const stepsVal = steps || 0;
        const workoutDur = workoutDuration || 0;
        const waterVal = waterGlasses || 0;
        const sleepVal = sleepHours || 0;

        // Diet score (35%): Compare calories to TDEE goal
        let dietScore = 0;
        const calorieDiff = Math.abs(foodData.totals.calories - tdee);
        if (calorieDiff < 100) dietScore = 35;
        else if (calorieDiff < 300) dietScore = 28;
        else if (calorieDiff < 500) dietScore = 20;
        else dietScore = 10;

        // Activity score (30%): Steps + Workout
        let activityScore = 0;
        const stepsScore = Math.min(stepsVal / 10000, 1) * 15;
        const workoutScore = Math.min(workoutDur / 60, 1) * 15;
        activityScore = Math.round(stepsScore + workoutScore);

        // Hydration score (25%): Water glasses vs 8 target
        const hydrationScore = Math.round(Math.min(waterVal / 8, 1) * 25);

        // Sleep score (10%)
        let sleepScore = 0;
        if (sleepVal >= 7 && sleepVal <= 9) sleepScore = 10;
        else if (sleepVal >= 6) sleepScore = 7;
        else if (sleepVal >= 5) sleepScore = 4;
        else sleepScore = 2;

        const healthScore = Math.min(100, dietScore + activityScore + hydrationScore + sleepScore);

        // Generate feedback messages
        const feedbackMessages = [];
        if (stepsVal < 5000) feedbackMessages.push(`Low activity - only ${stepsVal.toLocaleString()} steps today. Aim for 10,000!`);
        if (waterVal < 6) feedbackMessages.push(`Drink more water! Only ${waterVal} glasses today. Target is 8.`);
        if (sleepVal < 6) feedbackMessages.push(`You slept only ${sleepVal} hours. Try to get 7-9 hours.`);
        if (foodData.totals.calories > tdee + 300) feedbackMessages.push(`Calorie surplus of ${Math.round(foodData.totals.calories - tdee)} kcal. Watch your intake!`);
        if (foodData.totals.calories < tdee - 500) feedbackMessages.push(`Calorie deficit is high. Make sure you're eating enough.`);
        if (healthScore >= 80) feedbackMessages.push(`Great job! Your health score is ${healthScore}. Keep it up!`);

        // Check chronic conditions for adherence
        const isChronicPatient = profile.medicalHistory && profile.medicalHistory.length > 0;
        let adherenceScore = 0;
        if (isChronicPatient) {
            adherenceScore = healthScore; // Simplified adherence tracking
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const log = await HealthLog.findOneAndUpdate(
            { patientId: req.user.id, date: today },
            {
                patientId: req.user.id,
                date: today,
                foodLogs: foodData.items.map(item => ({
                    rawText: item.name || item.rawText,
                    calories: item.calories || 0,
                    protein: item.protein || 0,
                    carbs: item.carbs || 0,
                    fats: item.fats || 0,
                    fiber: item.fiber || 0
                })),
                totalCalories: foodData.totals.calories,
                totalProtein: foodData.totals.protein,
                totalCarbs: foodData.totals.carbs,
                totalFats: foodData.totals.fats,
                steps: stepsVal,
                workoutType: workoutType || 'none',
                workoutDuration: workoutDur,
                sleepHours: sleepVal,
                sleepQuality: sleepQuality || 'fair',
                waterGlasses: waterVal,
                healthScore,
                scoreBreakdown: {
                    diet: dietScore,
                    activity: activityScore,
                    sleep: sleepScore,
                    hydration: hydrationScore
                },
                feedbackMessages,
                isChronicPatient,
                adherenceScore
            },
            { new: true, upsert: true }
        );

        // Auto-alert on low adherence for chronic patients
        if (isChronicPatient && adherenceScore < 30) {
            const doctorProfile = await DoctorProfile.findOne({ patients: req.user.id });
            if (doctorProfile) {
                await EmergencyAlert.create({
                    patientId: req.user.id,
                    doctorId: doctorProfile.userId,
                    triggerType: 'auto',
                    message: `Patient ${req.user.name} has a critically low adherence score of ${adherenceScore}. Chronic conditions: ${profile.medicalHistory.join(', ')}`
                });
            }
        }

        res.json({
            message: 'Daily log submitted successfully',
            log,
            healthScore,
            scoreBreakdown: { diet: dietScore, activity: activityScore, sleep: sleepScore, hydration: hydrationScore },
            feedbackMessages
        });
    } catch (error) {
        console.error('Submit daily log error:', error);
        res.status(500).json({ error: 'Server error submitting log.' });
    }
};

/**
 * Get health logs with optional date range
 * GET /api/patient/logs?from=...&to=...
 */
const getLogs = async (req, res) => {
    try {
        const { from, to } = req.query;
        const query = { patientId: req.user.id };

        if (from || to) {
            query.date = {};
            if (from) query.date.$gte = new Date(from);
            if (to) query.date.$lte = new Date(to);
        }

        const logs = await HealthLog.find(query).sort({ date: -1 }).limit(90);
        res.json({ logs });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Server error fetching logs.' });
    }
};

/**
 * Get simulation / digital twin predictions
 * GET /api/patient/simulation
 */
const getSimulation = async (req, res) => {
    try {
        const profile = await PatientProfile.findOne({ userId: req.user.id });
        if (!profile) return res.status(400).json({ error: 'Profile not set up.' });

        // Fetch last 30 days of logs
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logs = await HealthLog.find({
            patientId: req.user.id,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: -1 });

        // Calculate averages
        const avgCalories = logs.length > 0 ? logs.reduce((sum, log) => sum + log.totalCalories, 0) / logs.length : profile.tdee;
        const avgSteps = logs.length > 0 ? logs.reduce((sum, log) => sum + log.steps, 0) / logs.length : 3000;

        // Call AI simulation service
        let predictions;
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/simulate`, {
                currentWeight: profile.weight,
                age: profile.age,
                gender: profile.gender,
                tdee: profile.tdee,
                avgCalories: Math.round(avgCalories),
                avgSteps: Math.round(avgSteps),
                medicalHistory: profile.medicalHistory,
                bmi: profile.bmi
            });
            predictions = aiResponse.data.predictions;
        } catch (aiErr) {
            console.error('AI simulation error, using fallback:', aiErr.message);
            // Fallback rule-based predictions
            const dailyDeficit = profile.tdee - avgCalories;
            const weeklyWeightChange = (dailyDeficit * 7) / 7700;

            const predict = (days) => {
                const weightChange = weeklyWeightChange * (days / 7);
                const newWeight = parseFloat((profile.weight + weightChange).toFixed(1));
                const heightM = profile.height / 100;
                const newBmi = parseFloat((newWeight / (heightM * heightM)).toFixed(1));
                return {
                    weight: newWeight,
                    bmi: newBmi,
                    obesityRisk: Math.min(100, Math.max(0, (newBmi - 25) * 10)),
                    diabetesRisk: Math.min(100, Math.max(0, (newBmi - 23) * 5 + (avgSteps < 5000 ? 15 : 0))),
                    cardiovascularRisk: Math.min(100, Math.max(0, (profile.age - 30) * 2 + (newBmi - 25) * 3))
                };
            };

            predictions = {
                days30: predict(30),
                days60: predict(60),
                days90: predict(90)
            };
        }

        const simulation = await SimulationResult.findOneAndUpdate(
            { patientId: req.user.id, scenario: req.query.scenario || 'current_trajectory' },
            {
                patientId: req.user.id,
                currentWeight: profile.weight,
                currentBmi: profile.bmi,
                predictions,
                generatedAt: new Date(),
                scenario: req.query.scenario || 'current_trajectory'
            },
            { new: true, upsert: true }
        );

        res.json({ simulation, logsUsed: logs.length });
    } catch (error) {
        console.error('Get simulation error:', error);
        res.status(500).json({ error: 'Server error running simulation.' });
    }
};

/**
 * Trigger emergency alert
 * POST /api/patient/emergency
 */
const triggerEmergency = async (req, res) => {
    try {
        const { message, doctorId } = req.body;

        const alert = await EmergencyAlert.create({
            patientId: req.user.id,
            doctorId: doctorId || null,
            triggerType: 'manual',
            message: message || 'Emergency triggered by patient'
        });

        // Socket emission handled by the route or socketService
        const io = req.app.get('io');
        if (io && doctorId) {
            io.to(`user_${doctorId}`).emit('emergency-alert', {
                alertId: alert._id,
                patientName: req.user.name,
                message: alert.message,
                triggeredAt: alert.triggeredAt
            });
        }

        res.status(201).json({ message: 'Emergency alert triggered', alert });
    } catch (error) {
        console.error('Trigger emergency error:', error);
        res.status(500).json({ error: 'Server error triggering emergency.' });
    }
};

/**
 * Book appointment with a doctor
 * POST /api/patient/appointment
 */
const bookAppointment = async (req, res) => {
    try {
        const { doctorId, dateTime, mode, symptom, notes } = req.body;

        if (!doctorId || !dateTime || !mode) {
            return res.status(400).json({ error: 'Doctor, dateTime, and mode are required.' });
        }

        const appointment = await Appointment.create({
            patientId: req.user.id,
            doctorId,
            dateTime: new Date(dateTime),
            mode,
            symptom,
            notes
        });

        // Add patient to doctor's list if not already there
        await DoctorProfile.findOneAndUpdate(
            { userId: doctorId },
            { $addToSet: { patients: req.user.id } }
        );

        // Socket notification
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${doctorId}`).emit('new-appointment', {
                appointmentId: appointment._id,
                patientName: req.user.name,
                dateTime: appointment.dateTime,
                mode: appointment.mode,
                symptom: appointment.symptom
            });
        }

        res.status(201).json({ message: 'Appointment booked', appointment });
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ error: 'Server error booking appointment.' });
    }
};

/**
 * Search doctors by specialization
 * GET /api/patient/doctors?specialization=...
 */
const searchDoctors = async (req, res) => {
    try {
        const { specialization } = req.query;
        const query = {};
        if (specialization) {
            query.specializations = { $regex: specialization, $options: 'i' };
        }

        const doctors = await DoctorProfile.find(query)
            .populate('userId', 'name email')
            .limit(20);

        res.json({ doctors });
    } catch (error) {
        console.error('Search doctors error:', error);
        res.status(500).json({ error: 'Server error searching doctors.' });
    }
};

module.exports = { setupProfile, submitDailyLog, getLogs, getSimulation, triggerEmergency, bookAppointment, searchDoctors };
