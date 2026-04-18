const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const HealthLog = require('../models/HealthLog');
const Appointment = require('../models/Appointment');
const MonitoringLog = require('../models/MonitoringLog');
const EmergencyAlert = require('../models/EmergencyAlert');
const User = require('../models/User');
const { generatePatientReport } = require('../services/pdfExportService');

/**
 * Setup doctor profile
 * POST /api/doctor/profile
 */
const setupProfile = async (req, res) => {
    try {
        const { specializations, consultationType, clinicName, clinicAddress, clinicTimings, onlineLink, appointmentSlots, appointmentDuration, licenseNumber, coordinates } = req.body;

        const profile = await DoctorProfile.findOneAndUpdate(
            { userId: req.user.id },
            {
                specializations: specializations || [],
                consultationType: consultationType || 'both',
                clinicName, clinicAddress, clinicTimings, onlineLink,
                appointmentSlots: appointmentSlots || [],
                appointmentDuration: appointmentDuration || 30,
                licenseNumber,
                location: coordinates ? { type: 'Point', coordinates } : undefined
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({ message: 'Doctor profile updated', profile });
    } catch (error) {
        console.error('Doctor setup profile error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * Get all patients assigned to this doctor
 * GET /api/doctor/patients
 */
const getPatients = async (req, res) => {
    try {
        const doctorProfile = await DoctorProfile.findOne({ userId: req.user.id });
        if (!doctorProfile) return res.status(404).json({ error: 'Doctor profile not found.' });

        // Get all patients who have appointments with this doctor
        const appointmentPatientIds = await Appointment.distinct('patientId', { doctorId: req.user.id });
        const monitoredPatientIds = doctorProfile.patients || [];
        const allPatientIds = [...new Set([...appointmentPatientIds.map(id => id.toString()), ...monitoredPatientIds.map(id => id.toString())])];

        const patients = [];
        for (const patientId of allPatientIds) {
            const user = await User.findById(patientId);
            if (!user) continue;

            const profile = await PatientProfile.findOne({ userId: patientId });
            const latestLog = await HealthLog.findOne({ patientId }).sort({ date: -1 });

            let status = 'stable';
            if (latestLog) {
                if (latestLog.healthScore < 40) status = 'emergency';
                else if (latestLog.healthScore < 60) status = 'at_risk';
            }

            patients.push({
                id: patientId,
                name: user.name,
                email: user.email,
                age: profile?.age,
                gender: profile?.gender,
                bmi: profile?.bmi,
                bmiCategory: profile?.bmiCategory,
                lastScore: latestLog?.healthScore || null,
                lastLogDate: latestLog?.date || null,
                status,
                medicalHistory: profile?.medicalHistory || []
            });
        }

        res.json({ patients });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * Get appointments for this doctor
 * GET /api/doctor/appointments?status=...&from=...&to=...
 */
const getAppointments = async (req, res) => {
    try {
        const { status, from, to } = req.query;
        const query = { doctorId: req.user.id };

        if (status) query.status = status;
        if (from || to) {
            query.dateTime = {};
            if (from) query.dateTime.$gte = new Date(from);
            if (to) query.dateTime.$lte = new Date(to);
        }

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name email')
            .sort({ dateTime: 1 });

        res.json({ appointments });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * Update appointment status
 * PUT /api/doctor/appointment/:id
 */
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, doctorId: req.user.id },
            { status, notes },
            { new: true }
        );
        if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });
        res.json({ message: 'Appointment updated', appointment });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * Get a specific patient's logs with trend data and insights
 * GET /api/doctor/patient/:patientId/logs
 */
const getPatientLogs = async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await User.findById(patientId);
        if (!patient) return res.status(404).json({ error: 'Patient not found.' });

        const profile = await PatientProfile.findOne({ userId: patientId });

        // Last 30 days of logs
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const logs = await HealthLog.find({ patientId, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 });

        // 7-day trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentLogs = logs.filter(l => new Date(l.date) >= sevenDaysAgo);
        const olderLogs = logs.filter(l => new Date(l.date) < sevenDaysAgo && new Date(l.date) >= new Date(Date.now() - 14 * 86400000));

        // Generate insights
        const insights = [];
        if (recentLogs.length > 0 && olderLogs.length > 0) {
            const recentAvgSteps = recentLogs.reduce((s, l) => s + l.steps, 0) / recentLogs.length;
            const olderAvgSteps = olderLogs.reduce((s, l) => s + l.steps, 0) / olderLogs.length;
            const stepChange = ((recentAvgSteps - olderAvgSteps) / olderAvgSteps * 100).toFixed(0);
            if (Math.abs(stepChange) > 10) {
                insights.push(`Activity ${stepChange > 0 ? 'increased' : 'dropped'} ${Math.abs(stepChange)}% this week vs last week`);
            }

            const recentAvgCal = recentLogs.reduce((s, l) => s + l.totalCalories, 0) / recentLogs.length;
            const olderAvgCal = olderLogs.reduce((s, l) => s + l.totalCalories, 0) / olderLogs.length;
            if (recentAvgCal > olderAvgCal + 200) {
                insights.push(`Calorie surplus trend detected: avg ${Math.round(recentAvgCal)} kcal/day (up from ${Math.round(olderAvgCal)})`);
            }
        }

        // Check for missing logs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastLog = logs[0];
        if (lastLog) {
            const daysSinceLastLog = Math.floor((today - new Date(lastLog.date)) / 86400000);
            if (daysSinceLastLog > 1) {
                insights.push(`No log submitted for ${daysSinceLastLog} days`);
            }
        }

        res.json({
            patient: { name: patient.name, email: patient.email },
            profile,
            logs,
            insights,
            trends: {
                sevenDay: recentLogs,
                thirtyDay: logs
            }
        });
    } catch (error) {
        console.error('Get patient logs error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * Add doctor recommendation for a patient
 * POST /api/doctor/recommendation
 */
const addRecommendation = async (req, res) => {
    try {
        const { patientId, recommendation } = req.body;
        if (!patientId || !recommendation) {
            return res.status(400).json({ error: 'Patient ID and recommendation are required.' });
        }

        const log = await MonitoringLog.create({
            patientId,
            doctorId: req.user.id,
            doctorRecommendation: recommendation
        });

        // Socket notification
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${patientId}`).emit('doctor-recommendation', {
                doctorName: req.user.name,
                recommendation,
                date: log.date
            });
        }

        res.status(201).json({ message: 'Recommendation added', log });
    } catch (error) {
        console.error('Add recommendation error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * Assign a patient to doctor's monitoring list
 * POST /api/doctor/monitor
 */
const assignMonitoring = async (req, res) => {
    try {
        const { patientId } = req.body;
        const profile = await DoctorProfile.findOneAndUpdate(
            { userId: req.user.id },
            { $addToSet: { patients: patientId } },
            { new: true }
        );
        res.json({ message: 'Patient added to monitoring list', profile });
    } catch (error) {
        console.error('Assign monitoring error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * Export patient PDF report
 * GET /api/doctor/patient/:patientId/export
 */
const exportPatientPDF = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { period } = req.query; // 'weekly' or 'monthly'

        const patient = await User.findById(patientId);
        const profile = await PatientProfile.findOne({ userId: patientId });

        const daysBack = period === 'weekly' ? 7 : 30;
        const since = new Date();
        since.setDate(since.getDate() - daysBack);

        const logs = await HealthLog.find({ patientId, date: { $gte: since } }).sort({ date: 1 });
        const recommendations = await MonitoringLog.find({ patientId, doctorId: req.user.id }).sort({ date: -1 }).limit(10);

        const pdfBuffer = await generatePatientReport(
            { ...patient.toObject(), ...profile?.toObject() },
            logs,
            recommendations,
            period || 'monthly'
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=patient_report_${patientId}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Export PDF error:', error);
        res.status(500).json({ error: 'Server error generating PDF.' });
    }
};

/**
 * Get active emergency alerts
 * GET /api/doctor/emergencies
 */
const getEmergencyAlerts = async (req, res) => {
    try {
        const alerts = await EmergencyAlert.find({ doctorId: req.user.id, status: 'active' })
            .populate('patientId', 'name email')
            .sort({ triggeredAt: -1 });
        res.json({ alerts });
    } catch (error) {
        console.error('Get emergencies error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
};

/**
 * Resolve an emergency alert
 * PUT /api/doctor/emergency/:id/resolve
 */
const resolveEmergency = async (req, res) => {
    try {
        const alert = await EmergencyAlert.findOneAndUpdate(
            { _id: req.params.id, doctorId: req.user.id },
            { status: 'resolved', resolvedAt: new Date() },
            { new: true }
        );
        if (!alert) return res.status(404).json({ error: 'Alert not found.' });
        res.json({ message: 'Emergency resolved', alert });
    } catch (error) {
        console.error('Resolve emergency error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
};

module.exports = {
    setupProfile, getPatients, getAppointments, updateAppointmentStatus,
    getPatientLogs, addRecommendation, assignMonitoring, exportPatientPDF,
    getEmergencyAlerts, resolveEmergency
};
