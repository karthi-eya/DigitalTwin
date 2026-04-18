import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PatientList = ({ patients = [], selectedId, onSelect }) => {
    const [search, setSearch] = useState('');
    const filtered = patients.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

    const statusColors = { stable: 'bg-green-500', at_risk: 'bg-yellow-500', emergency: 'bg-red-500' };
    const statusLabels = { stable: 'Stable', at_risk: 'At Risk', emergency: 'Emergency' };

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 transition text-sm"
                    placeholder="Search patients..." />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {filtered.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No patients found</p>
                ) : (
                    filtered.map((patient, i) => (
                        <motion.button key={patient.id || i} onClick={() => onSelect(patient)}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className={`w-full text-left p-4 rounded-xl transition ${selectedId === patient.id ? 'bg-teal-500/20 border border-teal-500/40' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-medium text-sm">{patient.name}</span>
                                <span className={`w-2.5 h-2.5 rounded-full ${statusColors[patient.status] || 'bg-gray-500'} ${patient.status === 'emergency' ? 'animate-pulse' : ''}`}></span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>Age: {patient.age || '--'}</span>
                                <span>BMI: {patient.bmi || '--'}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${patient.status === 'stable' ? 'bg-green-500/10 text-green-400' : patient.status === 'at_risk' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {statusLabels[patient.status] || 'Unknown'}
                                </span>
                            </div>
                            {patient.lastLogDate && <p className="text-xs text-gray-600 mt-1">Last log: {new Date(patient.lastLogDate).toLocaleDateString()}</p>}
                        </motion.button>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientList;
