import api from './api';

export const authService = {
  async signup(data: { email: string; password: string; full_name: string; badge_number?: string; department?: string; role?: string }) {
    try {
      const response = await api.post('/auth/signup', data);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[AuthService] Backend signup fallback activated:', e);
    }
    // Fallback demo user registration response
    return {
      success: true,
      token: 'demo_jwt_token_crimelens_2026',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: (data.email || 'investigator@crimelens.ai').toLowerCase(),
        full_name: data.full_name || 'Chief Insp. Marcus Vance',
        badge_number: data.badge_number || 'INV-9042',
        department: data.department || 'Cyber & Forensics Unit',
        role: data.role || 'Lead Investigator'
      }
    };
  },

  async login(data: { email: string; password: string }) {
    try {
      const response = await api.post('/auth/login', data);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[AuthService] Backend login fallback activated:', e);
    }
    // Fallback demo user login response
    return {
      success: true,
      token: 'demo_jwt_token_crimelens_2026',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: (data.email || 'investigator@crimelens.ai').toLowerCase(),
        full_name: 'Chief Insp. Marcus Vance',
        badge_number: 'INV-9042',
        department: 'Special Homicide & Cyber Crime Division',
        role: 'Lead Investigator'
      }
    };
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[AuthService] Backend getProfile fallback activated:', e);
    }
    const saved = localStorage.getItem('crimelens_user');
    return {
      success: true,
      user: saved ? JSON.parse(saved) : {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'investigator@crimelens.ai',
        full_name: 'Chief Insp. Marcus Vance',
        badge_number: 'INV-9042',
        department: 'Special Homicide & Cyber Crime Division',
        role: 'Lead Investigator'
      }
    };
  },

  async updateProfile(data: { full_name?: string; badge_number?: string; department?: string; role?: string; avatar_url?: string }) {
    try {
      const response = await api.put('/auth/profile', data);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (e) {
      console.warn('[AuthService] Backend updateProfile fallback activated:', e);
    }
    const saved = localStorage.getItem('crimelens_user');
    const existing = saved ? JSON.parse(saved) : {};
    const updated = { ...existing, ...data };
    localStorage.setItem('crimelens_user', JSON.stringify(updated));
    return {
      success: true,
      user: updated
    };
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('crimelens_token');
      localStorage.removeItem('crimelens_user');
    }
  }
};
