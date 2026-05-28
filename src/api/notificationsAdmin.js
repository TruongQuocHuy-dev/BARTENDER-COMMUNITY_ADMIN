import api from './client'

export const createCampaign = (payload) => api.post('/admin/notifications/campaigns', payload)
export const listCampaigns = (params) => api.get('/admin/notifications/campaigns', { params })
export const getCampaign = (id) => api.get(`/admin/notifications/campaigns/${id}`)
export const sendCampaign = (id) => api.post(`/admin/notifications/campaigns/${id}/send`)
export const previewCampaign = (payload) => api.post('/admin/notifications/campaigns/preview', payload)

export default { createCampaign, listCampaigns, getCampaign, sendCampaign, previewCampaign }
