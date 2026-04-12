import React, { useEffect, useState, useRef } from 'react'
import api from '../../api/client'
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch } from 'react-icons/fi'

import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import { Image, AlertCircle, Upload } from 'lucide-react';
import TableActionMenu from '../../components/TableActionMenu';
import '../../styles/components/modal-form.css';

function EditCategoryModal({ cat, onClose, onSaved }) {
  if (!cat) return null;

  const [form, setForm] = useState(cat || {})
  const [imagePreview, setImagePreview] = useState(cat?.image || '')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    setForm(cat || {})
    setImagePreview(cat?.image || '')
  }, [cat])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setForm(prev => ({ ...prev, imageFile: file }))
    setError('')
  }

  const save = async () => {
    try {
      setError('')
      setIsLoading(true)

      if (!form.name?.trim()) {
        setError('Name is required')
        return
      }

      if (!form.imageFile && !form.image) {
        setError('Image is required')
        return
      }

      const formData = new FormData()
      formData.append('name', form.name.trim())
      if (form.imageFile) {
        formData.append('image', form.imageFile)
      }

      if (form._id) {
        await api.put('/categories/' + form._id, formData)
      } else {
        await api.post('/categories', formData)
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e.message || 'Error saving category')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={Boolean(cat)}
      onClose={onClose}
      title={form._id ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
      size="small"
    >
      <div className="modal-form">
        <div className="modal-form-section-card">
          <div className="modal-form-grid">
        <div>
          {/* 1. Category Name Input */}
          <div className="modal-form-group">
            <label htmlFor="name" className="form-label required">Tên Danh mục</label>
            <input
              id="name"
              className="form-input"
              value={form.name || ''}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ví dụ: Đồ uống nóng, Salad, Món tráng miệng..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="modal-form-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Image Upload */}
        <div>
          <div className="modal-form-group">
            <label className="form-label required">Hình ảnh Danh mục</label>

            <div
              className="modal-form-upload"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <div className="modal-form-image-preview category-modal-preview">
                  <img
                    src={imagePreview}
                    alt="Xem trước hình ảnh"
                  />
                  <div className="modal-form-image-preview-overlay">
                    <span className="category-modal-overlay-text">Thay đổi</span>
                  </div>
                </div>
              ) : (
                <div className="modal-form-upload-content">
                  <div className="modal-form-upload-icon">
                    <Upload />
                  </div>
                  <p className="modal-form-upload-text">
                    {form._id ? "Nhấn để thay đổi hình ảnh" : "Nhấn để tải lên hình ảnh"}
                  </p>
                  <p className="modal-form-upload-hint">
                    Kích thước đề xuất: 400x240
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileRef}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>

      {/* Modal Footer */}
      <div className="modal-footer">
        <button
          className="button-secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          Hủy bỏ
        </button>
        <button
          className="button-primary"
          onClick={save}
          disabled={isLoading}
        >
          {isLoading ? 'Đang lưu...' : (form._id ? 'Lưu Thay đổi' : 'Tạo Danh mục')}
        </button>
      </div>
    </Modal>
  );
}



function DetailModal({ item, onClose }) {
  if (!item) return null;

  return (
    <Modal
      isOpen={Boolean(item)}
      onClose={onClose}
      title={item.name}
      size="medium"
    >
      <div style={{ display: 'flex', gap: 24, paddingBottom: 16 }}>
        {/* Left Side: Image */}
        <div style={{ flex: '0 0 40%' }}>
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: '100%',
                borderRadius: 12,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                aspectRatio: '1',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              aspectRatio: '1',
              background: '#f3f4f6',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af'
            }}>
              <Image size={40} />
              <p style={{ marginTop: 8, fontSize: 13 }}>Không có hình ảnh</p>
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>
              Tên Danh mục
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{item.name}</span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>
              Số lượng
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              background: '#e0e7ff',
              color: '#4338ca'
            }}>
              {item.count || 0} công thức
            </span>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <span style={{ display: 'block', fontSize: 11, color: '#9ca3af' }}>Ngày tạo</span>
              <span style={{ fontSize: 13, color: '#374151' }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: 11, color: '#9ca3af' }}>Cập nhật</span>
              <span style={{ fontSize: 13, color: '#374151' }}>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-footer" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="button-primary" onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  );
}

export default function Categories() {
  const [cats, setCats] = useState([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)

  useEffect(() => { load() }, [])
  const load = async () => { try { setCats(await api.get('/categories')) } catch (e) { console.error(e) } }

  const filteredCats = cats.filter(cat => {
    const matchesQuery = cat.name.toLowerCase().includes(query.toLowerCase())
    return matchesQuery
  })

  const remove = async (id) => {
    if (!confirm('Xóa danh mục này?')) return
    await api.del('/categories/' + id)
    load()
  }

  return (
    <div className="admin-page">
      <PageHeader
        title="QUẢN LÝ DANH MỤC"
        subtitle={`Tổng ${cats.length} danh mục`}
        actions={(
          <button className="button-primary" onClick={() => setEditing({})} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus size={16} /> Thêm Danh mục
          </button>
        )}
      />

      {/* Modern Search Bar */}
      <div className="search-filter-bar bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100"
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center'
        }}>

        {/* Search Box */}
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <FiSearch size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-field"
            style={{
              paddingLeft: 40,
              width: '100%',
              height: 42,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Modern Table */}
      <div className="table-container bg-white rounded-lg shadow-md" style={{ border: '1px solid rgba(0, 0, 0, 0.05)' }}>
        {filteredCats.length === 0 ? (
          <div className="empty-state text-center py-16 text-gray-400">
            <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
            <p>Không tìm thấy danh mục nào.</p>
          </div>
        ) : (
          <table className="table">
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', width: '40%' }}>
                  Tên danh mục
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', width: '30%' }}>
                  Hình ảnh
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', width: '15%' }}>
                  Số công thức
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', width: '15%' }}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCats.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: '#1f2937' }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        style={{
                          width: 100,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 6,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'transform 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: 13 }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#4b5563' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: c.count > 0 ? '#e0e7ff' : '#f3f4f6',
                      color: c.count > 0 ? '#4338ca' : '#6b7280',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {c.count || 0} công thức
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <TableActionMenu
                      onView={() => setDetail(c)}
                      onEdit={() => setEditing(c)}
                      onDelete={() => remove(c._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EditCategoryModal cat={editing} onClose={() => setEditing(null)} onSaved={load} />
      <DetailModal item={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
