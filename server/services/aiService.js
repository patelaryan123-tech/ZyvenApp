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

module.exports = {
  chatWithAI,
  analyzeReport,
  getSchemeRecommendations
};
