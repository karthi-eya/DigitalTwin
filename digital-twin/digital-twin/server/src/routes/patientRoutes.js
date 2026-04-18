const express = require('express');
const router = express.Router();
const { auth, requirePatient } = require('../middleware/auth');
const {
    setupProfile, submitDailyLog, getLogs, getSimulation,
    triggerEmergency, bookAppointment, searchDoctors
} = require('../controllers/patientController');

router.use(auth, requirePatient);

router.post('/profile', setupProfile);
router.post('/log', submitDailyLog);
router.get('/logs', getLogs);
router.get('/simulation', getSimulation);
router.post('/emergency', triggerEmergency);
router.post('/appointment', bookAppointment);
router.get('/doctors', searchDoctors);

module.exports = router;
