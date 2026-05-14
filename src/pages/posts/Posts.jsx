import React, { useEffect, useState, useMemo, useRef } from 'react'
import api from '../../api/client'
import { FiPlus, FiSearch, FiHeart, FiVideo, FiUpload, FiX } from 'react-icons/fi'
import { Image as ImageIcon } from 'lucide-react'; // Icon placeholder
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import TableActionMenu from '../../components/TableActionMenu';
import FormSearchField from '../../components/common/FormSearchField';
import EmptyState from '../../components/common/EmptyState';
import { FileText } from 'lucide-react'

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
      <div className="modal-form-section-card">
      {/* Phần Caption */}
      <div className="modal-form-group" style={{ marginBottom: 18 }}>
        <p style={{
          fontSize: '1rem',
          color: '#334155',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap'
        }}>
          {item.caption || "Không có nội dung."}
        </p>
      </div>

      {/* Phần Media (Hiển thị ảnh/video) */}
      <div className="modal-form-grid" style={{ marginBottom: 18 }}>
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
      <div className="modal-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 4 }}>
        <DetailItem label="Tác giả" value={item.author?.fullName} />
        <DetailItem label="Lượt thích" value={item.likes?.length || 0} icon={FiHeart} />
      </div>

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

function CreatePostModal({ isOpen, onClose, onCreated }) {
  const [caption, setCaption] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [videoPreview, setVideoPreview] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      setCaption('')
      setImageFile(null)
      setVideoFile(null)
      setImagePreview('')
      setVideoPreview('')
      setIsSaving(false)
      setError('')
    }
  }, [isOpen])

  const handleClose = () => {
    if (isSaving) return
    onClose()
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh hợp lệ.')
      return
    }
    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setError('Vui lòng chọn file video hợp lệ.')
      return
    }
    setError('')
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!caption.trim()) {
      setError('Nội dung bài viết là bắt buộc.')
      return
    }

    const formData = new FormData()
    formData.append('caption', caption.trim())
    if (imageFile) formData.append('imageFile', imageFile)
    if (videoFile) formData.append('videoFile', videoFile)

    try {
      setIsSaving(true)
      setError('')
      await api.post('/admin/posts', formData)
      onCreated()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tạo bài viết.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tạo bài viết mới" size="large">
      <div className="modal-form-section-card">
        <div className="modal-form-group" style={{ marginBottom: 16 }}>
          <label className="form-label required">Nội dung bài viết</label>
          <textarea
            className="form-input"
            style={{ minHeight: 140, resize: 'vertical' }}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Nhập nội dung bài viết sẽ hiển thị trên mobile..."
          />
        </div>

        <div className="modal-form-grid" style={{ gap: 16 }}>
          <div className="modal-form-group">
            <label className="form-label">Hình ảnh</label>
            <div className="modal-form-upload" onClick={() => imageInputRef.current?.click()}>
              {imagePreview ? (
                <div className="modal-form-image-preview" style={{ position: 'relative' }}>
                  <img src={imagePreview} alt="Xem trước hình ảnh" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageFile(null)
                      setImagePreview('')
                    }}
                    style={{ position: 'absolute', top: 8, right: 8, background: '#111827', color: '#fff', border: 'none', borderRadius: 999, width: 28, height: 28, display: 'grid', placeItems: 'center' }}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className="modal-form-upload-content">
                  <div className="modal-form-upload-icon"><FiUpload /></div>
                  <p className="modal-form-upload-text">Nhấn để tải lên hình ảnh</p>
                </div>
              )}
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="form-label">Video</label>
            <div className="modal-form-upload" onClick={() => videoInputRef.current?.click()}>
              {videoPreview ? (
                <div className="modal-form-image-preview" style={{ position: 'relative' }}>
                  <video src={videoPreview} controls style={{ width: '100%', maxHeight: 260, borderRadius: 12, background: '#000' }} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setVideoFile(null)
                      setVideoPreview('')
                    }}
                    style={{ position: 'absolute', top: 8, right: 8, background: '#111827', color: '#fff', border: 'none', borderRadius: 999, width: 28, height: 28, display: 'grid', placeItems: 'center' }}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className="modal-form-upload-content">
                  <div className="modal-form-upload-icon"><FiVideo /></div>
                  <p className="modal-form-upload-text">Nhấn để tải lên video</p>
                </div>
              )}
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} style={{ display: 'none' }} />
            </div>
          </div>
        </div>

        {error && <div className="modal-form-error" style={{ marginTop: 16 }}>{error}</div>}
      </div>

      <div className="modal-footer" style={{ marginTop: 20 }}>
        <button className="button-secondary" onClick={handleClose} disabled={isSaving}>Hủy bỏ</button>
        <button className="button-primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Đang tạo...' : 'Tạo bài viết'}
        </button>
      </div>
    </Modal>
  )
}

// --- 2. Main Posts Component ---
export default function Posts() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false); // Thêm state loading
  const [creating, setCreating] = useState(false)

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

  const filtered = items.filter((p) => {
    const matchesQuery = (p.caption || '').toLowerCase().includes(query.toLowerCase())
    const sourceRole = p.author?.role || 'user'
    const matchesSource = sourceFilter === 'all' ? true : sourceRole === sourceFilter
    return matchesQuery && matchesSource
  })

  const adminPostCount = items.filter((p) => (p.author?.role || 'user') === 'admin').length
  const userPostCount = items.filter((p) => (p.author?.role || 'user') === 'user').length

  return (
    <div className="admin-page">
      <PageHeader
        title="QUẢN LÝ BÀI VIẾT"
        subtitle={`Tổng ${items.length} bài viết • Admin ${adminPostCount} • User ${userPostCount}`}
        icon={<FileText size={26} />}
        actions={(
          <button className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setCreating(true)}>
            <FiPlus size={16} /> Tạo bài viết
          </button>
        )} />

      <div className="search-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="button-secondary"
            onClick={() => setSourceFilter('all')}
            style={{ opacity: sourceFilter === 'all' ? 1 : 0.7 }}
          >
            Tất cả
          </button>
          <button
            className="button-secondary"
            onClick={() => setSourceFilter('admin')}
            style={{ opacity: sourceFilter === 'admin' ? 1 : 0.7 }}
          >
            Bài Admin ({adminPostCount})
          </button>
          <button
            className="button-secondary"
            onClick={() => setSourceFilter('user')}
            style={{ opacity: sourceFilter === 'user' ? 1 : 0.7 }}
          >
            Bài User ({userPostCount})
          </button>
        </div>

        <div style={{ position: 'relative', width: '100%', flex: '1 1 320px' }}>
          <FormSearchField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm theo nội dung bài viết..."
            icon={FiSearch}
          />
        </div>
      </div>

      {/* --- Posts Table --- */}
      <div className="table-section">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📝" message="Không tìm thấy bài viết nào." />
        ) : (
          <table className="table posts-table">
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ ...tableHeaderStyle, minWidth: 300 }}>Nội dung</th>
                <th style={tableHeaderStyle}>Tác giả</th>
                <th style={tableHeaderStyle}>Nguồn</th>
                <th style={tableHeaderStyle}>Hình ảnh</th>
                <th style={tableHeaderStyle}>Video</th>

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
                    <span
                      className="common-badge"
                      style={{
                        background: (p.author?.role || 'user') === 'admin' ? '#fef3c7' : '#e5e7eb',
                        color: (p.author?.role || 'user') === 'admin' ? '#92400e' : '#374151',
                      }}
                    >
                      {(p.author?.role || 'user') === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
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
      <CreatePostModal
        isOpen={creating}
        onClose={() => setCreating(false)}
        onCreated={load}
      />
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