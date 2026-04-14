import React, { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import {
  FiCheck,
  FiEdit,
  FiEye,
  FiDollarSign,
  FiPlus,
  FiSearch,
  FiStar,
  FiTrash2,
  FiX,
  FiGrid,
} from 'react-icons/fi'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import '../../styles/components/modal-form.css'
import TableActionMenu from '../../components/TableActionMenu'
import FormSearchField from '../../components/common/FormSearchField'
import FormSelectField from '../../components/common/FormSelectField'
import EmptyState from '../../components/common/EmptyState'
import PlanStatCard from '../../components/payment-plans/PlanStatCard'
import PlanPill from '../../components/payment-plans/PlanPill'

const formatCurrency = (value, currency = 'USD') => {
  const locale = currency === 'VND' ? 'vi-VN' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

const tierLabel = (tier) => {
  if (tier === 'premium') return 'Cao cấp'
  if (tier === 'free') return 'Miễn phí'
  return tier || 'Khác'
}

const cycleLabel = (cycle) => {
  if (cycle === 'monthly') return 'Hàng tháng'
  if (cycle === 'yearly') return 'Hàng năm'
  return cycle || 'Khác'
}

const PopularBadge = ({ isPopular }) => {
  if (!isPopular) return <PlanPill tone="neutral">Tiêu chuẩn</PlanPill>

  return (
    <PlanPill tone="warning">
      <FiStar size={13} />
      Phổ biến
    </PlanPill>
  )
}

const DetailItem = ({ label, value }) => (
  <div className="plan-detail-item">
    <span className="plan-detail-label">{label}</span>
    <span className="plan-detail-value">{value}</span>
  </div>
)

function DetailModal({ item, onClose }) {
  if (!item) return null

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={item.name}
      size="small"
      subtitle={`${tierLabel(item.tier)} • ${cycleLabel(item.billingCycle)}`}
    >
      <div className="plan-detail-grid">
        <DetailItem label="Hạng" value={tierLabel(item.tier)} />
        <DetailItem label="Chu kỳ" value={cycleLabel(item.billingCycle)} />
        <DetailItem label="Giá" value={formatCurrency(item.price, item.currency)} />
        <DetailItem label="Trạng thái" value={item.popularPlan ? 'Phổ biến' : 'Tiêu chuẩn'} />
      </div>

      <div className="plan-detail-section">
        <h4>Tính năng</h4>
        {Array.isArray(item.features) && item.features.length > 0 ? (
          <ul className="plan-feature-list">
            {item.features.map((feature, index) => (
              <li key={index}>
                <FiCheck size={15} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="plan-muted-text">Không có tính năng nào.</p>
        )}
      </div>

      <div className="modal-footer">
        <button className="button-primary" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  )
}

function EditPlanModal({ plan, onClose, onSaved }) {
  const [form, setForm] = useState(
    plan || {
      tier: 'premium',
      billingCycle: 'monthly',
      currency: 'VND',
      price: 0,
      features: [],
      popularPlan: false,
      name: '',
      planId: '',
    },
  )
  const [featureInput, setFeatureInput] = useState('')

  useEffect(() => {
    const emptyPlan = {
      tier: 'premium',
      billingCycle: 'monthly',
      currency: 'VND',
      price: 0,
      features: [],
      popularPlan: false,
      name: '',
      planId: '',
    }
    setForm(plan?._id ? plan : emptyPlan)
    setFeatureInput('')
  }, [plan])

  if (!plan) return null

  const addFeature = () => {
    const nextValue = featureInput.trim()
    if (!nextValue) return
    setForm((prev) => ({ ...prev, features: [...(prev.features || []), nextValue] }))
    setFeatureInput('')
  }

  const removeFeature = (index) => {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, featureIndex) => featureIndex !== index) }))
  }

  const save = async () => {
    const payload = { ...form }
    try {
      if (form._id) {
        await api.put('/v1/subscription-plans/' + form._id, payload)
      } else {
        await api.post('/v1/subscription-plans', payload)
      }
      onSaved()
      onClose()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Modal
      isOpen={!!plan}
      onClose={onClose}
      title={form._id ? 'Chỉnh sửa gói' : 'Tạo gói thanh toán'}
      size="large"
      subtitle="Cập nhật thông tin gói trước khi lưu"
    >
      <div className="plan-editor-shell">
        <div className="modal-form payment-plan-form plan-editor-form">
          <div className="modal-form-section-card">
            <div className="modal-form-section-title">Thông tin gói</div>
            <div className="modal-form-grid payment-form-main-grid">
              <div className="modal-form-group">
                <label className="form-label">Tên gói</label>
                <input
                  value={form.name || ''}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="form-input"
                  placeholder="Premium Tháng"
                />
              </div>
              <div className="modal-form-group">
                <label className="form-label">Plan ID</label>
                <input
                  value={form.planId || ''}
                  onChange={(event) => setForm({ ...form, planId: event.target.value })}
                  disabled={!!form._id}
                  className="form-input"
                  placeholder="plan_monthly_123"
                />
              </div>
            </div>

            <div className="modal-form-grid">
              <div className="modal-form-group">
                <label className="form-label">Hạng</label>
                <select value={form.tier || 'premium'} onChange={(event) => setForm({ ...form, tier: event.target.value })} className="form-input">
                  <option value="free">Miễn phí</option>
                  <option value="premium">Cao cấp</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label className="form-label">Chu kỳ</label>
                <select
                  value={form.billingCycle || 'monthly'}
                  onChange={(event) => setForm({ ...form, billingCycle: event.target.value })}
                  className="form-input"
                >
                  <option value="monthly">Hàng tháng</option>
                  <option value="yearly">Hàng năm</option>
                </select>
              </div>
            </div>

            <div className="modal-form-grid">
              <div className="modal-form-group">
                <label className="form-label">Giá</label>
                <input
                  type="number"
                  value={form.price ?? 0}
                  onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                  className="form-input"
                />
              </div>
              <div className="modal-form-group">
                <label className="form-label">Tiền tệ</label>
                <input
                  value={form.currency || 'VND'}
                  onChange={(event) => setForm({ ...form, currency: event.target.value })}
                  className="form-input"
                  placeholder="VND, USD..."
                />
              </div>
            </div>
          </div>

          <div className="modal-form-section-card">
            <div className="modal-form-section-title">Tính năng và trạng thái</div>
            <div className="modal-form-group">
              <label className="form-label">Tính năng</label>
              <div className="payment-plan-feature-input-row">
                <input
                  value={featureInput}
                  onChange={(event) => setFeatureInput(event.target.value)}
                  placeholder="Thêm một tính năng..."
                  className="form-input"
                />
                <button type="button" className="button-primary" onClick={addFeature}>Thêm</button>
              </div>
              {Array.isArray(form.features) && form.features.length > 0 && (
                <div className="modal-form-list">
                  {form.features.map((feature, index) => (
                    <div key={index} className="modal-form-list-item">
                      <span>{feature}</span>
                      <button type="button" className="small-icon-button danger" onClick={() => removeFeature(index)}>
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-form-group">
              <label className="payment-plan-popular-toggle">
                <input
                  type="checkbox"
                  checked={!!form.popularPlan}
                  onChange={(event) => setForm({ ...form, popularPlan: event.target.checked })}
                />
                <span>Đánh dấu là gói phổ biến</span>
              </label>
            </div>
          </div>
        </div>

        <aside className="plan-preview-panel">
          <div className="plan-preview-card">
            <span className="plan-preview-eyebrow">Live preview</span>
            <h3>{form.name || 'Tên gói sẽ xuất hiện ở đây'}</h3>
            <div className="plan-preview-price">
              {formatCurrency(form.price, form.currency)}
            </div>
            <div className="plan-preview-badges">
              <PlanPill tone={form.tier === 'premium' ? 'primary' : 'neutral'}>
                {tierLabel(form.tier)}
              </PlanPill>
              <PlanPill tone="info">{cycleLabel(form.billingCycle)}</PlanPill>
              <PopularBadge isPopular={form.popularPlan} />
            </div>
            <p className="plan-preview-description">
              {form.planId || 'plan_id'}
            </p>
            <div className="plan-preview-list">
              {(form.features || []).slice(0, 5).map((feature, index) => (
                <div key={index} className="plan-preview-feature">
                  <FiCheck size={14} />
                  <span>{feature}</span>
                </div>
              ))}
              {(form.features || []).length === 0 ? (
                <p className="plan-muted-text">Thêm tính năng để preview chính xác hơn.</p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <div className="modal-footer">
        <button className="button-secondary" onClick={onClose}>Hủy</button>
        <button className="button-primary" onClick={save}>Lưu</button>
      </div>
    </Modal>
  )
}

function PlanCard({ plan, onView, onEdit, onDelete }) {
  const features = Array.isArray(plan.features) ? plan.features : []

  return (
    <article className={`plan-card ${plan.popularPlan ? 'popular' : ''}`}>
      <div className="plan-card-top">
        <div>
          <div className="plan-card-title-row">
            <h3>{plan.name}</h3>
            <PopularBadge isPopular={plan.popularPlan} />
          </div>
          <div className="plan-card-meta">
            <PlanPill tone={plan.tier === 'premium' ? 'primary' : 'neutral'}>{tierLabel(plan.tier)}</PlanPill>
            <PlanPill tone="info">{cycleLabel(plan.billingCycle)}</PlanPill>
          </div>
        </div>

        <div className="plan-card-action-wrap">
          <TableActionMenu onView={onView} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      <div className="plan-card-price-block">
        <span className="plan-card-price-label">Giá gói</span>
        <div className="plan-card-price">{formatCurrency(plan.price, plan.currency)}</div>
        <span className="plan-card-subtext">ID: {plan.planId}</span>
      </div>

      <div className="plan-card-features">
        {(features.length ? features : ['Chưa có tính năng được khai báo'])
          .slice(0, 4)
          .map((feature, index) => (
            <div key={index} className="plan-card-feature-item">
              <FiCheck size={14} />
              <span>{feature}</span>
            </div>
          ))}
      </div>

      <div className="plan-card-footer">
        <button type="button" className="plan-card-footer-btn" onClick={onView}>
          <FiEye size={14} />
          Xem
        </button>
        <button type="button" className="plan-card-footer-btn" onClick={onEdit}>
          <FiEdit size={14} />
          Sửa
        </button>
        <button type="button" className="plan-card-footer-btn danger" onClick={onDelete}>
          <FiTrash2 size={14} />
          Xóa
        </button>
      </div>
    </article>
  )
}

export default function PaymentMethods() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(null)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tierFilter, setTierFilter] = useState('all')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      setItems(await api.get('/v1/subscription-plans'))
    } catch (error) {
      if (error?.status === 404) {
        setItems([])
      } else {
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn XÓA gói thanh toán này?')) return
    try {
      await api.del('/v1/subscription-plans/' + id)
      load()
    } catch (error) {
      console.error('Failed to delete plan', error)
    }
  }

  const stats = useMemo(() => {
    const premiumCount = items.filter((plan) => plan.tier === 'premium').length
    const popularCount = items.filter((plan) => plan.popularPlan).length
    const yearlyCount = items.filter((plan) => plan.billingCycle === 'yearly').length
    const averagePrice = items.length
      ? Math.round(items.reduce((sum, plan) => sum + (Number(plan.price) || 0), 0) / items.length)
      : 0

    return [
      {
        label: 'Tổng gói',
        value: items.length,
        description: 'Gói thanh toán đang hoạt động trong hệ thống',
        accent: 'primary',
      },
      {
        label: 'Gói cao cấp',
        value: premiumCount,
        description: 'Số gói được gắn tier premium',
        accent: 'secondary',
      },
      {
        label: 'Gói phổ biến',
        value: popularCount,
        description: 'Gói đang được ưu tiên hiển thị',
        accent: 'warning',
      },
      {
        label: 'Giá trung bình',
        value: formatCurrency(averagePrice, 'VND'),
        description: `${yearlyCount} gói theo chu kỳ năm`,
        accent: 'success',
      },
    ]
  }, [items])

  const filtered = useMemo(() => items.filter((plan) => {
    const matchesQuery = (`${plan.name} ${plan.tier} ${plan.billingCycle}`.toLowerCase())
      .includes(query.toLowerCase())
    const matchesTier = tierFilter === 'all' || plan.tier === tierFilter
    return matchesQuery && matchesTier
  }), [items, query, tierFilter])

  return (
    <div className="admin-page payment-plans-page">
      <PageHeader
        title="GÓI THANH TOÁN"
        subtitle="Quản lý, tạo và cập nhật các gói subscription"
        icon={<FiDollarSign size={22} />}
        actions={(
          <button className="button-primary payment-plans-cta" onClick={() => setEditing({})}>
            <FiPlus size={16} />
            Tạo gói mới
          </button>
        )}
      />

      <section className="payment-plans-stats-grid">
        {stats.map((stat) => (
          <PlanStatCard key={stat.label} {...stat} />
        ))}
      </section>

      <div className="search-filter-bar payment-plans-toolbar">
        <div className="toolbar-search">
          <FormSearchField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên, tier, chu kỳ..."
            icon={FiSearch}
          />
        </div>

        <div className="toolbar-filter">
          <FormSelectField
            value={tierFilter}
            onChange={(event) => setTierFilter(event.target.value)}
            options={[
              { value: 'all', label: 'Tất cả Tier' },
              { value: 'free', label: 'Miễn phí' },
              { value: 'premium', label: 'Cao cấp' },
            ]}
          />
        </div>
      </div>

      <section className="payment-plans-section">
        <div className="payment-plans-section-head">
          <div>
            <h2>Danh sách gói thanh toán</h2>
            <p>{filtered.length} gói phù hợp với bộ lọc hiện tại.</p>
          </div>
          <button type="button" className="button-secondary" onClick={() => setEditing({})}>
            <FiGrid size={16} />
            Tạo nhanh
          </button>
        </div>

        {loading ? (
          <div className="payment-plans-loading">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="💳" message="Chưa có gói thanh toán nào được tạo." />
        ) : (
          <div className="payment-plans-grid">
            {filtered.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                onView={() => setDetail(plan)}
                onEdit={() => setEditing(plan)}
                onDelete={() => handleDelete(plan._id)}
              />
            ))}
          </div>
        )}
      </section>

      <DetailModal item={detail} onClose={() => setDetail(null)} />
      <EditPlanModal plan={editing} onClose={() => setEditing(null)} onSaved={load} />
    </div>
  )
}
