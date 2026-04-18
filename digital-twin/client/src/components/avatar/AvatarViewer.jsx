import React from 'react';
import AvatarFallback from './AvatarFallback';
import { motion } from 'framer-motion';

const AvatarViewer = ({ bmi = 22, activityScore = 50, bodyType = 'lean', weight, goalWeight }) => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🧬 Your Avatar</h3>
            <div className="flex items-center gap-6">
                <div className="flex-shrink-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl overflow-hidden">
                    <AvatarFallback bmi={bmi} activityScore={activityScore} bodyType={bodyType} />
                </div>
                <div className="space-y-4 flex-1">
                    <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-400 text-xs">Current Weight</p>
                        <p className="text-white font-bold text-xl">{weight || '--'} kg</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-gray-400 text-xs">BMI</p>
                        <p className="text-blue-400 font-bold text-xl">{bmi?.toFixed(1)}</p>
                    </div>
                    {goalWeight && (
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-gray-400 text-xs">Goal Weight</p>
                            <p className="text-teal-400 font-bold text-xl">{goalWeight} kg</p>
                            <div className="h-1.5 bg-white/5 rounded-full mt-2">
                                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (1 - Math.abs(weight - goalWeight) / goalWeight) * 100))}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AvatarViewer;
