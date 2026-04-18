const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    triggeredAt: { type: Date, default: Date.now },
    triggerType: {
        type: String,
        enum: ['manual', 'auto'],
        default: 'manual'
    },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    },
    resolvedAt: { type: Date }
}, {
    timestamps: true
});

emergencyAlertSchema.index({ doctorId: 1, status: 1 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
