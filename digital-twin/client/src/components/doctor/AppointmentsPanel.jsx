import React from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AppointmentsPanel = ({ appointments = [], onRefresh }) => {
    const handleAction = async (id, status) => {
        try {
            await api.put(`/doctor/appointment/${id}`, { status });
            toast.success(`Appointment ${status}`);
            onRefresh();
        } catch { toast.error('Action failed'); }
    };

    const modeColors = { online: 'bg-blue-500/10 text-blue-400', offline: 'bg-green-500/10 text-green-400' };
    const statusColors = { pending: 'text-yellow-400', confirmed: 'text-green-400', cancelled: 'text-red-400', completed: 'text-gray-400' };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">📅 Appointments</h2>
            {appointments.length === 0 ? (
                <div className="text-center text-gray-500 py-16">No appointments yet</div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((apt, i) => (
                        <motion.div key={apt._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">{apt.patientId?.name || 'Patient'}</p>
                                <div className="flex items-center gap-3 mt-1 text-sm">
                                    <span className="text-gray-400">{new Date(apt.dateTime).toLocaleString()}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${modeColors[apt.mode] || ''}`}>{apt.mode}</span>
                                    <span className={`capitalize ${statusColors[apt.status] || 'text-gray-400'}`}>{apt.status}</span>
                                </div>
                                {apt.symptom && <p className="text-gray-500 text-sm mt-1">Symptom: {apt.symptom}</p>}
                            </div>
                            {apt.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleAction(apt._id, 'confirmed')}
                                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition">Accept</button>
                                    <button onClick={() => handleAction(apt._id, 'cancelled')}
                                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition">Decline</button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppointmentsPanel;
