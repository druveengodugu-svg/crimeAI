import { callGeminiModel } from '../config/gemini';
import { extractSmartVideoAnalysis } from '../services/smartExtractor';

export interface VideoAgentResult {
  summary: string;
  detected_entities: {
    vehicles: string[];
    persons: string[];
    weapons: string[];
    objects: string[];
  };
  motion_summary?: string;
  important_activities?: string[];
  scene_changes?: string[];
  timestamps: Array<{
    time: string;
    description: string;
    importance: 'High' | 'Medium' | 'Low';
  }>;
  confidence_score: number;
}

export async function processVideoAgent(filePath: string, originalName: string): Promise<VideoAgentResult> {
  const prompt = `You are the Video Analysis Agent for CrimeLens AI.
Analyze CCTV Video footage named ${originalName} and output structured forensic details in valid JSON format:
{
  "summary": "Detailed overall narrative of CCTV footage",
  "detected_entities": {
    "vehicles": ["Vehicle color, make, license plate if visible"],
    "persons": ["Descriptions of suspects/bystanders"],
    "weapons": ["Weapons spotted in frame"],
    "objects": ["Carried duffel bags, crowbars, masks"]
  },
  "motion_summary": "Summary of movement",
  "important_activities": ["Key activity sequence"],
  "scene_changes": ["Major camera frame changes"],
  "timestamps": [
    {"time": "09:10 AM", "description": "Description of frame event", "importance": "High"}
  ],
  "confidence_score": 91
}
Return ONLY valid JSON.`;

  const aiOutput = await callGeminiModel(prompt);

  try {
    const jsonStart = aiOutput.indexOf('{');
    const jsonEnd = aiOutput.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const parsed = JSON.parse(aiOutput.substring(jsonStart, jsonEnd + 1));
      return {
        summary: parsed.summary || `CCTV Video ${originalName} analyzed.`,
        detected_entities: {
          vehicles: parsed.detected_entities?.vehicles || [],
          persons: parsed.detected_entities?.persons || [],
          weapons: parsed.detected_entities?.weapons || [],
          objects: parsed.detected_entities?.objects || []
        },
        motion_summary: parsed.motion_summary || 'Movement sequence recorded.',
        important_activities: parsed.important_activities || [],
        scene_changes: parsed.scene_changes || [],
        timestamps: parsed.timestamps || [],
        confidence_score: parsed.confidence_score || 91
      };
    }
  } catch (err) {
    console.warn('[Video Agent] Parsing fallback triggered, invoking Smart Video Extractor.');
  }

  return extractSmartVideoAnalysis(filePath, originalName);
}

