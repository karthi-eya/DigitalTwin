const express = require('express');
const router = express.Router();
const { registerPatient, registerDoctor, login, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register/patient', registerPatient);
router.post('/register/doctor', registerDoctor);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;
