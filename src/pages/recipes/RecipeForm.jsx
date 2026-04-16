import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/client';
import { getCurrentUser } from '../../auth/auth';
import { FiX, FiImage, FiVideo } from 'react-icons/fi';
import { Image, Video, Utensils, ListOrdered } from 'lucide-react';
import Modal from '../../components/Modal';

// --- CẬP NHẬT: Thêm style cho sticky header ---
const stickyHeaderStyle = {
  position: 'sticky',
  top: -1, // -1 để dính sát mép của vùng cuộn (có padding 1px)
  background: 'white',
  zIndex: 1,
  paddingTop: '16px',
  paddingBottom: '8px',
  borderBottom: '1px solid #e5e7eb' // Thêm đường viền để phân biệt
};

export default function RecipeForm({ recipe, onClose, onSaved }) {
  const [form, setForm] = useState(recipe || {
    name: '',
    description: '',
    category: '',
    difficulty: 'medium',
    alcoholLevel: 'medium',
    ingredients: [{ name: '', amount: '', unit: '' }],
    steps: [''],
    isPremium: false
  });
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(recipe?.imageUrl || '');
  const [videoPreview, setVideoPreview] = useState(recipe?.videoUrl || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const imageRef = useRef();
  const videoRef = useRef();

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.get('/categories');
        setCategories(data);
      } catch (e) {
        console.error('Error loading categories:', e);
        setError('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  // Handle file changes (Không đổi)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setForm(prev => ({ ...prev, imageFile: file }));
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    setForm(prev => ({ ...prev, videoFile: file }));
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle ingredients (Không đổi)
  const addIngredient = () => {
    setForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  // Handle steps (Không đổi)
  const addStep = () => {
    setForm(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const removeStep = (index) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index, value) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  };

  const save = async () => {
    try {
      setError('');
      setIsLoading(true);

      // Validation
      if (!form.name?.trim()) return setError('Name is required');
      if (!form.category) return setError('Category is required');
      if (!form.ingredients.length) return setError('At least one ingredient is required');
      if (!form.steps.length) return setError('At least one step is required');

      // --- CẬP NHẬT VALIDATION ---
      // Check ingredients (Chỉ bắt buộc TÊN)
      const invalidIngredient = form.ingredients.find(ing => ing.name?.trim() === '');
      if (invalidIngredient) return setError('Vui lòng hoàn thành tất cả TÊN nguyên liệu');

      // Check steps are not empty
      if (form.steps.some(step => !step.trim())) return setError('Please fill all steps');

      const user = getCurrentUser();
      if (!user || !user._id) {
        setError('Bạn phải đăng nhập để thực hiện. Vui lòng đăng nhập lại.');
        return;
      }

      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description?.trim() || '');
      formData.append('category', form.category);
      formData.append('difficulty', form.difficulty);
      formData.append('alcoholLevel', form.alcoholLevel);
      formData.append('isPremium', form.isPremium);
      formData.append('ingredients', JSON.stringify(form.ingredients));
      formData.append('steps', JSON.stringify(form.steps));
      formData.append('author', user._id)

      if (form.imageFile) {
        formData.append('imageFile', form.imageFile)
      }
      if (form.videoFile) {
        formData.append('videoFile', form.videoFile)
      }

      if (recipe?._id) {
        await api.put('/recipes/' + recipe._id, formData);
      } else {
        await api.post('/recipes', formData);
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error('Error saving recipe:', e);
      let errorMessage = 'Error saving recipe';

      try {
        if (e.response) {
          errorMessage = e.response.data?.message || errorMessage;
        } else if (typeof e.message === 'string') {
          errorMessage = e.message;
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!recipe && !onClose) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${recipe?._id ? 'Chỉnh sửa' : 'Tạo'} công thức`}
      size="large"
    >
      <div className="modal-form">
        <div className="modal-form-section-card">
          <div className="modal-form-section-title">Thông tin cơ bản</div>
          <div className="modal-form-grid">
            <div className="modal-form-group">
              <label className="form-label required">Tên Công thức</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nhập tên công thức"
              />
            </div>

            <div className="modal-form-group">
              <label className="form-label required">Danh mục</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="modal-form-group">
              <label className="form-label">Độ Khó</label>
              <select
                value={form.difficulty}
                onChange={e => setForm({ ...form, difficulty: e.target.value })}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label className="form-label">Nồng độ Cồn</label>
              <select
                value={form.alcoholLevel}
                onChange={e => setForm({ ...form, alcoholLevel: e.target.value })}
              >
                <option value="none">Không</option>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group full-width">
            <label className="form-label">Mô tả</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả chi tiết về công thức"
              rows={3}
            />
          </div>
        </div>

        <div className="modal-form-section-card">
          <div className="modal-form-section-title">Media</div>
          <div className="modal-form-grid">

          {/* Image Upload */}
          <MediaUploadBox
            label="Hình ảnh"
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
            />
          </MediaUploadBox>

          {/* Video Upload */}
          <MediaUploadBox
            label="Video (tùy chọn)"
            preview={videoPreview}
            onButtonClick={() => videoRef.current?.click()}
            Icon={FiVideo}
          >
            {videoPreview && (
              <video
                src={videoPreview}
                controls
                style={{ width: '100%', height: 200, borderRadius: 4, marginBottom: 8 }}
              />
            )}
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              ref={videoRef}
              style={{ display: 'none' }}
            />
          </MediaUploadBox>
          </div>
        </div>

        <div className="modal-form-section-card recipe-ingredients-card">
          <div className="modal-form-section-title">Nguyên liệu</div>
          <div className="recipe-list-actions">
            <button type="button" onClick={addIngredient} className="button-secondary small-button">+ Thêm nguyên liệu</button>
          </div>
          <div className="recipe-form-ingredients-header">
            <span>Tên Nguyên Liệu*</span>
            <span>Số Lượng</span>
            <span>Đơn Vị</span>
            <span></span>
          </div>
          {form.ingredients.map((ing, index) => (
            <div key={index} className="recipe-form-ingredients-row">
              <input
                value={ing.name}
                onChange={e => updateIngredient(index, 'name', e.target.value)}
                placeholder="Ví dụ: Vodka"
                className="form-input"
              />
              <input
                value={ing.amount}
                onChange={e => updateIngredient(index, 'amount', e.target.value)}
                placeholder="SL"
                className="form-input"
                type="number"
              />
              <input
                value={ing.unit}
                onChange={e => updateIngredient(index, 'unit', e.target.value)}
                placeholder="Đơn vị"
                className="form-input"
                list="unit-suggestions"
              />

              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="small-icon-button danger"
                disabled={form.ingredients.length === 1}
                style={{ width: 48, height: 42 }}
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="modal-form-section-card recipe-steps-card">
          <div className="modal-form-section-title">Các bước thực hiện</div>
          <div className="recipe-list-actions">
            <button type="button" onClick={addStep} className="button-secondary small-button">+ Thêm bước</button>
          </div>

          <div className="recipe-steps-header">
            <span>STT</span>
            <span>Mô tả bước</span>
            <span></span>
          </div>

          {form.steps.map((step, index) => (
            <div key={index} className="recipe-step-row">
              <div className="recipe-step-index">{index + 1}.</div>
              <textarea
                value={step}
                onChange={e => updateStep(index, e.target.value)}
                placeholder={`Mô tả bước ${index + 1}`}
                className="form-input"
                rows={1}
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="small-icon-button danger"
                disabled={form.steps.length === 1}
                style={{ width: 48, height: 42 }}
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* === THÊM MỚI DATALIST === */}
        <datalist id="unit-suggestions">
          <option value="ml" />
          <option value="g" />
          <option value="l" />
          <option value="kg" />
          <option value="lá" />
          <option value="giọt" />
          <option value="muỗng" />
        </datalist>
        {/* ======================== */}


        {/* 5. Premium Toggle */}
        <div className="modal-form-section-card">
          <div className="modal-form-section-title">Trạng thái cao cấp</div>
          <label className="payment-plan-popular-toggle">
            <input
              type="checkbox"
              checked={form.isPremium}
              onChange={e => setForm({ ...form, isPremium: e.target.checked })}
            />
            <span>
              Premium Recipe (Chỉ thành viên trả phí mới xem được)
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="modal-form-error recipe-form-error">
            ⚠️ {error}
          </div>
        )}

        {/* Footer */}
        <div className="modal-form-footer">
          <button onClick={onClose} className="button-secondary" disabled={isLoading}>
            Hủy
          </button>
          <button onClick={save} className="button-primary" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : (recipe?._id ? 'Lưu Thay đổi' : 'Tạo Công thức')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// --- Helper Component for Media Upload Box (Không đổi) ---
const MediaUploadBox = ({ label, preview, onButtonClick, Icon, children }) => (
  <div className="modal-form-group">
    <label className="form-label">{label}</label>
    <div className="recipe-media-shell">
      {children}
      {!preview && (
        <div className="recipe-media-empty">
          <Icon size={30} />
          <p className="text-sm">Click vào nút bên dưới để tải lên.</p>
        </div>
      )}
    </div>
    <button
      type="button"
      onClick={onButtonClick}
      className="upload-button recipe-upload-button"
    >
      {preview ? `Thay đổi ${label.toLowerCase()}` : `Tải lên ${label.toLowerCase()}`}
    </button>
  </div>
);