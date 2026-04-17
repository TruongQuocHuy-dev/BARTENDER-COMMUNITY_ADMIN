import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import api from '../../api/client'
import {
    FiPlus, FiSearch,
    FiCheck, FiX, FiChevronLeft, FiChevronRight,
    FiClock, FiRefreshCw, FiUpload
} from 'react-icons/fi'
import { UtensilsCrossed } from 'lucide-react'
import { Utensils, Zap, Star, Video, Image, CalendarDays, UserCircle2, ShieldCheck } from 'lucide-react';
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
        <Modal isOpen={!!item} onClose={onClose} title="Chi tiết Công thức" size="large" subtitle={item.category || 'Chưa phân loại'}>
            <div className="recipe-detail-modal">
                <section className="recipe-detail-hero">
                    <div className="recipe-hero-image-wrap">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="recipe-hero-image" />
                        ) : (
                            <div className="recipe-hero-image-empty"><Image size={20} /> Không có ảnh</div>
                        )}
                    </div>

                    <div className="recipe-hero-content">
                        <h2>{item.name}</h2>
                        <div className="recipe-hero-meta">
                            <span><UserCircle2 size={15} /> {item.author?.fullName || item.author?.displayName || 'Ẩn danh'}</span>
                            <span><CalendarDays size={15} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                        <p>{item.description || 'Chưa có mô tả.'}</p>
                    </div>
                </section>

                <div className="recipe-detail-tags-grid">
                    <DetailTag label="Trạng thái" value={item.status === 'approved' ? 'Đã duyệt' : item.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'} color={getStatusColor(item.status)} icon={ShieldCheck} />
                    <DetailTag label="Danh mục" value={item.category || 'N/A'} icon={Utensils} />
                    <DetailTag label="Độ khó" value={item.difficulty || 'N/A'} color={getDifficultyColor(item.difficulty)} icon={FiClock} />
                    <DetailTag label="Loại" value={item.isPremium ? 'Cao cấp' : 'Miễn phí'} icon={Zap} color={item.isPremium ? '#f59e0b' : '#374151'} />
                    <DetailTag label="Đánh giá" value={`${item.rating || 0}/5 (${item.reviewCount || 0} lượt)`} icon={Star} color="#f59e0b" />
                </div>

                <div className="recipe-detail-media-grid">
                    <div className="recipe-media-card">
                        <div className="recipe-media-head"><Image size={16} /> Hình ảnh</div>
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="recipe-media-img" />
                        ) : (
                            <div className="recipe-media-empty">Không có ảnh</div>
                        )}
                    </div>
                    <div className="recipe-media-card">
                        <div className="recipe-media-head"><Video size={16} /> Video hướng dẫn</div>
                        {item.videoUrl ? (
                            <video src={item.videoUrl} controls className="recipe-media-video" />
                        ) : (
                            <div className="recipe-media-empty">Không có video</div>
                        )}
                    </div>
                </div>

                <div className="recipe-detail-block">
                    <h3>Nguyên liệu</h3>
                    <div className="recipe-ingredients-table">
                        <div className="recipe-ingredients-header">
                            <span>Tên nguyên liệu</span>
                            <span>Số lượng</span>
                            <span>Đơn vị</span>
                        </div>
                        {item.ingredients?.length ? item.ingredients.map((ing, idx) => (
                            <div key={idx} className="recipe-ingredients-row">
                                <span>{ing.name || '-'}</span>
                                <span>{ing.amount || '-'}</span>
                                <span>{ing.unit || '-'}</span>
                            </div>
                        )) : (
                            <div className="recipe-ingredients-empty">Không có nguyên liệu</div>
                        )}
                    </div>
                </div>

                <div className="recipe-detail-block">
                    <h3>Các bước thực hiện</h3>
                    <div className="recipe-steps-wrap">
                        {item.steps?.length ? item.steps.map((step, idx) => (
                            <div key={idx} className="recipe-step-item">
                                <div className="recipe-step-index">{idx + 1}</div>
                                <div className="recipe-step-content">{step}</div>
                            </div>
                        )) : (
                            <div className="recipe-ingredients-empty">Không có bước thực hiện</div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
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
    const [isImporting, setIsImporting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const fileInputRef = useRef(null)
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

    const parseCsvLine = (line) => {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i += 1) {
            const ch = line[i];
            const next = line[i + 1];

            if (ch === '"') {
                if (inQuotes && next === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }

        values.push(current.trim());
        return values;
    };

    const parseCsvText = (text) => {
        const lines = text
            .replace(/^\uFEFF/, '')
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(Boolean);

        if (lines.length < 2) return [];

        const headers = parseCsvLine(lines[0]);

        return lines.slice(1).map((line) => {
            const values = parseCsvLine(line);
            return headers.reduce((acc, header, idx) => {
                acc[header] = values[idx] ?? '';
                return acc;
            }, {});
        });
    };

    const normalizeImportKey = (key) => String(key || '')
        .replace(/^\uFEFF/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

    const getFieldByAliases = (row, aliases) => {
        if (!row || typeof row !== 'object') return '';
        const normalizedRow = {};
        Object.entries(row).forEach(([k, v]) => {
            normalizedRow[normalizeImportKey(k)] = v;
        });

        for (const alias of aliases) {
            const value = normalizedRow[normalizeImportKey(alias)];
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                return value;
            }
        }

        return '';
    };

    const getArrayByAliases = (obj, aliases) => {
        if (!obj || typeof obj !== 'object') return [];

        const entries = Object.entries(obj);
        for (const alias of aliases) {
            const target = normalizeImportKey(alias);
            const matched = entries.find(([k]) => normalizeImportKey(k) === target);
            if (matched && Array.isArray(matched[1])) return matched[1];
        }

        return [];
    };

    const parseIngredientsField = (value) => {
        if (Array.isArray(value)) return value;
        if (!value || typeof value !== 'string') return [];

        const raw = value.trim();
        if (!raw) return [];

        if (raw.startsWith('[')) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                // fallback parser below
            }
        }

        const parseIngredientPart = (item) => {
            const chunk = String(item || '').trim();
            if (!chunk) return { name: '', amount: '', unit: '' };

            const pickDelimiter = () => {
                if ((chunk.match(/\|/g) || []).length >= 2) return '|';
                if ((chunk.match(/:/g) || []).length >= 2) return ':';
                if ((chunk.match(/-/g) || []).length >= 2) return '-';
                return '|';
            };

            const delimiter = pickDelimiter();
            const [name = '', amount = '', unit = ''] = chunk.split(delimiter);

            return {
                name: name.trim(),
                amount: amount.trim(),
                unit: unit.trim(),
            };
        };

        return raw.split(';').map(parseIngredientPart).filter(i => i.name);
    };

    const parseStepsField = (value) => {
        if (Array.isArray(value)) return value;
        if (!value || typeof value !== 'string') return [];

        const raw = value.trim();
        if (!raw) return [];

        if (raw.startsWith('[')) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                // fallback parser below
            }
        }

        return raw.split(';').map(s => s.trim()).filter(Boolean);
    };

    const normalizeImportedRecipe = (row) => ({
        name: String(getFieldByAliases(row, ['name', 'ten_cong_thuc', 'ten', 'recipe_name'])).trim(),
        description: String(getFieldByAliases(row, ['description', 'mo_ta', 'mo_ta_ngan', 'desc'])).trim(),
        category: String(getFieldByAliases(row, ['category', 'danh_muc', 'loai'])).trim(),
        difficulty: String(getFieldByAliases(row, ['difficulty', 'do_kho', 'level']) || 'medium').trim().toLowerCase(),
        alcoholLevel: String(getFieldByAliases(row, ['alcoholLevel', 'alcohol_level', 'nong_do', 'nong_do_con']) || 'medium').trim().toLowerCase(),
        isPremium: getFieldByAliases(row, ['isPremium', 'premium', 'cao_cap']),
        imageUrl: String(getFieldByAliases(row, ['imageUrl', 'image_url', 'hinh_anh', 'anh'])).trim(),
        videoUrl: String(getFieldByAliases(row, ['videoUrl', 'video_url', 'video'])).trim(),
        author: getFieldByAliases(row, ['author', 'authorId', 'tac_gia', 'nguoi_tao']),
        ingredients: parseIngredientsField(getFieldByAliases(row, ['ingredients', 'nguyen_lieu', 'nguyen_lie', 'ingredient'])),
        steps: parseStepsField(getFieldByAliases(row, ['steps', 'cac_buoc', 'buoc_lam', 'huong_dan'])),
    });

    const buildRowsFromSplitSheets = (payload) => {
        const recipeRows = getArrayByAliases(payload, ['recipes', 'recipe_sheet', 'sheet_recipes', 'cong_thuc', 'recipes_data']);
        if (!recipeRows.length) return [];

        const ingredientRows = getArrayByAliases(payload, ['ingredients', 'ingredient_sheet', 'sheet_ingredients', 'nguyen_lieu']);
        const stepRows = getArrayByAliases(payload, ['steps', 'step_sheet', 'sheet_steps', 'cac_buoc']);

        const recipeMap = new Map();

        const resolveRecipeKey = (row) => {
            const keyValue = getFieldByAliases(row, [
                'recipe_key', 'recipeKey', 'recipe_id', 'ma_cong_thuc',
                'recipe_name', 'ten_cong_thuc', 'name', 'ten'
            ]);
            return String(keyValue || '').trim().toLowerCase();
        };

        recipeRows.forEach((row, idx) => {
            const normalized = normalizeImportedRecipe(row);
            const key = resolveRecipeKey(row) || normalized.name.toLowerCase() || `row_${idx}`;
            recipeMap.set(key, {
                ...normalized,
                ingredients: Array.isArray(normalized.ingredients) ? normalized.ingredients : [],
                steps: Array.isArray(normalized.steps) ? normalized.steps : [],
            });
        });

        ingredientRows.forEach((row) => {
            const key = resolveRecipeKey(row);
            if (!key || !recipeMap.has(key)) return;

            const combined = getFieldByAliases(row, ['ingredients', 'ingredient', 'nguyen_lieu']);
            const parsedCombined = parseIngredientsField(combined);

            if (parsedCombined.length) {
                recipeMap.get(key).ingredients.push(...parsedCombined);
                return;
            }

            const name = String(getFieldByAliases(row, ['name', 'ingredient_name', 'ten_nguyen_lieu', 'nguyen_lieu']) || '').trim();
            const amount = String(getFieldByAliases(row, ['amount', 'so_luong', 'quantity']) || '').trim();
            const unit = String(getFieldByAliases(row, ['unit', 'don_vi']) || '').trim();
            if (name) recipeMap.get(key).ingredients.push({ name, amount, unit });
        });

        stepRows.forEach((row) => {
            const key = resolveRecipeKey(row);
            if (!key || !recipeMap.has(key)) return;

            const stepValue = getFieldByAliases(row, ['step', 'content', 'mo_ta_buoc', 'buoc', 'steps', 'cac_buoc']);
            const parsedSteps = parseStepsField(stepValue);
            if (parsedSteps.length) {
                recipeMap.get(key).steps.push(...parsedSteps);
                return;
            }

            const single = String(stepValue || '').trim();
            if (single) recipeMap.get(key).steps.push(single);
        });

        return Array.from(recipeMap.values());
    };

    const handleImportFile = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const ext = file.name.toLowerCase().split('.').pop();

            let parsedRows = [];
            if (ext === 'json') {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) {
                    parsedRows = parsed;
                } else if (parsed && typeof parsed === 'object') {
                    parsedRows = buildRowsFromSplitSheets(parsed);
                }
            } else if (ext === 'csv') {
                parsedRows = parseCsvText(text);
            } else {
                alert('Chỉ hỗ trợ file .json hoặc .csv');
                return;
            }

            const recipes = parsedRows
                .map(normalizeImportedRecipe)
                .filter(r => r.name && r.category);

            if (!recipes.length) {
                alert('Không tìm thấy dữ liệu công thức hợp lệ trong file.');
                return;
            }

            if (!confirm(`Import ${recipes.length} công thức từ file này?`)) {
                return;
            }

            setIsImporting(true);
            const result = await api.post('/admin/recipes/import', { recipes });
            alert(`${result.message}. Thành công: ${result.insertedCount}, lỗi: ${result.failedCount}`);
            await load();
        } catch (e) {
            console.error('Import recipes error:', e);
            alert(e?.message || 'Import thất bại. Vui lòng kiểm tra định dạng file.');
        } finally {
            setIsImporting(false);
            if (event.target) event.target.value = '';
        }
    };

    return (
        <div className="admin-page">
            <PageHeader
                title="QUẢN LÝ CÔNG THỨC"
                subtitle={`Hiển thị ${paginatedItems.length} / ${filtered.length} công thức`}
                actions={(
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="button-secondary"
                            disabled={isImporting}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            title="Import nhanh từ file JSON/CSV"
                        >
                            <FiUpload size={16} /> {isImporting ? 'Đang import...' : 'Import File'}
                        </button>
                        <button onClick={() => setEditing(true)} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiPlus size={16} /> Thêm Mới
                        </button>
                    </div>
                )}
                icon={<UtensilsCrossed size={26} />}
            />

            <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,application/json,text/csv"
                style={{ display: 'none' }}
                onChange={handleImportFile}
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
                        <div className="overflow-x-auto recipes-table-wrap">
                            <table className="table recipes-table">
                                <thead style={{ background: '#f9fafb' }}>
                                    <tr>
                                        <th style={tableHeaderStyle}>Hình ảnh</th>
                                        <th style={tableHeaderStyle}>Tên công thức</th>
                                        <th style={tableHeaderStyle}>Danh mục</th>
                                        <th style={tableHeaderStyle}>Tác giả</th>
                                        <th style={tableHeaderStyle}>Trạng thái</th>
                                        <th style={tableHeaderStyle}>Loại</th>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'center' }}></th>
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

                                            <td className="actions-cell recipe-actions-cell" style={{ ...tableCellStyle, textAlign: 'center' }}>
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