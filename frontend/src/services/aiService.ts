import api from './api';

export const aiService = {
  async runAnalysis(caseId: string) {
    const response = await api.post('/ai/analyze', { case_id: caseId });
    return response.data;
  },

  async analyzeEvidenceFile(evidenceId: string) {
    const response = await api.post(`/evidence/${evidenceId}/analyze`);
    return response.data;
  },

  async askChat(caseId: string, message: string) {
    const response = await api.post('/ai/chat', { case_id: caseId, message });
    return response.data;
  },

  async getReport(caseId: string) {
    const response = await api.get(`/ai/report/${caseId}`);
    return response.data;
  }
};
