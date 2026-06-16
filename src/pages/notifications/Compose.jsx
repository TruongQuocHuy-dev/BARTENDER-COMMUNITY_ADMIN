import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Megaphone,
  Heading,
  Type,
  FileText,
  Users,
  Calendar,
  Eye,
  Send,
  Globe,
  Award,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Hash,
  BellRing
} from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FormSelectField from '../../components/common/FormSelectField'
import notificationsAdmin from '../../api/notificationsAdmin'
import api from '../../api/client'

export default function Compose() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [body, setBody] = useState('')
  const [segmentType, setSegmentType] = useState('all')
  const [segmentOptions, setSegmentOptions] = useState({})
  const [preview, setPreview] = useState(null)
  const [sending, setSending] = useState(false)
  const [plans, setPlans] = useState([])
  const [scheduleAt, setScheduleAt] = useState('')
  const [errors, setErrors] = useState({})
  const [scanning, setScanning] = useState(false)

  // Clock state for phone mockup
  const [timeStr, setTimeStr] = useState('09:41')
  const [dateStr, setDateStr] = useState('Thứ Ba, 16 tháng 6')

  useEffect(() => {
    // Update phone lockscreen clock
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
      
      const options = { weekday: 'long', day: 'numeric', month: 'long' }
      setDateStr(now.toLocaleDateString('vi-VN', options))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // fetch available subscription plans for selector
    const loadPlans = async () => {
      try {
        const res = await api.get('/v1/subscription-plans')
        if (Array.isArray(res)) setPlans(res)
      } catch (e) {
        // ignore if endpoint missing
      }
    }
    loadPlans()
  }, [])

  const validate = () => {
    const err = {}
    if (!title || String(title).trim().length < 3) err.title = 'Tiêu đề ít nhất 3 ký tự'
    if (!body || String(body).trim().length < 5) err.body = 'Nội dung yêu cầu ít nhất 5 ký tự'
    if (segmentType === 'plan' && !segmentOptions.planId) err.segment = 'Vui lòng chọn gói đăng ký'
    if (segmentType === 'externalIds' && (!Array.isArray(segmentOptions.ids) || !segmentOptions.ids.length)) err.segment = 'Vui lòng nhập ít nhất 1 ID người dùng'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handlePreview = async () => {
    if (!validate()) return
    try {
      setScanning(true)
      setPreview(null)
      const res = await notificationsAdmin.previewCampaign({ segmentType, segmentOptions })
      setPreview(res)
    } catch (err) {
      console.error(err)
      alert('Quét phân khúc thất bại: ' + (err.message || ''))
    } finally {
      setScanning(false)
    }
  }

  const handleCreateAndSend = async () => {
    if (!validate()) return
    
    // Auto preview if not done yet
    let activePreview = preview
    if (!activePreview) {
      try {
        setScanning(true)
        const res = await notificationsAdmin.previewCampaign({ segmentType, segmentOptions })
        activePreview = res
        setPreview(res)
      } catch (err) {
        console.error(err)
        alert('Quét phân khúc thất bại: ' + (err.message || ''))
        setScanning(false)
        return
      } finally {
        setScanning(false)
      }
    }

    if (!activePreview || activePreview.total === 0) {
      if (!confirm('Số người nhận trong phân khúc này bằng 0. Bạn vẫn muốn tiếp tục gửi chứ?')) return
    } else {
      if (!confirm(`Bạn có chắc chắn muốn gửi chiến dịch này tới ${activePreview.total} người nhận?`)) return
    }

    try {
      setSending(true)
      const payload = { title, subtitle, body, data: {}, segmentType, segmentOptions }
      if (scheduleAt) payload.scheduledAt = scheduleAt
      
      const created = await notificationsAdmin.createCampaign(payload)
      await notificationsAdmin.sendCampaign(created._id)
      
      alert('Chiến dịch đã được tạo và gửi đi thành công!')
      
      // Reset form
      setTitle('')
      setSubtitle('')
      setBody('')
      setSegmentType('all')
      setSegmentOptions({})
      setPreview(null)
      setScheduleAt('')
      navigate('/notifications/campaigns')
    } catch (err) {
      console.error(err)
      alert('Gửi chiến dịch thất bại: ' + (err.message || ''))
    } finally {
      setSending(false)
    }
  }

  const isFormValid = () => {
    if ((String(title || '').trim().length) < 3) return false
    if ((String(body || '').trim().length) < 5) return false
    if (segmentType === 'plan' && !segmentOptions.planId) return false
    if (segmentType === 'externalIds' && (!Array.isArray(segmentOptions.ids) || !segmentOptions.ids.length)) return false
    return true
  }

  return (
    <div className="admin-page notification-compose">
      <PageHeader
        title="Soạn chiến dịch"
        subtitle="Soạn thảo thông báo broadcast và gửi tới các phân khúc người dùng"
        icon={<Sparkles size={24} />}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="button-secondary" onClick={() => navigate('/notifications')}>
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <button className="button-secondary" onClick={() => navigate('/notifications/campaigns')}>
              <Megaphone size={16} />
              Chiến dịch
            </button>
          </div>
        }
      />

      <div className="compose-grid">
        {/* Form soạn thảo */}
        <div className="report-list-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--text-dark)' }}>Thông tin thông báo</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="notification-form-group form-group-decorated">
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>
                Tiêu đề chiến dịch <span style={{ color: 'red' }}>*</span>
              </label>
              <Heading size={16} className="form-input-icon" />
              <input
                value={title}
                onChange={e => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors({ ...errors, title: '' })
                }}
                placeholder="Nhập tiêu đề ngắn gọn cho thông báo..."
              />
              {errors.title && <div style={{ color: 'var(--danger-color)', fontSize: 12, marginTop: 4, fontWeight: 600 }}>{errors.title}</div>}
            </div>

            <div className="notification-form-group form-group-decorated">
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>
                Phụ đề (tùy chọn)
              </label>
              <Type size={16} className="form-input-icon" />
              <input
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="Dòng mô tả phụ tóm tắt..."
              />
            </div>

            <div className="notification-form-group form-group-decorated">
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>
                Nội dung thông báo <span style={{ color: 'red' }}>*</span>
              </label>
              <FileText size={16} className="form-input-icon" style={{ top: 40 }} />
              <textarea
                value={body}
                onChange={e => {
                  setBody(e.target.value)
                  if (errors.body) setErrors({ ...errors, body: '' })
                }}
                rows={5}
                placeholder="Nhập chi tiết nội dung thông báo đẩy gửi tới người dùng..."
              />
              {errors.body && <div style={{ color: 'var(--danger-color)', fontSize: 12, marginTop: 4, fontWeight: 600 }}>{errors.body}</div>}
            </div>

            <div className="notification-form-group form-group-decorated">
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>
                Phân khúc người nhận
              </label>
              <Users size={16} className="form-input-icon" />
              <FormSelectField
                value={segmentType}
                onChange={e => {
                  setSegmentType(e.target.value)
                  setSegmentOptions({})
                  setPreview(null)
                  if (errors.segment) setErrors({ ...errors, segment: '' })
                }}
                options={[
                  { value: 'all', label: 'Tất cả người dùng hệ thống' },
                  { value: 'externalIds', label: 'Theo danh sách ID người dùng (User IDs)' },
                  { value: 'plan', label: 'Theo gói đăng ký dịch vụ (Subscription Tier)' },
                  { value: 'activeSince', label: 'Người dùng hoạt động từ ngày...' },
                  { value: 'country', label: 'Theo Quốc gia / Vị trí địa lý' },
                ]}
              />
              {errors.segment && <div style={{ color: 'var(--danger-color)', fontSize: 12, marginTop: 4, fontWeight: 600 }}>{errors.segment}</div>}
            </div>

            {/* Render dynamic inputs based on segment types with animation */}
            <AnimatePresence mode="wait">
              {segmentType === 'externalIds' && (
                <motion.div
                  key="externalIds"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="notification-form-group form-group-decorated"
                >
                  <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>
                    Nhập danh sách User IDs (cách nhau bằng dấu phẩy)
                  </label>
                  <Hash size={16} className="form-input-icon" style={{ top: 40 }} />
                  <textarea
                    onChange={e => {
                      const ids = String(e.target.value).split(',').map(s => s.trim()).filter(Boolean)
                      setSegmentOptions({ ids })
                      if (errors.segment) setErrors({ ...errors, segment: '' })
                    }}
                    placeholder="Ví dụ: 651234..., 651235..."
                    rows={3}
                  />
                </motion.div>
              )}

              {segmentType === 'plan' && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="notification-form-group form-group-decorated"
                >
                  <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>
                    Chọn gói đăng ký dịch vụ
                  </label>
                  <Award size={16} className="form-input-icon" />
                  <FormSelectField
                    value={segmentOptions.planId || ''}
                    onChange={e => {
                      setSegmentOptions({ ...segmentOptions, planId: e.target.value })
                      if (errors.segment) setErrors({ ...errors, segment: '' })
                    }}
                    options={[
                      { value: '', label: '--- Chọn gói dịch vụ ---' },
                      ...(plans.map(p => ({ value: p.planId || p._id, label: `${p.name || p.planId} (${p.planId})` })))
                    ]}
                  />
                </motion.div>
              )}

              {segmentType === 'activeSince' && (
                <motion.div
                  key="activeSince"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="notification-form-group form-group-decorated"
                >
                  <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>
                    Hoạt động từ ngày
                  </label>
                  <Calendar size={16} className="form-input-icon" />
                  <input
                    type="date"
                    onChange={e => setSegmentOptions({ ...segmentOptions, since: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </motion.div>
              )}

              {segmentType === 'country' && (
                <motion.div
                  key="country"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="notification-form-group form-group-decorated"
                >
                  <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>
                    Nhập tên quốc gia / vùng lãnh thổ
                  </label>
                  <Globe size={16} className="form-input-icon" />
                  <input
                    placeholder="Ví dụ: VN, Vietnam, US, JP..."
                    onChange={e => setSegmentOptions({ ...segmentOptions, country: e.target.value })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="notification-form-group form-group-decorated">
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>
                Lên lịch gửi (Để trống nếu muốn gửi ngay lập tức)
              </label>
              <Calendar size={16} className="form-input-icon" />
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={e => setScheduleAt(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button
                className="button-secondary"
                onClick={handlePreview}
                type="button"
                disabled={!isFormValid() || sending || scanning}
                style={{ flex: 1 }}
              >
                <Eye size={16} />
                {scanning ? 'Đang quét...' : 'Quét phân khúc'}
              </button>
              <button
                className="button-primary"
                onClick={handleCreateAndSend}
                disabled={!isFormValid() || sending || scanning}
                style={{ flex: 1 }}
                type="button"
              >
                <Send size={16} />
                {sending ? 'Đang gửi...' : scheduleAt ? 'Lên lịch & Lưu' : 'Tạo & Gửi ngay'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Panel & Quét người nhận */}
        <div className="live-preview-panel">
          <div className="report-list-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-dark)', textAlign: 'center' }}>
              Mô phỏng thiết bị thực tế
            </h3>

            {/* Mobile Device Mockup */}
            <div className="phone-mockup">
              <div className="phone-screen">
                {/* Status Bar */}
                <div className="phone-header">
                  <span>{timeStr}</span>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 9 }}>5G</span>
                    <span style={{ width: 12, height: 8, border: '1px solid white', borderRadius: 2, display: 'inline-block', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: 1, left: 1, bottom: 1, right: 3, background: 'white' }}></span>
                    </span>
                  </div>
                </div>

                {/* Clock */}
                <div className="phone-time-container">
                  <div className="phone-time">{timeStr}</div>
                  <div className="phone-date">{dateStr}</div>
                </div>

                {/* Push Notification */}
                <div className="phone-notification-push">
                  <div className="phone-noti-header">
                    <div className="phone-noti-icon-wrap">
                      <BellRing size={12} />
                    </div>
                    <span className="phone-noti-appname">Banterder</span>
                    <span className="phone-noti-time">bây giờ</span>
                  </div>
                  <div className="phone-noti-title">{title.trim() || 'Tiêu đề thông báo'}</div>
                  {subtitle.trim() && <div className="phone-noti-subtitle">{subtitle}</div>}
                  <p className="phone-noti-body">
                    {body.trim() || 'Nội dung chi tiết thông báo sẽ được hiển thị tại đây khi bạn soạn thảo văn bản bên cạnh.'}
                  </p>
                </div>

                {/* Bottom Bar */}
                <div className="phone-home-indicator"></div>
              </div>
            </div>

            {/* Scan Segment Info */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                Thông tin người nhận quét được
              </h4>

              {scanning ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>
                  Đang quét cơ sở dữ liệu người dùng...
                </div>
              ) : preview ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success-color)', fontWeight: 600, fontSize: 14 }}>
                    <CheckCircle size={16} />
                    Tổng số người nhận: {preview.total}
                  </div>
                  
                  {preview.sample && preview.sample.length > 0 ? (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                        Mẫu danh sách người nhận ({Math.min(preview.sample.length, 5)}/{preview.total}):
                      </div>
                      <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {preview.sample.slice(0, 5).map((u, idx) => (
                          <li key={idx} style={{ wordBreak: 'break-all' }}>
                            <strong>{u.fullName || u.username || 'Người dùng'}</strong> {u.email ? `(${u.email})` : ''} {u.location ? `— ${u.location}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>Không có người nhận mẫu.</div>
                  )}
                </div>
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', padding: '10px 0', border: '1px dashed var(--border-color)', borderRadius: 12 }}>
                  Bấm nút <strong>Quét phân khúc</strong> để tải số lượng người nhận thực tế trước khi gửi.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

