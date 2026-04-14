import { useEffect, useState, useMemo } from "react"
import api from "../../api/client"
// Thay thế FiCrown bằng FaCrown (từ Font Awesome) và thêm FaCrown vào import list
import { FiFilter, FiX, FiCheckCircle, FiLock, FiUser, FiTrash2 } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa';

import FilterChip from '../../components/filters/FilterChip'
import '../../styles/components/filter.css'
import '../../styles/users.css'
import '../../styles/components/modal-form.css'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import TableActionMenu from '../../components/TableActionMenu';
import BadgePill from '../../components/common/BadgePill'
import FormSearchField from '../../components/common/FormSearchField'
import EmptyState from '../../components/common/EmptyState'
import {
  Users as UsersIcon,
  Mail,
  CalendarDays,
  Crown,
  ShieldCheck,
  ShieldX,
  BadgeCheck,
  Clock3,
  UserCircle2,
} from 'lucide-react'

// Định nghĩa các loại bộ lọc có thể có
const FILTER_TYPES = {
  ROLE: 'role',
  STATUS: 'status',
  SUBSCRIPTION: 'subscription'
}

const FILTER_OPTIONS = {
  [FILTER_TYPES.ROLE]: {
    label: 'Vai trò',
    options: [
      { value: 'user', label: 'Người dùng', icon: <FiUser size={14} /> },
      { value: 'admin', label: 'Quản trị viên', icon: <FaCrown size={14} style={{ color: '#ef4444' }} /> }, // ĐÃ SỬA: FiCrown -> FaCrown
    ]
  },
  [FILTER_TYPES.STATUS]: {
    label: 'Khóa',
    options: [
      { value: 'all', label: 'Tất cả', icon: <FiUser size={14} /> },
      { value: 'unbanned', label: 'Không bị khóa', icon: <FiCheckCircle size={14} style={{ color: '#10b981' }} /> },
      { value: 'banned', label: 'Đã khóa', icon: <FiLock size={14} style={{ color: '#ef4444' }} /> }
    ]
  },
  [FILTER_TYPES.SUBSCRIPTION]: {
    label: 'Gói dịch vụ',
    options: [
      { value: 'free', label: 'Miễn phí', icon: <FiUser size={14} /> },
      { value: 'premium', label: 'Cao cấp', icon: <FaCrown size={14} style={{ color: '#f59e0b' }} /> } // ĐÃ SỬA: FiCrown -> FaCrown
    ]
  }
}

// Helper component để hiển thị Badge cho trạng thái (Không đổi)
const StatusBadge = ({ user }) => {
  const isBanned = user.isBanned === true
  let label = 'Không bị khóa';
  let tone = 'neutral';

  if (isBanned) {
    label = 'Đã khóa';
    tone = 'danger';
  }

  return <BadgePill label={label} tone={tone} />
};

// --- Modal chọn Bộ lọc mới (Không đổi) ---
function FilterSelectModal({ isOpen, onClose, onApplyFilter }) {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);

  const handleApply = () => {
    if (!selectedType || !selectedValue) return;

    const typeConfig = FILTER_OPTIONS[selectedType];
    const option = typeConfig.options.find(opt => opt.value === selectedValue);

    if (option) {
      onApplyFilter({
        type: selectedType,
        value: option.value,
        label: `${typeConfig.label}: ${option.label}`
      });
      onClose();
      setSelectedType(null);
      setSelectedValue(null);
    }
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setSelectedValue(null); // Reset value khi thay đổi loại filter
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Bộ lọc"
      size="small"
    >
      <div className="space-y-4">
        {/* Select Filter Type */}
        <div className="modal-form-group">
          <label>Loại Bộ lọc</label>
          <select value={selectedType || ""} onChange={handleTypeChange} className="input-field">
            <option value="">-- Chọn loại bộ lọc --</option>
            {Object.entries(FILTER_OPTIONS).map(([type, config]) => (
              <option key={type} value={type}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Select Filter Value */}
        {selectedType && FILTER_OPTIONS[selectedType] && (
          <div className="modal-form-group">
            <label>{FILTER_OPTIONS[selectedType].label} Chi tiết</label>
            <select value={selectedValue || ""} onChange={(e) => setSelectedValue(e.target.value)} className="input-field">
              <option value="">-- Chọn giá trị --</option>
              {FILTER_OPTIONS[selectedType].options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="modal-footer mt-6">
        <button className="button-secondary" onClick={onClose}>Hủy</button>
        <button
          className="button-primary"
          onClick={handleApply}
          disabled={!selectedType || !selectedValue}
        >
          Áp dụng Bộ lọc
        </button>
      </div>
    </Modal>
  );
}
// --- Edit User Modal (Không đổi) ---
function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState(user || {})
  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(false)

  useEffect(() => {
    setForm({
      role: user?.role || 'user',
      isBanned: user?.isBanned || false,
      isVerified: user?.isVerified || false,
      subscriptionPlanId: user?.subscription?.planId || 'free',
    })
  }, [user])

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true)
        const data = await api.get('/v1/subscription-plans')
        setPlans(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
        setPlans([])
      } finally {
        setLoadingPlans(false)
      }
    }

    if (user) loadPlans()
  }, [user])

  const save = async () => {
    try {
      await api.put("/admin/users/" + user._id, {
        role: form.role,
        isBanned: form.isBanned,
        isVerified: form.isVerified,
        subscriptionPlanId: form.subscriptionPlanId,
      })
      onSaved()
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  if (!user) return null
  return (
    <Modal isOpen={!!user} onClose={onClose} title="Chỉnh sửa Người dùng" size="small" subtitle={user.email}>
      <div className="modal-form user-edit-form">
        <div className="modal-form-section-card">
          <div className="modal-form-section-title">Quyền quản trị</div>
          <div className="modal-form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Người dùng</label>
            <div className="detail-box" style={{ background: '#f8fafc', border: '1px solid #e5e7eb', padding: 12, borderRadius: 10 }}>
              <div style={{ fontWeight: 700 }}>{user.fullName || 'N/A'}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{user.email}</div>
            </div>
          </div>
          <div className="modal-form-grid">
            <div className="modal-form-group">
              <label className="form-label">Gói dịch vụ</label>
              <select
                value={form.subscriptionPlanId || 'free'}
                onChange={(e) => setForm({ ...form, subscriptionPlanId: e.target.value })}
                className="form-input"
                disabled={loadingPlans}
              >
                <option value="free">Miễn phí</option>
                {plans.map((plan) => (
                  <option key={plan.planId} value={plan.planId}>
                    {plan.name} ({plan.planId})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-form-group">
              <label className="form-label">Vai trò</label>
              <select value={form.role || "user"} onChange={(e) => setForm({ ...form, role: e.target.value })} className="form-input">
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label className="form-label">Tình trạng khóa</label>
              <select
                value={form.isBanned ? 'banned' : 'active'}
                onChange={(e) => setForm({ ...form, isBanned: e.target.value === 'banned' })}
                className="form-input"
              >
                <option value="active">Không bị khóa</option>
                <option value="banned">Đã khóa</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label className="form-label">Xác thực email</label>
              <select
                value={form.isVerified ? 'verified' : 'unverified'}
                onChange={(e) => setForm({ ...form, isVerified: e.target.value === 'verified' })}
                className="form-input"
              >
                <option value="verified">Đã xác thực</option>
                <option value="unverified">Chưa xác thực</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="button-secondary" onClick={onClose}>Hủy</button>
        <button className="button-primary" onClick={save}>Lưu Thay đổi</button>
      </div>
    </Modal>
  )
}

function DetailUserModal({ user, onClose }) {
  if (!user) return null

  const subscription = user.subscription || { tier: 'free', planId: 'free', endDate: null }
  const initials = (user.fullName || user.email || 'U').charAt(0).toUpperCase()
  const roleLabel = user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'
  const isBanned = user.isBanned === true
  const statusLabel = isBanned ? 'Đã khóa' : 'Không bị khóa'
  const statusTone = isBanned ? 'danger' : 'success'
  const planLabel = subscription.tier === 'premium' ? 'Cao cấp' : 'Miễn phí'

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Chi tiết Người dùng"
      size="medium"
      subtitle={user.email}
    >
      <div className="modal-form user-detail-modal">
        <section className="user-detail-hero">
          <div className="user-detail-avatar">
            {initials}
          </div>

          <div className="user-detail-hero-body">
            <div className="user-detail-hero-topline">
              <div>
                <h2>{user.fullName || 'Không có tên'}</h2>
                <p>
                  <Mail size={14} />
                  {user.email || 'N/A'}
                </p>
              </div>

              <div className="user-detail-hero-tags">
                <BadgePill label={roleLabel} tone={user.role === 'admin' ? 'warning' : 'neutral'} />
                <BadgePill label={statusLabel} tone={statusTone} />
              </div>
            </div>

            <div className="user-detail-metadata-row">
              <div className="user-detail-metadata">
                <UserCircle2 size={16} />
                <span>{user.username || 'Chưa có username'}</span>
              </div>
              <div className="user-detail-metadata">
                <CalendarDays size={16} />
                <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="user-detail-stats-grid">
          <div className="user-detail-stat-card">
            <span className="stat-label">Xác thực email</span>
            <div className="stat-value-row">
              {user.isVerified ? <ShieldCheck size={18} /> : <ShieldX size={18} />}
              <strong>{user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}</strong>
            </div>
          </div>

          <div className="user-detail-stat-card">
            <span className="stat-label">Gói dịch vụ</span>
            <div className="stat-value-row">
              <Crown size={18} />
              <strong>{planLabel}</strong>
            </div>
            <span className="stat-subtext">{subscription.planId || 'free'}</span>
          </div>

          <div className="user-detail-stat-card">
            <span className="stat-label">Trạng thái khóa</span>
            <div className="stat-value-row">
              <BadgeCheck size={18} />
              <strong>{isBanned ? 'Đang bị khóa' : 'Hoạt động bình thường'}</strong>
            </div>
            <span className="stat-subtext">{isBanned ? 'Tài khoản bị hạn chế' : 'Không có hạn chế'}</span>
          </div>
        </div>

        <div className="modal-form-section-card user-detail-section-card">
          <div className="modal-form-section-title">Chi tiết quản trị</div>
          <div className="user-detail-info-list">
            <div className="user-detail-info-item">
              <span className="info-label">Gói DV hiện tại</span>
              <span className="info-value">{subscription.tier === 'premium' ? `Cao cấp (${subscription.planId || 'N/A'})` : 'Miễn phí'}</span>
            </div>
            <div className="user-detail-info-item">
              <span className="info-label">Ngày hết hạn</span>
              <span className="info-value">{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('vi-VN') : 'Không áp dụng'}</span>
            </div>
            <div className="user-detail-info-item">
              <span className="info-label">Số followers</span>
              <span className="info-value">{user.followersCount ?? 0}</span>
            </div>
            <div className="user-detail-info-item">
              <span className="info-label">Số following</span>
              <span className="info-value">{user.followingCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="button-primary" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  )
}
// ----------------------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------------------
export default function Users() {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [activeFilters, setActiveFilters] = useState([])
  const [showFilterModal, setShowFilterModal] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const data = await api.get("/admin/users")
      setUsers(data)
    } catch (err) {
      console.error(err)
    }
  }

  const remove = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return
    await api.del("/admin/users/" + id)
    load()
  }

  const filtered = useMemo(() => {
    return users.filter((u) => {
      // Áp dụng tìm kiếm văn bản
      const searchText = `${u.fullName || ""} ${u.email || ""} ${u.username || ""}`.toLowerCase()
      const matchesSearch = searchText.includes(query.toLowerCase())

      // Áp dụng tất cả bộ lọc đang hoạt động
      const matchesFilters = activeFilters.every(filter => {
        switch (filter.type) {
          case FILTER_TYPES.ROLE:
            return u.role === filter.value
          case FILTER_TYPES.STATUS:
            if (filter.value === 'all') return true
            if (filter.value === 'unbanned') return u.isBanned !== true
            if (filter.value === 'banned') return u.isBanned === true
            return true
          case FILTER_TYPES.SUBSCRIPTION:
            return (u.subscription?.tier || 'free') === filter.value
          default:
            return true
        }
      })

      return matchesSearch && matchesFilters
    })
  }, [users, query, activeFilters])

  const handleApplyFilter = (newFilter) => {
    // Kiểm tra xem bộ lọc đã tồn tại chưa (để tránh trùng lặp)
    const exists = activeFilters.some(f => f.type === newFilter.type && f.value === newFilter.value);
    if (!exists) {
      setActiveFilters([...activeFilters, newFilter]);
    }
  };

  const handleRemoveFilter = (filterToRemove) => {
    setActiveFilters(activeFilters.filter(f => f !== filterToRemove));
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="QUẢN LÝ NGƯỜI DÙNG"
        subtitle={`Tìm thấy ${filtered.length} trên tổng số ${users.length} người dùng`}
        icon={<UsersIcon size={26} />}
        actions={(
          <button className="button-danger" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiTrash2 size={16} /> <span>Xóa hàng loạt</span>
          </button>
        )} />

      {/* --- Search & Filter Bar --- */}
      <div className="search-filter-bar bg-white p-4 rounded-lg shadow-md mb-4" style={{ display: 'flex', gap: 10 }}>

        {/* Search Input */}
        <div style={{ flexGrow: 1 }}>
          <FormSearchField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm theo Tên, Email..."
            icon={FiUser}
          />
        </div>

        {/* Add Filter Button */}
        <button
          className="button-secondary"
          onClick={() => setShowFilterModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 15px' }}
        >
          <FiFilter size={16} />
          Thêm Bộ lọc
        </button>
      </div>

      {/* --- Active Filters --- */}
      <div className="active-filters-container mb-4 flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => (
          <FilterChip
            key={index}
            label={filter.label}
            onRemove={() => handleRemoveFilter(filter)}
            icon={FILTER_OPTIONS[filter.type].options.find(o => o.value === filter.value)?.icon}
          />
        ))}
        {activeFilters.length > 0 && (
          <button
            onClick={() => setActiveFilters([])}
            className="text-sm font-medium"
            style={{ padding: '4px 10px', color: '#ef4444', border: '1px solid #ef444460', borderRadius: '15px', background: '#fee2e2' }}
          >
            <FiX size={14} style={{ display: 'inline', marginRight: 4 }} />
            Xóa Tất cả
          </button>
        )}
      </div>

      {/* --- Users Table --- */}
      <div className="table-section bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState icon="🕵️" message="Không tìm thấy người dùng nào khớp với tiêu chí tìm kiếm và bộ lọc." />
        ) : (
          <table className="table users-table">
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={tableHeaderStyle}>Tên đầy đủ</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Gói DV</th>
                <th style={tableHeaderStyle}>Vai trò</th>
                <th style={tableHeaderStyle}>Trạng thái</th>
                <th style={tableHeaderStyle}>Xác thực</th>
                <th className="actions-column" style={{ ...tableHeaderStyle, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tableCellStyle} className="font-medium">{u.fullName || 'N/A'}</td>
                  <td style={tableCellStyle} className="text-gray-600">{u.email}</td>
                  <td style={tableCellStyle}>
                    <span className={`subscription-tag subscription-${u.subscription?.tier || 'free'}`}>
                      {u.subscription?.tier === 'premium'
                        ? `Cao cấp ${u.subscription.planId?.includes('yearly') ? '(Năm)' : u.subscription.planId?.includes('monthly') ? '(Tháng)' : ''}`
                        : 'Miễn phí'}
                    </span>
                    {u.subscription?.endDate && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 4 }}>
                        Hết hạn: {new Date(u.subscription.endDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{ fontWeight: 600, color: u.role === 'admin' ? '#ef4444' : '#374151' }}>
                      {u.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <StatusBadge user={u} />
                  </td>
                  <td style={tableCellStyle}>
                    <BadgePill label={u.isVerified ? 'Đã xác thực' : 'Chưa xác thực'} tone={u.isVerified ? 'success' : 'danger'} />
                  </td>
                  <td className="actions-cell" style={{ ...tableCellStyle, textAlign: 'center' }}>
                    <TableActionMenu
                      onView={() => setViewing(u)}
                      onEdit={() => setEditing(u)}
                      onDelete={() => remove(u._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EditUserModal user={editing} onClose={() => setEditing(null)} onSaved={load} />
      <DetailUserModal user={viewing} onClose={() => setViewing(null)} />
      <FilterSelectModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilter={handleApplyFilter}
      />
    </div>
  )
}

// Inline Styles for Table
const tableHeaderStyle = {
  padding: '16px 24px', // Tăng padding lên cho thoáng
  textAlign: 'left',
  color: '#6b7280',
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.05em' // Giãn chữ nhẹ cho sang
};
const tableCellStyle = {
  borderBottom: '1px solid #f3f4f6',
  verticalAlign: 'middle' // Căn giữa theo chiều dọc
};