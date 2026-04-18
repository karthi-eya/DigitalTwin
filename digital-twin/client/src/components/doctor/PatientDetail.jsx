import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PatientDetail = ({ patient, onBack }) => {
    const [tab, setTab] = useState('overview');
    const [logs, setLogs] = useState([]);
    const [insights, setInsights] = useState([]);
    const [recommendation, setRecommendation] = useState('');

    useEffect(() => {
        if (patient?.id) fetchPatientData();
    }, [patient?.id]);

    const fetchPatientData = async () => {
        try {
            const res = await api.get(`/doctor/patient/${patient.id}/logs`);
            setLogs(res.data.logs || []);
            setInsights(res.data.insights || []);
        } catch { console.error('Failed to fetch patient data'); }
    };

    const submitRecommendation = async () => {
        if (!recommendation.trim()) return toast.error('Enter recommendation');
        try {
            await api.post('/doctor/recommendation', { patientId: patient.id, recommendation });
            toast.success('Recommendation sent!');
            setRecommendation('');
        } catch { toast.error('Failed to send'); }
    };

    const exportPDF = async (period) => {
        try {
            const res = await api.get(`/doctor/patient/${patient.id}/export?period=${period}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url; a.download = `report_${patient.name}.pdf`; a.click();
            toast.success('PDF downloaded!');
        } catch { toast.error('Export failed'); }
    };

    const chartData = logs.slice(0, 14).reverse().map(l => ({
        date: new Date(l.date).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
        score: l.healthScore, calories: l.totalCalories, steps: l.steps
    }));

    const TABS = ['overview', 'logs', 'trends', 'recommendations'];

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition">← Back</button>
                <div>
                    <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
                    <p className="text-gray-500 text-sm">Age: {patient.age} | BMI: {patient.bmi} ({patient.bmiCategory || '--'})</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm capitalize transition ${tab === t ? 'bg-teal-500/20 text-teal-300' : 'text-gray-400 hover:bg-white/5'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {tab === 'overview' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <p className="text-gray-500 text-sm">Latest Score</p>
                            <p className={`text-3xl font-bold ${(patient.lastScore || 0) >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{patient.lastScore || '--'}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <p className="text-gray-500 text-sm">BMI</p>
                            <p className="text-3xl font-bold text-blue-400">{patient.bmi || '--'}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <p className="text-gray-500 text-sm">Status</p>
                            <p className={`text-xl font-bold ${patient.status === 'stable' ? 'text-green-400' : patient.status === 'at_risk' ? 'text-yellow-400' : 'text-red-400'}`}>
                                {patient.status === 'stable' ? '✅ Stable' : patient.status === 'at_risk' ? '⚠️ At Risk' : '🚨 Emergency'}
                            </p>
                        </div>
                    </div>
                    {insights.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                            <h4 className="text-amber-400 font-semibold">System Insights</h4>
                            {insights.map((ins, i) => <p key={i} className="text-amber-300/80 text-sm">💡 {ins}</p>)}
                        </div>
                    )}
                    {chartData.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-gray-400 text-sm mb-3">7-Day Score Trend</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={chartData.slice(-7)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Logs */}
            {tab === 'logs' && (
                <div>
                    <div className="flex justify-end gap-2 mb-4">
                        <button onClick={() => exportPDF('weekly')} className="px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg text-sm hover:bg-teal-500/30 transition">Export Weekly PDF</button>
                        <button onClick={() => exportPDF('monthly')} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition">Export Monthly PDF</button>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="bg-white/5">
                                {['Date', 'Calories', 'Steps', 'Sleep', 'Water', 'Score'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {logs.slice(0, 20).map((log, i) => (
                                    <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition">
                                        <td className="px-4 py-3 text-sm text-gray-300">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{log.totalCalories}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{log.steps?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{log.sleepHours || 0}h</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{log.waterGlasses || 0}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${log.healthScore >= 70 ? 'bg-green-500/20 text-green-400' : log.healthScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{log.healthScore}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Trends */}
            {tab === 'trends' && chartData.length > 0 && (
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-3">Health Score Over Time</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} /><YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} /><Tooltip /><Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} /></LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-3">Steps Over Time</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} /><YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} /><Tooltip /><Line type="monotone" dataKey="steps" stroke="#22c55e" strokeWidth={2} /></LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {tab === 'recommendations' && (
                <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-3">Add Recommendation</h4>
                        <textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} rows="3"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 transition resize-none"
                            placeholder="Write your recommendation for this patient..." />
                        <button onClick={submitRecommendation}
                            className="mt-3 px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition">
                            Send Recommendation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDetail;
