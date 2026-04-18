import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Animated DNA Helix built with CSS
const DNAHelix = () => {
    return (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden lg:block" style={{ perspective: '800px' }}>
            <div style={{ animation: 'dna-spin 12s linear infinite', transformStyle: 'preserve-3d' }}>
                {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-center" style={{ transform: `rotateY(${i * 22.5}deg) translateZ(60px)`, position: 'absolute', top: `${i * 30}px` }}>
                        <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
                        <div className="w-20 h-0.5 bg-gradient-to-r from-indigo-500/50 to-cyan-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Floating particles
const Particles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
            <div key={i}
                className="absolute rounded-full"
                style={{
                    width: `${Math.random() * 4 + 2}px`,
                    height: `${Math.random() * 4 + 2}px`,
                    background: ['#6366f1', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.1,
                    animation: `float-slow ${Math.random() * 10 + 8}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`
                }}
            />
        ))}
    </div>
);

// Feature pill
const FeaturePill = ({ text, delay }) => (
    <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-400"
    >
        {text}
    </motion.span>
);

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#050816] relative overflow-hidden noise-bg">
            {/* Background Effects */}
            <div className="absolute inset-0">
                {/* Large gradient orbs */}
                <div className="absolute w-[800px] h-[800px] rounded-full opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', top: '-20%', left: '-10%' }} />
                <div className="absolute w-[600px] h-[600px] rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', bottom: '-10%', right: '-5%' }} />
                <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 animate-pulse-glow"
                    style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', top: '40%', left: '50%' }} />
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />
            </div>

            <Particles />

            {/* Nav */}
            <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
                className="relative z-20 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="text-white font-bold text-lg">DT</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">DigitalTwin</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/auth" className="px-5 py-2 text-gray-400 hover:text-white text-sm font-medium transition">Sign In</Link>
                    <Link to="/auth" className="px-5 py-2 btn-premium text-white text-sm font-medium rounded-xl transition">Get Started</Link>
                </div>
            </motion.nav>

            {/* Hero */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-24">
                <div className="max-w-3xl">
                    {/* Badge */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-indigo-400 text-sm font-medium">AI-Powered Health Simulation</span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight mb-8">
                        <span className="text-white">Your Body,</span>
                        <br />
                        <span className="gradient-text">Simulated.</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl mb-10">
                        Build a digital replica of your body. Track nutrition, predict health risks,
                        and simulate the future — powered by AI and real-time analytics.
                    </motion.p>

                    {/* Feature pills */}
                    <motion.div className="flex flex-wrap gap-3 mb-12">
                        {['🧬 Digital Twin', '📊 Health Score', '🔮 90-Day Predictions', '🍽️ AI Food Parser', '🤖 Symptom AI', '👨‍⚕️ Doctor Network'].map((text, i) => (
                            <FeaturePill key={text} text={text} delay={0.4 + i * 0.08} />
                        ))}
                    </motion.div>

                    {/* CTA Cards */}
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-5">
                        <Link to="/auth" className="group flex-1">
                            <div className="glass-card glass-card-hover rounded-2xl p-7 transition-all duration-500 cursor-pointer relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-110 transition-all duration-500">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </div>
                                    <h3 className="text-white text-xl font-bold mb-2 group-hover:text-indigo-300 transition">I'm a Patient</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">Track health metrics, build your digital twin, and simulate your future body.</p>
                                    <div className="mt-4 flex items-center gap-2 text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                        Get started <span>→</span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link to="/auth" className="group flex-1">
                            <div className="glass-card glass-card-hover rounded-2xl p-7 transition-all duration-500 cursor-pointer relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 group-hover:scale-110 transition-all duration-500">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                    </div>
                                    <h3 className="text-white text-xl font-bold mb-2 group-hover:text-cyan-300 transition">I'm a Doctor</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">Monitor patients remotely, analyze trends, and send real-time health insights.</p>
                                    <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                        Access dashboard <span>→</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Right side visual */}
                <DNAHelix />

                {/* Stats bar */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}
                    className="mt-20 glass-card rounded-2xl p-6 flex items-center justify-around">
                    {[
                        { value: '60+', label: 'Foods in AI Database', icon: '🍽️' },
                        { value: '80+', label: 'Symptom Keywords', icon: '🩺' },
                        { value: '12', label: 'Specialist Types', icon: '👨‍⚕️' },
                        { value: '90', label: 'Day Predictions', icon: '🔮' },
                    ].map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 + i * 0.1 }} className="text-center px-4">
                            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-gray-500 text-xs">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;
