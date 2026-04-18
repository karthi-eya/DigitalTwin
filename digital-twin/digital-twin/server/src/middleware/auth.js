const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * JWT verification middleware
 * Extracts token from Authorization header, verifies it,
 * and attaches user to req.user
 */
const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        req.user = { id: user._id, role: user.role, name: user.name, email: user.email };
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

/**
 * Role-based access: Patient only
 */
const requirePatient = (req, res, next) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ error: 'Access denied. Patients only.' });
    }
    next();
};

/**
 * Role-based access: Doctor only
 */
const requireDoctor = (req, res, next) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }
    next();
};

module.exports = { auth, requirePatient, requireDoctor };
