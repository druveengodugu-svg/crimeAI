import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { callGeminiModel } from '../config/gemini';
import { extractSmartDocumentAnalysis } from '../services/smartExtractor';

export interface DocumentAgentResult {
  summary: string;
  extracted_entities: {
    names: string[];
    locations: string[];
    dates: string[];
    vehicle_numbers?: string[];
    phone_numbers?: string[];
    addresses?: string[];
    crime_sections: string[];
    important_events: string[];
    statements?: string[];
  };
  raw_text: string;
}

export async function processDocumentAgent(filePath: string, originalName: string): Promise<DocumentAgentResult> {
  let extractedText = '';

  const ext = path.extname(filePath).toLowerCase();
  
  if (fs.existsSync(filePath)) {
    try {
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const parsed = await pdfParse(dataBuffer);
        extractedText = parsed.text;
      } else if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
      } else if (['.txt', '.json', '.csv', '.gpx', '.kml'].includes(ext)) {
        extractedText = fs.readFileSync(filePath, 'utf-8');
      }
    } catch (err) {
      console.warn(`[Document Agent] Text extraction fallback for ${originalName}`, err);
    }
  }

  const prompt = `You are the Document Analysis Agent for CrimeLens AI.
Analyze the following FIR / legal document text for (${originalName}) and extract structured information in JSON format:
{
  "summary": "Case-specific concise summary of the document",
  "extracted_entities": {
    "names": ["Names of individuals mentioned"],
    "locations": ["Locations and addresses"],
    "dates": ["Dates and timestamps"],
    "vehicle_numbers": ["Vehicle registration/license numbers"],
    "phone_numbers": ["Phone numbers"],
    "addresses": ["Specific physical addresses"],
    "crime_sections": ["Legal crime sections or statutes"],
    "important_events": ["Key chronological sequence of events mentioned"],
    "statements": ["Important quotes or witness claims"]
  }
}

Document Text:
${extractedText.substring(0, 4000) || originalName}
Return ONLY raw valid JSON.`;

  const aiOutput = await callGeminiModel(prompt);

  try {
    const jsonStart = aiOutput.indexOf('{');
    const jsonEnd = aiOutput.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const parsed = JSON.parse(aiOutput.substring(jsonStart, jsonEnd + 1));
      return {
        summary: parsed.summary || `Document parsed for ${originalName}.`,
        extracted_entities: {
          names: parsed.extracted_entities?.names || [],
          locations: parsed.extracted_entities?.locations || [],
          dates: parsed.extracted_entities?.dates || [],
          vehicle_numbers: parsed.extracted_entities?.vehicle_numbers || [],
          phone_numbers: parsed.extracted_entities?.phone_numbers || [],
          addresses: parsed.extracted_entities?.addresses || [],
          crime_sections: parsed.extracted_entities?.crime_sections || [],
          important_events: parsed.extracted_entities?.important_events || [],
          statements: parsed.extracted_entities?.statements || []
        },
        raw_text: extractedText || originalName
      };
    }
  } catch (err) {
    console.warn('[Document Agent] JSON parsing failed, invoking Smart Document Extractor.');
  }

  // Use Dynamic Evidence Extractor
  return extractSmartDocumentAnalysis(filePath, originalName, extractedText);
}

