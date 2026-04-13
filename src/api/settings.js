import api from './client'

export const settingsApi = {
  getMyProfile: () => api.get('/users/me'),
  updateMyProfile: (payload) => api.put('/users/me', payload),

  getSecuritySettings: () => api.get('/security'),
  updateSecuritySettings: (payload) => api.put('/security', payload),
  changePassword: (payload) => api.put('/security/change-password', payload),
  getDevices: () => api.get('/security/devices'),
  logoutDevice: (deviceId) => api.del(`/security/devices/${deviceId}`),
  logoutAllDevices: () => api.post('/security/devices/logout-all', {}),
  generateTwoFactorSecret: () => api.post('/security/2fa/generate-secret', {}),
  sendTwoFactorSmsCode: () => api.post('/security/2fa/send-sms', {}),
  verifyAndEnableTwoFactor: (payload) => api.post('/security/2fa/verify-and-enable', payload),
  disableTwoFactor: () => api.post('/security/2fa/disable', {}),

  getNotificationSettings: () => api.get('/settings/notifications'),
  updateNotificationSettings: (payload) => api.put('/settings/notifications', payload),
}

export default settingsApi
