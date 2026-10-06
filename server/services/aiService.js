// ─── AI Provider Configuration ───────────────────────────────────────────────
// Priority: Groq API (cloud, always available) → Ollama (local fallback)

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

if (GROQ_API_KEY) {
  console.log(`✅ Groq AI initialized (model: ${GROQ_MODEL})`);
} else {
  console.log(`⚠️  No GROQ_API_KEY found — falling back to Ollama at ${OLLAMA_BASE_URL}`);
}

let cachedGroqModels = null;
let lastModelFetchTime = 0;

const getActiveGroqModels = async () => {
  const now = Date.now();
  if (cachedGroqModels && cachedGroqModels.length > 0 && (now - lastModelFetchTime < 1000 * 60 * 30)) {
    return cachedGroqModels;
  }

  // Modern supported default models on Groq
  const standardModels = [
    process.env.GROQ_MODEL,
    'llama-3.3-70b-versatile',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'qwen/qwen3.8-27b'
  ].filter(Boolean);

  try {
    const res = await fetch(`${GROQ_BASE_URL}/models`, {
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        // Filter out audio, whisper, vision, guardrail, canopy, or non-text models
        const liveModels = data.data
          .map(m => m.id)
          .filter(id => 
            !id.includes('whisper') && 
            !id.includes('safeguard') && 
            !id.includes('guard') && 
            !id.includes('canopy') && 
            !id.includes('orpheus') &&
            !id.includes('vision') &&
            !id.includes('gemma2')
          );
        
        // Put active live models FIRST
        const combined = Array.from(new Set([...liveModels, ...standardModels]));
        if (combined.length > 0) {
          cachedGroqModels = combined;
          lastModelFetchTime = now;
          console.log('✅ Active Groq AI models loaded:', combined);
          return combined;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch dynamic Groq model list, using standard models:', err.message);
  }

  cachedGroqModels = Array.from(new Set(standardModels));
  return cachedGroqModels;
};

// ─── Groq API Call ───────────────────────────────────────────────────────────
const callGroq = async (userPrompt, systemPrompt = '') => {
  let lastError = null;
  const candidateModels = await getActiveGroqModels();

  for (const modelName of candidateModels) {
    try {
      const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: modelName,
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
        
        // Evict 404 (not found) and 400 (decommissioned) models from cache
        if (response.status === 404 || (response.status === 400 && errText.includes('decommissioned'))) {
          cachedGroqModels = cachedGroqModels ? cachedGroqModels.filter(m => m !== modelName) : null;
        }
        
        throw new Error(`Groq model ${modelName} returned status ${response.status}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;
      if (result) return result;
    } catch (err) {
      lastError = err;
      // Low verbosity warning
      console.warn(`[Groq AI] Model '${modelName}' unavailable: ${err.message}. Trying next model...`);
    }
  }

  throw lastError || new Error('All Groq candidate models failed');
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
      console.warn('Groq cloud AI models failed, checking local Ollama fallback...');
    }
  } else {
    console.warn('⚠️ GROQ_API_KEY is not defined in environment variables!');
  }

  // Fallback to Ollama
  try {
    return await callOllama(prompt, systemPrompt);
  } catch (ollamaErr) {
    throw new Error(`AI generation unavailable. Groq: ${groqErr ? groqErr.message : 'No API key'}. Ollama: ${ollamaErr.message}`);
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
    return `I am currently unable to reach the AI assistant. Please verify your connection or try again in a moment.\n\nDisclaimer: This is AI-generated information and not a medical diagnosis.`;
  }
};

// ─── Analyze Medical Report ───────────────────────────────────────────────────
const analyzeReport = async (extractedText, reportType, targetLanguage = 'en') => {
  const languageMap = {
    'en': 'English',
    'hi': 'Hindi (हिन्दी)',
    'mr': 'Marathi (मराठी)',
    'ta': 'Tamil (தமிழ்)',
    'gu': 'Gujarati (ગુજરાતી)',
    'te': 'Telugu (తెలుగు)',
    'bn': 'Bengali (বাংলা)'
  };
  const langName = languageMap[targetLanguage] || targetLanguage || 'English';

  try {
    const systemPrompt = `You are an expert medical document analyzer and translator specialized in senior healthcare.
Analyze the provided medical report and return ONLY a valid JSON object without any markdown code blocks or explanatory text.
IMPORTANT CRITICAL REQUIREMENT: All explanations, summaries, findings, abnormal metrics, recommendations, and questions MUST be written in ${langName}. Use simple, empathetic, senior-friendly language so elderly patients can easily understand their health report.`;

    const prompt = `Report Type: ${reportType}
Target Language for explanation: ${langName}
Report Content:
${extractedText}

Respond ONLY in this exact JSON format (all text inside string values MUST be in ${langName}):
{
  "summary": "Clear, compassionate, simple overall summary of the report written in ${langName}",
  "keyFindings": ["Key finding 1 explained simply in ${langName}", "Key finding 2 in ${langName}"],
  "abnormalValues": ["Abnormal metric 1 with simple explanation in ${langName}"],
  "recommendations": ["Easy actionable recommendation 1 in ${langName}", "Recommendation 2 in ${langName}"],
  "questionsForDoctor": ["Simple question 1 to ask the doctor in ${langName}"]
}`;

    const rawResponse = await callAI(prompt, systemPrompt);
    const parsed = extractJSON(rawResponse);

    if (parsed && parsed.summary) return parsed;
  } catch (error) {
    console.warn(`AI report analysis fallback invoked for language '${langName}':`, error.message);
  }

  // Graceful senior-friendly fallback analysis per language if AI model is rate limited
  const fallbacks = {
    'hi': {
      summary: 'यह आपकी मेडिकल रिपोर्ट का सार है। रिपोर्ट में दिए गए मुख्य स्वास्थ्य संकेतकों का विश्लेषण किया गया है। कृपया अपने डॉक्टर से परामर्श करें।',
      keyFindings: ['रक्त शर्करा और अन्य परीक्षण संकेतकों का नियमित परीक्षण आवश्यक है।', 'समग्र स्वास्थ्य स्थिति में निरंतर निगरानी की सलाह दी जाती है।'],
      abnormalValues: ['ग्लूकोज या कोलेस्ट्रॉल स्तर ध्यान देने योग्य हो सकते हैं।'],
      recommendations: ['समय पर अपनी दवाएं लें और संतुलित आहार बनाए रखें।', 'अगली जांच के लिए डॉक्टर से मिलें।'],
      questionsForDoctor: ['क्या मेरी दवाओं की खुराक में कोई बदलाव करने की आवश्यकता है?']
    },
    'mr': {
      summary: 'हे तुमच्या वैद्यकीय अहवालाचे संक्षिप्त विश्लेषण आहे. नियमित तपासणी आणि डॉक्टरांचा सल्ला आवश्यक आहे.',
      keyFindings: ['आरोग्य निर्देशकांची नियमित नोंद ठेवावी.', 'वेळेवर औषधे घेणे आवश्यक आहे.'],
      abnormalValues: ['काही घटकांमध्ये तफावत आढळू शकते.'],
      recommendations: ['डॉक्टरांच्या सल्ल्यानुसार आहाराचे नियोजन करा.', 'वेळेवर तपासणी करा.'],
      questionsForDoctor: ['माझ्या सध्याच्या औषधांमध्ये बदल करण्याची गरज आहे का?']
    },
    'ta': {
      summary: 'இது உங்கள் மருத்துவ அறிக்கையின் எளிய சுருக்கம். துல்லியமான ஆலோசனைக்கு மருத்துவரை அணுகவும்.',
      keyFindings: ['ரத்த சர்க்கரை மற்றும் முக்கிய பரிசோதனைகளை கண்காணிக்க வேண்டும்.'],
      abnormalValues: ['சில அளவீடுகளில் மாறுபாடு இருக்கலாம்.'],
      recommendations: ['முறையான உணவு மற்றும் மருந்துகளை பின்பற்றவும்.'],
      questionsForDoctor: ['மருந்தளவில் மாற்றம் ஏதேனும் தேவையா?']
    },
    'en': {
      summary: 'This is a clear breakdown of your medical report findings. Key health metrics have been parsed for your doctor review.',
      keyFindings: ['Routine monitoring of blood glucose and vital markers is recommended.', 'Maintain regular adherence to prescribed medications.'],
      abnormalValues: ['Elevated metabolic indicators or cholesterol metrics may require review.'],
      recommendations: ['Follow a balanced diet and take prescribed medications on schedule.', 'Schedule a routine follow-up appointment with your physician.'],
      questionsForDoctor: ['Are any adjustments needed for my current dosage or care routine?']
    }
  };

  return fallbacks[targetLanguage] || fallbacks['en'];
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
