import React, { useEffect, useState, useCallback, useMemo } from 'react'
import api from '../../api/client'
import {
    FiEdit, FiTrash2, FiEye, FiPlus, FiSearch,
    FiCheck, FiX, FiChevronLeft, FiChevronRight,
    FiClock, FiRefreshCw
} from 'react-icons/fi'
import { Utensils, Zap, Star, Video, Image, ListOrdered } from 'lucide-react';
import RecipeForm from './RecipeForm'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import TableActionMenu from '../../components/TableActionMenu';

// --- DETAIL MODAL (Giữ nguyên giao diện đẹp) ---
function DetailModal({ item, onClose }) {
    if (!item) return null

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'easy': return '#10b981';
            case 'medium': return '#f59e0b';
            case 'hard': return '#ef4444';
            default: return '#6b7280';
        }
    }

    return (
        <Modal isOpen={!!item} onClose={onClose} title="Chi tiết Công thức" size="large">
            <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 }}>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: 16, marginBottom: 20 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>{item.name}</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: '#6b7280' }}>
                        <span>Tác giả: <strong>{item.author?.fullName || item.author?.displayName || 'Unknown'}</strong></span>
                        <span>Ngày tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
                    <DetailTag label="Trạng thái" value={item.status} color={getStatusColor(item.status)} />
                    <DetailTag label="Danh mục" value={item.category} icon={Utensils} />
                    <DetailTag label="Độ khó" value={item.difficulty} color={getDifficultyColor(item.difficulty)} icon={FiClock} />
                    <DetailTag label="Loại" value={item.isPremium ? 'Cao cấp' : 'Miễn phí'} icon={Zap} color={item.isPremium ? '#f59e0b' : '#374151'} />
                    <DetailTag label="Đánh giá" value={`${item.rating || 0}/5 (${item.reviewCount || 0} lượt)`} icon={Star} color="#f59e0b" />
                </div>

                <div style={{ marginBottom: 24, background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>Mô tả</label>
                    <p style={{ margin: 0, lineHeight: 1.6, color: '#374151' }}>{item.description || "Chưa có mô tả."}</p>
                </div>


                <div style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 8 }}>
                        <label className="modal-form-section-title" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Media</label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Image size={16} /> Hình ảnh
                            </div>
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 6 }} />
                            ) : (
                                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 6, color: '#9ca3af' }}>Không có ảnh</div>
                            )}
                        </div>
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Video size={16} /> Video hướng dẫn
                            </div>
                            {item.videoUrl ? (
                                <video src={item.videoUrl} controls style={{ width: '100%', height: 200, borderRadius: 6, background: '#000' }} />
                            ) : (
                                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 6, color: '#9ca3af' }}>Không có video</div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 8 }}>
                        <label className="modal-form-section-title" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Nguyên liệu</label>
                    </div>
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 0.8fr 24px 1.2fr', gap: 1, background: '#e5e7eb', paddingBottom: 1 }}>
                            <div style={{ background: '#f9fafb', padding: '12px 16px', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#4b5563', letterSpacing: '0.5px' }}>Tên Nguyên Liệu</div>
                            <div style={{ background: '#f9fafb', padding: '12px 16px', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#4b5563', letterSpacing: '0.5px' }}>Số Lượng</div>
                            <div style={{ background: '#f9fafb' }}></div>
                            <div style={{ background: '#f9fafb', padding: '12px 16px', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#4b5563', letterSpacing: '0.5px' }}>Đơn Vị</div>
                        </div>
                        {item.ingredients?.map((ing, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 0.8fr 24px 1.2fr', borderBottom: '1px solid #f3f4f6' }}>
                                <div style={{ padding: '12px 16px', color: '#1f2937' }}>{ing.name}</div>
                                <div style={{ padding: '12px 16px', color: '#4b5563' }}>{ing.amount || '-'}</div>
                                <div></div>
                                <div style={{ padding: '12px 16px', color: '#4b5563' }}>{ing.unit || '-'}</div>
                            </div>
                        ))}
                        {(!item.ingredients || item.ingredients.length === 0) && (
                            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>Không có nguyên liệu</div>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                    <div style={{ marginBottom: 8 }}>
                        <label className="modal-form-section-title" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Các bước thực hiện</label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {item.steps?.map((step, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 12 }}>
                                <div style={{ minWidth: 28, height: 28, borderRadius: '50%', background: '#1a73e8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, marginTop: 2 }}>{idx + 1}</div>
                                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', flex: 1, fontSize: 15, lineHeight: 1.5 }}>{step}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="modal-footer" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee' }}>
                <button className="button-secondary" onClick={onClose}>Đóng</button>
            </div>
        </Modal>
    );
}

const DetailTag = ({ label, value, icon: Icon, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 10, borderRadius: 8, background: color ? `${color}10` : '#f3f4f6', border: `1px solid ${color ? color + '30' : '#e5e7eb'}` }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: color || '#1f2937', fontSize: 14 }}>
            {Icon && <Icon size={16} />}
            <span style={{ textTransform: 'capitalize' }}>{value || 'N/A'}</span>
        </div>
    </div>
);

// --- MAIN COMPONENT ---
export default function Recipes() {
    const [items, setItems] = useState([])
    const [query, setQuery] = useState('')
    const [detail, setDetail] = useState(null)
    const [editing, setEditing] = useState(false)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)

    // --- CÁC STATE BỘ LỌC ---
    const [selectedCategory, setSelectedCategory] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('all') // 'all', 'free', 'premium'

    const [isBulkApproving, setIsBulkApproving] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10;

    // Load data
    const load = useCallback(async () => {
        try {
            setLoading(true);
            // SỬA: Lấy TOÀN BỘ dữ liệu về client để lọc (Client-side filtering)
            // Điều này đảm bảo bộ lọc hoạt động chính xác bất kể backend
            const data = await api.get('/admin/recipes/all');
            setItems(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadCategories() }, []);
    useEffect(() => { load() }, [load]);

    const loadCategories = async () => {
        try { const data = await api.get('/categories'); setCategories(data); } catch (e) { console.error(e) }
    }

    const remove = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa công thức này?')) return
        try { await api.del('/recipes/' + id); load(); } catch (e) { console.error(e) }
    }

    const handleApprove = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn DUYỆT công thức này?')) return;
        try { await api.put(`/admin/recipes/${id}/approve`); load(); } catch (e) { alert(e.message); }
    };

    const handleReject = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn TỪ CHỐI công thức này?')) return;
        try { await api.put(`/admin/recipes/${id}/reject`); load(); } catch (e) { alert(e.message); }
    };

    const handleBulkApprove = async () => {
        const pendingCount = items.filter(r => r.status === 'pending').length;
        if (pendingCount === 0) return alert("Không có công thức nào đang chờ duyệt.");
        if (!confirm(`Duyệt TẤT CẢ ${pendingCount} công thức đang chờ?`)) return;

        setIsBulkApproving(true);
        try { const result = await api.put('/admin/recipes/approve-all'); alert(result.message); load(); }
        catch (e) { alert(e.message); }
        finally { setIsBulkApproving(false); }
    };

    // --- LOGIC LỌC (CLIENT-SIDE) ---
    const filtered = useMemo(() => {
        return items.filter(r => {
            // 1. Tìm kiếm theo tên
            const matchesQuery = (r.name || '').toLowerCase().includes(query.toLowerCase())

            // 2. Lọc theo Trạng thái
            const matchesStatus = !statusFilter
                ? true
                : (statusFilter === 'pending' ? (r.status === 'pending' || !r.status) : r.status === statusFilter);

            // 3. Lọc theo Danh mục (SỬA LỖI: So sánh trực tiếp)
            // r.category thường lưu tên (String), nếu lưu ID thì cần check lại data
            const matchesCategory = !selectedCategory || r.category === selectedCategory;

            // 4. Lọc theo Loại (MỚI)
            const matchesType = typeFilter === 'all'
                ? true
                : (typeFilter === 'premium' ? r.isPremium === true : !r.isPremium);

            return matchesQuery && matchesStatus && matchesCategory && matchesType;
        })
    }, [items, query, statusFilter, selectedCategory, typeFilter]);

    // Reset trang khi filter thay đổi
    useEffect(() => { setCurrentPage(1); }, [query, selectedCategory, statusFilter, typeFilter]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const pendingCount = items.filter(r => r.status === 'pending' || !r.status).length;

    // Reset filters
    const clearFilters = () => {
        setQuery('');
        setSelectedCategory('');
        setStatusFilter('');
        setTypeFilter('all');
        setCurrentPage(1);
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <PageHeader
                title="QUẢN LÝ CÔNG THỨC"
                subtitle={`Hiển thị ${paginatedItems.length} / ${filtered.length} công thức`}
                actions={(
                    <button onClick={() => setEditing(true)} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiPlus size={16} /> Thêm Mới
                    </button>
                )}
            />

            {/* --- THANH TÌM KIẾM & BỘ LỌC --- */}
            <div className="search-filter-bar bg-white p-4 rounded-lg shadow-md mb-6"
                style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', border: '1px solid #e5e7eb' }}>

                {/* 1. Tìm kiếm */}
                <div style={{ position: 'relative', flex: '2 1 250px' }}>
                    <FiSearch
                        size={18}
                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 10 }}
                    />
                    <input
                        placeholder="Tìm kiếm tên công thức..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="input-field"
                        style={{
                            paddingLeft: 40,
                            width: '100%',
                            height: 42,
                            borderRadius: 8,
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* 2. Các Dropdown Bộ lọc */}
                <div style={{ display: 'flex', gap: 12, flex: '4 1 500px', flexWrap: 'wrap' }}>
                    {/* Lọc Danh mục */}
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="input-field"
                        style={{ minWidth: 160, flex: 1, height: 42, borderRadius: 8, cursor: 'pointer' }}
                    >
                        <option value="">Tất cả Danh mục</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>

                    {/* Lọc Trạng thái */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="input-field"
                        style={{ minWidth: 160, flex: 1, height: 42, borderRadius: 8, cursor: 'pointer' }}
                    >
                        <option value="">Tất cả Trạng thái</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Bị từ chối</option>
                    </select>

                    {/* Lọc Loại (MỚI) */}
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        className="input-field"
                        style={{ minWidth: 140, flex: 1, height: 42, borderRadius: 8, cursor: 'pointer' }}
                    >
                        <option value="all">Tất cả Loại</option>
                        <option value="free">Miễn phí</option>
                        <option value="premium">Cao cấp</option>
                    </select>
                </div>

                {/* 3. Nút Hành động */}
                <div style={{ display: 'flex', gap: 8, flex: '1 1 auto', justifyContent: 'flex-end' }}>
                    {/* Nút Reset Filter */}
                    {(query || selectedCategory || statusFilter || typeFilter !== 'all') && (
                        <button
                            onClick={clearFilters}
                            title="Xóa bộ lọc"
                            style={{
                                height: 42, width: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#6b7280', cursor: 'pointer'
                            }}
                        >
                            <FiRefreshCw />
                        </button>
                    )}

                    <button
                        onClick={handleBulkApprove}
                        className="button-primary"
                        disabled={isBulkApproving || loading || pendingCount === 0}
                        style={{
                            height: 42,
                            padding: '0 16px',
                            backgroundColor: (pendingCount > 0 && !isBulkApproving) ? '#22c55e' : undefined,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {isBulkApproving ? 'Đang xử lý...' : `Duyệt Nhanh (${pendingCount})`}
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-section bg-white p-0 rounded-lg shadow-md overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                ) : paginatedItems.length === 0 ? (
                    <div className="empty-state text-center py-16 text-gray-400">
                        <div style={{ fontSize: 40, marginBottom: 10 }}>🍳</div>
                        <p>Không tìm thấy công thức nào phù hợp.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table recipes-table">
                                <thead style={{ background: '#f9fafb' }}>
                                    <tr>
                                        <th style={tableHeaderStyle}>Hình ảnh</th>
                                        <th style={tableHeaderStyle}>Tên công thức</th>
                                        <th style={tableHeaderStyle}>Danh mục</th>
                                        <th style={tableHeaderStyle}>Tác giả</th>
                                        <th style={tableHeaderStyle}>Trạng thái</th>
                                        <th style={tableHeaderStyle}>Loại</th>
                                        <th style={{ ...tableHeaderStyle, width: 140, textAlign: 'center' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.map(r => (
                                        <tr key={r._id} style={{ borderBottom: '1px solid #f3f4f6' }} className="hover:bg-gray-50">
                                            <td style={tableCellStyle}>
                                                {r.imageUrl ? (
                                                    <img src={r.imageUrl} alt={r.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                                                ) : <div style={{ width: 48, height: 48, background: '#f3f4f6', borderRadius: 6 }} />}
                                            </td>
                                            <td style={{ ...tableCellStyle, fontWeight: 500, color: '#111827' }}>{r.name}</td>
                                            <td style={tableCellStyle}>
                                                <span style={{ padding: '2px 8px', background: '#f3f4f6', borderRadius: 12, fontSize: 12 }}>{r.category}</span>
                                            </td>
                                            <td style={{ ...tableCellStyle, color: '#4b5563' }}>{r.author?.fullName || r.author?.displayName || 'Ẩn danh'}</td>

                                            <td style={tableCellStyle}>
                                                <span className={`status-badge status-${r.status}`} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: `${getStatusColor(r.status)}15`, color: getStatusColor(r.status), border: `1px solid ${getStatusColor(r.status)}30`, whiteSpace: 'nowrap', display: 'inline-block' }}>
                                                    {r.status === 'approved' ? 'Đã duyệt' : r.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                                </span>
                                            </td>

                                            <td style={tableCellStyle}>
                                                {r.isPremium ?
                                                    <span style={{ color: '#b45309', background: '#fffbeb', padding: '2px 6px', borderRadius: 4, border: '1px solid #fcd34d', fontSize: 11, fontWeight: 600 }}>CAO CẤP</span>
                                                    : <span style={{ color: '#374151', fontSize: 12 }}>Miễn phí</span>
                                                }
                                            </td>

                                            <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <TableActionMenu
                                                        onView={() => setDetail(r)}
                                                        onEdit={() => setEditing(r)}
                                                        onDelete={() => remove(r._id)}
                                                        customActions={r.status === 'pending' ? [
                                                            {
                                                                label: 'Duyệt',
                                                                icon: <FiCheck size={16} color="#22c55e" />,
                                                                onClick: () => handleApprove(r._id)
                                                            },
                                                            {
                                                                label: 'Từ chối',
                                                                icon: <FiX size={16} color="#f97316" />,
                                                                onClick: () => handleReject(r._id)
                                                            }
                                                        ] : []}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
                                <span style={{ fontSize: 13, color: '#6b7280' }}>Trang <strong>{currentPage}</strong> / {totalPages}</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="button-secondary" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', fontSize: 13 }}><FiChevronLeft size={14} /> Trước</button>
                                    <button className="button-secondary" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', fontSize: 13 }}>Sau <FiChevronRight size={14} /></button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {editing && <RecipeForm recipe={typeof editing === 'object' ? editing : null} onClose={() => setEditing(false)} onSaved={() => { load(); setEditing(false); }} />}
            <DetailModal item={detail} onClose={() => setDetail(null)} />
        </div>
    )
}

function getStatusColor(status) {
    switch (status) {
        case 'approved': return '#22c55e';
        case 'pending': return '#f59e0b';
        case 'rejected': return '#ef4444';
        default: return '#6b7280';
    }
}

const tableHeaderStyle = { padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' };
const tableCellStyle = { padding: '12px 16px', fontSize: 14, verticalAlign: 'middle', borderBottom: '1px solid #f3f4f6' };
const actionButtonStyle = (color) => ({ background: `${color}1A`, color: color, border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' });