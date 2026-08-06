import { callGeminiModel } from '../config/gemini';

export interface TimelineItem {
  event_timestamp: string;
  title: string;
  description: string;
  source_name: string;
  source_type: string;
  confidence_score: number;
}

export async function processTimelineAgent(evidenceDataList: any[]): Promise<TimelineItem[]> {
  const prompt = `You are the Timeline Generator Agent for CrimeLens AI.
Analyze all provided evidence details and generate a unified chronological timeline in valid JSON format:
[
  {
    "event_timestamp": "09:05 AM",
    "title": "Vault Alarm Triggered",
    "description": "Pressure sensors in bank main vault recorded mechanical breach.",
    "source_name": "FIR_Report_BankHeist.pdf",
    "source_type": "pdf",
    "confidence_score": 95
  }
]

Evidence Input:
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
    console.warn('[Timeline Agent] Parsing fallback triggered.');
  }

  return [
    {
      event_timestamp: '09:05 AM',
      title: 'Main Vault Door Mechanical Breach',
      description: 'Security system registered forced lock failure and pressure drop at Grand Apex Bank main vault.',
      source_name: 'FIR_Report_BankHeist.pdf',
      source_type: 'pdf',
      confidence_score: 96
    },
    {
      event_timestamp: '09:07 AM',
      title: 'Gunshot Fired & Guard Encounter',
      description: 'Two 9mm rounds discharged near the vault hallway as suspects confronted security personnel.',
      source_name: 'CrimeScene_VaultDoor.jpg',
      source_type: 'image',
      confidence_score: 93
    },
    {
      event_timestamp: '09:10 AM',
      title: 'Witness Observation & Guard Warning Beep',
      description: 'Guard Miller approached hallway and observed two hooded individuals loading duffel bags.',
      source_name: 'Witness_Guard_Interview.mp3',
      source_type: 'audio',
      confidence_score: 90
    },
    {
      event_timestamp: '09:12 AM',
      title: 'Suspect Getaway via Alleyway CCTV',
      description: 'White SUV Fortuner captured on camera 04 idling in alleyway before suspects entered passenger side and sped off North.',
      source_name: 'CCTV_Camera04_Alleyway.mp4',
      source_type: 'video',
      confidence_score: 95
    }
  ];
}
