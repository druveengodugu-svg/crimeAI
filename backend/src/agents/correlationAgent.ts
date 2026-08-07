import { callGeminiModel } from '../config/gemini';
import { synthesizeCrossEvidenceCorrelation } from '../services/smartExtractor';

export interface GraphNode {
  id: string;
  label: string;
  category: 'Person' | 'Vehicle' | 'Location' | 'Weapon' | 'Date' | 'Object' | 'Evidence';
  sourceFile: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  confidence: number;
}

export interface CorrelationResult {
  matches: {
    matching_names: string[];
    matching_vehicles: string[];
    matching_locations: string[];
    matching_dates: string[];
    matching_timestamps: string[];
    matching_objects: string[];
  };
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  summary: string;
}

export async function processCorrelationAgent(evidenceDataList: any[]): Promise<CorrelationResult> {
  const combinedContext = JSON.stringify(evidenceDataList, null, 2);

  const prompt = `You are the Evidence Correlation Agent for CrimeLens AI.
Synthesize all extracted information across documents, photos, CCTV, and audio testimony to identify cross-modal linkages.
Output valid JSON format:
{
  "summary": "Summary of interconnected evidence findings",
  "matches": {
    "matching_names": ["Names appearing across multiple evidence sources"],
    "matching_vehicles": ["Vehicles mentioned or seen in multiple files"],
    "matching_locations": ["Locations identified across files"],
    "matching_dates": ["Dates/times matched"],
    "matching_timestamps": ["Specific minute matches"],
    "matching_objects": ["Weapons/bags matched across sources"]
  },
  "graph": {
    "nodes": [
      {"id": "node1", "label": "Entity Label", "category": "Person", "sourceFile": "Evidence_File.pdf"}
    ],
    "edges": [
      {"source": "node1", "target": "node2", "relation": "Relationship description", "confidence": 92}
    ]
  }
}

Evidence Context:
${combinedContext.substring(0, 5000)}
Return ONLY valid JSON.`;

  const aiOutput = await callGeminiModel(prompt);

  try {
    const jsonStart = aiOutput.indexOf('{');
    const jsonEnd = aiOutput.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const parsed = JSON.parse(aiOutput.substring(jsonStart, jsonEnd + 1));
      return {
        summary: parsed.summary || 'Evidence correlation synthesized.',
        matches: parsed.matches || {
          matching_names: [],
          matching_vehicles: [],
          matching_locations: [],
          matching_dates: [],
          matching_timestamps: [],
          matching_objects: []
        },
        graph: parsed.graph || { nodes: [], edges: [] }
      };
    }
  } catch (err) {
    console.warn('[Correlation Agent] Parsing fallback triggered, calling Dynamic Cross-Evidence Synthesizer.');
  }

  return synthesizeCrossEvidenceCorrelation(evidenceDataList);
}

