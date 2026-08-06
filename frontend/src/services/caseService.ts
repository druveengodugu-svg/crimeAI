import api from './api';

export const caseService = {
  async createCase(data: {
    title: string;
    case_number?: string;
    fir_number?: string;
    description: string;
    location: string;
    officer: string;
    crime_type: string;
    incident_date: string;
    priority?: string;
  }) {
    const response = await api.post('/cases', data);
    return response.data;
  },

  async getCases(params?: { search?: string; crimeType?: string; status?: string }) {
    const response = await api.get('/cases', { params });
    return response.data;
  },

  async getCaseById(id: string) {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  async deleteCase(id: string) {
    const response = await api.delete(`/cases/${id}`);
    return response.data;
  },

  async loadDemoCase() {
    const response = await api.post('/cases/demo');
    return response.data;
  },

  async uploadEvidence(caseId: string, files: File[]) {
    const formData = new FormData();
    formData.append('case_id', caseId);
    files.forEach(f => formData.append('files', f));

    const response = await api.post('/evidence/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async deleteEvidence(evidenceId: string) {
    const response = await api.delete(`/evidence/${evidenceId}`);
    return response.data;
  },

  async getEvidenceDetails(evidenceId: string) {
    const response = await api.get(`/evidence/${evidenceId}`);
    return response.data;
  }
};
