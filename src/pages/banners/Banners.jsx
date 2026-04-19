import React, { useEffect, useState, useMemo } from 'react'
import api from '../../api/client'
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch } from 'react-icons/fi'
import { CheckCircle, AlertTriangle, Eye, Clock, Zap, MessageSquare } from 'lucide-react'
import BannerForm from '../../components/banners/BannerForm'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import TableActionMenu from '../../components/TableActionMenu';
import BadgePill from '../../components/common/BadgePill';
import FormSearchField from '../../components/common/FormSearchField';
import { Image as BannerIcon } from 'lucide-react'

// --- Helper Component: Status Badge ---
const StatusBadge = ({ status }) => {
  const isActive = status === 'active';
  const Icon = isActive ? CheckCircle : AlertTriangle;
  const tone = isActive ? 'success' : 'warning';

  return <BadgePill label={isActive ? 'Hoạt động' : 'Không hoạt động'} icon={Icon} tone={tone} />
};

// --- Helper: KPI Card ---
const BannerKPICard = ({ icon: Icon, label, value, tone = 'blue' }) => (
  <article className={`banner-kpi-card tone-${tone}`}>
    <div className="banner-kpi-icon">
      <Icon size={18} />
    </div>
    <div className="banner-kpi-content">
      <span className="banner-kpi-label">{label}</span>
      <span className="banner-kpi-value">{value}</span>
    </div>
  </article>
);

// --- Helper Component: Detail Modal (REFACTORED) ---
function DetailModal({ item, onClose }) {
  if (!item) return null;

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  return (
    <Modal isOpen={!!item} onClose={onClose} title="Chi tiết Banner" size="medium">
      <div className="banner-detail-container">
        {/* Hero Section */}
        <div className="banner-detail-hero">
        <div className="banner-detail-image-wrap">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="banner-detail-image" />
          ) : (
            <div className="banner-detail-image-empty">
              <BannerIcon size={32} />
            </div>
          )}
        </div>

        <div className="banner-detail-hero-content">
          <h1 className="banner-detail-title">{item.title}</h1>
          <p className="banner-detail-description">{item.description}</p>
          <div className="banner-detail-badges">
            <StatusBadge status={item.status} />
            {item.priority > 0 && (
              <BadgePill 
                label={`Độ ưu tiên: ${item.priority}`} 
                icon={Zap} 
                tone="orange" 
              />
            )}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="banner-kpi-grid">
        <BannerKPICard 
          icon={Eye} 
          label="Lượt xem" 
          value={item.views || 0} 
          tone="blue" 
        />
        <BannerKPICard 
          icon={Clock} 
          label="Ngày tạo" 
          value={formatDate(item.createdAt)} 
          tone="purple" 
        />
        <BannerKPICard 
          icon={Clock} 
          label="Cập nhật" 
          value={formatDate(item.updatedAt)} 
          tone="pink" 
        />
      </div>

      {/* Details Grid */}
      <div className="banner-detail-section">
        <h3 className="banner-detail-section-title">Thông tin liên kết</h3>
        <div className="banner-detail-field">
          <label>Link liên kết</label>
          <div className="banner-detail-value-link">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="banner-link">
              {item.link}
            </a>
          </div>
        </div>
      </div>

      {/* Content Detail */}
      {item.contentDetail && (
        <div className="banner-detail-section">
          <h3 className="banner-detail-section-title">Nội dung chi tiết</h3>
          <div className="banner-detail-content-box">
            {item.contentDetail}
          </div>
        </div>
      )}

      {/* Highlights */}
      {Array.isArray(item.highlights) && item.highlights.length > 0 && (
        <div className="banner-detail-section">
          <h3 className="banner-detail-section-title">
            <MessageSquare size={14} />
            Điểm nổi bật
          </h3>
          <div className="banner-highlights-list">
            {item.highlights.map((highlight, i) => (
              <div key={i} className="banner-highlight-item">
                <span className="banner-highlight-badge">{i + 1}</span>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Info */}
      {(item.startDate || item.endDate) && (
        <div className="banner-detail-section">
          <h3 className="banner-detail-section-title">Lịch chiếu</h3>
          <div className="banner-schedule-grid">
            {item.startDate && (
              <div className="banner-schedule-item">
                <span className="banner-schedule-label">Ngày bắt đầu</span>
                <span className="banner-schedule-value">{formatDate(item.startDate)}</span>
              </div>
            )}
            {item.endDate && (
              <div className="banner-schedule-item">
                <span className="banner-schedule-label">Ngày kết thúc</span>
                <span className="banner-schedule-value">{formatDate(item.endDate)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="banner-detail-footer">
        <button onClick={onClose} className="banner-button-close">
          Đóng
        </button>
      </div>
      </div>
    </Modal>
  );
}

// --- Main Component ---
export default function Banners() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(null)
  const [editing, setEditing] = useState(null) // Sẽ là true/false hoặc object

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const data = await api.get('/banners');
      setItems(data);
    } catch (e) {
      console.error('Error loading banners:', e);
    }
  }

  const remove = async (id) => { if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return; await api.del('/banners/' + id); load() }

  const filtered = items.filter(b => (b.title || '').toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="admin-page">
      <PageHeader
        title="QUẢN LÝ QUẢNG CÁO"
        subtitle={`Tổng ${items.length} banners`}
        icon={<BannerIcon size={26} />}
        actions={(
          <button onClick={() => setEditing({})} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus size={16} /> Thêm Banner
          </button>
        )} />

      {/* --- Search Bar --- */}
      <div className="search-filter-bar bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100"
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center'
        }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <FormSearchField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm banner theo tiêu đề..."
            icon={FiSearch}
          />
        </div>
      </div>

      {/* --- Banners Table --- */}
      <div className="table-section bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        <table className="table banners-table">
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={tableHeaderStyle}>Tiêu đề</th>
              <th style={tableHeaderStyle}>Hình ảnh</th>
              <th style={tableHeaderStyle}>Nổi bật</th>
              <th style={tableHeaderStyle}>Trạng thái</th>
              <th style={tableHeaderStyle}>Lượt xem</th>
              <th style={{ ...tableHeaderStyle, width: 120, textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tableCellStyle} className="font-medium">{b.title}</td>
                <td style={tableCellStyle}>
                  {b.imageUrl && (
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  )}
                </td>
                <td style={{ ...tableCellStyle, maxWidth: 300, fontSize: 13, color: '#6b7280' }}>
                  {Array.isArray(b.highlights) ? (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {b.highlights.slice(0, 2).map((highlight, i) => ( // Giới hạn 2 dòng
                        <li key={i}>{highlight}</li>
                      ))}
                      {b.highlights.length > 2 && <li>...</li>}
                    </ul>
                  ) : '-'}
                </td>
                <td style={tableCellStyle}>
                  <StatusBadge status={b.status || 'active'} />
                </td>
                <td style={tableCellStyle}>{b.views || 0}</td>
                <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                  <TableActionMenu
                    onEdit={() => setEditing(b)}
                    onView={() => setDetail(b)}
                    onDelete={() => remove(b._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetailModal item={detail} onClose={() => setDetail(null)} />

      {/* GỌI BANNER FORM BÊN TRONG MODAL CHUẨN */}
      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._id ? 'Chỉnh sửa Banner' : 'Tạo Banner Mới'}
        size="large" // Form này lớn, dùng size 'large'
      >
        {editing && ( // Chỉ render form khi 'editing' không phải là null
          <BannerForm
            banner={editing} // Truyền object banner (có thể rỗng nếu là 'new')
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}
      </Modal>
    </div>
  )
}

// Inline Styles for Table (Sử dụng lại từ các trang khác)
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