import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client'; // Đảm bảo đường dẫn đúng
import { FiSearch, FiFilter } from 'react-icons/fi';
import { AlertTriangle, CheckCircle, Mail, Flag } from 'lucide-react';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import TableActionMenu from '../../components/TableActionMenu';
import BadgePill from '../../components/common/BadgePill';
import FormSearchField from '../../components/common/FormSearchField';
import FormSelectField from '../../components/common/FormSelectField';
import EmptyState from '../../components/common/EmptyState';

// --- 1. Helper: Status Badge (Giữ nguyên) ---
const StatusBadge = ({ status }) => {
  const isPending = status === 'pending';
  const Icon = isPending ? AlertTriangle : CheckCircle;
  const label = isPending ? 'Chờ xử lý' : 'Đã xong';
  const tone = isPending ? 'warning' : 'success'

  return <BadgePill label={label} icon={Icon} tone={tone} />
};

// --- 2. Helper: Type Badge (MỚI) ---
// Phân biệt màu sắc giữa Hỗ trợ và Báo cáo xấu
const TypeBadge = ({ type, targetType }) => {
  const isSupport = type === 'support';
  const Icon = isSupport ? Mail : Flag;

  // Text hiển thị: Nếu là support thì ghi "Hỗ trợ", nếu không thì ghi loại (Post/Comment)
  const label = isSupport ? 'Yêu cầu Hỗ trợ' : `Báo cáo: ${targetType || 'Khác'}`;
  const tone = isSupport ? 'info' : 'danger'

  return <BadgePill label={label} icon={Icon} tone={tone} />
};

// --- 3. Modal Chi Tiết (NÂNG CẤP) ---
// Tự động render giao diện dựa trên item.type
function DetailModal({ item, onClose, onResolve, onDelete }) {
  if (!item) return null;

  const isSupport = item.type === 'support';

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={isSupport ? "Chi tiết Yêu cầu Hỗ trợ" : "Chi tiết Báo cáo Vi phạm"}
      size="medium"
      subtitle={`ID: ${item._id} • Gửi ngày: ${new Date(item.createdAt).toLocaleDateString('vi-VN')}`}
    >
      {/* Thông tin người gửi */}
      <div style={{ marginBottom: 16, padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>
          Người gửi / Báo cáo
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Họ tên:</span>
            <div style={{ fontWeight: 600 }}>{item.reporter?.fullName || 'Ẩn danh'}</div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Email:</span>
            <div style={{ fontWeight: 600 }}>{item.reporter?.email || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Grid trạng thái */}
      <div className="modal-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label className="modal-field-label">Loại phiếu</label>
          <div style={{ marginTop: 4 }}><TypeBadge type={item.type} targetType={item.targetType} /></div>
        </div>
        <div>
          <label className="modal-field-label">Trạng thái</label>
          <div style={{ marginTop: 4 }}><StatusBadge status={item.status} /></div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH (Thay đổi theo loại) */}

      {/* 1. Nếu là Support: Hiện Tiêu đề */}
      {isSupport && (
        <div className="modal-form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Tiêu đề</label>
          <div className="detail-box" style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 10, fontWeight: 700 }}>
            {item.title}
          </div>
        </div>
      )}

      {/* 2. Nội dung / Lý do */}
      <div className="modal-form-group">
        <label className="form-label" style={{ fontWeight: 600 }}>
          {isSupport ? "Nội dung tin nhắn" : "Lý do báo cáo"}
        </label>
        <div className="detail-box" style={{ background: '#f3f4f6', padding: 12, borderRadius: 6, minHeight: 60, whiteSpace: 'pre-wrap' }}>
          {item.reason}
        </div>
      </div>

      {/* 3. Nếu là Vi phạm: Hiện chi tiết bổ sung (nếu có) */}
      {!isSupport && item.details && (
        <div className="modal-form-group">
          <label className="form-label">Chi tiết bổ sung</label>
          <div className="detail-box" style={{ background: '#fff', border: '1px solid #eee', padding: 8, fontSize: 13 }}>
            {item.details}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="modal-footer" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {item.status === 'pending' && (
          <button
            onClick={() => { onResolve(item._id); onClose(); }}
            style={{
              backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <CheckCircle size={16} /> Đánh dấu Đã xử lý
          </button>
        )}
        <button
          onClick={() => { onDelete(item._id); onClose(); }}
          style={{
            backgroundColor: '#fff', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600
          }}
        >
          Xóa phiếu
        </button>
      </div>
    </Modal>
  )
}

// --- 4. Main Component ---
export default function ReportsAndSupport() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false);

  // Filter States
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // pending, resolved
  const [typeFilter, setTypeFilter] = useState('all')     // all, violation, support

  const [detail, setDetail] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/reports') // Gọi API lấy tất cả
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const remove = async (id) => {
    if (!confirm('Bạn có chắc muốn XÓA phiếu này vĩnh viễn?')) return;
    try {
      await api.del('/admin/reports/' + id);
      load();
      setDetail(null);
    } catch (e) { console.error(e) }
  }

  const resolve = async (id) => {
    try {
      await api.put('/admin/reports/' + id, { status: 'resolved' });
      load();
      setDetail(null);
    } catch (e) { console.error(e) }
  }

  // Logic lọc dữ liệu
  const filtered = useMemo(() => items.filter(r => {
    // 1. Lọc theo text search (Tìm cả trong title, reason, tên người gửi)
    const txt = ((r.title || '') + ' ' + (r.reason || '') + ' ' + (r.reporter?.fullName || '') + ' ' + (r.reporter?.email || '')).toLowerCase()
    const matchesQuery = txt.includes(query.toLowerCase())

    // 2. Lọc theo trạng thái
    const matchesStatus = statusFilter === 'all' ? true : (r.status === statusFilter)

    // 3. Lọc theo loại (Support vs Violation)
    let matchesType = true;
    if (typeFilter === 'support') matchesType = (r.type === 'support');
    if (typeFilter === 'violation') matchesType = (r.type !== 'support'); // Hoặc r.type === 'violation'

    return matchesQuery && matchesStatus && matchesType
  }), [items, query, statusFilter, typeFilter]);

  return (
    <div className="admin-page">
      <PageHeader
        title="QUẢN LÝ BÁO CÁO & HỖ TRỢ"
        subtitle={`Tổng hợp ${filtered.length} phiếu yêu cầu từ người dùng`}
      />

      {/* --- THANH CÔNG CỤ (Search & Filter) --- */}
      <div className="search-filter-bar bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100"
        style={{
          display: 'flex',
          width: '100%',       // Đảm bảo chiếm hết chiều ngang
          gap: 12,             // Khoảng cách giữa các ô
          alignItems: 'center' // Căn giữa theo chiều dọc
        }}>

        {/* 1. Search Box (Chiếm 3 phần - Rộng nhất) */}
        <div style={{ position: 'relative', flex: 3, minWidth: 0 }}>
          <FormSearchField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm nội dung, tiêu đề, email..."
            icon={FiSearch}
          />
        </div>

        {/* 2. Filter Type (Chiếm 1 phần) */}
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <FormSelectField
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            icon={FiFilter}
            options={[
              { value: 'all', label: 'Tất cả loại phiếu' },
              { value: 'support', label: 'Chỉ Hỗ trợ' },
              { value: 'violation', label: 'Chỉ Báo cáo xấu' },
            ]}
          />
        </div>

        {/* 3. Filter Status (Chiếm 1 phần) */}
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <FormSelectField
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            icon={CheckCircle}
            options={[
              { value: 'all', label: 'Mọi trạng thái' },
              { value: 'pending', label: 'Chờ xử lý' },
              { value: 'resolved', label: 'Đã xử lý' },
            ]}
          />
        </div>
      </div>

      {/* --- TABLE HIỂN THỊ --- */}
      <div className="table-section bg-white p-0 rounded-lg shadow-md overflow-hidden border border-gray-100">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📭" message="Không tìm thấy phiếu nào khớp với bộ lọc." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table reports-table">
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ ...tableHeaderStyle, width: '12%' }}>Loại phiếu</th>
                  <th style={{ ...tableHeaderStyle, width: '30%' }}>Nội dung / Tiêu đề</th>
                  <th style={{ ...tableHeaderStyle, width: '20%' }}>Người gửi</th>
                  <th style={{ ...tableHeaderStyle, width: '15%' }}>Ngày gửi</th>
                  <th style={{ ...tableHeaderStyle, width: '13%' }}>Trạng thái</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'center', width: '10%' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }} className="hover:bg-gray-50">

                    {/* Cột 1: Loại */}
                    <td style={tableCellStyle}>
                      <TypeBadge type={r.type} targetType={r.targetType} />
                    </td>

                    {/* Cột 2: Nội dung (Thông minh) */}
                    <td style={{ ...tableCellStyle, maxWidth: 350 }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Nếu là Support -> Hiện Title đậm. Nếu là Report -> Không có title */}
                        {r.type === 'support' && (
                          <span style={{ fontWeight: 700, color: '#1f2937', marginBottom: 2 }}>{r.title}</span>
                        )}
                        <span style={{
                          color: r.type === 'support' ? '#4b5563' : '#1f2937',
                          fontSize: r.type === 'support' ? 13 : 14,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {r.reason}
                        </span>
                      </div>
                    </td>

                    {/* Cột 3: Người gửi */}
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: 500, color: '#374151' }}>{r.reporter?.fullName || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{r.reporter?.email}</div>
                    </td>

                    {/* Cột 4: Ngày gửi */}
                    <td style={tableCellStyle}>
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    {/* Cột 5: Trạng thái */}
                    <td style={tableCellStyle}>
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Cột 6: Hành động */}
                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                      <TableActionMenu
                        onView={() => setDetail(r)}
                        onDelete={() => remove(r._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DetailModal
        item={detail}
        onClose={() => setDetail(null)}
        onResolve={resolve}
        onDelete={remove}
      />
    </div>
  )
}

// --- Styles (Giữ nguyên hoặc tinh chỉnh nhẹ) ---
const tableHeaderStyle = { padding: '16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' };
const tableCellStyle = { padding: '16px', fontSize: 14, verticalAlign: 'middle', color: '#374151' };
const actionButtonStyle = (color) => ({
  background: `${color}1A`, color: color, border: 'none', borderRadius: '8px', padding: '8px',
  cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
});

// (Phần api helper export giữ nguyên như code cũ của bạn)