import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PatientLogin = () => {
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
            if (user.role !== 'patient') { toast.error('This login is for patients only'); return; }
            toast.success('Welcome back!');
            navigate(isProfileSetup ? '/patient/dashboard' : '/patient/setup');
        } catch (err) { toast.error(err.message || 'Login failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050816] flex noise-bg">
            {/* Left: Visual */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 mesh-gradient"></div>
                <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 animate-pulse-glow"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', top: '20%', left: '20%' }} />
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
                    className="relative z-10 text-center p-12">
                    <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-8">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Your Health,<br/><span className="gradient-text">Quantified.</span></h2>
                    <p className="text-gray-500 text-lg max-w-sm mx-auto">Track, predict, and optimize your wellbeing with AI-powered insights.</p>
                    <div className="flex justify-center gap-8 mt-10">
                        {[{ n: '100+', l: 'Metrics' }, { n: '90d', l: 'Forecasts' }, { n: 'AI', l: 'Powered' }].map(s => (
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
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                    className="w-full max-w-md">
                    <div className="mb-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition mb-8">
                            <span>←</span> Back to home
                        </Link>
                        <h2 className="text-3xl font-bold text-white">Welcome back</h2>
                        <p className="text-gray-500 mt-2">Sign in to your patient dashboard</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                placeholder="Enter your password" />
                        </div>
                        <motion.button type="submit" disabled={loading}
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            className="w-full py-3.5 btn-premium text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </motion.button>
                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{' '}
                            <Link to="/patient/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition">Create one</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PatientLogin;
