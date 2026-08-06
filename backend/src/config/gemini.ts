import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from './env';

let genAI: GoogleGenerativeAI | null = null;

if (ENV.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    console.log('[Gemini AI] Initialized Google Gemini SDK successfully.');
  } catch (err) {
    console.warn('[Gemini AI] Failed to initialize Gemini client.', err);
  }
} else {
  console.log('[Gemini AI] GEMINI_API_KEY not configured. Running in Fallback Agentic Simulation Mode.');
}

export { genAI };

export async function callGeminiModel(prompt: string, imageOrMediaParts: any[] = []): Promise<string> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      if (imageOrMediaParts.length > 0) {
        const result = await model.generateContent([prompt, ...imageOrMediaParts]);
        return result.response.text();
      } else {
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
    } catch (err) {
      console.warn('[Gemini AI Call Failed] Falling back to structured response generator:', err);
    }
  }
  return '';
}
