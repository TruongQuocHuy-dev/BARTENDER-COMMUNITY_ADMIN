import api from './client'

export const queryAudits = async (params = {}) => {
  // params: { admin, action, resourceType, resourceId, from, to, q, page, limit }
  const res = await api.get('/admin/audits', { params })
  return res
}

export const exportAudits = async (params = {}) => {
  // API returns CSV as text
  const csv = await api.get('/admin/audits/export', { params })
  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to download CSV', err)
    throw err
  }
}

export default { queryAudits, exportAudits }
