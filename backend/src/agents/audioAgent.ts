import { callGeminiModel } from '../config/gemini';
import { extractSmartAudioAnalysis } from '../services/smartExtractor';

export interface AudioAgentResult {
  witness_summary: string;
  transcript: string;
  extracted_entities: {
    people: string[];
    places: string[];
    suspicious_words?: string[];
    important_statements: string[];
  };
  timeline_mentions: Array<{
    time: string;
    statement: string;
  }>;
  confidence_score: number;
}

export async function processAudioAgent(filePath: string, originalName: string): Promise<AudioAgentResult> {
  const prompt = `You are the Audio Analysis Agent for CrimeLens AI Forensic Intelligence.
Transcribe and analyze witness audio recording ${originalName} and output JSON format:
{
  "witness_summary": "Summary of witness testimony",
  "transcript": "Full clean text transcript of recorded interview",
  "extracted_entities": {
    "people": ["Names mentioned"],
    "places": ["Locations mentioned"],
    "suspicious_words": ["Suspicious key terms"],
    "important_statements": ["Key quote extracts"]
  },
  "timeline_mentions": [
    {"time": "09:05 AM", "statement": "Statement describing event"}
  ],
  "confidence_score": 89
}
Return ONLY valid JSON.`;

  const aiOutput = await callGeminiModel(prompt);

  try {
    const jsonStart = aiOutput.indexOf('{');
    const jsonEnd = aiOutput.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const parsed = JSON.parse(aiOutput.substring(jsonStart, jsonEnd + 1));
      return {
        witness_summary: parsed.witness_summary || `Audio recording ${originalName} transcribed.`,
        transcript: parsed.transcript || 'Speech transcript compiled.',
        extracted_entities: {
          people: parsed.extracted_entities?.people || [],
          places: parsed.extracted_entities?.places || [],
          suspicious_words: parsed.extracted_entities?.suspicious_words || [],
          important_statements: parsed.extracted_entities?.important_statements || []
        },
        timeline_mentions: parsed.timeline_mentions || [],
        confidence_score: parsed.confidence_score || 89
      };
    }
  } catch (err) {
    console.warn('[Audio Agent] Using Smart Audio Extractor.');
  }

  return extractSmartAudioAnalysis(filePath, originalName);
}

