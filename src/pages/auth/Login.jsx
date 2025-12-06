import React, { useState } from 'react'
import api from '../../api/client'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AlertCircle, Coffee, Eye, EyeOff } from 'lucide-react'
import '../../styles/login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [err, setErr] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErr('Vui lòng nhập cả email và mật khẩu')
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
        setErr('Bạn không có quyền truy cập trang quản trị.');
        setIsLoading(false); // Đảm bảo dừng loading
        return;
      }

      // 4. Nếu là admin, gọi login
      login(token, user)

      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })

    } catch (e) {
      console.error(e)
      const message = e.response?.data?.message === 'Invalid email or password'
        ? 'Email hoặc mật khẩu không đúng'
        : (e.response?.data?.message || 'Đăng nhập thất bại')
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
          <h1>Chào mừng trở lại</h1>
        </div>

        <form onSubmit={submit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Địa chỉ Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
