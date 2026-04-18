const socketIO = require('socket.io');

// Map of userId → socketId for targeted emissions
const userSocketMap = new Map();

/**
 * Initialize Socket.io on the Express server
 */
const initializeSocket = (server) => {
    const io = socketIO(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Client registers with their userId
        socket.on('register', (userId) => {
            userSocketMap.set(userId, socket.id);
            socket.join(`user_${userId}`);
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            // Remove from map
            for (const [userId, socketId] of userSocketMap.entries()) {
                if (socketId === socket.id) {
                    userSocketMap.delete(userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    return io;
};

/**
 * Send event to a specific user
 */
const sendToUser = (io, userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
};

/**
 * Send event to a doctor
 */
const sendToDoctor = (io, doctorId, event, data) => {
    io.to(`user_${doctorId}`).emit(event, data);
};

/**
 * Broadcast log reminders to patients who haven't logged today
 */
const broadcastLogReminders = (io, patientIds) => {
    patientIds.forEach(patientId => {
        io.to(`user_${patientId}`).emit('log-reminder', {
            message: "Don't forget to log your health data today!",
            timestamp: new Date()
        });
    });
};

module.exports = { initializeSocket, sendToUser, sendToDoctor, broadcastLogReminders, userSocketMap };
