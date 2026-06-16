import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Megaphone,
  ArrowLeft,
  Clock,
  User,
  Users,
  AlertTriangle,
  CheckCircle2,
  Send,
  ShieldAlert,
  Hash,
  Activity,
  FileText
} from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import BadgePill from '../../components/common/BadgePill'
import EmptyState from '../../components/common/EmptyState'
import notificationsAdmin from '../../api/notificationsAdmin'
import auditApi from '../../api/audit'

const segmentLabels = {
  all: "Tất cả người dùng",
  plan: "Gói đăng ký",
  externalIds: "Danh sách ID",
  activeSince: "Thời gian hoạt động",
  country: "Quốc gia / Vị trí",
}

const statusLabels = {
  draft: "Bản nháp",
  sending: "Đang gửi...",
  sent: "Đã gửi",
  failed: "Thất bại",
}

const statusTones = {
  draft: "warning",
  sending: "info",
  sent: "success",
  failed: "danger",
}

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(false)
  const [audits, setAudits] = useState([])
  const [sending, setSending] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const c = await notificationsAdmin.getCampaign(id)
      setCampaign(c)
      // fetch related audits
      const a = await auditApi.queryAudits({ resourceType: 'Campaign', resourceId: id, limit: 50 })
      setAudits(a.items || [])
    } catch (err) {
      console.error(err)
      alert('Không thể tải thông tin chi tiết chiến dịch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleResend = async () => {
    if (!confirm('Bạn có chắc chắn muốn gửi lại chiến dịch này?')) return
    try {
      setSending(true)
      await notificationsAdmin.sendCampaign(id)
      alert('Đã gửi lại chiến dịch thành công!')
      load()
    } catch (err) {
      console.error(err)
      alert('Gửi lại chiến dịch thất bại: ' + (err.message || ''))
    } finally {
      setSending(false)
    }
  }

  // Calculate success rate and counts
  const sentCount = campaign?.results?.sentCount || 0
  const failedCount = campaign?.results?.failedCount || 0
  const totalRecipients = sentCount + failedCount
  const successRate = totalRecipients > 0 ? Math.round((sentCount / totalRecipients) * 100) : 0

  // Circular progress calculations (radius = 40 -> circumference = 251.2)
  const strokeDashValue = 2 * Math.PI * 40
  const strokeDashOffset = strokeDashValue - (successRate / 100) * strokeDashValue

  if (loading) {
    return (
      <div className="admin-page">
        <PageHeader title="Chi tiết chiến dịch" />
        <div className="rounded-xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-500 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span>Đang tải thông tin chi tiết chiến dịch...</span>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="admin-page">
        <PageHeader title="Chi tiết chiến dịch" />
        <EmptyState message="Không tìm thấy chiến dịch này trên hệ thống." />
      </div>
    )
  }

  return (
    <div className="admin-page notification-campaign-detail">
      <PageHeader
        title={campaign.title}
        subtitle={`Kênh phát sóng hàng loạt • ${segmentLabels[campaign.segmentType] || campaign.segmentType}`}
        icon={<Megaphone size={24} />}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="button-secondary" onClick={() => navigate('/notifications/campaigns')}>
              <ArrowLeft size={16} />
              Quay lại danh sách
            </button>
            {campaign.status !== 'sending' && (
              <button className="button-primary" onClick={handleResend} disabled={sending}>
                <Send size={16} />
                {sending ? 'Đang gửi...' : 'Gửi lại chiến dịch'}
              </button>
            )}
          </div>
        }
      />

      <div className="campaign-detail-grid">
        {/* Cột trái: Nội dung chiến dịch & lỗi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Nội dung thông báo */}
          <div className="report-list-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-dark)' }}>
              Nội dung thông báo phát hành
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>{campaign.title}</h4>
                {campaign.subtitle && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 10 }}>{campaign.subtitle}</div>
                )}
                <p style={{ fontSize: 13, color: '#334155', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {campaign.body}
                </p>
              </div>

              {/* Phân khúc thông tin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>
                    Phân khúc đích
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} style={{ color: 'var(--primary-color)' }} />
                    <strong style={{ fontSize: 14 }}>{segmentLabels[campaign.segmentType] || campaign.segmentType}</strong>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>
                    Trạng thái chiến dịch
                  </span>
                  <BadgePill
                    label={statusLabels[campaign.status] || campaign.status}
                    tone={statusTones[campaign.status] || "neutral"}
                  />
                </div>
              </div>

              {campaign.segmentOptions && Object.keys(campaign.segmentOptions).length > 0 && (
                <div style={{ background: 'rgba(99, 102, 241, 0.04)', borderRadius: 12, padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <strong style={{ display: 'block', marginBottom: 4 }}>Tham số bộ lọc phân khúc:</strong>
                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 11, color: 'var(--primary-color)' }}>
                    {JSON.stringify(campaign.segmentOptions, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Lỗi gửi */}
          <div className="report-list-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-dark)' }}>
              Danh sách lỗi phát sinh (Failures)
            </h3>

            {(!campaign.results?.failures || !campaign.results.failures.length) ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--success-color)', fontSize: 13, fontWeight: 600 }}>
                ✓ Không có lỗi nào xảy ra trong quá trình phát sóng.
              </div>
            ) : (
              <div className="table-responsive" style={{ border: '1px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
                <table className="table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>#</th>
                      <th>Nội dung lỗi chi tiết</th>
                      <th style={{ width: 120, textAlign: 'center' }}>Cỡ lô (Batch)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.results.failures.map((f, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ color: 'var(--danger-color)', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={14} />
                            {f.error}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{f.batchSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Chỉ số & Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Tỷ lệ thành công */}
          <div className="report-list-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, width: '100%', marginBottom: 20, color: 'var(--text-dark)', textAlign: 'left' }}>
              Hiệu suất phát hành
            </h3>

            <div className="metric-circle-wrap">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="120" height="120" className="metric-circle-svg">
                  <defs>
                    <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient id="warningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                    <linearGradient id="dangerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#f87171" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="40" className="metric-circle-bg" />
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    className="metric-circle-fill"
                    stroke={successRate > 80 ? 'url(#successGrad)' : successRate > 50 ? 'url(#warningGrad)' : 'url(#dangerGrad)'}
                    style={{
                      strokeDasharray: strokeDashValue,
                      strokeDashoffset: strokeDashOffset
                    }}
                  />
                </svg>
                <div className="metric-circle-text">
                  <h2>{successRate}%</h2>
                  <span>Thành công</span>
                </div>
              </div>

              <div style={{ marginTop: 24, width: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px dashed var(--border-light)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tổng số người nhận:</span>
                  <strong style={{ color: 'var(--text-dark)' }}>{totalRecipients}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px dashed var(--border-light)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Đã gửi thành công:</span>
                  <strong style={{ color: 'var(--success-color)' }}>{sentCount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Thất bại (Gặp lỗi):</span>
                  <strong style={{ color: failedCount > 0 ? 'var(--danger-color)' : 'var(--text-dark)' }}>{failedCount}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Audit logs */}
          <div className="report-list-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-dark)' }}>
              Nhật ký hành động (Audit Logs)
            </h3>

            {audits.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>
                Không có dữ liệu nhật ký.
              </div>
            ) : (
              <ul className="audit-timeline">
                {audits.map((a, idx) => (
                  <li className="audit-timeline-item" key={a._id || idx}>
                    <div className="audit-timeline-node">
                      <Activity size={10} style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <div className="audit-timeline-content">
                      <div className="audit-timeline-time">
                        {new Date(a.createdAt).toLocaleString('vi-VN')}
                      </div>
                      <div className="audit-timeline-title">
                        {a.action === 'send' ? 'Bắt đầu gửi chiến dịch' : a.action === 'create' ? 'Tạo mới chiến dịch' : a.action}
                      </div>
                      <div className="audit-timeline-admin">
                        <User size={12} />
                        <span>{a.admin?.fullName || a.admin?.email || 'Hệ thống'}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
