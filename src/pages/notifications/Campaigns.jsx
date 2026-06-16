import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone,
  Plus,
  ArrowLeft,
  Search,
  Clock,
  Eye,
  Send,
  Calendar,
  AlertCircle,
  Inbox,
  Filter
} from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import FormSearchField from '../../components/common/FormSearchField'
import FormSelectField from '../../components/common/FormSelectField'
import BadgePill from '../../components/common/BadgePill'
import EmptyState from '../../components/common/EmptyState'
import notificationsAdmin from '../../api/notificationsAdmin'

const segmentLabels = {
  all: "Tất cả người dùng",
  plan: "Gói đăng ký",
  externalIds: "Danh sách ID",
  activeSince: "Thời gian hoạt động",
  country: "Quốc gia / Vị trí",
}

const segmentTones = {
  all: "info",
  plan: "success",
  externalIds: "neutral",
  activeSince: "warning",
  country: "info",
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

export default function Campaigns() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async () => {
    try {
      setLoading(true)
      const res = await notificationsAdmin.listCampaigns({ page: 1, limit: 50 })
      setItems(res.items || [])
    } catch (err) {
      console.error(err)
      alert('Không thể tải danh sách chiến dịch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSend = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn gửi chiến dịch này ngay bây giờ?')) return
    try {
      await notificationsAdmin.sendCampaign(id)
      alert('Đã gửi chiến dịch thành công!')
      load()
    } catch (err) {
      console.error(err)
      alert('Gửi chiến dịch thất bại: ' + (err.message || ''))
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const total = items.length
    const activeOrDraft = items.filter(it => it.status === 'draft' || it.status === 'sending').length
    const sent = items.filter(it => it.status === 'sent').length
    return { total, activeOrDraft, sent }
  }, [items])

  // Filter campaigns
  const filteredItems = useMemo(() => {
    return items.filter(it => {
      const text = `${it.title} ${it.segmentType}`.toLowerCase()
      const matchesSearch = text.includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'all' ? true : it.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [items, query, statusFilter])

  return (
    <div className="admin-page notification-campaigns">
      <PageHeader
        title="Chiến dịch phát sóng"
        subtitle="Quản lý và theo dõi các chiến dịch gửi thông báo hàng loạt"
        icon={<Megaphone size={24} />}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="button-secondary" onClick={() => navigate('/notifications')}>
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <button className="button-primary" onClick={() => navigate('/notifications/compose')}>
              <Plus size={16} />
              Tạo chiến dịch mới
            </button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="campaign-stats-grid">
        <div className="report-summary-card tone-blue">
          <div className="summary-card-head">
            <span className="summary-card-icon"><Megaphone size={14} /></span>
            <span>Tổng chiến dịch</span>
          </div>
          <h3>{stats.total}</h3>
          <p>Tất cả các chiến dịch đã lưu và gửi</p>
        </div>

        <div className="report-summary-card tone-amber">
          <div className="summary-card-head">
            <span className="summary-card-icon"><Clock size={14} /></span>
            <span>Bản nháp / Đang gửi</span>
          </div>
          <h3>{stats.activeOrDraft}</h3>
          <p>Chiến dịch chưa phát sóng hoặc đang chạy</p>
        </div>

        <div className="report-summary-card tone-green">
          <div className="summary-card-head">
            <span className="summary-card-icon"><Send size={14} /></span>
            <span>Đã gửi thành công</span>
          </div>
          <h3>{stats.sent}</h3>
          <p>Các chiến dịch đã phát sóng hoàn tất</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="search-filter-bar">
        <div style={{ flex: 2, minWidth: 0 }}>
          <FormSearchField
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề chiến dịch..."
            icon={Search}
          />
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <FormSelectField
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'draft', label: 'Bản nháp' },
              { value: 'sending', label: 'Đang gửi' },
              { value: 'sent', label: 'Đã gửi' },
              { value: 'failed', label: 'Thất bại' },
            ]}
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="table-section table-responsive">
        {loading ? (
          <div className="rounded-xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-500 shadow-sm flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span>Đang tải danh sách chiến dịch...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState message="Không tìm thấy chiến dịch nào phù hợp với bộ lọc." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tiêu đề chiến dịch</th>
                <th>Phân khúc nhận tin</th>
                <th>Trạng thái</th>
                <th>Ngày phát hành</th>
                <th style={{ textAlign: 'center', width: 220 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredItems.map((it, idx) => (
                  <motion.tr
                    key={it._id || idx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.25) }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                      <div>{it.title}</div>
                      {it.subtitle && (
                        <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          {it.subtitle}
                        </div>
                      )}
                    </td>
                    <td>
                      <BadgePill
                        label={segmentLabels[it.segmentType] || it.segmentType}
                        tone={segmentTones[it.segmentType] || "neutral"}
                      />
                    </td>
                    <td>
                      <BadgePill
                        label={statusLabels[it.status] || it.status}
                        tone={statusTones[it.status] || "neutral"}
                      />
                    </td>
                    <td>
                      {it.sentAt ? (
                        <span style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                          <Clock size={13} style={{ color: 'var(--text-tertiary)' }} />
                          {new Date(it.sentAt).toLocaleString('vi-VN')}
                        </span>
                      ) : it.scheduledAt ? (
                        <span style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--warning-color)' }}>
                          <Calendar size={13} />
                          Lên lịch: {new Date(it.scheduledAt).toLocaleString('vi-VN')}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                          Chưa gửi
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          className="button-secondary btn-sm"
                          onClick={() => navigate(`/notifications/campaigns/${it._id}`)}
                          style={{ padding: '6px 12px', display: 'inline-flex', gap: 4 }}
                        >
                          <Eye size={14} />
                          Xem chi tiết
                        </button>
                        {it.status !== 'sent' && it.status !== 'sending' && (
                          <button
                            className="button-primary btn-sm"
                            onClick={() => handleSend(it._id)}
                            style={{ padding: '6px 12px', display: 'inline-flex', gap: 4 }}
                          >
                            <Send size={14} />
                            Gửi ngay
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

