const API_BASE = window.__API_BASE__ || '/api'

const getToken = () => localStorage.getItem('admin_token')

const fetchJson = async (url, opts = {}) => {
  const headers = opts.headers || {}
  if (!headers['Content-Type'] && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Support simple params for GET queries
  let finalUrl = url
  if (opts.params && typeof opts.params === 'object') {
    const qs = new URLSearchParams()
    Object.entries(opts.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length) qs.append(k, v)
    })
    const qsStr = qs.toString()
    if (qsStr) finalUrl += (finalUrl.includes('?') ? '&' : '?') + qsStr
  }

  const res = await fetch(API_BASE + finalUrl, { ...opts, headers })
  const responseText = await res.text()

  if (!res.ok) {
    let errorMessage = res.statusText
    
    // Handle 401 Unauthorized - token expired or invalid
    if (res.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new Error('Session expired. Please login again.')
    }

    try {
      const errorData = JSON.parse(responseText)
      throw { 
        response: { data: errorData },
        status: res.status,
        message: errorData.message || errorMessage
      }
    } catch (e) {
      if (e.response) throw e
      throw new Error(responseText || errorMessage)
    }
  }

  if (res.status === 204 || !responseText) return null
  
  try {
    return JSON.parse(responseText)
  } catch (e) {
    console.error('Error parsing response:', e)
    return responseText
  }
}

export const api = {
  get: (path, opts = {}) => fetchJson(path, { method: 'GET', ...(opts || {}) }),
  post: (path, body) => fetchJson(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body) => fetchJson(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  del: (path) => fetchJson(path, { method: 'DELETE' }),
}

export default api
