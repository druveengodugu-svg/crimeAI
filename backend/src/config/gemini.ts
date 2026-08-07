import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from './env';

export async function callGeminiModel(prompt: string, imageOrMediaParts: any[] = []): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || ENV.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      
      // Try gemini-1.5-flash first, fallback to gemini-2.0-flash or gemini-1.5-pro
      const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
      
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          let result;
          if (imageOrMediaParts.length > 0) {
            result = await model.generateContent([prompt, ...imageOrMediaParts]);
          } else {
            result = await model.generateContent(prompt);
          }
          const responseText = result.response.text();
          if (responseText && responseText.trim().length > 0) {
            console.log(`[Gemini AI] Successfully generated content using model: ${modelName}`);
            return responseText;
          }
        } catch (err: any) {
          console.warn(`[Gemini AI] Model ${modelName} call failed:`, err?.message || err);
        }
      }
    } catch (err) {
      console.warn('[Gemini AI Call Failed] Falling back to structured extractor:', err);
    }
  }
  return '';
}

