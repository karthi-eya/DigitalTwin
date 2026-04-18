import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { saveHealthLog, getHealthLogs, getTodayLog } from '../../services/localDB';
import { parseFood } from '../../services/foodParser';
import { calculateHealthScore } from '../../services/healthScore';

const DailyLog = ({ onLogSaved }) => {
    const { profile } = useAuth();
    const [foodText, setFoodText] = useState('');
    const [parsedFood, setParsedFood] = useState(null);
    const [steps, setSteps] = useState(5000);
    const [workoutType, setWorkoutType] = useState('none');
    const [workoutDuration, setWorkoutDuration] = useState(30);
    const [sleepHours, setSleepHours] = useState(7);
    const [sleepQuality, setSleepQuality] = useState('good');
    const [waterGlasses, setWaterGlasses] = useState(4);
    const [result, setResult] = useState(null);

    const handleParseFood = () => {
        if (!foodText.trim()) return toast.error('Enter food items first');
        const parsed = parseFood(foodText);
        setParsedFood(parsed);
        toast.success(`Parsed ${parsed.items.length} food items!`);
    };

    const handleSubmit = () => {
        const food = parsedFood || parseFood(foodText);
        const totalCalories = food.totals.calories;
        const totalProtein = food.totals.protein;
        const totalCarbs = food.totals.carbs;
        const totalFats = food.totals.fats;

        const { healthScore, scoreBreakdown, feedbackMessages } = calculateHealthScore({
            totalCalories, tdee: profile?.tdee || 2000,
            steps, workoutDuration, workoutType, sleepHours, sleepQuality, waterGlasses
        });

        const logData = {
            foodText, foodItems: food.items,
            totalCalories, totalProtein, totalCarbs, totalFats,
            steps, workoutType, workoutDuration,
            sleepHours, sleepQuality, waterGlasses,
            healthScore, scoreBreakdown, feedbackMessages
        };

        saveHealthLog(profile?.userId || 'demo', logData);
        setResult({ healthScore, scoreBreakdown, feedbackMessages });
        toast.success(`Health Score: ${healthScore}/100`);
        if (onLogSaved) onLogSaved();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">📝 Log Today's Health Data</h2>
            <AnimatePresence mode="wait">
                {result ? (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                            <div className="text-7xl mb-4">{result.healthScore >= 70 ? '🎉' : result.healthScore >= 40 ? '👍' : '💪'}</div>
                            <p className="text-gray-400 text-lg">Your Health Score</p>
                            <p className={`text-6xl font-bold mt-2 ${result.healthScore >= 70 ? 'text-green-400' : result.healthScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{result.healthScore}</p>
                        </motion.div>
                        <div className="grid grid-cols-4 gap-4 mt-8">
                            {[{ l: 'Diet', v: result.scoreBreakdown?.diet, m: 35, c: 'text-blue-400' }, { l: 'Activity', v: result.scoreBreakdown?.activity, m: 30, c: 'text-green-400' }, { l: 'Hydration', v: result.scoreBreakdown?.hydration, m: 25, c: 'text-cyan-400' }, { l: 'Sleep', v: result.scoreBreakdown?.sleep, m: 10, c: 'text-purple-400' }].map(s => (
                                <div key={s.l} className="bg-white/5 rounded-xl p-3 border border-white/5"><p className="text-gray-600 text-xs">{s.l}</p><p className={`font-bold text-lg ${s.c}`}>{s.v}/{s.m}</p></div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-2 text-left">
                            {result.feedbackMessages?.map((msg, i) => <p key={i} className="text-gray-400 text-sm flex items-start gap-2">💡 {msg}</p>)}
                        </div>
                        <button onClick={() => setResult(null)} className="mt-6 px-6 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition">Log Another Day</button>
                    </motion.div>
                ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Food */}
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-3">🍽️ Food Intake</h3>
                            <p className="text-gray-600 text-xs mb-2">Enter what you ate, separated by commas or "and". Example: 2 roti, 1 cup rice, 1 banana, 1 cup dal</p>
                            <textarea value={foodText} onChange={e => setFoodText(e.target.value)} rows="3"
                                className="w-full px-4 py-3 input-premium rounded-xl text-white text-sm resize-none" placeholder="2 roti + 1 cup rice + 1 banana + 1 cup dal + 1 cup milk" />
                            <button onClick={handleParseFood} className="mt-3 px-5 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition text-sm">🔍 Parse Food</button>
                            {parsedFood && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="grid grid-cols-4 gap-3 text-center mb-3">
                                            <div><p className="text-orange-400 font-bold text-lg">{parsedFood.totals.calories}</p><p className="text-gray-600 text-xs">Calories</p></div>
                                            <div><p className="text-blue-400 font-bold text-lg">{parsedFood.totals.protein}g</p><p className="text-gray-600 text-xs">Protein</p></div>
                                            <div><p className="text-yellow-400 font-bold text-lg">{parsedFood.totals.carbs}g</p><p className="text-gray-600 text-xs">Carbs</p></div>
                                            <div><p className="text-red-400 font-bold text-lg">{parsedFood.totals.fats}g</p><p className="text-gray-600 text-xs">Fats</p></div>
                                        </div>
                                        <div className="space-y-1">{parsedFood.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-xs text-gray-400 py-1 border-t border-white/5">
                                                <span>{item.name} {item.estimated ? '(estimated)' : ''}</span>
                                                <span>{item.calories} kcal</span>
                                            </div>
                                        ))}</div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        {/* Activity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-white font-semibold mb-3">👣 Steps</h3>
                                <input type="range" min="0" max="25000" step="500" value={steps} onChange={e => setSteps(parseInt(e.target.value))} className="w-full" />
                                <p className="text-green-400 font-bold text-2xl mt-2">{steps.toLocaleString()}</p>
                            </div>
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-white font-semibold mb-3">🏋️ Workout</h3>
                                <select value={workoutType} onChange={e => setWorkoutType(e.target.value)} className="w-full px-4 py-2 input-premium rounded-xl text-white text-sm mb-2">
                                    {['none','cardio','strength','yoga','sports'].map(t => <option key={t} value={t} className="bg-slate-800">{t[0].toUpperCase()+t.slice(1)}</option>)}
                                </select>
                                {workoutType !== 'none' && <><input type="range" min="0" max="120" step="5" value={workoutDuration} onChange={e => setWorkoutDuration(parseInt(e.target.value))} className="w-full" /><p className="text-purple-400 font-medium text-sm">{workoutDuration} min</p></>}
                            </div>
                        </div>
                        {/* Sleep & Water */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-white font-semibold mb-3">😴 Sleep</h3>
                                <input type="range" min="0" max="12" step="0.5" value={sleepHours} onChange={e => setSleepHours(parseFloat(e.target.value))} className="w-full" />
                                <p className="text-indigo-400 font-bold text-2xl mt-2">{sleepHours} hrs</p>
                                <div className="flex gap-2 mt-3">{['good','fair','poor'].map(q => (
                                    <button key={q} onClick={() => setSleepQuality(q)} className={`flex-1 py-2 rounded-lg text-sm transition ${sleepQuality === q ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-white/5 text-gray-500 border border-white/10'}`}>{q[0].toUpperCase()+q.slice(1)}</button>
                                ))}</div>
                            </div>
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-white font-semibold mb-3">💧 Water</h3>
                                <div className="flex items-center justify-center gap-4">
                                    <button onClick={() => setWaterGlasses(Math.max(0, waterGlasses-1))} className="w-12 h-12 rounded-full bg-white/5 text-white text-xl hover:bg-white/10 transition border border-white/10">-</button>
                                    <p className="text-cyan-400 font-bold text-4xl w-16 text-center">{waterGlasses}</p>
                                    <button onClick={() => setWaterGlasses(Math.min(16, waterGlasses+1))} className="w-12 h-12 rounded-full bg-white/5 text-white text-xl hover:bg-white/10 transition border border-white/10">+</button>
                                </div>
                                <p className="text-gray-600 text-center mt-2 text-sm">glasses (target: 8)</p>
                                <div className="flex justify-center gap-1 mt-3">{Array.from({length:8}).map((_,i) => (
                                    <div key={i} className={`w-5 h-8 rounded-sm transition ${i < waterGlasses ? 'bg-cyan-500' : 'bg-white/5'}`} />
                                ))}</div>
                            </div>
                        </div>
                        <motion.button onClick={handleSubmit} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="w-full py-4 btn-premium text-white font-bold text-lg rounded-xl">
                            📊 Submit Daily Log & Get Score
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyLog;
