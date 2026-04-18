const express = require('express');
const router = express.Router();
const { auth, requireDoctor } = require('../middleware/auth');
const {
    setupProfile, getPatients, getAppointments, updateAppointmentStatus,
    getPatientLogs, addRecommendation, assignMonitoring, exportPatientPDF,
    getEmergencyAlerts, resolveEmergency
} = require('../controllers/doctorController');

router.use(auth, requireDoctor);

router.post('/profile', setupProfile);
router.get('/patients', getPatients);
router.get('/appointments', getAppointments);
router.put('/appointment/:id', updateAppointmentStatus);
router.get('/patient/:patientId/logs', getPatientLogs);
router.post('/recommendation', addRecommendation);
router.post('/monitor', assignMonitoring);
router.get('/patient/:patientId/export', exportPatientPDF);
router.get('/emergencies', getEmergencyAlerts);
router.put('/emergency/:id/resolve', resolveEmergency);

module.exports = router;
