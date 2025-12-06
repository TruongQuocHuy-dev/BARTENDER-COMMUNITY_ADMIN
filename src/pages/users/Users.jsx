import { useEffect, useState, useMemo } from "react"
import api from "../../api/client"
// Thay thế FiCrown bằng FaCrown (từ Font Awesome) và thêm FaCrown vào import list
import { FiPlus, FiFilter, FiX, FiCheckCircle, FiAlertTriangle, FiLock, FiUser, FiTrash2 } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa';

import FilterChip from '../../components/filters/FilterChip'
import '../../styles/components/filter.css'
import '../../styles/users.css'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import TableActionMenu from '../../components/TableActionMenu';

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
    label: 'Trạng thái',
    options: [
      { value: 'active', label: 'Đang hoạt động', icon: <FiCheckCircle size={14} style={{ color: '#10b981' }} /> },
      { value: 'inactive', label: 'Không hoạt động', icon: <FiAlertTriangle size={14} style={{ color: '#f59e0b' }} /> },
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
  let status = 'inactive';
  let label = 'Không hoạt động';
  let color = '#9ca3af';

  if (user.isBanned) {
    status = 'banned';
    label = 'Đã khóa';
    color = '#ef4444';
  } else if (user.isActive) {
    status = 'active';
    label = 'Hoạt động';
    color = '#10b981';
  }

  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: `${color}1A`, // 10% opacity
      color: color
    }}>
      {label}
    </span>
  );
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
  // ... (Code modal chỉnh sửa không đổi)
  const [form, setForm] = useState(user || {})

  useEffect(() => setForm(user || {}), [user])

  const save = async () => {
    try {
      await api.put("/admin/users/" + user._id, form)
      onSaved()
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  if (!user) return null
  return (
    <Modal isOpen={!!user} onClose={onClose} title="Chỉnh sửa Người dùng" size="small" subtitle={user.email}>
      <div className="modal-form-group">
        <label>Tên đầy đủ</label>
        <input value={form.fullName || ""} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" />
      </div>
      <div className="modal-form-group">
        <label>Email</label>
        <input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" disabled />
      </div>
      <div className="modal-form-group">
        <label>Vai trò</label>
        <select value={form.role || "user"} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
          <option value="user">Người dùng</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>
      {/* Giả định thêm trường trạng thái/ban ở đây */}
      <div className="modal-form-group">
        <label>Tình trạng Khóa (Ban)</label>
        <select
          value={form.isBanned ? 'banned' : 'active'}
          onChange={(e) => setForm({ ...form, isBanned: e.target.value === 'banned' })}
          className="input-field"
        >
          <option value="active">Không bị khóa</option>
          <option value="banned">Đã khóa (Banned)</option>
        </select>
      </div>
      <div className="modal-footer">
        <button className="button-secondary" onClick={onClose}>Hủy</button>
        <button className="button-primary" onClick={save}>Lưu Thay đổi</button>
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
      const searchText = (u.fullName || u.email || u.username || "").toLowerCase()
      const matchesSearch = searchText.includes(query.toLowerCase())

      // Áp dụng tất cả bộ lọc đang hoạt động
      const matchesFilters = activeFilters.every(filter => {
        switch (filter.type) {
          case FILTER_TYPES.ROLE:
            return u.role === filter.value
          case FILTER_TYPES.STATUS:
            // Logic filter Status phức tạp hơn, dựa trên cả isActive và isBanned
            if (filter.value === 'active') return u.isActive && !u.isBanned
            if (filter.value === 'inactive') return !u.isActive && !u.isBanned
            if (filter.value === 'banned') return u.isBanned
            return true
          case FILTER_TYPES.SUBSCRIPTION:
            return (u.subscription || 'free') === filter.value
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="QUẢN LÝ NGƯỜI DÙNG"
        subtitle={`Tìm thấy ${filtered.length} trên tổng số ${users.length} người dùng`}
        actions={(
          <button className="button-danger" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiTrash2 size={16} /> <span>Xóa hàng loạt</span>
          </button>
        )} />

      {/* --- Search & Filter Bar --- */}
      <div className="search-filter-bar bg-white p-4 rounded-lg shadow-md mb-4" style={{ display: 'flex', gap: 10 }}>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Tìm kiếm theo Tên, Email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field"
          style={{ flexGrow: 1, padding: '10px 12px' }}
        />

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
          <div className="empty-state text-center py-10 text-gray-500">
            <div className="text-4xl mb-3">🕵️</div>
            <p>Không tìm thấy người dùng nào khớp với tiêu chí tìm kiếm và bộ lọc.</p>
          </div>
        ) : (
          <table className="table users-table">
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={tableHeaderStyle}>Tên đầy đủ</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Gói DV</th>
                <th style={tableHeaderStyle}>Vai trò</th>
                <th style={tableHeaderStyle}>Trạng thái</th>
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
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: u.isVerified ? '#10b9811A' : '#ef44441A',
                      color: u.isVerified ? '#10b981' : '#ef4444',
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}>
                      {u.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </span>
                  </td>
                  <td className="actions-cell" style={{ ...tableCellStyle, textAlign: 'center' }}>
                    <TableActionMenu
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