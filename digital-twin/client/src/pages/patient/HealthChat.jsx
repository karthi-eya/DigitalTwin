import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { mapSymptoms } from '../../services/symptomMapper';
import { getAllDoctors, createAppointment, getHealthLogs } from '../../services/localDB';

const HealthChat = () => {
    const { user, profile } = useAuth();
    const [messages, setMessages] = useState([
        { role: 'bot', text: `Hi ${user?.name || 'there'}! 👋 I'm your AI Health Assistant. I can help with:\n\n• 📊 BMI & health data analysis\n• 🍽️ Diet recommendations\n• 🤒 Symptom checking & doctor finder\n• 🏃 Fitness tips\n\nTry asking me something!`, time: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const endRef = useRef(null);
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const quickActions = [
        { label: '📊 My BMI', text: 'What is my BMI?' },
        { label: '🍽️ Diet plan', text: 'What should I eat today?' },
        { label: '🤒 Symptom', text: 'I have a headache and fever' },
        { label: '👨‍⚕️ Find doctor', text: 'Find me a doctor' },
        { label: '📈 My score', text: 'What is my health score?' },
    ];

    const addBot = (text) => setMessages(prev => [...prev, { role: 'bot', text, time: new Date() }]);

    const send = (text) => {
        const msg = (text || input).trim();
        if (!msg) return;
        setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date() }]);
        setInput('');
        setTyping(true);

        setTimeout(() => {
            const lower = msg.toLowerCase();

            // BMI query
            if (lower.includes('bmi') || lower.includes('weight') || lower.includes('height')) {
                if (profile) {
                    addBot(`📊 **Your Health Metrics:**\n\n• Weight: ${profile.weight} kg\n• Height: ${profile.height} cm\n• BMI: **${profile.bmi}** (${profile.bmiCategory})\n• TDEE: ${profile.tdee} kcal/day\n• Activity: ${profile.activityLevel}\n\n${profile.bmi >= 25 ? '⚠️ Your BMI is above normal. Consider increasing physical activity and watching calorie intake.' : profile.bmi < 18.5 ? '⚠️ Your BMI is below normal. Consider increasing calorie intake with nutritious foods.' : '✅ Your BMI is in the healthy range! Keep maintaining your lifestyle.'}`);
                } else {
                    addBot('Please complete your profile setup first to see BMI data.');
                }
            }
            // Health score
            else if (lower.includes('score') || lower.includes('health score') || lower.includes('how am i doing')) {
                const logs = getHealthLogs(user?.id);
                if (logs.length > 0) {
                    const latest = logs[0];
                    const avg = Math.round(logs.slice(0, 7).reduce((s, l) => s + (l.healthScore || 0), 0) / Math.min(7, logs.length));
                    addBot(`📈 **Your Health Score Analysis:**\n\n• Today's Score: **${latest.healthScore}/100**\n• 7-Day Average: **${avg}/100**\n• Total Logs: ${logs.length}\n\n**Breakdown:**\n• Diet: ${latest.scoreBreakdown?.diet}/35\n• Activity: ${latest.scoreBreakdown?.activity}/30\n• Hydration: ${latest.scoreBreakdown?.hydration}/25\n• Sleep: ${latest.scoreBreakdown?.sleep}/10\n\n${latest.feedbackMessages?.map(m => `💡 ${m}`).join('\n') || ''}`);
                } else {
                    addBot('No health logs yet! Go to "Log Today" to submit your first daily log and get a health score.');
                }
            }
            // Diet / food
            else if (lower.includes('eat') || lower.includes('diet') || lower.includes('food') || lower.includes('nutrition') || lower.includes('meal')) {
                const tdee = profile?.tdee || 2000;
                const goal = profile?.goal || 'maintain';
                let calTarget = tdee;
                if (goal === 'lose_weight') calTarget = tdee - 400;
                if (goal === 'gain_muscle') calTarget = tdee + 300;
                addBot(`🍽️ **Personalized Diet Plan** (Goal: ${goal.replace('_', ' ')})\nTarget: ~${calTarget} kcal/day\n\n**🌅 Breakfast (~${Math.round(calTarget * 0.25)} kcal):**\n• 1 cup oats with banana + almonds\n• OR 2 idli + sambar + 1 cup milk\n\n**🌞 Lunch (~${Math.round(calTarget * 0.35)} kcal):**\n• 1 cup rice + 1 cup dal + sabzi + curd\n• OR 2 roti + chicken curry + salad\n\n**🍌 Snack (~${Math.round(calTarget * 0.1)} kcal):**\n• 1 banana + handful of peanuts\n• OR 1 cup buttermilk + 2 biscuits\n\n**🌙 Dinner (~${Math.round(calTarget * 0.3)} kcal):**\n• 2 roti + paneer/egg curry + salad\n• OR 1 cup brown rice + rajma + curd\n\n💡 Protein: Aim for ${Math.round(profile?.weight * 1.2 || 80)}g/day\n💧 Water: 8+ glasses`);
            }
            // Find doctor
            else if (lower.includes('doctor') || lower.includes('find') || lower.includes('specialist') || lower.includes('appointment')) {
                const doctors = getAllDoctors();
                if (doctors.length > 0) {
                    const list = doctors.map(d => `• Dr. ${d.name} — ${d.specialization} (${d.consultationType})`).join('\n');
                    addBot(`👨‍⚕️ **Available Doctors:**\n\n${list}\n\nTo book an appointment, describe your symptoms and I'll recommend the right specialist.`);
                } else {
                    addBot(`👨‍⚕️ No doctors registered yet on the platform.\n\nAvailable specialist types:\n• General Physician\n• Cardiologist\n• Orthopedic\n• Dermatologist\n• Neurologist\n• Psychiatrist\n• Gastroenterologist\n\nDescribe your symptoms and I'll tell you which specialist to see.`);
                }
            }
            // Symptom detection
            else if (['pain', 'ache', 'fever', 'cough', 'headache', 'nausea', 'dizzy', 'rash', 'breathing', 'anxiety', 'depression', 'chest', 'stomach', 'joint', 'skin', 'tired', 'fatigue', 'vomiting', 'diarrhea', 'itching', 'blurred', 'bleeding', 'numbness', 'seizure', 'burn', 'insomnia', 'stress'].some(k => lower.includes(k))) {
                const result = mapSymptoms(msg);
                const urgencyEmoji = { emergency: '🚨', high: '⚠️', medium: '⚡', low: 'ℹ️' };
                addBot(`🩺 **Symptom Analysis:**\n\n${urgencyEmoji[result.urgency]} ${result.message}\n\n**Recommended Specialists:**\n${result.specialists.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${result.urgency === 'high' || result.urgency === 'emergency' ? '⚠️ Please consult a doctor immediately!' : 'Would you like me to help you find a doctor?'}`);
            }
            // Fitness tips
            else if (lower.includes('exercise') || lower.includes('fitness') || lower.includes('workout') || lower.includes('gym')) {
                const level = profile?.activityLevel || 'sedentary';
                addBot(`🏃 **Fitness Recommendations** (Level: ${level})\n\n${level === 'sedentary' ? '**Start Slow:**\n• Walk 30 min daily\n• Body-weight squats: 3x10\n• Stretching: 15 min\n• Goal: 5000 steps/day' : level === 'light' ? '**Build Consistency:**\n• Walk 45 min or jog 20 min\n• Push-ups: 3x15\n• Squats: 3x15\n• Goal: 7000 steps/day' : '**Level Up:**\n• Run 30 min or 1 hour gym\n• Weight training: 4x/week\n• Active recovery: yoga\n• Goal: 10000+ steps/day'}\n\n💡 Remember to warm up and stay hydrated!`);
            }
            // Default
            else {
                addBot(`Thanks for your message! I can help with:\n\n• 📊 "What's my BMI?" — View health metrics\n• 📈 "What's my health score?" — Score analysis\n• 🍽️ "What should I eat?" — Diet plan\n• 🤒 "I have chest pain" — Symptom check\n• 👨‍⚕️ "Find a doctor" — Doctor search\n• 🏃 "Exercise tips" — Fitness plan\n\nTry one of these!`);
            }

            setTyping(false);
        }, 1200);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            <h2 className="text-2xl font-bold text-white mb-4">💬 AI Health Assistant</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                <AnimatePresence>{messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-5 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-md' : 'glass-card text-gray-200 rounded-bl-md'}`}>
                            {msg.role === 'bot' && <span className="text-xs text-indigo-400 font-medium block mb-1">🤖 Health AI</span>}
                            <p className="text-sm whitespace-pre-line">{msg.text}</p>
                            <p className="text-[10px] opacity-40 mt-1">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </motion.div>
                ))}</AnimatePresence>
                {typing && <div className="flex justify-start"><div className="glass-card px-5 py-3 rounded-2xl rounded-bl-md"><div className="flex gap-1.5">{[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 bg-indigo-400 rounded-full" animate={{ y: [0,-8,0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />)}</div></div></div>}
                <div ref={endRef} />
            </div>
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">{quickActions.map(a => (
                <button key={a.label} onClick={() => send(a.text)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-500 text-sm whitespace-nowrap hover:bg-white/10 hover:text-white transition">{a.label}</button>
            ))}</div>
            <div className="flex gap-3">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                    className="flex-1 px-5 py-3 input-premium rounded-xl text-white text-sm" placeholder="Ask about your health..." />
                <motion.button onClick={() => send()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 btn-premium text-white rounded-xl text-sm">Send</motion.button>
            </div>
        </div>
    );
};

export default HealthChat;
