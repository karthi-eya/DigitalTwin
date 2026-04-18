// ─── Client-Side Symptom Mapper ───

const SYMPTOM_MAP = {
    'chest pain': { specialist: 'Cardiologist', urgency: 'high', weight: 10 },
    'heart pain': { specialist: 'Cardiologist', urgency: 'high', weight: 10 },
    'breathlessness': { specialist: 'Cardiologist', urgency: 'high', weight: 9 },
    'shortness of breath': { specialist: 'Cardiologist', urgency: 'high', weight: 9 },
    'palpitations': { specialist: 'Cardiologist', urgency: 'medium', weight: 7 },
    'joint pain': { specialist: 'Orthopedic', urgency: 'medium', weight: 6 },
    'back pain': { specialist: 'Orthopedic', urgency: 'medium', weight: 6 },
    'knee pain': { specialist: 'Orthopedic', urgency: 'medium', weight: 6 },
    'fracture': { specialist: 'Orthopedic', urgency: 'high', weight: 9 },
    'muscle pain': { specialist: 'Physiotherapist', urgency: 'low', weight: 4 },
    'skin rash': { specialist: 'Dermatologist', urgency: 'low', weight: 4 },
    'rash': { specialist: 'Dermatologist', urgency: 'low', weight: 4 },
    'acne': { specialist: 'Dermatologist', urgency: 'low', weight: 3 },
    'itching': { specialist: 'Dermatologist', urgency: 'low', weight: 3 },
    'hair loss': { specialist: 'Dermatologist', urgency: 'low', weight: 3 },
    'stomach pain': { specialist: 'Gastroenterologist', urgency: 'medium', weight: 6 },
    'abdominal pain': { specialist: 'Gastroenterologist', urgency: 'medium', weight: 6 },
    'nausea': { specialist: 'Gastroenterologist', urgency: 'medium', weight: 5 },
    'vomiting': { specialist: 'Gastroenterologist', urgency: 'medium', weight: 6 },
    'diarrhea': { specialist: 'Gastroenterologist', urgency: 'medium', weight: 5 },
    'acidity': { specialist: 'Gastroenterologist', urgency: 'low', weight: 4 },
    'bloating': { specialist: 'Gastroenterologist', urgency: 'low', weight: 3 },
    'fever': { specialist: 'General Physician', urgency: 'medium', weight: 5 },
    'cold': { specialist: 'General Physician', urgency: 'low', weight: 3 },
    'cough': { specialist: 'General Physician', urgency: 'low', weight: 3 },
    'fatigue': { specialist: 'General Physician', urgency: 'low', weight: 3 },
    'weakness': { specialist: 'General Physician', urgency: 'medium', weight: 4 },
    'headache': { specialist: 'General Physician', urgency: 'low', weight: 3 },
    'body ache': { specialist: 'General Physician', urgency: 'low', weight: 3 },
    'sore throat': { specialist: 'General Physician', urgency: 'low', weight: 3 },
    'anxiety': { specialist: 'Psychiatrist', urgency: 'medium', weight: 6 },
    'depression': { specialist: 'Psychiatrist', urgency: 'medium', weight: 7 },
    'stress': { specialist: 'Psychiatrist', urgency: 'low', weight: 4 },
    'insomnia': { specialist: 'Psychiatrist', urgency: 'medium', weight: 5 },
    'panic attack': { specialist: 'Psychiatrist', urgency: 'high', weight: 8 },
    'seizure': { specialist: 'Neurologist', urgency: 'high', weight: 9 },
    'numbness': { specialist: 'Neurologist', urgency: 'medium', weight: 6 },
    'migraine': { specialist: 'Neurologist', urgency: 'medium', weight: 6 },
    'dizziness': { specialist: 'Neurologist', urgency: 'medium', weight: 5 },
    'fainting': { specialist: 'Neurologist', urgency: 'high', weight: 8 },
    'ear pain': { specialist: 'ENT Specialist', urgency: 'medium', weight: 5 },
    'hearing loss': { specialist: 'ENT Specialist', urgency: 'medium', weight: 6 },
    'sinus': { specialist: 'ENT Specialist', urgency: 'low', weight: 4 },
    'eye pain': { specialist: 'Ophthalmologist', urgency: 'medium', weight: 5 },
    'blurred vision': { specialist: 'Ophthalmologist', urgency: 'medium', weight: 6 },
    'vision loss': { specialist: 'Ophthalmologist', urgency: 'high', weight: 9 },
    'bleeding': { specialist: 'Emergency Medicine', urgency: 'high', weight: 9 },
    'severe pain': { specialist: 'Emergency Medicine', urgency: 'high', weight: 8 },
    'accident': { specialist: 'Emergency Medicine', urgency: 'emergency', weight: 10 },
    'unconscious': { specialist: 'Emergency Medicine', urgency: 'emergency', weight: 10 },
    'burn': { specialist: 'Emergency Medicine', urgency: 'high', weight: 8 },
};

const URGENCY_ORDER = { emergency: 4, high: 3, medium: 2, low: 1 };
const URGENCY_MESSAGES = {
    emergency: '🚨 EMERGENCY: Seek immediate medical attention or call 112/108!',
    high: '⚠️ Urgent: Consult a specialist within 24 hours.',
    medium: 'Schedule an appointment within the next few days.',
    low: 'Not critical — consult at your convenience.'
};

export function mapSymptoms(text) {
    const lower = text.toLowerCase().trim();
    const matched = [];

    for (const [keyword, data] of Object.entries(SYMPTOM_MAP)) {
        if (lower.includes(keyword)) {
            matched.push(data);
        }
    }

    if (matched.length === 0) {
        return {
            specialists: ['General Physician'],
            urgency: 'low',
            message: 'Based on your symptoms, start with a General Physician for initial evaluation.'
        };
    }

    const maxUrgency = matched.reduce((max, m) => URGENCY_ORDER[m.urgency] > URGENCY_ORDER[max] ? m.urgency : max, 'low');

    const specialistScores = {};
    matched.forEach(m => {
        specialistScores[m.specialist] = (specialistScores[m.specialist] || 0) + m.weight;
    });

    const sorted = Object.keys(specialistScores).sort((a, b) => specialistScores[b] - specialistScores[a]);
    if (!sorted.includes('General Physician')) sorted.push('General Physician');

    return {
        specialists: sorted.slice(0, 4),
        urgency: maxUrgency,
        message: URGENCY_MESSAGES[maxUrgency]
    };
}

export default mapSymptoms;
