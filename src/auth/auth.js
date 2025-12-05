export const saveAuth = (token, user) => {
  if (token) localStorage.setItem('admin_token', token)
  if (user) localStorage.setItem('admin_user', JSON.stringify(user))
}

export const getCurrentUser = () => {
  try{ return JSON.parse(localStorage.getItem('admin_user')) }catch{ return null }
}

export const logout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
}
