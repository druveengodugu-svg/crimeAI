import { callGeminiModel } from '../config/gemini';

export interface ContradictionItem {
  statement1: string;
  source1: string;
  statement2: string;
  source2: string;
  confidence_score: number;
  explanation: string;
  category: string;
}

export async function processContradictionAgent(evidenceDataList: any[]): Promise<ContradictionItem[]> {
  const prompt = `You are the Contradiction Detection Agent for CrimeLens AI.
Compare witness statements, FIR documentation, images, CCTV video, and audio recordings.
Identify direct contradictions and discrepancies in the investigation evidence.
Output valid JSON format:
[
  {
    "statement1": "Witness stated suspect fled in a blue sedan",
    "source1": "Witness_Guard_Interview.mp3",
    "statement2": "CCTV camera footage shows getaway vehicle was a white SUV",
    "source2": "CCTV_Camera04_Alleyway.mp4",
    "confidence_score": 94,
    "explanation": "Human witness visual perception error or deliberate misdirection vs verified video footage.",
    "category": "Vehicle Discrepancy"
  }
]

Evidence Context:
${JSON.stringify(evidenceDataList, null, 2).substring(0, 5000)}
Return ONLY valid JSON array.`;

  const aiOutput = await callGeminiModel(prompt);

  try {
    const jsonStart = aiOutput.indexOf('[');
    const jsonEnd = aiOutput.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const parsed = JSON.parse(aiOutput.substring(jsonStart, jsonEnd + 1));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Contradiction Agent] Parsing fallback triggered.');
  }

  // Dynamic evidence-based contradiction detection fallback
  const dynamicContradictions: ContradictionItem[] = [];

  const vehiclesFound: Array<{ source: string; vehicle: string }> = [];
  const timesFound: Array<{ source: string; time: string }> = [];
  const personsFound: Array<{ source: string; person: string }> = [];

  evidenceDataList.forEach(item => {
    const src = item.file_name || 'Evidence_File';
    const res = item.result || {};

    const extVeh = res.detected_entities?.vehicles || res.detected_objects?.vehicles || res.extracted_entities?.vehicle_numbers || [];
    extVeh.forEach((v: string) => vehiclesFound.push({ source: src, vehicle: v }));

    const extTimes = res.timestamps?.map((t: any) => t.time) || res.extracted_entities?.dates || [];
    extTimes.forEach((t: string) => timesFound.push({ source: src, time: t }));

    const extPersons = res.detected_entities?.persons || res.detected_objects?.persons || res.extracted_entities?.names || [];
    extPersons.forEach((p: string) => personsFound.push({ source: src, person: p }));
  });

  if (vehiclesFound.length >= 2 && vehiclesFound[0].vehicle !== vehiclesFound[1].vehicle) {
    dynamicContradictions.push({
      statement1: `Evidence (${vehiclesFound[0].source}) references vehicle: "${vehiclesFound[0].vehicle}"`,
      source1: vehiclesFound[0].source,
      statement2: `Evidence (${vehiclesFound[1].source}) references vehicle: "${vehiclesFound[1].vehicle}"`,
      source2: vehiclesFound[1].source,
      confidence_score: 91,
      explanation: 'Discrepancy identified between vehicle models/plates across separate evidence items.',
      category: 'Vehicle Description Discrepancy'
    });
  }

  if (timesFound.length >= 2 && timesFound[0].time !== timesFound[1].time) {
    dynamicContradictions.push({
      statement1: `Recorded time mark in ${timesFound[0].source}: ${timesFound[0].time}`,
      source1: timesFound[0].source,
      statement2: `Recorded time mark in ${timesFound[1].source}: ${timesFound[1].time}`,
      source2: timesFound[1].source,
      confidence_score: 87,
      explanation: 'Variance in incident time markers recorded across separate evidence files.',
      category: 'Time Marker Variance'
    });
  }

  return dynamicContradictions;
}

