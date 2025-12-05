import React from 'react';
import { FiX } from 'react-icons/fi';
import '../../styles/components/filter-chip.css';

// Sửa: Component nhận label, icon và onRemove trực tiếp
const FilterChip = ({ label, icon, onRemove }) => {

  // Thêm kiểm tra an toàn để đảm bảo label tồn tại
  if (!label) return null;

  return (
    <div className="filter-chip">

      {/* Hiển thị Icon nếu có */}
      {icon && <span className="filter-chip-icon">{icon}</span>}

      <span className="filter-chip-label">{label}</span>

      {/* Nút xóa: Gọi onRemove */}
      <button className="filter-chip-remove" onClick={onRemove}>
        <FiX size={14} />
      </button>
    </div>
  );
};

export default FilterChip;