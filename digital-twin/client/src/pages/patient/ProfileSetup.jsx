import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { saveProfile } from '../../services/localDB';

const STEPS = ['Personal Info', 'Medical History', 'Activity & Goals', 'Body Type', 'Summary'];
const CONDITIONS = ['Diabetes', 'Thyroid', 'Hypertension', 'Heart Disease', 'Asthma', 'PCOS', 'None'];
const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Sedentary', icon: '🪑', desc: 'Little to no exercise' },
    { value: 'light', label: 'Lightly Active', icon: '🚶', desc: '1-3 days/week' },
    { value: 'moderate', label: 'Moderately Active', icon: '🏃', desc: '3-5 days/week' },
    { value: 'active', label: 'Very Active', icon: '💪', desc: '6-7 days/week' }
];
const GOALS = [
    { value: 'lose_weight', label: 'Lose Weight', icon: '⚖️' },
    { value: 'gain_muscle', label: 'Gain Muscle', icon: '💪' },
    { value: 'maintain', label: 'Maintain', icon: '🎯' },
    { value: 'improve_stamina', label: 'Improve Stamina', icon: '🏃' }
];
const BODY_TYPES = [
    { value: 'skinny', label: 'Skinny', emoji: '🧍' },
    { value: 'lean', label: 'Lean', emoji: '🧍‍♂️' },
    { value: 'athletic', label: 'Athletic', emoji: '🏋️' },
    { value: 'skinny-fat', label: 'Skinny-Fat', emoji: '🧑' },
    { value: 'overweight', label: 'Overweight', emoji: '🧑‍🦲' },
    { value: 'obese', label: 'Obese', emoji: '👤' }
];

const ProfileSetup = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        age: '', gender: 'male', height: '', weight: '',
        medicalHistory: [], currentMedications: [], medicationInput: '',
        activityLevel: 'sedentary', goal: 'maintain', avatarBodyType: 'lean',
        specialization: '', consultationType: 'both'
    });

    const bmi = useMemo(() => {
        if (!form.height || !form.weight) return null;
        return (parseFloat(form.weight) / ((parseFloat(form.height)/100) ** 2)).toFixed(1);
    }, [form.height, form.weight]);

    const bmiCat = useMemo(() => {
        if (!bmi) return null;
        if (bmi < 18.5) return { l: 'Underweight', c: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        if (bmi < 25) return { l: 'Normal', c: 'text-green-400', bg: 'bg-green-500/20' };
        if (bmi < 30) return { l: 'Overweight', c: 'text-orange-400', bg: 'bg-orange-500/20' };
        return { l: 'Obese', c: 'text-red-400', bg: 'bg-red-500/20' };
    }, [bmi]);

    const tdee = useMemo(() => {
        if (!form.height || !form.weight || !form.age) return null;
        const w = parseFloat(form.weight), h = parseFloat(form.height), a = parseInt(form.age);
        let bmr = form.gender === 'male' ? 88.362 + 13.397*w + 4.799*h - 5.677*a : 447.593 + 9.247*w + 3.098*h - 4.330*a;
        const m = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
        return Math.round(bmr * (m[form.activityLevel] || 1.2));
    }, [form]);

    const u = (key, val) => setForm(p => ({ ...p, [key]: val }));
    const toggleCondition = (c) => {
        if (c === 'None') { u('medicalHistory', form.medicalHistory.includes('None') ? [] : ['None']); return; }
        const f = form.medicalHistory.filter(x => x !== 'None');
        u('medicalHistory', f.includes(c) ? f.filter(x => x !== c) : [...f, c]);
    };
    const addMed = () => { if (form.medicationInput.trim()) { u('currentMedications', [...form.currentMedications, form.medicationInput.trim()]); u('medicationInput', ''); } };

    const handleSubmit = () => {
        try {
            saveProfile(user.id, form);
            refreshProfile();
            toast.success('Profile set up!');
            navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
        } catch (err) { toast.error(err.message); }
    };

    const canNext = () => { if (step === 0) return form.age && form.height && form.weight; return true; };

    return (
        <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 noise-bg">
            <div className="absolute inset-0">
                <div className="absolute w-[500px] h-[500px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', top: '10%', left: '20%' }} />
            </div>
            <div className="relative z-10 w-full max-w-2xl">
                {/* Progress */}
                <div className="flex items-center mb-8 px-4">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-gray-600 border border-white/10'}`}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <span className={`text-[10px] mt-1 hidden md:block ${i <= step ? 'text-indigo-400' : 'text-gray-700'}`}>{s}</span>
                            </div>
                            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 transition-all ${i < step ? 'bg-indigo-500' : 'bg-white/5'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="glass-card rounded-3xl p-8 min-h-[420px]">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.25 }}>
                            {step === 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm text-gray-400 mb-1.5">Age</label><input type="number" value={form.age} onChange={e => u('age', e.target.value)} className="w-full px-4 py-3 input-premium rounded-xl text-white text-sm" placeholder="25" /></div>
                                        <div><label className="block text-sm text-gray-400 mb-1.5">Gender</label>
                                            <div className="flex gap-2">{['male','female','other'].map(g => (
                                                <button key={g} type="button" onClick={() => u('gender', g)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${form.gender === g ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-white/5 text-gray-500 border border-white/10'}`}>{g[0].toUpperCase()+g.slice(1)}</button>
                                            ))}</div>
                                        </div>
                                        <div><label className="block text-sm text-gray-400 mb-1.5">Height (cm)</label><input type="number" value={form.height} onChange={e => u('height', e.target.value)} className="w-full px-4 py-3 input-premium rounded-xl text-white text-sm" placeholder="170" /></div>
                                        <div><label className="block text-sm text-gray-400 mb-1.5">Weight (kg)</label><input type="number" value={form.weight} onChange={e => u('weight', e.target.value)} className="w-full px-4 py-3 input-premium rounded-xl text-white text-sm" placeholder="70" /></div>
                                    </div>
                                    {bmi && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-4"><div className="text-center"><p className="text-gray-500 text-xs">BMI</p><p className={`text-4xl font-bold ${bmiCat?.c}`}>{bmi}</p></div><span className={`px-4 py-2 rounded-full text-sm font-medium ${bmiCat?.bg} ${bmiCat?.c}`}>{bmiCat?.l}</span></motion.div>}
                                </div>
                            )}
                            {step === 1 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-4">Medical History</h2>
                                    <div className="grid grid-cols-2 gap-3 mb-5">{CONDITIONS.map(c => (
                                        <button key={c} onClick={() => toggleCondition(c)} className={`py-3 px-4 rounded-xl text-sm font-medium transition ${form.medicalHistory.includes(c) ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10'}`}>{c}</button>
                                    ))}</div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Current Medications</label>
                                    <div className="flex gap-2"><input type="text" value={form.medicationInput} onChange={e => u('medicationInput', e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMed())} className="flex-1 px-4 py-3 input-premium rounded-xl text-white text-sm" placeholder="Add medication" /><button onClick={addMed} className="px-4 py-3 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition">Add</button></div>
                                    {form.currentMedications.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{form.currentMedications.map((m,i) => <span key={i} className="px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded-full text-sm flex items-center gap-1">{m}<button onClick={() => u('currentMedications', form.currentMedications.filter((_,j)=>j!==i))} className="hover:text-red-400 ml-1">×</button></span>)}</div>}
                                </div>
                            )}
                            {step === 2 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-4">Activity & Goals</h2>
                                    <p className="text-gray-500 text-sm mb-3">Activity Level:</p>
                                    <div className="grid grid-cols-2 gap-3 mb-5">{ACTIVITY_LEVELS.map(a => (
                                        <button key={a.value} onClick={() => u('activityLevel', a.value)} className={`p-4 rounded-xl text-left transition ${form.activityLevel === a.value ? 'bg-indigo-500/15 border border-indigo-500/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}><span className="text-2xl">{a.icon}</span><p className={`font-medium mt-1 text-sm ${form.activityLevel === a.value ? 'text-indigo-300' : 'text-white'}`}>{a.label}</p><p className="text-xs text-gray-600">{a.desc}</p></button>
                                    ))}</div>
                                    <p className="text-gray-500 text-sm mb-3">Goal:</p>
                                    <div className="grid grid-cols-2 gap-3">{GOALS.map(g => (
                                        <button key={g.value} onClick={() => u('goal', g.value)} className={`p-4 rounded-xl text-center transition ${form.goal === g.value ? 'bg-cyan-500/15 border border-cyan-500/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}><span className="text-2xl">{g.icon}</span><p className={`font-medium mt-1 text-sm ${form.goal === g.value ? 'text-cyan-300' : 'text-white'}`}>{g.label}</p></button>
                                    ))}</div>
                                </div>
                            )}
                            {step === 3 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-4">Choose Body Type</h2>
                                    <div className="grid grid-cols-3 gap-4">{BODY_TYPES.map(b => (
                                        <motion.button key={b.value} onClick={() => u('avatarBodyType', b.value)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            className={`p-6 rounded-2xl text-center transition ${form.avatarBodyType === b.value ? 'bg-indigo-500/15 border-2 border-indigo-400 shadow-lg shadow-indigo-500/10' : 'bg-white/5 border border-white/10'}`}>
                                            <div className="text-5xl mb-3">{b.emoji}</div><p className={`font-medium ${form.avatarBodyType === b.value ? 'text-indigo-300' : 'text-white'}`}>{b.label}</p></motion.button>
                                    ))}</div>
                                </div>
                            )}
                            {step === 4 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Your Digital Twin Summary</h2>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5"><p className="text-gray-500 text-xs">BMI</p><p className={`text-3xl font-bold ${bmiCat?.c}`}>{bmi}</p><span className={`px-3 py-1 rounded-full text-xs ${bmiCat?.bg} ${bmiCat?.c}`}>{bmiCat?.l}</span></div>
                                        <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5"><p className="text-gray-500 text-xs">Daily Calories</p><p className="text-3xl font-bold text-indigo-400">{tdee || '--'}</p><span className="text-xs text-gray-600">TDEE (kcal)</span></div>
                                        <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5"><p className="text-gray-500 text-xs">Goal</p><p className="text-lg font-bold text-cyan-400">{GOALS.find(g=>g.value===form.goal)?.label}</p></div>
                                        <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5"><p className="text-gray-500 text-xs">Body Type</p><p className="text-lg font-bold text-purple-400">{BODY_TYPES.find(b=>b.value===form.avatarBodyType)?.label}</p></div>
                                    </div>
                                    {form.medicalHistory.length > 0 && form.medicalHistory[0] !== 'None' && <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-5"><p className="text-orange-400 text-sm">⚠️ Medical: {form.medicalHistory.join(', ')}</p></div>}
                                    <motion.button onClick={handleSubmit} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 btn-premium text-white font-bold text-lg rounded-xl">🧬 Activate My Digital Twin</motion.button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    <div className="flex justify-between mt-8">
                        <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="px-6 py-2 bg-white/5 text-gray-500 rounded-xl hover:bg-white/10 transition disabled:opacity-20">Back</button>
                        {step < 4 && <button onClick={() => setStep(s => s+1)} disabled={!canNext()} className="px-6 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition disabled:opacity-20">Next</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
