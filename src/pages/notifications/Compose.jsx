import React, { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import FormSelectField from '../../components/common/FormSelectField'
import notificationsAdmin from '../../api/notificationsAdmin'
import api from '../../api/client'

export default function Compose() {
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

  useEffect(() => {
    // fetch available subscription plans for selector (if endpoint exists)
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
    if (segmentType === 'plan' && !segmentOptions.planId) err.segment = 'Vui lòng chọn plan'
    if (segmentType === 'externalIds' && (!Array.isArray(segmentOptions.ids) || !segmentOptions.ids.length)) err.segment = 'Vui lòng nhập ít nhất 1 external id'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handlePreview = async () => {
    if (!validate()) return
    try {
      setPreview(null)
      const res = await notificationsAdmin.previewCampaign({ segmentType, segmentOptions })
      setPreview(res)
    } catch (err) {
      console.error(err)
      alert('Preview failed: ' + (err.message || ''))
    }
  }

  const handleCreateAndSend = async () => {
    if (!validate()) return
    if (!preview || preview.total === 0) {
      if (!confirm('Recipients count is zero. Send anyway?')) return
    }

    try {
      setSending(true)
      const payload = { title, subtitle, body, data: {}, segmentType, segmentOptions }
      if (scheduleAt) payload.scheduledAt = scheduleAt
      const created = await notificationsAdmin.createCampaign(payload)
      await notificationsAdmin.sendCampaign(created._id)
      alert('Chiến dịch đã được gửi')
      // reset form
      setTitle('')
      setSubtitle('')
      setBody('')
      setSegmentType('all')
      setSegmentOptions({})
      setPreview(null)
    } catch (err) {
      console.error(err)
      alert('Send failed: ' + (err.message || ''))
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
      <PageHeader title="Soạn chiến dịch" subtitle="Soạn và gửi broadcast tới phân khúc người dùng" />

      <div className="card" style={{ maxWidth: 980, padding: 20 }}>
        <div className="form-row">
          <label>Tiêu đề</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề ngắn" />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        <div className="form-row">
          <label>Phụ đề (tùy chọn)</label>
          <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Dòng mô tả ngắn" />
        </div>

        <div className="form-row">
          <label>Nội dung</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="Nội dung thông báo" />
          {errors.body && <div className="form-error">{errors.body}</div>}
        </div>

        <div className="form-row">
          <label>Phân khúc</label>
          <FormSelectField value={segmentType} onChange={e => setSegmentType(e.target.value)} options={[
            { value: 'all', label: 'Tất cả người dùng' },
            { value: 'externalIds', label: 'External user IDs' },
            { value: 'plan', label: 'Theo gói đăng ký' },
            { value: 'activeSince', label: 'Active since' },
            { value: 'country', label: 'Theo quốc gia / vị trí' },
          ]} />
          {errors.segment && <div className="form-error">{errors.segment}</div>}
        </div>

        {segmentType === 'externalIds' && (
          <div className="form-row">
            <label>External IDs (phân tách bằng dấu phẩy)</label>
            <textarea onChange={e => setSegmentOptions({ ids: String(e.target.value).split(',').map(s => s.trim()).filter(Boolean) })} rows={3} />
          </div>
        )}

        {segmentType === 'plan' && (
          <div className="form-row">
            <label>Chọn gói</label>
            <FormSelectField value={segmentOptions.planId || ''} onChange={e => setSegmentOptions({ ...segmentOptions, planId: e.target.value })} options={[{ value: '', label: '--- Chọn gói ---' }, ...(plans.map(p => ({ value: p.planId || p._id, label: p.name || p.planId })))]} />
          </div>
        )}

        {segmentType === 'activeSince' && (
          <div className="form-row">
            <label>Active since</label>
            <input type="date" onChange={e => setSegmentOptions({ ...segmentOptions, since: e.target.value })} />
          </div>
        )}

        {segmentType === 'country' && (
          <div className="form-row">
            <label>Quốc gia / Vị trí (chuỗi)</label>
            <input onChange={e => setSegmentOptions({ ...segmentOptions, country: e.target.value })} />
          </div>
        )}

        <div className="form-row">
          <label>Lên lịch gửi (tùy chọn)</label>
          <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button className="btn btn-outline" onClick={handlePreview} type="button" disabled={!isFormValid() || sending}>Xem trước</button>
          <button className="btn btn-primary" onClick={handleCreateAndSend} disabled={!isFormValid() || sending} type="button">{sending ? 'Đang gửi...' : 'Tạo và gửi'}</button>
        </div>

        {preview && (
          <div style={{ marginTop: 18 }}>
            <h4>Preview</h4>
            <div><strong>Tổng người nhận:</strong> {preview.total}</div>
            <div style={{ marginTop: 8 }}>
              <strong>Mẫu (sample):</strong>
              <ul>
                {(preview.sample || []).slice(0,20).map((u, idx) => (
                  <li key={idx}>{u.fullName || u} — {u.email || ''} — {u.location || ''}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
