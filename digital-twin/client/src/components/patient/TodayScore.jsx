import React from 'react';
import { motion } from 'framer-motion';

const TodayScore = ({ score = 0, breakdown = {}, feedbackMessages = [] }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444';

    return (
        <div className="glass-card rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Today's Score</h3>
            <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                    <svg width="180" height="180" className="transform -rotate-90">
                        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <motion.circle cx="90" cy="90" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
                            strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.5, ease: 'easeOut' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                            className="text-4xl font-bold" style={{ color }}>{score}</motion.span>
                        <span className="text-gray-600 text-xs">/100</span>
                    </div>
                </div>
                <div className="flex-1 space-y-3">
                    {[
                        { label: 'Diet', val: breakdown.diet || 0, max: 35, color: '#3b82f6' },
                        { label: 'Activity', val: breakdown.activity || 0, max: 30, color: '#22c55e' },
                        { label: 'Hydration', val: breakdown.hydration || 0, max: 25, color: '#06b6d4' },
                        { label: 'Sleep', val: breakdown.sleep || 0, max: 10, color: '#a855f7' },
                    ].map(b => (
                        <div key={b.label}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">{b.label}</span>
                                <span className="text-gray-400">{b.val}/{b.max}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(b.val / b.max) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full" style={{ background: b.color }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {feedbackMessages.length > 0 && (
                <div className="mt-4 space-y-1.5 pt-4 border-t border-white/[0.05]">
                    {feedbackMessages.slice(0, 3).map((msg, i) => <p key={i} className="text-gray-500 text-xs">💡 {msg}</p>)}
                </div>
            )}
        </div>
    );
};

export default TodayScore;
