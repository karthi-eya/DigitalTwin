const mongoose = require('mongoose');

const monitoringLogSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: { type: Date, default: Date.now },
    patientEntry: { type: String },
    doctorRecommendation: { type: String }
}, {
    timestamps: true
});

monitoringLogSchema.index({ patientId: 1, doctorId: 1, date: -1 });

module.exports = mongoose.model('MonitoringLog', monitoringLogSchema);
