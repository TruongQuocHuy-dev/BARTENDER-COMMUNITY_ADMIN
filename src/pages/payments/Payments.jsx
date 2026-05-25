import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDownToLine, Banknote, CircleDollarSign, FileText, RefreshCw, Search, ShieldCheck, Undo2 } from 'lucide-react'
import api, { requestRaw } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import BadgePill from '../../components/common/BadgePill'
import EmptyState from '../../components/common/EmptyState'
import FormSearchField from '../../components/common/FormSearchField'
import FormSelectField from '../../components/common/FormSelectField'
import TableActionMenu from '../../components/TableActionMenu'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
]

const METHOD_OPTIONS = [
  { value: 'all', label: 'Tất cả phương thức' },
  { value: 'vnpay', label: 'VNPay' },
  { value: 'momo', label: 'MoMo' },
  { value: 'card', label: 'Card' },
]

const formatCurrency = (value, currency = 'VND') => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(Number(value || 0))

const formatDateTime = (value) => value ? new Date(value).toLocaleString('vi-VN') : 'N/A'

const statusTone = (status) => {
  if (status === 'completed') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'refunded') return 'info'
  return 'danger'
}

const statusLabel = (status) => {
  if (status === 'completed') return 'Hoàn tất'
  if (status === 'pending') return 'Chờ xử lý'
  if (status === 'refunded') return 'Đã hoàn tiền'
  return 'Thất bại'
}

const methodLabel = (method) => {
  if (method === 'vnpay') return 'VNPay'
  if (method === 'momo') return 'MoMo'
  if (method === 'card') return 'Card'
  return method || 'N/A'
}

const methodTone = (method) => {
  if (method === 'vnpay') return 'primary'
  if (method === 'momo') return 'info'
  return 'neutral'
}

const buildParams = (filters, page) => ({
  page,
  limit: 12,
  q: filters.q || undefined,
  status: filters.status !== 'all' ? filters.status : undefined,
  method: filters.method !== 'all' ? filters.method : undefined,
  from: filters.from || undefined,
  to: filters.to || undefined,
})

function SummaryCard({ icon: Icon, label, value, note, tone = 'primary' }) {
  return (
    <article className={`payment-summary-card tone-${tone}`}>
      <div className="payment-summary-head">
        <div className="payment-summary-icon">
          <Icon size={18} />
        </div>
        <span>{label}</span>
      </div>
      <h3>{value}</h3>
      {note ? <p>{note}</p> : null}
    </article>
  )
}

function PaymentDetailModal({ payment, refundReason, setRefundReason, onClose, onRefund, refunding }) {
  if (!payment) return null

  const isRefundable = payment.status === 'completed'
  const refund = payment.refund || {}

  return (
    <Modal
      isOpen={!!payment}
      onClose={onClose}
      title="Chi tiết giao dịch"
      size="medium"
      subtitle={`${payment.transactionId} • ${formatDateTime(payment.createdAt)}`}
    >
      <div className="payment-detail-grid">
        <div className="payment-detail-card">
          <span>Người mua</span>
          <strong>{payment.user?.fullName || 'N/A'}</strong>
          <p>{payment.user?.email || 'Không có email'}</p>
        </div>
        <div className="payment-detail-card">
          <span>Trạng thái</span>
          <div style={{ marginTop: 6 }}>
            <BadgePill label={statusLabel(payment.status)} tone={statusTone(payment.status)} icon={ShieldCheck} />
          </div>
        </div>
        <div className="payment-detail-card">
          <span>Số tiền</span>
          <strong>{formatCurrency(payment.amount, payment.currency)}</strong>
          <p>{payment.currency}</p>
        </div>
        <div className="payment-detail-card">
          <span>Phương thức</span>
          <div style={{ marginTop: 6 }}>
            <BadgePill label={methodLabel(payment.method)} tone={methodTone(payment.method)} icon={Banknote} />
          </div>
        </div>
      </div>

      <div className="payment-detail-section">
        <label className="payment-detail-label">Mô tả</label>
        <div className="payment-detail-box">{payment.description || 'Không có mô tả'}</div>
      </div>

      <div className="payment-detail-section payment-detail-grid-two">
        <div>
          <label className="payment-detail-label">Plan ID</label>
          <div className="payment-detail-box">{payment.planId || 'N/A'}</div>
        </div>
        <div>
          <label className="payment-detail-label">Giao dịch gốc</label>
          <div className="payment-detail-box">{payment.transactionId}</div>
        </div>
      </div>

      {payment.status === 'refunded' ? (
        <div className="payment-detail-section">
          <label className="payment-detail-label">Thông tin hoàn tiền</label>
          <div className="payment-detail-box payment-refund-box">
            <div><strong>Trạng thái:</strong> {refund.status || 'none'}</div>
            <div><strong>Lý do:</strong> {refund.reason || 'N/A'}</div>
            <div><strong>Processed at:</strong> {formatDateTime(refund.processedAt)}</div>
            <div><strong>Gateway ref:</strong> {refund.gatewayReference || 'N/A'}</div>
          </div>
        </div>
      ) : null}

      {isRefundable ? (
        <div className="payment-detail-section">
          <label className="payment-detail-label">Lý do refund mô phỏng</label>
          <textarea
            className="input-field payment-refund-textarea"
            value={refundReason}
            onChange={(event) => setRefundReason(event.target.value)}
            placeholder="Nhập lý do hoàn tiền"
            rows={4}
          />
          <p className="payment-detail-help">
            Hoàn tiền sẽ chuyển trạng thái giao dịch sang <strong>refunded</strong> và lưu metadata mô phỏng.
          </p>
        </div>
      ) : null}

      <div className="modal-footer payment-detail-footer">
        <button className="button-secondary" onClick={onClose}>
          Đóng
        </button>
        {isRefundable ? (
          <button
            className="button-danger"
            onClick={() => onRefund(payment)}
            disabled={refunding}
          >
            <Undo2 size={16} />
            {refunding ? 'Đang hoàn tiền...' : 'Hoàn tiền'}
          </button>
        ) : null}
      </div>
    </Modal>
  )
}

export default function Payments() {
  const [filters, setFilters] = useState({
    q: '',
    status: 'all',
    method: 'all',
    from: '',
    to: '',
  })
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 12 })
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [refundReason, setRefundReason] = useState('Hoàn tiền theo yêu cầu admin')
  const [refundingId, setRefundingId] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const loadPayments = async (page = 1) => {
    try {
      setLoading(true)
      const data = await api.get('/admin/payments', { params: buildParams(filters, page) })
      setItems(Array.isArray(data?.items) ? data.items : [])
      setSummary(data?.summary || {})
      setPagination(data?.pagination || { page, totalPages: 1, total: 0, limit: 12 })
    } catch (error) {
      console.error('Failed to load admin payments', error)
      setItems([])
      setSummary({})
      setPagination({ page: 1, totalPages: 1, total: 0, limit: 12 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments(1)
  }, [refreshIndex])

  const handleSearch = () => {
    loadPayments(1)
  }

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > (pagination.totalPages || 1)) return
    loadPayments(nextPage)
  }

  const handleRefund = async (payment) => {
    if (!payment) return
    const message = `Hoàn tiền giao dịch ${payment.transactionId}?`
    if (!window.confirm(message)) return

    try {
      setRefundingId(payment._id)
      await api.post(`/admin/payments/${payment._id}/refund`, {
        reason: refundReason || 'Hoàn tiền theo yêu cầu admin',
      })
      setDetail(null)
      setRefreshIndex((value) => value + 1)
    } catch (error) {
      console.error('Failed to refund payment', error)
      window.alert(error?.message || error?.response?.data?.message || 'Không thể hoàn tiền giao dịch')
    } finally {
      setRefundingId(null)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const response = await requestRaw('/admin/payments/export', {
        method: 'GET',
        params: buildParams(filters, 1),
        headers: { Accept: 'text/csv' },
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `payments-export-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export payments', error)
      window.alert('Không thể xuất CSV lúc này')
    } finally {
      setExporting(false)
    }
  }

  const activeCounts = useMemo(() => ({
    totalTransactions: Number(summary.totalTransactions || 0),
    totalAmount: Number(summary.totalAmount || 0),
    completedAmount: Number(summary.completedAmount || 0),
    refundedAmount: Number(summary.refundedAmount || 0),
  }), [summary])

  return (
    <div className="admin-page payments-admin-page">
      <PageHeader
        title="GIAO DỊCH THANH TOÁN"
        subtitle="Theo dõi thanh toán, đối soát doanh thu và xử lý hoàn tiền mô phỏng khi gateway không hỗ trợ"
        icon={<CircleDollarSign size={22} />}
        actions={(
          <div className="payments-header-actions">
            <button className="button-secondary" onClick={() => setRefreshIndex((value) => value + 1)}>
              <RefreshCw size={16} />
              Làm mới
            </button>
            <button className="button-primary" onClick={handleExport} disabled={exporting}>
              <ArrowDownToLine size={16} />
              {exporting ? 'Đang xuất...' : 'Xuất CSV'}
            </button>
          </div>
        )}
      />

      <section className="payment-summary-grid">
        <SummaryCard
          icon={FileText}
          label="Tổng giao dịch"
          value={activeCounts.totalTransactions}
          note="Số bản ghi khớp bộ lọc hiện tại"
          tone="primary"
        />
        <SummaryCard
          icon={CircleDollarSign}
          label="Tổng doanh thu"
          value={formatCurrency(activeCounts.totalAmount)}
          note="Tổng số tiền của các giao dịch đã lọc"
          tone="secondary"
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Completed"
          value={formatCurrency(activeCounts.completedAmount)}
          note="Doanh thu đã ghi nhận"
          tone="success"
        />
        <SummaryCard
          icon={Undo2}
          label="Refunded"
          value={formatCurrency(activeCounts.refundedAmount)}
          note="Tổng giá trị hoàn tiền mô phỏng"
          tone="warning"
        />
      </section>

      <section className="payment-reconciliation-grid">
        <div className="payment-reconciliation-card">
          <div className="payment-reconciliation-head">
            <div>
              <h2>Đối soát theo trạng thái</h2>
              <p>So sánh nhanh khối lượng giao dịch theo từng trạng thái.</p>
            </div>
          </div>
          <div className="payment-reconciliation-list">
            {['completed', 'pending', 'failed', 'refunded'].map((status) => {
              const stat = summary.byStatus?.[status] || { count: 0, total: 0 }
              return (
                <div key={status} className="payment-reconciliation-item">
                  <div>
                    <strong>{statusLabel(status)}</strong>
                    <span>{stat.count} giao dịch</span>
                  </div>
                  <b>{formatCurrency(stat.total)}</b>
                </div>
              )
            })}
          </div>
        </div>

        <div className="payment-reconciliation-card">
          <div className="payment-reconciliation-head">
            <div>
              <h2>Đối soát theo phương thức</h2>
              <p>Theo dõi phân bổ thanh toán theo gateway.</p>
            </div>
          </div>
          <div className="payment-reconciliation-list">
            {['vnpay', 'momo', 'card'].map((method) => {
              const stat = summary.byMethod?.[method] || { count: 0, total: 0 }
              return (
                <div key={method} className="payment-reconciliation-item">
                  <div>
                    <strong>{methodLabel(method)}</strong>
                    <span>{stat.count} giao dịch</span>
                  </div>
                  <b>{formatCurrency(stat.total)}</b>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="payment-toolbar">
        <div className="payment-toolbar-search">
          <FormSearchField
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="Tìm transaction ID, plan, mô tả..."
            icon={Search}
          />
        </div>
        <div className="payment-toolbar-field">
          <FormSelectField
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="payment-toolbar-field">
          <FormSelectField
            value={filters.method}
            onChange={(event) => setFilters((current) => ({ ...current, method: event.target.value }))}
            options={METHOD_OPTIONS}
          />
        </div>
        <div className="payment-toolbar-date">
          <input
            type="date"
            className="input-field"
            value={filters.from}
            onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
          />
        </div>
        <div className="payment-toolbar-date">
          <input
            type="date"
            className="input-field"
            value={filters.to}
            onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
          />
        </div>
        <button className="button-secondary payment-toolbar-cta" onClick={handleSearch}>
          Lọc dữ liệu
        </button>
      </section>

      <section className="payment-table-card">
        <div className="payment-table-head">
          <div>
            <h2>Danh sách giao dịch</h2>
            <p>
              {pagination.total || 0} giao dịch khớp với bộ lọc, đang ở trang {pagination.page || 1}/{pagination.totalPages || 1}
            </p>
          </div>
          <button className="button-secondary" onClick={handleExport} disabled={exporting}>
            <ArrowDownToLine size={16} />
            {exporting ? 'Đang xuất...' : 'Export CSV'}
          </button>
        </div>

        {loading ? (
          <div className="payment-loading">Đang tải dữ liệu giao dịch...</div>
        ) : items.length === 0 ? (
          <EmptyState icon="💸" message="Chưa có giao dịch nào phù hợp với bộ lọc hiện tại." />
        ) : (
          <div className="payment-table-wrap">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Giao dịch</th>
                  <th>Người dùng</th>
                  <th>Trạng thái</th>
                  <th>Phương thức</th>
                  <th>Số tiền</th>
                  <th>Ngày tạo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <div className="payment-primary-cell">
                        <strong>{payment.transactionId}</strong>
                        <span>{payment.planId || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="payment-user-cell">
                        <strong>{payment.user?.fullName || 'N/A'}</strong>
                        <span>{payment.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <BadgePill label={statusLabel(payment.status)} tone={statusTone(payment.status)} icon={ShieldCheck} />
                    </td>
                    <td>
                      <BadgePill label={methodLabel(payment.method)} tone={methodTone(payment.method)} icon={Banknote} />
                    </td>
                    <td>
                      <strong>{formatCurrency(payment.amount, payment.currency)}</strong>
                    </td>
                    <td>{formatDateTime(payment.createdAt)}</td>
                    <td>
                      <TableActionMenu
                        onView={() => {
                          setRefundReason(payment.refund?.reason || 'Hoàn tiền theo yêu cầu admin')
                          setDetail(payment)
                        }}
                        customActions={payment.status === 'completed' ? [{
                          label: 'Hoàn tiền',
                          icon: <Undo2 size={16} />,
                          onClick: async () => {
                            setRefundReason('Hoàn tiền theo yêu cầu admin')
                            await handleRefund(payment)
                          },
                        }] : []}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="payment-pagination">
          <button
            className="button-secondary"
            onClick={() => handlePageChange((pagination.page || 1) - 1)}
            disabled={(pagination.page || 1) <= 1 || loading}
          >
            Trang trước
          </button>
          <span>
            Trang {pagination.page || 1} / {pagination.totalPages || 1}
          </span>
          <button
            className="button-secondary"
            onClick={() => handlePageChange((pagination.page || 1) + 1)}
            disabled={(pagination.page || 1) >= (pagination.totalPages || 1) || loading}
          >
            Trang sau
          </button>
        </div>
      </section>

      <PaymentDetailModal
        payment={detail}
        refundReason={refundReason}
        setRefundReason={setRefundReason}
        onClose={() => setDetail(null)}
        onRefund={handleRefund}
        refunding={refundingId === detail?._id}
      />
    </div>
  )
}
