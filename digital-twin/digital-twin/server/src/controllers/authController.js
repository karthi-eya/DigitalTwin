const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new patient
 * POST /api/auth/register/patient
 */
const registerPatient = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        const user = await User.create({ name, email, password, role: 'patient' });

        // Create stub patient profile
        await PatientProfile.create({
            userId: user._id,
            age: 25,
            gender: 'other',
            height: 170,
            weight: 70
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: 'Patient registered successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Register patient error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

/**
 * Register a new doctor
 * POST /api/auth/register/doctor
 */
const registerDoctor = async (req, res) => {
    try {
        const { name, email, password, specialization, consultationType } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        const user = await User.create({ name, email, password, role: 'doctor' });

        await DoctorProfile.create({
            userId: user._id,
            specializations: specialization ? [specialization] : [],
            consultationType: consultationType || 'both'
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: 'Doctor registered successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Register doctor error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

/**
 * Login user (patient or doctor)
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = generateToken(user._id, user.role);

        // Check if profile is set up
        let isProfileSetup = false;
        if (user.role === 'patient') {
            const profile = await PatientProfile.findOne({ userId: user._id });
            isProfileSetup = profile && profile.age && profile.height && profile.weight;
        } else {
            const profile = await DoctorProfile.findOne({ userId: user._id });
            isProfileSetup = profile && profile.specializations && profile.specializations.length > 0;
        }

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            isProfileSetup
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        let profile = null;
        if (user.role === 'patient') {
            profile = await PatientProfile.findOne({ userId: user._id });
        } else {
            profile = await DoctorProfile.findOne({ userId: user._id });
        }

        res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, profile });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
};

module.exports = { registerPatient, registerDoctor, login, getMe };
