import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getAllPatients, getHealthLogs, getProfile, getAppointments, updateAppointment, getEmergencies, resolveEmergency, addRecommendation, getRecommendations } from '../../services/localDB';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState('patients');
    const [patients, setPatients] = useState([]);
    const [selected, setSelected] = useState(null);
    const [patientLogs, setPatientLogs] = useState([]);
    const [patientTab, setPatientTab] = useState('overview');
    const [recText, setRecText] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [emergencies, setEmergencies] = useState([]);
    const [search, setSearch] = useState('');

    const refresh = () => {
        setPatients(getAllPatients());
        setAppointments(getAppointments(user?.id, 'doctor'));
        setEmergencies(getEmergencies());
    };

    useEffect(() => { refresh(); }, []);

    const selectPatient = (p) => {
        setSelected(p);
        setPatientLogs(getHealthLogs(p.id));
        setPatientTab('overview');
    };

    const sendRec = () => {
        if (!recText.trim()) return toast.error('Enter a recommendation');
        addRecommendation(user.id, selected.id, recText);
        toast.success('Recommendation sent!');
        setRecText('');
    };

    const handleApptAction = (id, status) => {
        updateAppointment(id, { status });
        toast.success(`Appointment ${status}`);
        refresh();
    };

    const handleResolve = (id) => {
        resolveEmergency(id);
        toast.success('Emergency resolved');
        refresh();
    };

    const filteredPatients = patients.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
    const chartData = patientLogs.slice(0, 14).reverse().map(l => ({
        date: new Date(l.date).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
        score: l.healthScore || 0, calories: l.totalCalories || 0, steps: l.steps || 0
    }));

    return (
        <div className="min-h-screen bg-[#050816] flex noise-bg">
            {/* Sidebar */}
            <aside className="w-80 bg-white/[0.02] border-r border-white/[0.06] flex flex-col">
                <div className="p-6 border-b border-white/[0.06]">
                    <h1 className="text-xl font-bold gradient-text">Dr. {user?.name}</h1>
                    <p className="text-gray-600 text-sm">Doctor Dashboard</p>
                </div>
                {/* Tabs */}
                <div className="flex px-4 pt-4 gap-1">
                    {['patients', 'appointments', 'emergency'].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2 text-xs rounded-lg font-medium transition capitalize ${tab === t ? 'bg-indigo-500/15 text-indigo-300' : 'text-gray-600 hover:bg-white/5'}`}>
                            {t === 'emergency' && emergencies.length > 0 && <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse" />}
                            {t}
                        </button>
                    ))}
                </div>
                {tab === 'patients' && (
                    <>
                        <div className="p-4"><input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full px-4 py-2.5 input-premium rounded-xl text-white text-sm" placeholder="Search patients..." /></div>
                        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                            {filteredPatients.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-4xl mb-3">👥</p>
                                    <p className="text-gray-600 text-sm">No patients with profiles yet.</p>
                                    <p className="text-gray-700 text-xs mt-1">Patients will appear here after they set up their profile.</p>
                                </div>
                            ) : filteredPatients.map((p, i) => (
                                <motion.button key={p.id} onClick={() => selectPatient(p)}
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    className={`w-full text-left p-4 rounded-xl transition ${selected?.id === p.id ? 'bg-indigo-500/15 border border-indigo-500/30' : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.06]'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white font-medium text-sm">{p.name}</span>
                                        <span className={`w-2.5 h-2.5 rounded-full ${p.status === 'stable' ? 'bg-green-500' : p.status === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                                    </div>
                                    <div className="flex gap-3 text-xs text-gray-600">
                                        <span>Age: {p.age}</span><span>BMI: {p.bmi}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${p.status === 'stable' ? 'bg-green-500/10 text-green-400' : p.status === 'at_risk' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>{p.status === 'at_risk' ? 'At Risk' : p.status === 'stable' ? 'Stable' : 'Alert'}</span>
                                    </div>
                                    {p.lastLogDate && <p className="text-[10px] text-gray-700 mt-1">Last: {new Date(p.lastLogDate).toLocaleDateString()}</p>}
                                </motion.button>
                            ))}
                        </div>
                    </>
                )}
                <div className="p-4 border-t border-white/[0.06]">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition text-sm">🚪 Logout</button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-auto p-6">
                {tab === 'patients' && !selected && (
                    <div className="flex items-center justify-center h-full text-gray-600 text-lg">
                        <div className="text-center"><p className="text-5xl mb-4">👈</p><p>Select a patient from the sidebar</p></div>
                    </div>
                )}
                {tab === 'patients' && selected && (
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white transition text-sm">← Back</button>
                            <div><h2 className="text-2xl font-bold text-white">{selected.name}</h2><p className="text-gray-600 text-sm">Age: {selected.age} | BMI: {selected.bmi} ({selected.bmiCategory}) | Logs: {selected.totalLogs}</p></div>
                        </div>
                        <div className="flex gap-2 mb-6">{['overview', 'logs', 'trends', 'recommend'].map(t => (
                            <button key={t} onClick={() => setPatientTab(t)} className={`px-4 py-2 rounded-lg text-sm capitalize transition ${patientTab === t ? 'bg-indigo-500/15 text-indigo-300' : 'text-gray-500 hover:bg-white/5'}`}>{t}</button>
                        ))}</div>

                        {patientTab === 'overview' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="glass-card rounded-xl p-4 text-center"><p className="text-gray-600 text-sm">Latest Score</p><p className={`text-3xl font-bold ${(selected.lastScore || 0) >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{selected.lastScore || '--'}</p></div>
                                    <div className="glass-card rounded-xl p-4 text-center"><p className="text-gray-600 text-sm">BMI</p><p className="text-3xl font-bold text-indigo-400">{selected.bmi}</p></div>
                                    <div className="glass-card rounded-xl p-4 text-center"><p className="text-gray-600 text-sm">Weight</p><p className="text-3xl font-bold text-white">{selected.weight || '--'} <span className="text-lg text-gray-600">kg</span></p></div>
                                </div>
                                {selected.medicalHistory?.length > 0 && selected.medicalHistory[0] !== 'None' && (
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4"><p className="text-orange-400 text-sm font-medium">⚠️ Medical History: {selected.medicalHistory.join(', ')}</p></div>
                                )}
                                {chartData.length > 0 && (
                                    <div className="glass-card rounded-xl p-4">
                                        <p className="text-gray-500 text-sm mb-3">7-Day Score Trend</p>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <LineChart data={chartData.slice(-7)}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} /><YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} /><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }} /><Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        )}
                        {patientTab === 'logs' && (
                            <div className="glass-card rounded-xl overflow-hidden">
                                <table className="w-full"><thead><tr className="bg-white/[0.03]">{['Date','Calories','Steps','Sleep','Water','Score'].map(h => <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium">{h}</th>)}</tr></thead>
                                <tbody>{patientLogs.slice(0, 20).map((log, i) => (
                                    <tr key={i} className="border-t border-white/[0.04] hover:bg-white/[0.03] transition">
                                        <td className="px-4 py-3 text-sm text-gray-400">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{log.totalCalories}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{log.steps?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{log.sleepHours}h</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{log.waterGlasses}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${log.healthScore >= 70 ? 'bg-green-500/15 text-green-400' : log.healthScore >= 40 ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400'}`}>{log.healthScore}</span></td>
                                    </tr>
                                ))}</tbody></table>
                                {patientLogs.length === 0 && <p className="text-gray-600 text-center py-8">No logs yet</p>}
                            </div>
                        )}
                        {patientTab === 'trends' && chartData.length > 0 && (
                            <div className="space-y-6">
                                <div className="glass-card rounded-xl p-4"><p className="text-gray-500 text-sm mb-3">Health Score</p>
                                    <ResponsiveContainer width="100%" height={200}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} /><YAxis domain={[0,100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} /><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }} /><Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
                                <div className="glass-card rounded-xl p-4"><p className="text-gray-500 text-sm mb-3">Steps</p>
                                    <ResponsiveContainer width="100%" height={200}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} /><YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} /><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }} /><Line type="monotone" dataKey="steps" stroke="#22c55e" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
                            </div>
                        )}
                        {patientTab === 'recommend' && (
                            <div className="space-y-4">
                                <div className="glass-card rounded-xl p-5">
                                    <h4 className="text-white font-semibold mb-3">Send Recommendation</h4>
                                    <textarea value={recText} onChange={e => setRecText(e.target.value)} rows="3"
                                        className="w-full px-4 py-3 input-premium rounded-xl text-white text-sm resize-none" placeholder="Write your recommendation for this patient..." />
                                    <motion.button onClick={sendRec} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className="mt-3 px-6 py-2 btn-accent text-white rounded-xl text-sm">Send Recommendation</motion.button>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-gray-400 text-sm font-medium">Previous Recommendations</h4>
                                    {getRecommendations(selected.id).map((r, i) => (
                                        <div key={i} className="glass-card rounded-xl p-4">
                                            <p className="text-gray-300 text-sm">{r.text}</p>
                                            <p className="text-gray-700 text-xs mt-2">{new Date(r.date).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'appointments' && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">📅 Appointments</h2>
                        {appointments.length === 0 ? <div className="text-center text-gray-600 py-16"><p className="text-5xl mb-4">📅</p>No appointments yet</div> : (
                            <div className="space-y-3">{appointments.map((a, i) => (
                                <div key={a.id} className="glass-card rounded-xl p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">{a.patientName || 'Patient'}</p>
                                        <p className="text-gray-500 text-sm">{new Date(a.dateTime).toLocaleString()} — {a.mode}</p>
                                        <p className={`text-sm capitalize ${a.status === 'pending' ? 'text-yellow-400' : a.status === 'confirmed' ? 'text-green-400' : 'text-red-400'}`}>{a.status}</p>
                                    </div>
                                    {a.status === 'pending' && <div className="flex gap-2">
                                        <button onClick={() => handleApptAction(a.id, 'confirmed')} className="px-4 py-2 bg-green-500/15 text-green-400 rounded-lg text-sm hover:bg-green-500/25 transition">Accept</button>
                                        <button onClick={() => handleApptAction(a.id, 'cancelled')} className="px-4 py-2 bg-red-500/15 text-red-400 rounded-lg text-sm hover:bg-red-500/25 transition">Decline</button>
                                    </div>}
                                </div>
                            ))}</div>
                        )}
                    </div>
                )}

                {tab === 'emergency' && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">🚨 Emergency Center</h2>
                        {emergencies.length === 0 ? (
                            <div className="text-center py-16"><p className="text-6xl mb-4">✅</p><p className="text-gray-500 text-lg">No active emergencies</p></div>
                        ) : (
                            <div className="space-y-3">{emergencies.map((e, i) => (
                                <motion.div key={e.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-500/5 border-2 border-red-500/20 rounded-xl p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2"><span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /><span className="text-red-400 font-bold">EMERGENCY</span></div>
                                            <p className="text-gray-300 text-sm">{e.message}</p>
                                            <p className="text-gray-600 text-xs mt-1">Trigger: {e.triggerType} | {new Date(e.triggeredAt).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => handleResolve(e.id)} className="px-5 py-2 bg-green-500/15 text-green-400 rounded-xl hover:bg-green-500/25 transition text-sm">Resolve</button>
                                    </div>
                                </motion.div>
                            ))}</div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DoctorDashboard;
