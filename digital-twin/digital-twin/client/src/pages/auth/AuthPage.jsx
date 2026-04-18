import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AuthPage = () => {
    const [mode, setMode] = useState('login'); // login | register
    const [role, setRole] = useState('patient'); // patient | doctor
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Please fill all fields');
        if (mode === 'register' && !name) return toast.error('Please enter your name');
        if (mode === 'register' && password.length < 4) return toast.error('Password must be at least 4 characters');
        setLoading(true);
        try {
            if (mode === 'register') {
                register(name, email, password, role);
                toast.success('Account created! Set up your profile.');
                navigate(`/${role}/setup`);
            } else {
                const { user, isProfileSetup } = login(email, password);
                if (user.role !== role) {
                    toast.error(`This account is registered as ${user.role}. Please select the correct role.`);
                    setLoading(false);
                    return;
                }
                toast.success(`Welcome back, ${user.name}!`);
                navigate(isProfileSetup ? `/${role}/dashboard` : `/${role}/setup`);
            }
        } catch (err) {
            toast.error(err.message || 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050816] flex noise-bg">
            {/* Left Visual Panel */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute w-[600px] h-[600px] rounded-full opacity-20" style={{ background: role === 'patient' ? 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)', top: '15%', left: '15%', transition: 'background 0.5s' }} />
                    <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 animate-pulse-glow" style={{ background: role === 'patient' ? 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)', bottom: '20%', right: '20%', transition: 'background 0.5s' }} />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>
                <motion.div key={role} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                    className="relative z-10 text-center p-16 max-w-lg">
                    <div className={`w-28 h-28 mx-auto rounded-3xl flex items-center justify-center shadow-2xl mb-8 transition-all duration-500 ${role === 'patient' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30' : 'bg-gradient-to-br from-cyan-500 to-teal-600 shadow-cyan-500/30'}`}>
                        {role === 'patient' ? (
                            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        ) : (
                            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        )}
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        {role === 'patient' ? (<>Your Health,<br/><span className="gradient-text">Quantified.</span></>) : (<>Clinical<br/><span className="gradient-text">Intelligence.</span></>)}
                    </h2>
                    <p className="text-gray-500 text-lg">
                        {role === 'patient' ? 'Track nutrition, predict health risks, and simulate your future body with AI.' : 'Monitor patients remotely, analyze trends, and send real-time health insights.'}
                    </p>
                    <div className="flex justify-center gap-10 mt-10">
                        {role === 'patient' ? (
                            [{ n: '🧬', l: 'Digital Twin' }, { n: '📊', l: 'Health Score' }, { n: '🔮', l: 'Predictions' }].map(s => (
                                <div key={s.l} className="text-center"><p className="text-3xl mb-1">{s.n}</p><p className="text-gray-600 text-xs">{s.l}</p></div>
                            ))
                        ) : (
                            [{ n: '👥', l: 'Patients' }, { n: '📄', l: 'Reports' }, { n: '🚨', l: 'Alerts' }].map(s => (
                                <div key={s.l} className="text-center"><p className="text-3xl mb-1">{s.n}</p><p className="text-gray-600 text-xs">{s.l}</p></div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
                    {/* Back */}
                    <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition mb-8">
                        ← Back to home
                    </button>

                    {/* Role Selector */}
                    <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl border border-white/10">
                        {['patient', 'doctor'].map(r => (
                            <button key={r} onClick={() => setRole(r)}
                                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${role === r ? (r === 'patient' ? 'bg-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/10' : 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10') : 'text-gray-500 hover:text-gray-300'}`}>
                                {r === 'patient' ? '🧑 Patient' : '👨‍⚕️ Doctor'}
                            </button>
                        ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-white mb-1">
                        {mode === 'login' ? 'Welcome back' : 'Create account'}
                    </h2>
                    <p className="text-gray-500 mb-8">
                        {mode === 'login' ? `Sign in as ${role}` : `Register as ${role}`}
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {mode === 'register' && (
                                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Full Name</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3.5 input-premium rounded-xl text-white placeholder-gray-600 text-sm"
                                        placeholder={role === 'patient' ? 'John Doe' : 'Dr. Jane Smith'} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2 font-medium">Email address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 input-premium rounded-xl text-white placeholder-gray-600 text-sm"
                                placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2 font-medium">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 input-premium rounded-xl text-white placeholder-gray-600 text-sm"
                                placeholder="Enter password" />
                        </div>
                        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            className={`w-full py-3.5 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm mt-2 ${role === 'patient' ? 'btn-premium' : 'btn-accent'}`}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {mode === 'login' ? 'Signing in...' : 'Creating...'}
                                </span>
                            ) : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </motion.button>
                    </form>

                    <p className="text-center text-gray-600 text-sm mt-8">
                        {mode === 'login' ? (
                            <>Don't have an account?{' '}<button onClick={() => setMode('register')} className={`font-medium transition ${role === 'patient' ? 'text-indigo-400 hover:text-indigo-300' : 'text-cyan-400 hover:text-cyan-300'}`}>Create one</button></>
                        ) : (
                            <>Already have an account?{' '}<button onClick={() => setMode('login')} className={`font-medium transition ${role === 'patient' ? 'text-indigo-400 hover:text-indigo-300' : 'text-cyan-400 hover:text-cyan-300'}`}>Sign in</button></>
                        )}
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
