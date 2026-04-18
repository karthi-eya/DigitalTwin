import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const WeeklySummary = ({ logs = [] }) => {
    const [metric, setMetric] = useState('score');

    const chartData = [...logs].reverse().slice(0, 7).map(l => ({
        date: new Date(l.date).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
        score: l.healthScore || 0,
        calories: l.totalCalories || 0,
        steps: l.steps || 0
    }));

    const config = {
        score: { key: 'score', color: '#6366f1', label: 'Health Score', gradient: 'url(#colorScore)' },
        calories: { key: 'calories', color: '#f59e0b', label: 'Calories', gradient: 'url(#colorCals)' },
        steps: { key: 'steps', color: '#22c55e', label: 'Steps', gradient: 'url(#colorSteps)' }
    };

    const currentConfig = config[metric];

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-semibold">Weekly Trends</h3>
                <select value={metric} onChange={e => setMetric(e.target.value)}
                    className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                    <option value="score">Health Score</option>
                    <option value="calories">Calories</option>
                    <option value="steps">Steps</option>
                </select>
            </div>
            
            {chartData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">No data available</div>
            ) : (
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }} />
                            <Area type="monotone" dataKey={currentConfig.key} stroke={currentConfig.color} strokeWidth={2} fillOpacity={1} fill={currentConfig.gradient} name={currentConfig.label} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default WeeklySummary;
