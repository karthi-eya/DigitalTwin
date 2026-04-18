import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DoctorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Please fill all fields');
        setLoading(true);
        try {
            const { user, isProfileSetup } = await login(email, password);
            if (user.role !== 'doctor') { toast.error('This login is for doctors only'); return; }
            toast.success('Welcome back, Doctor!');
            navigate(isProfileSetup ? '/doctor/dashboard' : '/doctor/setup');
        } catch (err) { toast.error(err.message || 'Login failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050816] flex noise-bg">
            {/* Left: Visual */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(at 30% 40%, rgba(6,182,212,0.1) 0%, transparent 60%), radial-gradient(at 70% 70%, rgba(20,184,166,0.08) 0%, transparent 50%)' }}></div>
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
                    className="relative z-10 text-center p-12">
                    <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 mb-8">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Clinical<br/><span className="gradient-text">Intelligence.</span></h2>
                    <p className="text-gray-500 text-lg max-w-sm mx-auto">Monitor patients remotely with real-time analytics, risk predictions, and AI-assisted insights.</p>
                    <div className="flex justify-center gap-8 mt-10">
                        {[{ n: 'Live', l: 'Monitoring' }, { n: 'PDF', l: 'Reports' }, { n: '🚨', l: 'Alerts' }].map(s => (
                            <div key={s.l} className="text-center">
                                <p className="text-2xl font-bold text-white">{s.n}</p>
                                <p className="text-gray-600 text-xs">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right: Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
                    <div className="mb-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition mb-8"><span>←</span> Back to home</Link>
                        <h2 className="text-3xl font-bold text-white">Doctor Portal</h2>
                        <p className="text-gray-500 mt-2">Access your clinical dashboard</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2 font-medium">Email address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 input-premium rounded-xl text-white placeholder-gray-600 text-sm" placeholder="doctor@hospital.com" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2 font-medium">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 input-premium rounded-xl text-white placeholder-gray-600 text-sm" placeholder="Enter your password" />
                        </div>
                        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            className="w-full py-3.5 btn-accent text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm">
                            {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Signing in...</span> : 'Sign In'}
                        </motion.button>
                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">New to the platform? <Link to="/doctor/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition">Register here</Link></p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DoctorLogin;
