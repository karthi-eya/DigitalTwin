const { sendToUser, sendToDoctor, broadcastLogReminders } = require('../services/socketService');

/**
 * Helper to send a notification to a specific user
 */
const notifyUser = (io, userId, event, data) => {
    sendToUser(io, userId, event, data);
};

/**
 * Helper to send a notification to a doctor
 */
const notifyDoctor = (io, doctorId, event, data) => {
    sendToDoctor(io, doctorId, event, data);
};

/**
 * Helper to broadcast log reminders
 */
const sendLogReminders = (io, patientIds) => {
    broadcastLogReminders(io, patientIds);
};

module.exports = { notifyUser, notifyDoctor, sendLogReminders };
