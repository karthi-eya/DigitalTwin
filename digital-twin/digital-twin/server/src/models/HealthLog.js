const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema({
    rawText: { type: String },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 }
});

const healthLogSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: () => new Date().setHours(0,0,0,0)
    },
    foodLogs: [foodLogSchema],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFats: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    workoutType: { 
        type: String, 
        enum: ['none', 'cardio', 'strength', 'yoga', 'sports'],
        default: 'none'
    },
    workoutDuration: { type: Number, default: 0 }, // minutes
    sleepHours: { type: Number, default: 0, min: 0, max: 24 },
    sleepQuality: { type: String, enum: ['good', 'fair', 'poor'], default: 'fair' },
    waterGlasses: { type: Number, default: 0, min: 0, max: 20 },
    healthScore: { type: Number, default: 0, min: 0, max: 100 },
    scoreBreakdown: {
        diet: { type: Number, default: 0 },
        activity: { type: Number, default: 0 },
        sleep: { type: Number, default: 0 },
        hydration: { type: Number, default: 0 }
    },
    feedbackMessages: [{ type: String }],
    isChronicPatient: { type: Boolean, default: false },
    adherenceScore: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Compound index for efficient queries
healthLogSchema.index({ patientId: 1, date: -1 });
healthLogSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('HealthLog', healthLogSchema);
