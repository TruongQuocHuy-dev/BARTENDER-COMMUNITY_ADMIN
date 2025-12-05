import React, { useState } from 'react'
import api from '../../api/client'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AlertCircle, Coffee } from 'lucide-react'
import '../../styles/login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErr('Please enter both email and password')
      return
    }

    setIsLoading(true)
    setErr('')

    try {
      // 1. Gọi API, 'res' CHÍNH LÀ DỮ LIỆU { token, user }
      const res = await api.post('/auth/login', { email, password })

      // 2. SỬA LỖI: Lấy token và user trực tiếp từ 'res' (KHÔNG DÙNG .data)
      const { token, user } = res;

      // 3. VẪN GIỮ: Kiểm tra quyền admin
      if (!user || user.role !== 'admin') {
        setErr('You do not have permission to access the admin panel.');
        setIsLoading(false); // Đảm bảo dừng loading
        return;
      }

      // 4. Nếu là admin, gọi login
      login(token, user)

      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })

    } catch (e) {
      console.error(e)
      const message = e.response?.data?.message || 'Invalid email or password'
      setErr(message)
    } finally {
      // Sẽ chạy ngay cả khi bạn 'return' ở (3)
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Coffee size={32} />
          </div>
          <h1>Welcome Back</h1>
        </div>

        <form onSubmit={submit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {err && (
            <div className="error-message">
              <AlertCircle size={16} />
              {err}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
