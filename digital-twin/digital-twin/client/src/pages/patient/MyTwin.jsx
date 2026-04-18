import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getHealthLogs } from '../../services/localDB';
import { runSimulation, runScenario } from '../../services/simulator';
import toast from 'react-hot-toast';

const SCENARIOS = [
    { value: 'stop_exercise', label: "🛑 I stop exercising" },
    { value: 'eat_less_300', label: "🥗 I eat 300 kcal less/day" },
    { value: 'sleep_8hrs', label: "😴 I sleep 8 hours every night" },
    { value: 'walk_10k', label: "🚶 I walk 10,000 steps daily" },
    { value: 'all_above', label: "⚡ I do all of the above" },
];

const RiskBadge = ({ label, value }) => {
    const c = value < 20 ? 'bg-green-500/15 text-green-400' : value < 50 ? 'bg-yellow-500/15 text-yellow-400' : value < 75 ? 'bg-orange-500/15 text-orange-400' : 'bg-red-500/15 text-red-400';
    return <div className={`px-4 py-3 rounded-xl text-center ${c}`}><p className="text-[10px] opacity-70">{label}</p><p className="text-xl font-bold">{value?.toFixed(0) || 0}%</p></div>;
};

const MyTwin = () => {
    const { user, profile } = useAuth();
    const [simulation, setSimulation] = useState(null);
    const [scenario, setScenario] = useState('');
    const [scenarioData, setScenarioData] = useState(null);

    useEffect(() => { if (profile) doSimulation(); }, [profile]);

    const getSimInput = () => {
        const logs = getHealthLogs(user.id);
        const recent = logs.slice(0, 7);
        const avgCalories = recent.length > 0 ? Math.round(recent.reduce((s, l) => s + (l.totalCalories || 0), 0) / recent.length) : (profile?.tdee || 2000);
        const avgSteps = recent.length > 0 ? Math.round(recent.reduce((s, l) => s + (l.steps || 0), 0) / recent.length) : 5000;
        return {
            currentWeight: profile?.weight || 70,
            age: profile?.age || 25,
            gender: profile?.gender || 'male',
            tdee: profile?.tdee || 2000,
            avgCalories, avgSteps,
            medicalHistory: profile?.medicalHistory || [],
            bmi: profile?.bmi || 22
        };
    };

    const doSimulation = () => {
        const input = getSimInput();
        const result = runSimulation(input);
        setSimulation(result);
        setScenarioData(null);
        setScenario('');
    };

    const doScenario = () => {
        if (!scenario) return toast.error('Select a scenario');
        const input = getSimInput();
        const result = runScenario(input, scenario);
        setScenarioData(result);
        toast.success('Scenario simulated!');
    };

    const chartData = simulation ? [
        { day: 'Now', current: simulation.currentWeight, scenario: scenarioData ? simulation.currentWeight : null },
        { day: '30d', current: simulation.predictions?.days30?.weight, scenario: scenarioData?.predictions?.days30?.weight },
        { day: '60d', current: simulation.predictions?.days60?.weight, scenario: scenarioData?.predictions?.days60?.weight },
        { day: '90d', current: simulation.predictions?.days90?.weight, scenario: scenarioData?.predictions?.days90?.weight },
    ] : [];

    const p = simulation?.predictions;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">🧬 My Digital Twin</h2>
                <motion.button onClick={doSimulation} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 btn-premium text-white text-sm rounded-xl">🔄 Refresh Simulation</motion.button>
            </div>
            {/* Current */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 text-center"><p className="text-gray-500 text-sm">Weight</p><p className="text-3xl font-bold text-white">{simulation?.currentWeight || '--'}<span className="text-lg text-gray-600"> kg</span></p></div>
                <div className="glass-card rounded-2xl p-5 text-center"><p className="text-gray-500 text-sm">BMI</p><p className="text-3xl font-bold text-indigo-400">{simulation?.currentBmi || '--'}</p></div>
                <RiskBadge label="Obesity Risk" value={p?.days30?.obesityRisk || 0} />
                <RiskBadge label="Diabetes Risk" value={p?.days30?.diabetesRisk || 0} />
            </div>
            {/* Predictions */}
            {p && <div className="grid grid-cols-3 gap-4">{[{ l: '30 Days', d: p.days30 }, { l: '60 Days', d: p.days60 }, { l: '90 Days', d: p.days90 }].map((pr, i) => (
                <motion.div key={pr.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-2xl p-5">
                    <h4 className="text-indigo-400 font-semibold text-sm mb-3">{pr.l}</h4>
                    <p className="text-white text-xl font-bold">{pr.d?.weight?.toFixed(1)} kg</p>
                    <p className="text-gray-500 text-sm">BMI: {pr.d?.bmi?.toFixed(1)}</p>
                    <div className="mt-3 space-y-1">
                        {[['Obesity', pr.d?.obesityRisk], ['Diabetes', pr.d?.diabetesRisk], ['Cardio', pr.d?.cardiovascularRisk]].map(([n, v]) => (
                            <div key={n} className="flex justify-between text-xs"><span className="text-gray-600">{n}</span><span className={v < 30 ? 'text-green-400' : 'text-orange-400'}>{v?.toFixed(0)}%</span></div>
                        ))}
                    </div>
                </motion.div>
            ))}</div>}
            {/* Chart */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Weight Projection</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: '#6b7280' }} axisLine={false} />
                        <YAxis tick={{ fill: '#6b7280' }} axisLine={false} domain={['dataMin - 3', 'dataMax + 3']} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }} />
                        <Legend />
                        <Line type="monotone" dataKey="current" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} name="Current Path" />
                        {scenarioData && <Line type="monotone" dataKey="scenario" stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 4" dot={{ r: 4 }} name="Scenario" />}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {/* What-If */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">🔮 What If Simulator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">{SCENARIOS.map(s => (
                    <button key={s.value} onClick={() => setScenario(s.value)}
                        className={`px-4 py-3 rounded-xl text-left text-sm transition ${scenario === s.value ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/40' : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10'}`}>{s.label}</button>
                ))}</div>
                <motion.button onClick={doScenario} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20">⚡ Run Scenario</motion.button>
            </div>
        </div>
    );
};

export default MyTwin;
