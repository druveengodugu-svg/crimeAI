import api from './api';

export const authService = {
  async signup(data: { email: string; password: string; full_name: string; badge_number?: string; department?: string; role?: string }) {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(data: { full_name?: string; badge_number?: string; department?: string; role?: string; avatar_url?: string }) {
    const response = await api.put('/auth/profile', data);
    return response.data;
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
