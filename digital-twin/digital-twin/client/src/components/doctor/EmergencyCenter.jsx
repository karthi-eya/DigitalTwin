import React from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EmergencyCenter = ({ emergencies = [], onRefresh }) => {
    const resolve = async (id) => {
        try {
            await api.put(`/doctor/emergency/${id}/resolve`);
            toast.success('Emergency resolved');
            onRefresh();
        } catch { toast.error('Failed to resolve'); }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">🚨 Emergency Center</h2>
            {emergencies.length === 0 ? (
                <div className="text-center py-16">
                    <span className="text-6xl mb-4 block">✅</span>
                    <p className="text-gray-400 text-lg">No active emergencies</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {emergencies.map((alert, i) => (
                        <motion.div key={alert._id || i}
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/5 border-2 border-red-500/30 rounded-xl p-5 animate-pulse-subtle">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                        <span className="text-red-400 font-bold text-lg">EMERGENCY</span>
                                    </div>
                                    <p className="text-white font-medium">{alert.patientId?.name || 'Patient'}</p>
                                    <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
                                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                        <span>Trigger: {alert.triggerType}</span>
                                        <span>Time: {new Date(alert.triggeredAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button onClick={() => resolve(alert._id)}
                                    className="px-5 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition font-medium">
                                    Resolve
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmergencyCenter;
