const mongoose = require('mongoose');

const appointmentSlotSchema = new mongoose.Schema({
    day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    startTime: { type: String },
    endTime: { type: String }
}, { _id: false });

const doctorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    specializations: [{ type: String }],
    consultationType: {
        type: String,
        enum: ['online', 'offline', 'both'],
        default: 'both'
    },
    clinicName: { type: String },
    clinicAddress: { type: String },
    clinicTimings: { type: String },
    onlineLink: { type: String },
    appointmentSlots: [appointmentSlotSchema],
    appointmentDuration: { type: Number, default: 30 }, // minutes
    licenseNumber: { type: String },
    isVerified: { type: Boolean, default: false },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },
    patients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Geospatial index for doctor search
doctorProfileSchema.index({ location: '2dsphere' });
doctorProfileSchema.index({ specializations: 1 });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
