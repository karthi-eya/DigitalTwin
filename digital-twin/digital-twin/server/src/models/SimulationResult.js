const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    weight: { type: Number },
    bmi: { type: Number },
    obesityRisk: { type: Number, min: 0, max: 100 },
    diabetesRisk: { type: Number, min: 0, max: 100 },
    cardiovascularRisk: { type: Number, min: 0, max: 100 }
}, { _id: false });

const simulationResultSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    generatedAt: { type: Date, default: Date.now },
    currentWeight: { type: Number },
    currentBmi: { type: Number },
    predictions: {
        days30: predictionSchema,
        days60: predictionSchema,
        days90: predictionSchema
    },
    scenario: { type: String, default: 'current_trajectory' }
}, {
    timestamps: true
});

simulationResultSchema.index({ patientId: 1, generatedAt: -1 });

module.exports = mongoose.model('SimulationResult', simulationResultSchema);
