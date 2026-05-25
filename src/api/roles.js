import api from './client'

export const roleApi = {
  getRoles: () => api.get('/admin/roles'),
  getPermissions: () => api.get('/admin/roles/permissions'),
  createRole: (payload) => api.post('/admin/roles', payload),
  updateRole: (roleId, payload) => api.put(`/admin/roles/${roleId}`, payload),
  deleteRole: (roleId) => api.del(`/admin/roles/${roleId}`),
}

export default roleApi