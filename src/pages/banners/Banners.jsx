import React, { useEffect, useState, useMemo } from 'react'
import api from '../../api/client'
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch } from 'react-icons/fi'
import { CheckCircle, AlertTriangle } from 'lucide-react' // Dùng icon cho Status
import BannerForm from '../../components/banners/BannerForm' // Sửa đường dẫn nếu cần
import '../../styles/components/table.css'
import Modal from '../../components/Modal' // Import Modal chuẩn
import PageHeader from '../../components/PageHeader' // Import PageHeader
import TableActionMenu from '../../components/TableActionMenu';

// --- Helper Component: Status Badge ---
const StatusBadge = ({ status }) => {
  const isActive = status === 'active';
  const color = isActive ? '#10b981' : '#f59e0b'; // Green or Amber
  const Icon = isActive ? CheckCircle : AlertTriangle;

  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: `${color}1A`, // 10% opacity
      color: color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <Icon size={14} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

// --- Helper Component: Detail Modal ---
function DetailModal({ item, onClose }) {
  if (!item) return null

  // Sử dụng Modal chuẩn
  return (
    <Modal isOpen={!!item} onClose={onClose} title="Chi tiết Banner" size="medium">
      <div className="detail-image-card" style={{ marginBottom: 16 }}>
        <img src={item.imageUrl} alt={item.title} style={{ maxWidth: '100%', borderRadius: 8, objectFit: 'cover', height: 200, width: '100%' }} />
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
      <p style={{ color: '#6b7280', marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: 10 }}>{item.description}</p>

      <div className="modal-grid">
        <DetailItem label="Link liên kết" value={item.link} />
        <DetailItem label="Lượt xem" value={item.views} />
        <DetailItem label="Trạng thái" value={item.status} />
        <DetailItem label="Ưu tiên" value={item.priority} />
      </div>

      <h4 style={{ marginTop: 16, marginBottom: 8 }}>Nội dung chi tiết</h4>
      <div style={{ background: '#f9fafb', padding: 12, borderRadius: 6, fontSize: 14 }}>{item.contentDetail || 'Không có'}</div>

      <h4 style={{ marginTop: 16, marginBottom: 8 }}>Điểm nổi bật</h4>
      {Array.isArray(item.highlights) && item.highlights.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 20, background: '#f9fafb', padding: '12px 12px 12px 30px', borderRadius: 6 }}>
          {item.highlights.map((highlight, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{highlight}</li>
          ))}
        </ul>
      ) : <p style={{ color: '#9ca3af' }}>Không có</p>}

      <div className="modal-footer" style={{ marginTop: 20 }}>
        <button onClick={onClose} className="button-primary">Đóng</button>
      </div>
    </Modal>
  )
}

// Helper for DetailModal items
const DetailItem = ({ label, value }) => (
  <div className="modal-field">
    <span className="modal-field-label">{label}</span>
    <span className="modal-field-value">{value}</span>
  </div>
);

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="QUẢN LÝ QUẢNG CÁO"
        subtitle={`Tổng ${items.length} banners`}
        actions={(
          <button onClick={() => setEditing({})} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus size={16} /> Thêm Banner
          </button>
        )} />

      {/* --- Search Bar --- */}
      <div className="search-filter-bar bg-white p-4 rounded-lg shadow-md mb-6" style={{ display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            placeholder="Tìm kiếm banner theo tiêu đề..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-field"
            style={{ flex: 1, padding: '10px 12px 10px 40px' }}
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