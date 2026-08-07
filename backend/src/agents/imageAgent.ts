import fs from 'fs';
import { callGeminiModel } from '../config/gemini';
import { extractSmartImageAnalysis } from '../services/smartExtractor';

export interface ImageAgentResult {
  description: string;
  detected_objects: {
    weapons: string[];
    vehicles: string[];
    blood_stains: string[];
    destroyed_objects: string[];
    suspicious_objects: string[];
    number_plates: string[];
    persons: string[];
    clothing: string[];
  };
  possible_evidence?: string[];
  suspicious_observations?: string[];
  environmental_conditions?: string;
  ocr_text?: string;
  suggested_leads?: string[];
  confidence_score: number;
}

export async function processImageAgent(filePath: string, originalName: string): Promise<ImageAgentResult> {
  let imageBase64 = '';
  let fileBuf: Buffer | undefined;
  if (fs.existsSync(filePath)) {
    try {
      fileBuf = fs.readFileSync(filePath);
      imageBase64 = fileBuf.toString('base64');
    } catch (err) {
      console.warn(`[Image Agent] Could not read image ${originalName}`, err);
    }
  }

  const prompt = `You are the Image Analysis Agent for CrimeLens AI Forensic Unit.
Analyze this crime scene photograph (${originalName}) and output structured details in valid JSON format:
{
  "description": "Comprehensive visual narrative of what is strictly visible in the image",
  "detected_objects": {
    "weapons": ["List of firearms, knives, blunt instruments visible"],
    "vehicles": ["List of visible vehicles with color and make"],
    "blood_stains": ["Location and spatter analysis of blood stains"],
    "destroyed_objects": ["Pry marks, broken glass, forced locks"],
    "suspicious_objects": ["Dropped bags, tools, shell casings"],
    "number_plates": ["Visible license plate numbers"],
    "persons": ["Visible individuals or silhouettes"],
    "clothing": ["Colors and types of clothing worn"]
  },
  "possible_evidence": ["Key physical items"],
  "suspicious_observations": ["Visual anomalies"],
  "environmental_conditions": "Lighting, indoor/outdoor, shadows",
  "ocr_text": "Extracted text if visible",
  "suggested_leads": ["Actionable forensic follow-ups"],
  "confidence_score": 92
}
Return ONLY valid JSON based strictly on the uploaded image.`;

  let mediaParts: any[] = [];
  if (imageBase64) {
    const ext = originalName.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    mediaParts = [{
      inlineData: {
        data: imageBase64,
        mimeType
      }
    }];
  }

  const aiOutput = await callGeminiModel(prompt, mediaParts);

  try {
    const jsonStart = aiOutput.indexOf('{');
    const jsonEnd = aiOutput.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const parsed = JSON.parse(aiOutput.substring(jsonStart, jsonEnd + 1));
      return {
        description: parsed.description || `Forensic visual analysis of ${originalName}.`,
        detected_objects: {
          weapons: parsed.detected_objects?.weapons || [],
          vehicles: parsed.detected_objects?.vehicles || [],
          blood_stains: parsed.detected_objects?.blood_stains || [],
          destroyed_objects: parsed.detected_objects?.destroyed_objects || [],
          suspicious_objects: parsed.detected_objects?.suspicious_objects || [],
          number_plates: parsed.detected_objects?.number_plates || [],
          persons: parsed.detected_objects?.persons || [],
          clothing: parsed.detected_objects?.clothing || []
        },
        possible_evidence: parsed.possible_evidence || [],
        suspicious_observations: parsed.suspicious_observations || [],
        environmental_conditions: parsed.environmental_conditions || 'Indoor artificial lighting',
        ocr_text: parsed.ocr_text || '',
        suggested_leads: parsed.suggested_leads || [],
        confidence_score: parsed.confidence_score || 92
      };
    }
  } catch (err) {
    console.warn('[Image Agent] Parsing failed, calling Smart Evidence Extractor.');
  }

  // Use Dynamic Evidence Extractor
  return extractSmartImageAnalysis(filePath, originalName, fileBuf);
}

