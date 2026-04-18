const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'digital-twin-secret-key';
const JWT_EXPIRY = '7d';

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user's MongoDB _id
 * @param {string} role - 'patient' or 'doctor'
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token string
 * @returns {object} Decoded payload { userId, role }
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
