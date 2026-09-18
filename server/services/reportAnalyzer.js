const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const aiService = require('./aiService');

const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF Parse Error:', error);
    throw new Error('Failed to parse PDF file');
  }
};

const extractTextFromImage = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return `Image properties: ${metadata.width}x${metadata.height}, format: ${metadata.format}. Image content requires advanced OCR.`;
  } catch (error) {
    console.error('Image Processing Error:', error);
    throw new Error('Failed to process image');
  }
};

const analyzeWithAI = async (text, reportType) => {
  return await aiService.analyzeReport(text, reportType);
};

const processReport = async (file, reportType) => {
  let text = '';
  
  if (file.mimetype === 'application/pdf') {
    text = await extractTextFromPDF(file.buffer);
  } else if (file.mimetype.startsWith('image/')) {
    text = await extractTextFromImage(file.buffer);
    // In production, we'd use Google Cloud Vision or Tesseract for actual OCR
    text += "\nNote: Basic image metadata extracted. Full text extraction pending OCR integration.";
  } else {
    throw new Error('Unsupported file type');
  }
  
  const analysis = await analyzeWithAI(text, reportType);
  
  return {
    extractedText: text,
    analysis
  };
};

module.exports = {
  extractTextFromPDF,
  extractTextFromImage,
  analyzeWithAI,
  processReport
};
