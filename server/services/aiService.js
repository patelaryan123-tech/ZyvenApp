// ─── AI Provider Configuration ───────────────────────────────────────────────
// Priority: Groq API (cloud, always available) → Ollama (local fallback)

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

if (GROQ_API_KEY) {
  console.log(`✅ Groq AI initialized (model: ${GROQ_MODEL})`);
} else {
  console.log(`⚠️  No GROQ_API_KEY found — falling back to Ollama at ${OLLAMA_BASE_URL}`);
}

// ─── Groq API Call ───────────────────────────────────────────────────────────
const callGroq = async (userPrompt, systemPrompt = '') => {
  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

// ─── Ollama API Call (fallback) ───────────────────────────────────────────────
const callOllama = async (prompt, systemPrompt = '') => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      system: systemPrompt,
      stream: false,
      options: { temperature: 0.3 }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.response || '';
};

// ─── Unified AI Call (Groq first, Ollama fallback) ───────────────────────────
const callAI = async (prompt, systemPrompt = '') => {
  let groqErr = null;
  if (GROQ_API_KEY) {
    try {
      return await callGroq(prompt, systemPrompt);
    } catch (err) {
      groqErr = err;
      console.error('Groq failed, trying Ollama fallback:', err.message);
    }
  } else {
    console.warn('⚠️ GROQ_API_KEY is not defined in environment variables!');
  }

  // Fallback to Ollama
  try {
    return await callOllama(prompt, systemPrompt);
  } catch (ollamaErr) {
    console.error('Ollama fallback also failed:', ollamaErr.message);
    throw new Error(`AI generation failed. Groq: ${groqErr ? groqErr.message : 'No API key set'}. Ollama: ${ollamaErr.message}`);
  }
};

// ─── JSON Extractor ───────────────────────────────────────────────────────────
const extractJSON = (text) => {
  if (!text) return null;
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
};

// ─── Chat with AI ─────────────────────────────────────────────────────────────
const chatWithAI = async (message, conversationHistory, language = 'en') => {
  try {
    const systemPrompt = `You are a helpful, empathetic healthcare assistant for the ZYVEN platform.
Respond in ${language === 'hi' ? 'Hindi' : 'English'}. Keep answers concise, warm, and clear for seniors and caregivers.
IMPORTANT: End every response with: 'Disclaimer: This is AI-generated information and not a medical diagnosis.'`;

    const prompt = `Conversation History:\n${JSON.stringify(conversationHistory || [])}\n\nUser Message: ${message}`;

    const reply = await callAI(prompt, systemPrompt);
    return reply.trim();
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    return `I am currently unable to reach the AI assistant. Please check your internet connection and try again.\n\nDisclaimer: This is AI-generated information and not a medical diagnosis.`;
  }
};

// ─── Analyze Medical Report ───────────────────────────────────────────────────
const analyzeReport = async (extractedText, reportType) => {
  try {
    const systemPrompt = `You are a medical document analyzer. Analyze the provided medical report and return ONLY a valid JSON object without any markdown code blocks or explanatory text.`;

    const prompt = `Report Type: ${reportType}
Report Content:
${extractedText}

Respond ONLY in this exact JSON format:
{
  "summary": "Brief overall summary of the report",
  "keyFindings": ["Key finding 1", "Key finding 2"],
  "abnormalValues": ["Abnormal value 1 with explanation"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "questionsForDoctor": ["Question 1 to ask the doctor"]
}`;

    const rawResponse = await callAI(prompt, systemPrompt);
    const parsed = extractJSON(rawResponse);

    if (parsed && parsed.summary) return parsed;

    return {
      summary: rawResponse.substring(0, 300) || 'Medical report processed.',
      keyFindings: ['Extracted report details'],
      abnormalValues: [],
      recommendations: ['Consult with a primary care physician to review full findings'],
      questionsForDoctor: ['What do these test results mean for my ongoing care plan?']
    };
  } catch (error) {
    console.error('Error in analyzeReport:', error);
    throw new Error('Failed to analyze report using AI');
  }
};

// ─── Government Scheme Recommendations ───────────────────────────────────────
const getSchemeRecommendations = async (userProfile) => {
  try {
    const prompt = `Based on the following user profile, suggest matching healthcare/pension government scheme categories:
Profile: ${JSON.stringify(userProfile)}

Return a comma-separated list of categories (e.g. Healthcare, Pension, Senior Welfare).`;

    const reply = await callAI(prompt, 'You match citizens to government welfare categories.');
    return reply.trim() || 'Healthcare, Pension';
  } catch (error) {
    console.error('Error in getSchemeRecommendations:', error);
    return 'Healthcare, Pension';
  }
};

// ─── Analyze Symptoms ─────────────────────────────────────────────────────────
const analyzeSymptoms = async (symptoms, age, gender, duration, severity, existingConditions = []) => {
  try {
    const systemPrompt = `You are a senior healthcare triage evaluator. Return ONLY a valid JSON object matching the requested schema. No markdown tags, no extra prose.`;

    const prompt = `Evaluate the following reported symptoms for a senior patient:
Symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}
Age: ${age || 65}
Gender: ${gender || 'Unspecified'}
Duration: ${duration || 'Recent'}
Severity Scale (1-10): ${severity || 5}
Existing Medical Conditions: ${Array.isArray(existingConditions) ? existingConditions.join(', ') : (existingConditions || 'None')}

Return ONLY a valid JSON object with this exact structure:
{
  "urgencyLevel": "Low" | "Moderate" | "Urgent",
  "summary": "Reassuring, clear symptom summary",
  "possibleCauses": ["Possible cause 1", "Possible cause 2"],
  "redFlags": ["Warning sign 1", "Warning sign 2"],
  "recommendedActions": ["Recommended action 1", "Recommended action 2"],
  "emergencyNotice": "Emergency notice string if Urgent, else null"
}`;

    const rawResponse = await callAI(prompt, systemPrompt);
    const parsed = extractJSON(rawResponse);

    if (parsed && parsed.urgencyLevel && parsed.summary) return parsed;

    return {
      urgencyLevel: severity > 7 ? 'Urgent' : (severity > 4 ? 'Moderate' : 'Low'),
      summary: 'Symptom details received and analyzed by ZYVEN AI Triage.',
      possibleCauses: ['Requires clinical evaluation by a physician'],
      redFlags: ['Shortness of breath', 'Chest pain or pressure', 'Sudden dizziness or numbness'],
      recommendedActions: ['Rest and monitor symptoms', 'Schedule an appointment with your primary care provider'],
      emergencyNotice: severity > 7 ? 'If experiencing acute distress, call emergency services or tap the SOS button immediately.' : null
    };
  } catch (error) {
    console.error('Error in analyzeSymptoms:', error);
    return {
      urgencyLevel: severity > 7 ? 'Urgent' : 'Moderate',
      summary: 'Symptom evaluation processed. Please consult a medical professional for advice.',
      possibleCauses: ['Clinical consultation recommended'],
      redFlags: ['Chest pain', 'Shortness of breath', 'Unexplained weakness'],
      recommendedActions: ['Consult your healthcare provider'],
      emergencyNotice: 'Disclaimer: This is AI-generated advice and not a medical diagnosis.'
    };
  }
};

module.exports = {
  chatWithAI,
  analyzeReport,
  getSchemeRecommendations,
  analyzeSymptoms
};
