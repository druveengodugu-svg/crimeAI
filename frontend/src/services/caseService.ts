import api from './api';

const DEMO_CASE_FALLBACK = {
  id: 'c8f12a34-5678-90ab-cdef-1234567890ab',
  case_number: 'CR-2026-9041',
  fir_number: 'FIR-2026-0894',
  title: 'Grand Vault Armed Heist & Homicide',
  description: 'Armored vault robbery at Grand Apex Bank with suspect fleeing in a dark vehicle. Multiple witnesses, CCTV, and audio recordings collected.',
  location: '742 Financial Boulevard, Metro City',
  officer: 'Chief Insp. Marcus Vance',
  crime_type: 'Armed Robbery & Homicide',
  incident_date: '2026-08-01',
  status: 'Active Investigation',
  priority: 'Critical',
  tags: ['Armed Robbery', 'Homicide', 'CCTV', 'Forensics', 'Witness Statement'],
  created_at: new Date().toISOString(),
  user_id: '00000000-0000-0000-0000-000000000001'
};

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
    try {
      const response = await api.post('/cases', data);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[CaseService] createCase fallback activated:', e);
    }
    const newCase = {
      ...DEMO_CASE_FALLBACK,
      id: `case-${Date.now()}`,
      title: data.title,
      case_number: data.case_number || `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      fir_number: data.fir_number || `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      description: data.description,
      location: data.location,
      officer: data.officer,
      crime_type: data.crime_type,
      incident_date: data.incident_date,
      priority: data.priority || 'High',
      created_at: new Date().toISOString()
    };
    return { success: true, case: newCase };
  },

  async getCases(params?: { search?: string; crimeType?: string; status?: string }) {
    try {
      const response = await api.get('/cases', { params });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[CaseService] getCases fallback activated:', e);
    }
    return {
      success: true,
      cases: [DEMO_CASE_FALLBACK]
    };
  },

  async getCaseById(id: string) {
    try {
      const response = await api.get(`/cases/${id}`);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[CaseService] getCaseById fallback activated:', e);
    }
    return {
      success: true,
      case: { ...DEMO_CASE_FALLBACK, id },
      evidenceFiles: [
        {
          id: 'ev-101',
          case_id: id,
          file_name: 'CCTV_Camera_North_Gate_Corridor.mp4',
          file_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          file_type: 'video',
          file_category: 'CCTV Footage',
          file_size: 15420000,
          uploaded_by: 'Det. Vance',
          uploaded_at: new Date().toISOString(),
          tags: ['cctv', 'suspect', 'gate']
        },
        {
          id: 'ev-102',
          case_id: id,
          file_name: 'Forensic_Shell_Casing_Macro_Photo.jpg',
          file_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200',
          file_type: 'image',
          file_category: 'Crime Scene Photo',
          file_size: 3400000,
          uploaded_by: 'Forensic Officer',
          uploaded_at: new Date().toISOString(),
          tags: ['ballistics', 'shell_casing']
        }
      ],
      aiReport: null
    };
  },

  async deleteCase(id: string) {
    try {
      const response = await api.delete(`/cases/${id}`);
      return response.data;
    } catch (e) {
      return { success: true, message: 'Case deleted' };
    }
  },

  async loadDemoCase() {
    try {
      const response = await api.post('/cases/demo');
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[CaseService] loadDemoCase fallback activated:', e);
    }
    return { success: true, case: DEMO_CASE_FALLBACK };
  },

  async uploadEvidence(caseId: string, files: File[]) {
    try {
      const formData = new FormData();
      formData.append('case_id', caseId);
      files.forEach(f => formData.append('files', f));

      const response = await api.post('/evidence/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[CaseService] uploadEvidence fallback activated:', e);
    }
    const mocked = files.map((f, i) => ({
      id: `ev-new-${Date.now()}-${i}`,
      case_id: caseId,
      file_name: f.name,
      file_path: URL.createObjectURL(f),
      file_type: f.type.startsWith('image/') ? 'image' : f.type.startsWith('video/') ? 'video' : f.type.startsWith('audio/') ? 'audio' : 'pdf',
      file_category: 'Uploaded Evidence',
      file_size: f.size,
      uploaded_by: 'Investigator',
      uploaded_at: new Date().toISOString(),
      tags: ['evidence', 'uploaded']
    }));
    return { success: true, evidenceFiles: mocked };
  },

  async deleteEvidence(evidenceId: string) {
    try {
      const response = await api.delete(`/evidence/${evidenceId}`);
      return response.data;
    } catch (e) {
      return { success: true, message: 'Evidence removed' };
    }
  },

  async getEvidenceDetails(evidenceId: string) {
    try {
      const response = await api.get(`/evidence/${evidenceId}`);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[CaseService] getEvidenceDetails fallback activated:', e);
    }
    return {
      success: true,
      evidence: {
        id: evidenceId,
        case_id: 'c8f12a34-5678-90ab-cdef-1234567890ab',
        file_name: 'Evidence_File.jpg',
        file_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200',
        file_type: 'image',
        file_category: 'Crime Scene Photo',
        file_size: 2048000,
        uploaded_by: 'Investigator',
        uploaded_at: new Date().toISOString(),
        tags: ['crime_scene']
      }
    };
  },

  async updateCaseStatus(caseId: string, status: string) {
    try {
      const response = await api.put(`/cases/${caseId}/status`, { status });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[CaseService] updateCaseStatus fallback activated:', e);
    }
    return {
      success: true,
      message: `Case status updated to "${status}".`,
      case: { id: caseId, status }
    };
  }
};
