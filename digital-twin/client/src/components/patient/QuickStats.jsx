import React from 'react';
import { motion } from 'framer-motion';

const QuickStats = ({ log = {}, profile = {} }) => {
    const tdee = profile.tdee || 2000;
    const cals = log.totalCalories || 0;
    const calPct = Math.min(100, Math.round((cals / tdee) * 100));

    const steps = log.steps || 0;
    const stepsGoal = 10000;
    const stepsPct = Math.min(100, Math.round((steps / stepsGoal) * 100));

    const water = log.waterGlasses || 0;
    const waterGoal = 8;
    const waterPct = Math.min(100, Math.round((water / waterGoal) * 100));

    const stats = [
        { label: 'Calories', val: cals, target: tdee, unit: 'kcal', pct: calPct, color: '#f59e0b' },
        { label: 'Steps', val: steps, target: stepsGoal, unit: '', pct: stepsPct, color: '#22c55e' },
        { label: 'Water', val: water, target: waterGoal, unit: 'glasses', pct: waterPct, color: '#06b6d4' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-10 transition-opacity" style={{ background: s.color }} />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-500 text-sm font-medium">{s.label}</span>
                            <span className="text-xs text-gray-600">{s.pct}%</span>
                        </div>
                        <div className="flex items-end gap-1 mb-3">
                            <span className="text-2xl font-bold text-white">{s.val.toLocaleString()}</span>
                            <span className="text-gray-600 text-xs mb-1">/ {s.target.toLocaleString()} {s.unit}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 1 }}
                                className="h-full rounded-full" style={{ background: s.color }} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default QuickStats;
