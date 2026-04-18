import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = ['General Physician', 'Cardiologist', 'Orthopedic', 'Dermatologist', 'Gastroenterologist', 'Neurologist', 'Psychiatrist', 'Pediatrician', 'ENT Specialist', 'Ophthalmologist', 'Physiotherapist', 'Endocrinologist'];

const DoctorRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [consultationType, setConsultationType] = useState('both');
    const [loading, setLoading] = useState(false);
    const { registerDoctor } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !specialization) return toast.error('Please fill all required fields');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            await registerDoctor(name, email, password, specialization, consultationType);
            toast.success('Account created!');
            navigate('/doctor/setup');
        } catch (err) { toast.error(err.message || 'Registration failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] top-1/4 left-1/3"></div>
                <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] bottom-1/4 right-1/3"></div>
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Doctor Registration</h2>
                        <p className="text-gray-400 mt-2">Join our healthcare platform</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                                placeholder="Dr. Jane Smith" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                                placeholder="doctor@hospital.com" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                                placeholder="Min 6 characters" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">Specialization *</label>
                            <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition">
                                <option value="" className="bg-slate-800">Select specialization</option>
                                {SPECIALIZATIONS.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">Consultation Type</label>
                            <div className="flex gap-3">
                                {['online', 'offline', 'both'].map(t => (
                                    <button key={t} type="button" onClick={() => setConsultationType(t)}
                                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${consultationType === t ? 'bg-teal-500/30 text-teal-300 border border-teal-500/50' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-50 mt-2"
                        >
                            {loading ? <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating...</span> : 'Create Account'}
                        </motion.button>
                    </form>
                    <p className="text-center text-gray-400 mt-6">
                        Already registered? <Link to="/doctor/login" className="text-teal-400 hover:text-teal-300 transition">Sign in</Link>
                    </p>
                    <div className="text-center mt-3"><Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition">Back to Home</Link></div>
                </div>
            </motion.div>
        </div>
    );
};

export default DoctorRegister;
