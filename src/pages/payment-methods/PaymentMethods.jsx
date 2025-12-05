import React, { useEffect, useState, useMemo } from 'react'
import api from '../../api/client'
import { FiEye, FiEdit, FiTrash2, FiPlus, FiSearch, FiX, FiCheck, FiStar } from 'react-icons/fi'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
// Đảm bảo import CSS bảng đã sửa (có table-layout: fixed)
import '../../styles/components/table.css'
import '../../styles/components/modal-form.css'
import TableActionMenu from '../../components/TableActionMenu';

// ... (Giữ nguyên các hàm Helper: formatCurrency, PopularBadge, DetailItem...)
const formatCurrency = (value, currency = 'USD') => {
  const style = currency === 'VND' ? 'vi-VN' : 'en-US';
  return new Intl.NumberFormat(style, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(value);
};

const PopularBadge = ({ isPopular }) => {
  if (!isPopular) {
    return <span style={{ color: '#9ca3af', fontSize: 13 }}>Không</span>;
  }
  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: '#fef3c7',
      color: '#b45309',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <FiStar size={14} />
      Phổ biến
    </span>
  );
};

// ... (Giữ nguyên DetailModal và DetailItem)
const DetailItem = ({ label, value }) => (
  <div className="modal-field" style={{ padding: 8, background: '#f9fafb', borderRadius: 4 }}>
    <span className="modal-field-label" style={{ fontSize: 13, color: '#6b7280' }}>
      {label}
    </span>
    <span className="modal-field-value" style={{ fontWeight: 600, color: '#1f2937' }}>{value}</span>
  </div>
);

function DetailModal({ item, onClose }) {
  if (!item) return null
  return (
    <Modal isOpen={!!item} onClose={onClose} title={item.name} size="small" subtitle={`${item.tier} • ${item.billingCycle}`}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ width: '48%' }}><DetailItem label="Tier" value={item.tier} /></div>
        <div style={{ width: '48%' }}><DetailItem label="Chu kỳ" value={item.billingCycle} /></div>
        <div style={{ width: '48%' }}><DetailItem label="Giá" value={formatCurrency(item.price, item.currency)} /></div>
        <div style={{ width: '48%' }}><DetailItem label="Độ Phổ biến" value={<PopularBadge isPopular={item.popularPlan} />} /></div>
      </div>

      <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 16 }}>Tính năng</h4>
      {Array.isArray(item.features) && item.features.length > 0 ? (
        <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: 'none', background: '#f9fafb', padding: 12, borderRadius: 6 }}>
          {item.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <FiCheck size={16} style={{ color: '#10b981' }} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      ) : <p style={{ color: '#9ca3af' }}>Không có tính năng nào.</p>}

      <div className="modal-footer" style={{ marginTop: 20 }}>
        <button className="button-primary" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  )
}

// ... (Giữ nguyên EditPlanModal hoàn toàn giống code cũ)
function EditPlanModal({ plan, onClose, onSaved }) {
  const [form, setForm] = useState(plan || { tier: 'premium', billingCycle: 'monthly', currency: 'VND', price: 0, features: [], popularPlan: false, name: '', planId: '' })
  const [featureInput, setFeatureInput] = useState('')
  useEffect(() => {
    const emptyPlan = { tier: 'premium', billingCycle: 'monthly', currency: 'VND', price: 0, features: [], popularPlan: false, name: '', planId: '' };
    setForm(plan?._id ? plan : emptyPlan);
  }, [plan])

  if (!plan) return null

  const addFeature = () => {
    const v = featureInput.trim(); if (!v) return; setForm(prev => ({ ...prev, features: [...(prev.features || []), v] })); setFeatureInput('')
  }
  const removeFeature = (idx) => setForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }))
  const save = async () => {
    const payload = { ...form }
    try {
      if (form._id) {
        await api.put('/v1/subscription-plans/' + form._id, payload)
      } else {
        await api.post('/v1/subscription-plans', payload)
      }
      onSaved(); onClose()
    } catch (e) { console.error(e) }
  }

  return (
    <Modal isOpen={!!plan} onClose={onClose} title={form._id ? 'Sửa Gói' : 'Tạo Gói Mới'} size="medium">
      <div style={{ paddingRight: 0 }}>
        <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
          <div className="modal-form-group" style={{ flex: 1 }}>
            <label className="form-label">Tên Gói</label>
            <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="form-input" placeholder="Premium Tháng" />
          </div>
          <div className="modal-form-group" style={{ flex: 1 }}>
            <label className="form-label">Plan ID (Stripe/Momo...)</label>
            <input value={form.planId || ''} onChange={e => setForm({ ...form, planId: e.target.value })} disabled={!!form._id} className="form-input" placeholder="plan_monthly_123" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
          <div className="modal-form-group" style={{ flex: 1 }}>
            <label className="form-label">Tier</label>
            <select value={form.tier || 'premium'} onChange={e => setForm({ ...form, tier: e.target.value })} className="form-input">
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="modal-form-group" style={{ flex: 1 }}>
            <label className="form-label">Chu kỳ Thanh toán</label>
            <select value={form.billingCycle || 'monthly'} onChange={e => setForm({ ...form, billingCycle: e.target.value })} className="form-input">
              <option value="monthly">Hàng tháng (monthly)</option>
              <option value="yearly">Hàng năm (yearly)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
          <div className="modal-form-group" style={{ flex: 2 }}>
            <label className="form-label">Giá (Price)</label>
            <input type="number" value={form.price ?? 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="form-input" />
          </div>
          <div className="modal-form-group">
            <label className="form-label">Tiền tệ</label>
            <input value={form.currency || 'VND'} onChange={e => setForm({ ...form, currency: e.target.value })} className="form-input" placeholder="VND, USD..." />
          </div>
        </div>

        <div className="modal-form-group">
          <label className="form-label">Tính năng</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Thêm một tính năng..." className="form-input" style={{ flex: 1 }} />
            <button type="button" className="button-primary" onClick={addFeature}>Thêm</button>
          </div>
          {Array.isArray(form.features) && form.features.length > 0 && (
            <div style={{ border: '1px solid #e5e7eb', padding: 10, borderRadius: 8, maxHeight: 150, overflowY: 'auto' }}>
              {form.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px dotted #eee' }}>
                  <span>{f}</span>
                  <button type="button" className="small-icon-button danger" onClick={() => removeFeature(i)}>
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-form-group" style={{ marginTop: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form.popularPlan} onChange={e => setForm({ ...form, popularPlan: e.target.checked })} style={{ transform: 'scale(1.2)' }} />
            <span style={{ fontWeight: 600, color: '#f59e0b' }}>
              Đánh dấu là Gói Phổ biến
            </span>
          </label>
        </div>
      </div>

      <div className="modal-footer">
        <button className="button-secondary" onClick={onClose}>Hủy</button>
        <button className="button-primary" onClick={save}>Lưu</button>
      </div>
    </Modal>
  )
}

// --- Main Component ---
export default function PaymentMethods() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(null)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false);

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      setLoading(true);
      setItems(await api.get('/v1/subscription-plans'))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn XÓA gói thanh toán này?')) return;
    try {
      await api.del('/v1/subscription-plans/' + id);
      load();
    } catch (e) {
      console.error('Failed to delete plan', e);
    }
  }

  const filtered = useMemo(() => items.filter(p =>
    (`${p.name} ${p.tier} ${p.billingCycle}`.toLowerCase())
      .includes(query.toLowerCase())
  ), [items, query]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Các Gói Thanh toán"
        subtitle={`Tổng ${items.length} gói`}
        actions={(
          <button className="button-primary" onClick={() => setEditing({})} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus size={16} /> Tạo Gói Mới
          </button>
        )} />

      <div className="search-filter-bar bg-white p-4 rounded-lg shadow-md mb-6">
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            placeholder="Tìm kiếm theo tên, tier, chu kỳ..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 40 }}
          />
        </div>
      </div>

      {/* SỬA ĐỔI: Thêm class "table-container" để nhận CSS ẩn scrollbar */}
      <div className="table-container bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state text-center py-10 text-gray-500">
            <div className="text-4xl mb-3">💳</div>
            <p>Chưa có gói thanh toán nào được tạo.</p>
          </div>
        ) : (
          /* SỬA ĐỔI: Thêm class "table" và bỏ w-full vì class table đã lo việc đó */
          <table className="table">
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                {/* SỬA ĐỔI: Phân chia width % để bảng đầy đặn */}
                <th style={{ ...tableHeaderStyle, width: '25%' }}>Tên Gói</th>
                <th style={{ ...tableHeaderStyle, width: '15%' }}>Tier</th>
                <th style={{ ...tableHeaderStyle, width: '15%' }}>Chu kỳ</th>
                <th style={{ ...tableHeaderStyle, width: '15%' }}>Giá</th>
                <th style={{ ...tableHeaderStyle, width: '15%' }}>Phổ biến</th>
                <th style={{ ...tableHeaderStyle, width: '15%', textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tableCellStyle} className="font-medium">{p.name}</td>
                  <td style={tableCellStyle}>
                    {/* Badge cho Tier */}
                    <span style={{
                      padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                      backgroundColor: p.tier === 'premium' ? '#ede9fe' : '#f3f4f6',
                      color: p.tier === 'premium' ? '#6d28d9' : '#4b5563'
                    }}>
                      {p.tier}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{p.billingCycle}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 'bold', color: '#059669' }}>
                    {formatCurrency(p.price, p.currency)}
                  </td>
                  <td style={tableCellStyle}>
                    <PopularBadge isPopular={p.popularPlan} />
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                    <TableActionMenu
                      onView={() => setDetail(p)}
                      onEdit={() => setEditing(p)}
                      onDelete={() => handleDelete(p._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DetailModal item={detail} onClose={() => setDetail(null)} />
      <EditPlanModal plan={editing} onClose={() => setEditing(null)} onSaved={load} />
    </div>
  )
}

// Inline Styles (Đã cập nhật)
const tableHeaderStyle = { padding: '12px 15px', textAlign: 'left', color: '#4b5563', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' };
const tableCellStyle = { padding: '12px 15px', fontSize: 14, verticalAlign: 'middle' };
const actionButtonStyle = (color) => ({
  background: `${color}1A`,
  color: color,
  border: 'none',
  borderRadius: '4px',
  padding: '8px',
  cursor: 'pointer',
  transition: 'background 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});