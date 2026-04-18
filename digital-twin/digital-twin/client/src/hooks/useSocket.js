import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const useSocket = (userId) => {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!userId) return;

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket connected');
            socket.emit('register', userId);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        // Listen for events
        socket.on('emergency-alert', (data) => {
            toast.error(`EMERGENCY: ${data.patientName} - ${data.message}`, { duration: 10000 });
        });

        socket.on('new-appointment', (data) => {
            toast.success(`New appointment from ${data.patientName}`, { duration: 5000 });
        });

        socket.on('doctor-recommendation', (data) => {
            toast(`Dr. ${data.doctorName}: ${data.recommendation}`, {
                icon: '💊',
                duration: 6000
            });
        });

        socket.on('log-reminder', (data) => {
            toast(data.message, { icon: '📝', duration: 8000 });
        });

        socket.on('connect_error', () => {
            console.log('Socket connection error');
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);

    const emit = useCallback((event, data) => {
        if (socketRef.current) {
            socketRef.current.emit(event, data);
        }
    }, []);

    return { socket: socketRef.current, emit };
};

export default useSocket;
