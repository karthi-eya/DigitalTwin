import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getHealthLogs, getTodayLog } from '../../services/localDB';
import TodayScore from '../../components/patient/TodayScore';
import WeeklySummary from '../../components/patient/WeeklySummary';
import QuickStats from '../../components/patient/QuickStats';
import DailyLog from './DailyLog';
import MyTwin from './MyTwin';
import HealthChat from './HealthChat';

const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'log', label: 'Log Today', icon: '📝' },
    { id: 'twin', label: 'My Twin', icon: '🧬' },
    { id: 'chat', label: 'Health Chat', icon: '💬' },
];

const Dashboard = () => {
    const { user, profile, logout } = useAuth();
    const [tab, setTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const todayLog = getTodayLog(user?.id);
    const logs = getHealthLogs(user?.id);

    const handleLogSaved = useCallback(() => {
        setRefreshKey(k => k + 1);
        setTab('dashboard');
    }, []);

    return (
        <div className="min-h-screen bg-[#050816] flex noise-bg">
            {/* Sidebar */}
            <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/[0.02] backdrop-blur-xl border-r border-white/[0.06] flex flex-col transition-all duration-300`}>
                <div className="p-6 border-b border-white/[0.06]">
                    <h1 className={`font-bold gradient-text ${sidebarOpen ? 'text-xl' : 'text-sm text-center'}`}>{sidebarOpen ? 'DigitalTwin' : 'DT'}</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {NAV.map(item => (
                        <button key={item.id} onClick={() => setTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${tab === item.id ? 'bg-indigo-500/15 text-indigo-300' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
                            <span className="text-xl">{item.icon}</span>
                            {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/[0.06]">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition">
                        <span>🚪</span>{sidebarOpen && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main */}
            <main className="flex-1 overflow-auto">
                <div className="sticky top-0 z-20 bg-[#050816]/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h2 className="text-xl font-semibold text-white">Welcome, {user?.name || 'Patient'}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {todayLog && <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${todayLog.healthScore >= 70 ? 'bg-green-500/15 text-green-400' : todayLog.healthScore >= 40 ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400'}`}>Score: {todayLog.healthScore}</span>}
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                            {(user?.name || 'P')[0].toUpperCase()}
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-6 max-w-7xl mx-auto" key={refreshKey}>
                    {tab === 'dashboard' && (
                        <>
                            <QuickStats log={todayLog || {}} profile={profile || {}} />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <TodayScore score={todayLog?.healthScore || 0} breakdown={todayLog?.scoreBreakdown || {}} feedbackMessages={todayLog?.feedbackMessages || []} />
                                <WeeklySummary logs={logs} />
                            </div>
                            {!todayLog && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-8 text-center">
                                    <p className="text-5xl mb-4">📝</p>
                                    <p className="text-white text-lg font-semibold">No log today yet!</p>
                                    <p className="text-gray-500 mt-2 mb-4">Submit your first daily log to see your health score.</p>
                                    <button onClick={() => setTab('log')} className="px-6 py-3 btn-premium text-white font-semibold rounded-xl">Log Today's Health Data</button>
                                </motion.div>
                            )}
                        </>
                    )}
                    {tab === 'log' && <DailyLog onLogSaved={handleLogSaved} />}
                    {tab === 'twin' && <MyTwin />}
                    {tab === 'chat' && <HealthChat />}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
