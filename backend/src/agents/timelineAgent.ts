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

  // Dynamic evidence-based timeline extraction fallback
  const dynamicTimeline: TimelineItem[] = [];

  evidenceDataList.forEach((item) => {
    const fileName = item.file_name || 'Evidence_File';
    const fileType = item.file_type || 'file';
    const res = item.result || {};

    if (res.timestamps && Array.isArray(res.timestamps)) {
      res.timestamps.forEach((ts: any) => {
        dynamicTimeline.push({
          event_timestamp: ts.time || 'Timestamp Logged',
          title: `Activity recorded in ${fileName}`,
          description: ts.description || 'Activity captured in video feed.',
          source_name: fileName,
          source_type: fileType,
          confidence_score: res.confidence_score || 92
        });
      });
    } else if (res.timeline_mentions && Array.isArray(res.timeline_mentions)) {
      res.timeline_mentions.forEach((tm: any) => {
        dynamicTimeline.push({
          event_timestamp: tm.time || 'Statement Timestamp',
          title: `Witness statement in ${fileName}`,
          description: tm.statement || 'Recorded testimony statement.',
          source_name: fileName,
          source_type: fileType,
          confidence_score: res.confidence_score || 90
        });
      });
    } else if (res.extracted_entities?.dates && Array.isArray(res.extracted_entities.dates)) {
      res.extracted_entities.dates.forEach((d: string) => {
        dynamicTimeline.push({
          event_timestamp: d,
          title: `Document event in ${fileName}`,
          description: `Document record timestamp in ${fileName}: ${res.summary || 'Official filing details.'}`,
          source_name: fileName,
          source_type: fileType,
          confidence_score: 94
        });
      });
    } else {
      dynamicTimeline.push({
        event_timestamp: 'Incident Record',
        title: `Evidence analysis for ${fileName}`,
        description: res.description || res.summary || res.witness_summary || `Visual / analytical findings from ${fileName}`,
        source_name: fileName,
        source_type: fileType,
        confidence_score: res.confidence_score || 88
      });
    }
  });

  return dynamicTimeline.length > 0 ? dynamicTimeline : [
    {
      event_timestamp: 'Initial Upload',
      title: 'Evidence Registered',
      description: 'Primary evidence file registered into investigation workspace.',
      source_name: 'Case File',
      source_type: 'system',
      confidence_score: 90
    }
  ];
}

