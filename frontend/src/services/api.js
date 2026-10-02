const API_BASE = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('mukt_kavya_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword({ email, otp, newPassword }) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  async getPoetProfile(poetId) {
    const res = await fetch(`${API_BASE}/auth/poet/${poetId}`);
    return res.json();
  },

  // Kavitas
  async getKavitas(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/kavitas?${query}`);
    return res.json();
  },

  async getKavitaById(id) {
    const res = await fetch(`${API_BASE}/kavitas/${id}`);
    return res.json();
  },

  async getDailyFeatured() {
    const res = await fetch(`${API_BASE}/kavitas/daily/featured`);
    return res.json();
  },

  async createKavita(kavitaData) {
    const res = await fetch(`${API_BASE}/kavitas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(kavitaData),
    });
    return res.json();
  },

  async updateKavita(id, kavitaData) {
    const res = await fetch(`${API_BASE}/kavitas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(kavitaData),
    });
    return res.json();
  },

  async deleteKavita(id) {
    const res = await fetch(`${API_BASE}/kavitas/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getMyKavitas(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/kavitas/my/all?${query}` : `${API_BASE}/kavitas/my/all`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async exportAllMyKavitas(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/kavitas/my/export-all?${query}` : `${API_BASE}/kavitas/my/export-all`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async toggleLike(id) {
    const res = await fetch(`${API_BASE}/kavitas/${id}/like`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async addComment(id, content) {
    const res = await fetch(`${API_BASE}/kavitas/${id}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  async toggleVisibility(id, isVisible) {
    const res = await fetch(`${API_BASE}/kavitas/${id}/visibility`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isVisible }),
    });
    return res.json();
  },

  async getPoetComments() {
    const res = await fetch(`${API_BASE}/kavitas/my/comments`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async toggleFollow(userId) {
    const res = await fetch(`${API_BASE}/auth/follow/${userId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/auth/notifications`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async markNotificationsRead() {
    const res = await fetch(`${API_BASE}/auth/notifications/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Admin & Super Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAllUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/users?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  async toggleBlockUser(userId) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/block`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  async toggleRestrictUser(userId) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/restrict`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  async deleteUser(userId) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async moderateKavita(id, statusData) {
    const res = await fetch(`${API_BASE}/admin/kavitas/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(statusData),
    });
    return res.json();
  },

  async deleteKavitaAdmin(id) {
    const res = await fetch(`${API_BASE}/admin/kavitas/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async editKavitaAdmin(id, data) {
    const res = await fetch(`${API_BASE}/admin/kavitas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async testBrevoEmail(targetEmail) {
    const res = await fetch(`${API_BASE}/admin/brevo/test-email`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetEmail }),
    });
    return res.json();
  },

  // 🏛️ Heritage Classical Poets Master Archive
  async getHeritagePresets() {
    const res = await fetch(`${API_BASE}/admin/managed-poets/presets`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getManagedPoets() {
    const res = await fetch(`${API_BASE}/admin/managed-poets`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createManagedPoet(data) {
    const res = await fetch(`${API_BASE}/admin/managed-poets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateManagedPoet(id, data) {
    const res = await fetch(`${API_BASE}/admin/managed-poets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteManagedPoet(id) {
    const res = await fetch(`${API_BASE}/admin/managed-poets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async feedPoemForPoet(poetId, poemData) {
    const res = await fetch(`${API_BASE}/admin/managed-poets/${poetId}/feed-poem`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(poemData),
    });
    return res.json();
  },

  async trackView(id, action = 'view_kavita') {
    try {
      const res = await fetch(`${API_BASE}/kavitas/${id}/track-view`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action }),
      });
      return res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // 🛡️ Security Telemetry & Audit Logs
  async getSecurityTelemetry(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/telemetry?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getSecurityTelemetryStats() {
    const res = await fetch(`${API_BASE}/admin/telemetry/stats`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async exportSecurityTelemetry() {
    const res = await fetch(`${API_BASE}/admin/telemetry/export`, {
      headers: getHeaders(),
    });
    return res.json();
  },
};
