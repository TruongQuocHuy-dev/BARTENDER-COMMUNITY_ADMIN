import React, { useEffect, useState, useMemo } from 'react'
import api from '../../api/client'
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch, FiHeart, FiVideo } from 'react-icons/fi'
import { Image as ImageIcon } from 'lucide-react'; // Icon placeholder
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import '../../styles/components/table.css' // Đảm bảo bạn đã import
import TableActionMenu from '../../components/TableActionMenu';

// --- 1. DetailModal (Đã thiết kế lại hoàn toàn) ---
function DetailModal({ item, onClose }) {
  if (!item) return null

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title="Chi tiết Bài viết"
      size="large" // Cần size lớn để xem media
    >
      {/* Phần Caption */}
      <div style={{ marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 15 }}>
        <p style={{
          fontSize: '1rem',
          color: '#333',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap' // Giữ định dạng xuống dòng
        }}>
          {item.caption || "Không có nội dung."}
        </p>
      </div>

      {/* Phần Media (Hiển thị ảnh/video) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Image Preview */}
        <div className="media-preview-box">
          <label className="form-label">Hình ảnh</label>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt="Post image"
              style={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
            />
          ) : (
            <div className="media-placeholder" style={{ height: 250 }}>
              <ImageIcon size={40} />
              <span>Không có hình ảnh</span>
            </div>
          )}
        </div>

        {/* Video Preview */}
        <div className="media-preview-box">
          <label className="form-label">Video</label>
          {item.videoUrl ? (
            <video
              src={item.videoUrl}
              controls
              style={{ width: '100%', height: 250, borderRadius: 8, background: '#000' }}
            />
          ) : (
            <div className="media-placeholder" style={{ height: 250 }}>
              <FiVideo size={40} />
              <span>Không có video</span>
            </div>
          )}
        </div>
      </div>

      {/* Phần Stats (Grid) */}
      <div className="modal-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <DetailItem label="Tác giả" value={item.author?.fullName} />
        <DetailItem label="Lượt thích" value={item.likes?.length || 0} icon={FiHeart} />
      </div>

      <div className="modal-footer" style={{ marginTop: 20 }}>
        <button className="button-primary" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  )
}

// Helper for DetailModal items
const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="modal-field" style={{ padding: 8, background: '#f9fafb', borderRadius: 4 }}>
    <span className="modal-field-label" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6b7280' }}>
      {Icon && <Icon size={14} />}
      {label}
    </span>
    <span className="modal-field-value" style={{ fontWeight: 600, color: '#1f2937' }}>{value}</span>
  </div>
);

// --- 2. Main Posts Component ---
export default function Posts() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false); // Thêm state loading

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      setLoading(true);
      setItems(await api.get('/admin/posts'))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false);
    }
  }

  const remove = async (id) => { if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return; await api.del('/admin/posts/' + id); load() }

  const filtered = items.filter(p => (p.caption || '').toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="QUẢN LÝ BÀI VIẾT"
        subtitle={`Tổng ${items.length} bài viết`}
        actions={(
          <button className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} disabled>
            <FiPlus size={16} /> New (Tạm khóa)
          </button>
        )} />

      {/* --- Search Bar --- */}
      {/* --- Search Bar --- */}
      <div className="search-filter-bar bg-white p-4 rounded-lg shadow-md mb-6"
        style={{ display: 'flex', alignItems: 'center' }}>

        {/* Wrapper cho ô tìm kiếm: Phải có width 100% */}
        <div style={{ position: 'relative', width: '100%' }}>

          {/* Icon Search */}
          <FiSearch
            size={18}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              zIndex: 1
            }}
          />

          {/* Input Field */}
          <input
            placeholder="Tìm kiếm theo nội dung bài viết..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-field"
            style={{
              width: '100%',                // QUAN TRỌNG: Bắt buộc để nó dãn ra hết màn hình
              height: 44,                   // Tăng chiều cao lên chút cho dễ bấm
              padding: '0 12px 0 40px',     // Padding trái 40px để tránh đè lên icon
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              outline: 'none',
              boxSizing: 'border-box',       // Đảm bảo padding không làm vỡ khung
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* --- Posts Table --- */}
      <div className="table-section bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state text-center py-10 text-gray-500">
            <div className="text-4xl mb-3">📝</div>
            <p>Không tìm thấy bài viết nào.</p>
          </div>
        ) : (
          <table className="table posts-table">
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ ...tableHeaderStyle, minWidth: 300 }}>Nội dung</th>
                <th style={tableHeaderStyle}>Tác giả</th>
                <th style={tableHeaderStyle}>Hình ảnh</th>
                <th style={tableHeaderStyle}>Video</th>
                <th style={tableHeaderStyle}>Lượt thích</th>
                <th style={{ ...tableHeaderStyle, width: 120, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ ...tableCellStyle, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.caption?.slice(0, 120) || "(Không có nội dung)"}
                  </td>
                  <td style={tableCellStyle}>{p.author?.fullName || 'N/A'}</td>
                  <td style={tableCellStyle}>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt="Post thumb"
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {p.videoUrl ? (
                      <FiVideo size={20} style={{ color: '#6b7280' }} />
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444' }}>
                      <FiHeart size={14} />
                      <span style={{ fontWeight: 600 }}>{p.likes?.length || 0}</span>
                    </div>
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                    <TableActionMenu
                      onView={() => setDetail(p)}
                      onDelete={() => remove(p._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DetailModal item={detail} onClose={() => setDetail(null)} />
    </div>
  )
}

// Inline Styles for Table
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