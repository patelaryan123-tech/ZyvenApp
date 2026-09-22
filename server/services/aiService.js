const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const getModel = () => {
  if (!genAI) {
    throw new Error('Google Gemini API key is missing. AI features are disabled.');
  }
  return genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
};

const chatWithAI = async (message, conversationHistory, language = 'en') => {
  try {
    const model = getModel();
    const prompt = `You are a helpful, empathetic healthcare assistant for the ZYVEN platform.
    Respond in ${language}. Keep answers concise and clear.
    IMPORTANT: Add this disclaimer at the end of every response: 'This is AI-generated information and not a medical diagnosis.'
    
    Conversation History:
    ${JSON.stringify(conversationHistory)}
    
    User Message: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    throw new Error('Failed to communicate with AI');
  }
};

const analyzeReport = async (extractedText, reportType) => {
  try {
    const model = getModel();
    const prompt = `Analyze the following medical report of type: ${reportType}.
    Extract the key information and structure it exactly as this JSON format, no markdown tags:
    {
      "summary": "Brief summary of the report",
      "keyFindings": ["Finding 1", "Finding 2"],
      "abnormalValues": ["Value 1 (Reason)"],
      "recommendations": ["Recommendation 1"],
      "questionsForDoctor": ["Question 1"]
    }
    
    Report Text:
    ${extractedText}
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // try to parse JSON
    try {
      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return parsed;
    } catch (e) {
       console.error("JSON parse error:", text);
       throw new Error('AI returned invalid format');
    }
  } catch (error) {
    console.error('Error in analyzeReport:', error);
    throw new Error('Failed to analyze medical report');
  }
};

const getSchemeRecommendations = async (userProfile) => {
  try {
    const model = getModel();
    const prompt = `Based on the following user profile, suggest categories of government schemes they might be eligible for.
    Profile: ${JSON.stringify(userProfile)}
    Return a simple list of categories (e.g. Healthcare, Pension).`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error in getSchemeRecommendations:', error);
    return 'Healthcare, Pension'; // fallback
  }
};

const analyzeSymptoms = async (symptoms, age, gender, duration, severity, existingConditions = []) => {
  try {
    const model = getModel();
    const prompt = `Perform a senior healthcare triage evaluation for the following reported symptoms:
    Symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}
    Patient Age: ${age || 65}
    Gender: ${gender || 'Unspecified'}
    Duration: ${duration || 'Recent'}
    Severity (1-10): ${severity || 5}
    Existing Medical Conditions: ${existingConditions.join(', ') || 'None reported'}

    Return ONLY a valid JSON object matching this exact structure without markdown backticks:
    {
      "urgencyLevel": "Low" | "Moderate" | "Urgent",
      "summary": "Clear, reassuring explanation of the symptoms for a senior or caregiver",
      "possibleCauses": ["Cause 1", "Cause 2"],
      "redFlags": ["Warning sign 1 to watch for"],
      "recommendedActions": ["Action 1 (e.g. Drink fluids, Rest)", "Action 2 (e.g. Schedule Clinic Visit)"],
      "emergencyNotice": "Include a bold emergency message if urgency level is Urgent, else null"
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return parsed;
    } catch (e) {
      console.warn("AI Triage JSON parse error, returning fallback format:", text);
      return {
        urgencyLevel: severity > 7 ? "Urgent" : (severity > 4 ? "Moderate" : "Low"),
        summary: "Based on the reported symptoms, please monitor your condition carefully.",
        possibleCauses: ["General fatigue or age-related strain", "Mild symptom presentation"],
        redFlags: ["Chest pain or shortness of breath", "Sudden weakness or difficulty speaking"],
        recommendedActions: ["Rest and stay hydrated", "Consult your physician if symptoms persist"],
        emergencyNotice: severity > 7 ? "If experiencing acute distress, press the SOS button immediately." : null
      };
    }
  } catch (error) {
    console.error('Error in analyzeSymptoms:', error);
    return {
      urgencyLevel: severity > 7 ? "Urgent" : "Moderate",
      summary: "We received your symptom details. Please consult with a medical professional for an accurate assessment.",
      possibleCauses: ["Requires clinical evaluation"],
      redFlags: ["Shortness of breath, chest pressure, severe dizziness"],
      recommendedActions: ["Contact your doctor or visit a nearby clinic"],
      emergencyNotice: "Disclaimer: This is AI-generated advice and not a medical diagnosis."
    };
  }
};

module.exports = {
  chatWithAI,
  analyzeReport,
  getSchemeRecommendations,
  analyzeSymptoms
};

