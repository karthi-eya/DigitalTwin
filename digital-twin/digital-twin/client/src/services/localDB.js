// ─── LocalDB: localStorage-based database for the entire app ───

const DB_KEYS = {
    USERS: 'dt_users',
    CURRENT_USER: 'dt_current_user',
    PROFILES: 'dt_profiles',
    HEALTH_LOGS: 'dt_health_logs',
    SIMULATIONS: 'dt_simulations',
    APPOINTMENTS: 'dt_appointments',
    EMERGENCIES: 'dt_emergencies',
    RECOMMENDATIONS: 'dt_recommendations',
};

function getStore(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
}
function setStore(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function getObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; }
    catch { return null; }
}
function setObj(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

// ─── Auth ───
export function registerUser(name, email, password, role) {
    const users = getStore(DB_KEYS.USERS);
    if (users.find(u => u.email === email)) throw new Error('Email already registered');
    const user = { id: Date.now().toString(), name, email, password, role, createdAt: new Date().toISOString() };
    users.push(user);
    setStore(DB_KEYS.USERS, users);
    setObj(DB_KEYS.CURRENT_USER, { ...user, password: undefined });
    return { ...user, password: undefined };
}

export function loginUser(email, password) {
    const users = getStore(DB_KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const safeUser = { ...user, password: undefined };
    setObj(DB_KEYS.CURRENT_USER, safeUser);
    return safeUser;
}

export function getCurrentUser() { return getObj(DB_KEYS.CURRENT_USER); }
export function logoutUser() { localStorage.removeItem(DB_KEYS.CURRENT_USER); }

// ─── Patient Profile ───
export function saveProfile(userId, profileData) {
    const profiles = getStore(DB_KEYS.PROFILES);
    const existing = profiles.findIndex(p => p.userId === userId);
    const h = parseFloat(profileData.height) / 100;
    const w = parseFloat(profileData.weight);
    const bmi = parseFloat((w / (h * h)).toFixed(1));
    const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

    // TDEE calculation (Mifflin-St Jeor)
    const age = parseInt(profileData.age);
    let bmr = profileData.gender === 'male'
        ? 88.362 + (13.397 * w) + (4.799 * parseFloat(profileData.height)) - (5.677 * age)
        : 447.593 + (9.247 * w) + (3.098 * parseFloat(profileData.height)) - (4.330 * age);
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
    const tdee = Math.round(bmr * (multipliers[profileData.activityLevel] || 1.2));

    const profile = {
        userId,
        ...profileData,
        bmi, bmiCategory, tdee,
        age: parseInt(profileData.age),
        height: parseFloat(profileData.height),
        weight: parseFloat(profileData.weight),
        isSetup: true,
        updatedAt: new Date().toISOString()
    };

    if (existing >= 0) profiles[existing] = profile;
    else profiles.push(profile);
    setStore(DB_KEYS.PROFILES, profiles);
    return profile;
}

export function getProfile(userId) {
    return getStore(DB_KEYS.PROFILES).find(p => p.userId === userId) || null;
}

// ─── Health Logs ───
export function saveHealthLog(userId, logData) {
    const logs = getStore(DB_KEYS.HEALTH_LOGS);
    const today = new Date().toDateString();
    // Remove existing log for today
    const filtered = logs.filter(l => !(l.userId === userId && new Date(l.date).toDateString() === today));
    const log = {
        id: Date.now().toString(),
        userId,
        date: new Date().toISOString(),
        ...logData,
        createdAt: new Date().toISOString()
    };
    filtered.push(log);
    setStore(DB_KEYS.HEALTH_LOGS, filtered);
    return log;
}

export function getHealthLogs(userId) {
    return getStore(DB_KEYS.HEALTH_LOGS)
        .filter(l => l.userId === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getTodayLog(userId) {
    const today = new Date().toDateString();
    return getStore(DB_KEYS.HEALTH_LOGS).find(l => l.userId === userId && new Date(l.date).toDateString() === today) || null;
}

// ─── Simulations ───
export function saveSimulation(userId, simData) {
    const sims = getStore(DB_KEYS.SIMULATIONS);
    sims.push({ id: Date.now().toString(), userId, ...simData, date: new Date().toISOString() });
    setStore(DB_KEYS.SIMULATIONS, sims);
}

export function getLatestSimulation(userId) {
    return getStore(DB_KEYS.SIMULATIONS).filter(s => s.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
}

// ─── Appointments ───
export function createAppointment(patientId, doctorId, data) {
    const appts = getStore(DB_KEYS.APPOINTMENTS);
    const appt = { id: Date.now().toString(), patientId, doctorId, status: 'pending', ...data, createdAt: new Date().toISOString() };
    appts.push(appt);
    setStore(DB_KEYS.APPOINTMENTS, appts);
    return appt;
}

export function getAppointments(userId, role) {
    const appts = getStore(DB_KEYS.APPOINTMENTS);
    return role === 'doctor' ? appts.filter(a => a.doctorId === userId) : appts.filter(a => a.patientId === userId);
}

export function updateAppointment(apptId, updates) {
    const appts = getStore(DB_KEYS.APPOINTMENTS);
    const idx = appts.findIndex(a => a.id === apptId);
    if (idx >= 0) { appts[idx] = { ...appts[idx], ...updates }; setStore(DB_KEYS.APPOINTMENTS, appts); }
    return appts[idx];
}

// ─── Emergencies ───
export function createEmergency(patientId, message, triggerType) {
    const alerts = getStore(DB_KEYS.EMERGENCIES);
    // Find doctors to notify
    const users = getStore(DB_KEYS.USERS).filter(u => u.role === 'doctor');
    const alert = { id: Date.now().toString(), patientId, message, triggerType, resolved: false, triggeredAt: new Date().toISOString() };
    alerts.push(alert);
    setStore(DB_KEYS.EMERGENCIES, alerts);
    return alert;
}

export function getEmergencies() {
    return getStore(DB_KEYS.EMERGENCIES).filter(e => !e.resolved).sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));
}

export function resolveEmergency(alertId) {
    const alerts = getStore(DB_KEYS.EMERGENCIES);
    const idx = alerts.findIndex(a => a.id === alertId);
    if (idx >= 0) { alerts[idx].resolved = true; alerts[idx].resolvedAt = new Date().toISOString(); setStore(DB_KEYS.EMERGENCIES, alerts); }
}

// ─── Recommendations ───
export function addRecommendation(doctorId, patientId, text) {
    const recs = getStore(DB_KEYS.RECOMMENDATIONS);
    recs.push({ id: Date.now().toString(), doctorId, patientId, text, date: new Date().toISOString() });
    setStore(DB_KEYS.RECOMMENDATIONS, recs);
}

export function getRecommendations(patientId) {
    return getStore(DB_KEYS.RECOMMENDATIONS).filter(r => r.patientId === patientId).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ─── Doctor: Get all patients ───
export function getAllPatients() {
    const users = getStore(DB_KEYS.USERS).filter(u => u.role === 'patient');
    return users.map(u => {
        const profile = getProfile(u.id);
        const logs = getHealthLogs(u.id);
        const lastLog = logs[0];
        return {
            id: u.id,
            name: u.name,
            email: u.email,
            age: profile?.age || '--',
            bmi: profile?.bmi || '--',
            bmiCategory: profile?.bmiCategory || '--',
            weight: profile?.weight,
            height: profile?.height,
            medicalHistory: profile?.medicalHistory || [],
            lastScore: lastLog?.healthScore || null,
            lastLogDate: lastLog?.date || null,
            status: lastLog ? (lastLog.healthScore >= 60 ? 'stable' : lastLog.healthScore >= 35 ? 'at_risk' : 'emergency') : 'stable',
            totalLogs: logs.length
        };
    }).filter(p => getProfile(p.id)?.isSetup);
}

// ─── Doctor: Get all doctors (for patient search) ───
export function getAllDoctors() {
    const users = getStore(DB_KEYS.USERS).filter(u => u.role === 'doctor');
    return users.map(u => {
        const profile = getProfile(u.id);
        return { id: u.id, name: u.name, email: u.email, specialization: profile?.specialization || 'General', consultationType: profile?.consultationType || 'both' };
    });
}

export default {
    registerUser, loginUser, getCurrentUser, logoutUser,
    saveProfile, getProfile,
    saveHealthLog, getHealthLogs, getTodayLog,
    saveSimulation, getLatestSimulation,
    createAppointment, getAppointments, updateAppointment,
    createEmergency, getEmergencies, resolveEmergency,
    addRecommendation, getRecommendations,
    getAllPatients, getAllDoctors
};
