import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/client';
import { FiX, FiImage } from 'react-icons/fi';

const DEFAULT_BANNER_FORM = {
  title: '',
  description: '',
  link: 'http://',
  status: 'active',
  priority: 0,
  highlights: [''],
  contentDetail: '',
  startDate: '',
  endDate: ''
};

function normalizeBannerFormData(banner) {
  if (!banner) {
    return { ...DEFAULT_BANNER_FORM };
  }

  return {
    ...DEFAULT_BANNER_FORM,
    ...banner,
    title: banner.title ?? '',
    description: banner.description ?? '',
    link: banner.link ?? 'http://',
    status: banner.status ?? 'active',
    priority: banner.priority ?? 0,
    contentDetail: banner.contentDetail ?? '',
    startDate: banner.startDate ?? '',
    endDate: banner.endDate ?? '',
    highlights: Array.isArray(banner.highlights) && banner.highlights.length > 0 ? banner.highlights : ['']
  };
}

const MediaUploadBox = ({ label, preview, onButtonClick, Icon, children }) => (
  <div className="modal-form-group">
    <label className="form-label">{label}</label>
    <div className="banner-media-shell">
      {children}
      {!preview && (
        <div className="banner-media-empty-state">
          <Icon size={30} />
          <p className="text-sm">Click vào nút bên dưới để tải lên.</p>
        </div>
      )}
    </div>
    <button
      type="button"
      onClick={onButtonClick}
      className="upload-button banner-upload-button"
    >
      {preview ? `Thay đổi ${label.toLowerCase()}` : `Tải lên ${label.toLowerCase()}`}
    </button>
  </div>
);

export default function BannerForm({ banner, onClose, onSaved }) {
  const [form, setForm] = useState(() => normalizeBannerFormData(banner));
  const [imagePreview, setImagePreview] = useState(banner?.imageUrl || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const imageRef = useRef();

  useEffect(() => {
    setForm(normalizeBannerFormData(banner));
    setImagePreview(banner?.imageUrl || '');
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
        <div className="modal-form-error banner-modal-error">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={save}>
        {/* 2 Column Layout: Left fields, Right image */}
        <div className="modal-form-section-card">
        <div className="modal-form-section-title">Thông tin banner</div>
        <div className="modal-form-grid banner-form-main-grid">

          {/* LEFT COLUMN - All Fields */}
          <div>
            <div className="modal-form-group">
              <label className="form-label required">Tiêu đề</label>
              <input
                type="text"
                value={form.title ?? ''}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Nhập tiêu đề banner"
                required
              />
            </div>

            <div className="modal-form-group">
              <label className="form-label required">Link liên kết</label>
              <input
                type="url"
                value={form.link ?? ''}
                onChange={e => setForm({ ...form, link: e.target.value })}
                placeholder="http://..."
                required
              />
            </div>

            <div className="modal-form-grid">
              <div className="modal-form-group">
                <label className="form-label">Trạng thái</label>
                <select
                  value={form.status ?? 'active'}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="form-label">Độ ưu tiên</label>
                <input
                  type="number"
                  value={form.priority ?? 0}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            <div className="modal-form-grid">
              <div className="modal-form-group">
                <label className="form-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={(form.startDate || '').split('T')[0] || ''}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label className="form-label">Ngày kết thúc</label>
                <input
                  type="date"
                  value={(form.endDate || '').split('T')[0] || ''}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-form-group">
              <label className="form-label">Mô tả ngắn</label>
              <textarea
                value={form.description ?? ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả ngắn hiển thị trên banner"
                rows={2}
                required
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Image Upload & Content Detail */}
          <div>
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
                  className="banner-media-preview"
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
                value={form.contentDetail ?? ''}
                onChange={e => setForm({ ...form, contentDetail: e.target.value })}
                placeholder="Nội dung chi tiết (nếu banner này mở ra một trang chi tiết)"
                rows={5}
              />
            </div>
          </div>
        </div>
        </div>

        {/* Highlights - Full Width Below */}
        <div className="modal-form-section-card banner-highlights-section">
          <div className="modal-form-section-title">Điểm nổi bật</div>
          <div className="modal-form-list banner-highlights-list">
            <div className="banner-highlights-add-row">
              <button type="button" onClick={addHighlight} className="button-secondary">+ Thêm</button>
            </div>
            {form.highlights?.map((highlight, i) => (
              <div key={i} className="banner-highlight-row">
                <input
                  value={highlight ?? ''}
                  onChange={e => updateHighlight(i, e.target.value)}
                  placeholder={`Điểm nổi bật ${i + 1}`}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => removeHighlight(i)}
                  className="button-danger"
                  disabled={form.highlights.length === 1}
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