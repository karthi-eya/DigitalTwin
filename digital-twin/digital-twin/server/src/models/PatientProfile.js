const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    age: { type: Number, required: true, min: 1, max: 150 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    height: { type: Number, required: true, min: 50, max: 300 }, // cm
    weight: { type: Number, required: true, min: 10, max: 500 }, // kg
    bmi: { type: Number },
    bmiCategory: { type: String, enum: ['Underweight', 'Normal', 'Overweight', 'Obese'] },
    tdee: { type: Number }, // Total Daily Energy Expenditure
    medicalHistory: [{ type: String }],
    currentMedications: [{ type: String }],
    activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active'],
        default: 'sedentary'
    },
    goal: {
        type: String,
        enum: ['lose_weight', 'gain_muscle', 'maintain', 'improve_stamina'],
        default: 'maintain'
    },
    baselineHealthScore: { type: Number, default: 50 },
    avatarBodyType: {
        type: String,
        enum: ['skinny', 'lean', 'athletic', 'skinny-fat', 'overweight', 'obese'],
        default: 'lean'
    },
    skinTone: { type: Number, default: 0, min: 0, max: 4 }
}, {
    timestamps: true
});

// Calculate BMI before saving
patientProfileSchema.pre('save', function(next) {
    if (this.isModified('height') || this.isModified('weight')) {
        const heightM = this.height / 100;
        this.bmi = parseFloat((this.weight / (heightM * heightM)).toFixed(1));

        if (this.bmi < 18.5) this.bmiCategory = 'Underweight';
        else if (this.bmi < 25) this.bmiCategory = 'Normal';
        else if (this.bmi < 30) this.bmiCategory = 'Overweight';
        else this.bmiCategory = 'Obese';
    }
    next();
});

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
