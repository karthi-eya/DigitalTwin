const HealthLog = require('../models/HealthLog');
const User = require('../models/User');

/**
 * Cron service for scheduled tasks
 * - Daily 8 PM: Find patients who haven't submitted today's log → emit reminders
 * - Daily midnight: Run health score calculation for missed logs
 */

let cronInterval = null;

const startCronJobs = (io) => {
    // Check every hour
    cronInterval = setInterval(async () => {
        const now = new Date();
        const hour = now.getHours();

        // 8 PM reminder
        if (hour === 20) {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Find all patients
                const patients = await User.find({ role: 'patient' });
                const patientIdsWithLogs = await HealthLog.distinct('patientId', { date: { $gte: today } });
                const patientIdsWithLogsStr = patientIdsWithLogs.map(id => id.toString());

                const missingPatients = patients.filter(p => !patientIdsWithLogsStr.includes(p._id.toString()));

                missingPatients.forEach(patient => {
                    io.to(`user_${patient._id}`).emit('log-reminder', {
                        message: "You haven't logged your health data today. Log now to keep your streak!",
                        timestamp: new Date()
                    });
                });

                console.log(`[CRON] Sent log reminders to ${missingPatients.length} patients`);
            } catch (error) {
                console.error('[CRON] Log reminder error:', error);
            }
        }

        // Midnight: process missed logs
        if (hour === 0) {
            try {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);

                const patients = await User.find({ role: 'patient' });
                const loggedPatientIds = await HealthLog.distinct('patientId', { date: yesterday });
                const loggedStr = loggedPatientIds.map(id => id.toString());

                const missed = patients.filter(p => !loggedStr.includes(p._id.toString()));

                // Create empty logs with score 0 for missed days
                for (const patient of missed) {
                    await HealthLog.create({
                        patientId: patient._id,
                        date: yesterday,
                        healthScore: 0,
                        feedbackMessages: ['No log submitted for this day'],
                        scoreBreakdown: { diet: 0, activity: 0, sleep: 0, hydration: 0 }
                    });
                }

                console.log(`[CRON] Processed ${missed.length} missed logs for yesterday`);
            } catch (error) {
                console.error('[CRON] Midnight cron error:', error);
            }
        }
    }, 3600000); // Every hour

    console.log('[CRON] Cron jobs started');
};

const stopCronJobs = () => {
    if (cronInterval) clearInterval(cronInterval);
};

module.exports = { startCronJobs, stopCronJobs };
