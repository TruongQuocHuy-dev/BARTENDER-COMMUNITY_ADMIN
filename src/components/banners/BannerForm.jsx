import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/client';
import '../../styles/components/banner-form.css';
import { FiX, FiImage } from 'react-icons/fi';

const MediaUploadBox = ({ label, preview, onButtonClick, Icon, children }) => (
  <div>
    <label className="form-label">{label}</label>
    <div style={{
      border: preview ? 'none' : '2px dashed #d1d5db',
      borderRadius: 4,
      padding: preview ? 0 : 20,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      backgroundColor: preview ? 'transparent' : '#f9fafb'
    }}>
      {children}
      {!preview && (
        <div style={{ color: '#9ca3af', textAlign: 'center' }}>
          <Icon size={30} style={{ marginBottom: 8 }} />
          <p className="text-sm">Click vào nút bên dưới để tải lên.</p>
        </div>
      )}
    </div>
    <button
      type="button"
      onClick={onButtonClick}
      className="upload-button"
      style={{
        width: '100%',
        marginTop: 8,
        padding: '10px',
        background: '#eef2ff',
        color: '#4f46e5',
        border: '1px solid #4f46e550',
        borderRadius: '6px',
        fontWeight: 600,
        cursor: 'pointer'
      }}
    >
      {preview ? `Thay đổi ${label.toLowerCase()}` : `Tải lên ${label.toLowerCase()}`}
    </button>
  </div>
);

export default function BannerForm({ banner, onClose, onSaved }) {
  const [form, setForm] = useState(banner?._id ? banner : {
    title: '',
    description: '',
    link: 'http://',
    status: 'active',
    priority: 0,
    highlights: [''],
    contentDetail: '',
    startDate: '',
    endDate: ''
  });
  const [imagePreview, setImagePreview] = useState(banner?.imageUrl || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const imageRef = useRef();

  useEffect(() => {
    if (banner) {
      setForm({ ...banner, highlights: banner.highlights || [''] });
      setImagePreview(banner.imageUrl || '');
    }
  }, [banner]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setForm(prev => ({ ...prev, image: file }));
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();

      Object.keys(form).forEach(key => {
        if (key === 'highlights' && Array.isArray(form[key])) {
          formData.append(key, JSON.stringify(form[key].filter(h => h.trim() !== '')));
        } else if (key !== 'image' && key !== 'imageUrl' && key !== '_id' && key !== 'views') {
          formData.append(key, form[key]);
        }
      });

      if (form.image) {
        formData.append('image', form.image);
      }

      if (form._id) {
        await api.put('/banners/' + form._id, formData);
      } else {
        await api.post('/banners', formData);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message || 'Error saving banner');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const addHighlight = () => {
    setForm(prev => ({ ...prev, highlights: [...prev.highlights, ''] }));
  };

  const removeHighlight = (index) => {
    setForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const updateHighlight = (index, value) => {
    setForm(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }));
  };

  return (
    <div className="modal-form">
      {error && (
        <div className="modal-form-error" style={{ marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={save}>
        {/* 2 Column Layout: Left fields, Right image */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* LEFT COLUMN - All Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="modal-form-group">
              <label className="form-label required">Tiêu đề</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Nhập tiêu đề banner"
                required
              />
            </div>

            <div className="modal-form-group">
              <label className="form-label required">Link liên kết</label>
              <input
                type="url"
                value={form.link}
                onChange={e => setForm({ ...form, link: e.target.value })}
                placeholder="http://..."
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>

              <div>
                <label className="form-label">Độ ưu tiên</label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={form.startDate?.split('T')[0] || ''}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Ngày kết thúc</label>
                <input
                  type="date"
                  value={form.endDate?.split('T')[0] || ''}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-form-group">
              <label className="form-label">Mô tả ngắn</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả ngắn hiển thị trên banner"
                rows={2}
                required
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Image Upload & Content Detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MediaUploadBox
              label="Hình ảnh Banner*"
              preview={imagePreview}
              onButtonClick={() => imageRef.current?.click()}
              Icon={FiImage}
            >
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={imageRef}
                style={{ display: 'none' }}
                required={!banner?._id}
              />
            </MediaUploadBox>

            <div className="modal-form-group">
              <label className="form-label">Nội dung Chi tiết (tùy chọn)</label>
              <textarea
                value={form.contentDetail}
                onChange={e => setForm({ ...form, contentDetail: e.target.value })}
                placeholder="Nội dung chi tiết (nếu banner này mở ra một trang chi tiết)"
                rows={5}
              />
            </div>
          </div>
        </div>

        {/* Highlights - Full Width Below */}
        <div style={{ marginTop: 16 }}>
          <label className="form-label">Điểm nổi bật (tùy chọn)</label>
          <div style={{ border: '1px solid #e5e7eb', padding: 15, borderRadius: 8, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <button type="button" onClick={addHighlight} className="button-secondary">+ Thêm</button>
            </div>
            {form.highlights?.map((highlight, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <input
                  value={highlight}
                  onChange={e => updateHighlight(i, e.target.value)}
                  placeholder={`Điểm nổi bật ${i + 1}`}
                  style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8 }}
                />
                <button
                  type="button"
                  onClick={() => removeHighlight(i)}
                  className="button-danger"
                  disabled={form.highlights.length === 1}
                  style={{ padding: '8px 12px' }}
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-form-footer">
          <button type="button" onClick={onClose} className="button-secondary" disabled={isLoading}>
            Hủy
          </button>
          <button type="submit" className="button-primary" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : (banner?._id ? 'Cập nhật' : 'Tạo Banner')}
          </button>
        </div>
      </form>
    </div>
  );
}