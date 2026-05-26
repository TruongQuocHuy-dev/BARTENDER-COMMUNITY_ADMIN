import React, { useEffect, useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiSearch, FiCheckSquare, FiSquare } from 'react-icons/fi'
import { Pin, Star, EyeOff, Eye, FlagTriangleRight, CalendarDays, UserCircle2 } from 'lucide-react'
import api from '../../api/client'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/common/EmptyState'
import BadgePill from '../../components/common/BadgePill'
import FormSearchField from '../../components/common/FormSearchField'
import FormSelectField from '../../components/common/FormSelectField'
import TableActionMenu from '../../components/TableActionMenu'

const PAGE_SIZE = 12

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'visible', label: 'Đang hiển thị' },
  { value: 'hidden', label: 'Đang ẩn' },
  { value: 'pinned', label: 'Đã pin' },
  { value: 'featured', label: 'Đã feature' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Mọi trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
]

const BULK_OPTIONS = [
  { value: 'hide', label: 'Ẩn đã chọn' },
  { value: 'restore', label: 'Khôi phục đã chọn' },
  { value: 'pin', label: 'Pin đã chọn' },
  { value: 'feature', label: 'Feature đã chọn' },
]

const getFlagSummary = (recipe) => {
  const flags = []
  if (recipe.isHidden) flags.push('Hidden')
  if (recipe.isPinned) flags.push('Pinned')
  if (recipe.isFeatured) flags.push('Featured')
  return flags.length ? flags.join(' · ') : 'Không có cờ'
}

const ReasonBlock = ({ label, value }) => {
  if (!value) return null

  return (
    <div className="moderation-reason-block">
      <span className="moderation-reason-label">{label}</span>
      <div className="moderation-reason-value">{value}</div>
    </div>
  )
}

function RecipeDetailCard({ recipe }) {
  if (!recipe) return null

  return (
    <div className="moderation-detail-card">
      <div className="moderation-detail-head">
        <div>
          <h3>{recipe.name}</h3>
          <p>{recipe.category || 'Chưa phân loại'}</p>
        </div>
        <BadgePill
          label={recipe.status === 'approved' ? 'Đã duyệt' : recipe.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
          tone={recipe.status === 'approved' ? 'success' : recipe.status === 'rejected' ? 'danger' : 'warning'}
        />
      </div>

      <div className="moderation-detail-meta">
        <span><UserCircle2 size={14} /> {recipe.author?.fullName || recipe.author?.email || 'Ẩn danh'}</span>
        <span><CalendarDays size={14} /> {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
      </div>

      <div className="moderation-detail-flags">
        <BadgePill label={recipe.isHidden ? 'Đang ẩn' : 'Hiển thị'} icon={recipe.isHidden ? EyeOff : Eye} tone={recipe.isHidden ? 'danger' : 'success'} />
        <BadgePill label={recipe.isPinned ? 'Đã pin' : 'Chưa pin'} icon={Pin} tone={recipe.isPinned ? 'info' : 'neutral'} />
        <BadgePill label={recipe.isFeatured ? 'Đã feature' : 'Chưa feature'} icon={Star} tone={recipe.isFeatured ? 'warning' : 'neutral'} />
      </div>

      <p className="moderation-detail-description">{recipe.description || 'Không có mô tả.'}</p>

      <ReasonBlock label="Lý do ẩn" value={recipe.hiddenReason} />
      <ReasonBlock label="Lý do pin" value={recipe.pinnedReason} />
      <ReasonBlock label="Lý do feature" value={recipe.featuredReason} />
    </div>
  )
}

export default function ModerationQueue() {
  const [items, setItems] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [visibility, setVisibility] = useState('all')
  const [status, setStatus] = useState('')
  const [bulkReason, setBulkReason] = useState('')
  const [bulkAction, setBulkAction] = useState('hide')
  const [detailItem, setDetailItem] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, limit: PAGE_SIZE })
  const [counts, setCounts] = useState({ hidden: 0, pinned: 0, featured: 0 })

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 350)
    return () => window.clearTimeout(timer)
  }, [query])

  const loadQueue = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/moderation/queue', {
        params: {
          page,
          limit: PAGE_SIZE,
          q: debouncedQuery,
          visibility: visibility === 'all' ? undefined : visibility,
          status: status || undefined,
        },
      })
      setItems(response.items || [])
      setPagination({ total: response.total || 0, limit: response.limit || PAGE_SIZE })
      setCounts(response.counts || { hidden: 0, pinned: 0, featured: 0 })
      setSelectedIds((current) => current.filter((id) => (response.items || []).some((item) => item._id === id)))
    } catch (error) {
      alert(error.message || 'Không tải được moderation queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQueue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQuery, visibility, status])

  const totalPages = useMemo(() => Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || PAGE_SIZE))), [pagination])

  const summary = useMemo(() => ({
    total: pagination.total || 0,
    hidden: counts.hidden || 0,
    pinned: counts.pinned || 0,
    featured: counts.featured || 0,
  }), [items, pagination])

  const toggleSelection = (id) => {
    setSelectedIds((current) => (
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    ))
  }

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? items.map((item) => item._id) : [])
  }

  const runSingleAction = async (recipe, action) => {
    const reason = window.prompt('Nhập lý do cho thao tác này (tuỳ chọn)', '') || ''
    const endpointMap = {
      hide: `/admin/moderation/recipes/${recipe._id}/hide`,
      restore: `/admin/moderation/recipes/${recipe._id}/restore`,
      pin: `/admin/moderation/recipes/${recipe._id}/pin`,
      feature: `/admin/moderation/recipes/${recipe._id}/feature`,
    }

    const payloadMap = {
      hide: { reason },
      restore: { reason },
      pin: { value: !recipe.isPinned, reason },
      feature: { value: !recipe.isFeatured, reason },
    }

    try {
      await api.put(endpointMap[action], payloadMap[action])
      await loadQueue()
    } catch (error) {
      alert(error.message || 'Không thực hiện được thao tác')
    }
  }

  const runBulkAction = async () => {
    if (!selectedIds.length) {
      alert('Chọn ít nhất một công thức')
      return
    }

    try {
      await api.post('/admin/moderation/bulk', {
        ids: selectedIds,
        action: bulkAction,
        reason: bulkReason,
        value: bulkAction === 'pin' || bulkAction === 'feature' ? true : undefined,
      })
      setBulkReason('')
      setSelectedIds([])
      await loadQueue()
    } catch (error) {
      alert(error.message || 'Không thực hiện được bulk action')
    }
  }

  const allSelected = items.length > 0 && selectedIds.length === items.length

  return (
    <div className="page-shell moderation-queue-page">
      <PageHeader
        title="Moderation Queue"
        subtitle="Ẩn, khôi phục, pin và feature công thức với audit log tự động"
        actions={[
          <button key="refresh" type="button" className="btn btn-secondary" onClick={loadQueue} disabled={loading}>
            <FiRefreshCw size={16} /> Làm mới
          </button>,
        ]}
      />

      <section className="summary-row moderation-summary-row">
        <article className="report-summary-card">
          <div className="summary-card-head"><span>Tổng trên trang:</span></div>
          <h3>{summary.total}</h3>
        </article>
        <article className="report-summary-card">
          <div className="summary-card-head"><span>Đang ẩn:</span></div>
          <h3>{summary.hidden}</h3>
        </article>
        <article className="report-summary-card">
          <div className="summary-card-head"><span>Đã pin:</span></div>
          <h3>{summary.pinned}</h3>
        </article>
        <article className="report-summary-card">
          <div className="summary-card-head"><span>Đã feature:</span></div>
          <h3>{summary.featured}</h3>
        </article>
      </section>

      <section className="panel">
        <div className="search-filter-bar moderation-toolbar-panel">
          <div className="moderation-toolbar-grid">
            <FormSearchField
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, danh mục, lý do..."
              icon={FiSearch}
            />
            <FormSelectField value={visibility} onChange={(event) => setVisibility(event.target.value)} options={FILTER_OPTIONS} />
            <FormSelectField value={status} onChange={(event) => setStatus(event.target.value)} options={STATUS_OPTIONS} />
          </div>

          <div className="moderation-bulk-panel">
            <FormSelectField value={bulkAction} onChange={(event) => setBulkAction(event.target.value)} options={BULK_OPTIONS} />
            <input
              type="text"
              className="text-input"
              value={bulkReason}
              onChange={(event) => setBulkReason(event.target.value)}
              placeholder="Lý do cho bulk action"
            />
            <button type="button" className="btn btn-primary" onClick={runBulkAction} disabled={!selectedIds.length || loading}>
              Áp dụng cho {selectedIds.length} mục
            </button>
          </div>
        </div>
      </section>

      <section className="panel moderation-table-panel">
        {loading ? (
          <div className="empty-state">Đang tải dữ liệu...</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<FlagTriangleRight size={24} />}
            message="Không có mục nào trong queue. Thử đổi bộ lọc hoặc làm mới dữ liệu."
          />
        ) : (
          <div className="table-section">
            <div className="table-responsive">
              <table className="data-table moderation-table">
              <thead>
                <tr>
                  <th>
                    <button type="button" className="selection-toggle" onClick={() => toggleSelectAll(!allSelected)}>
                      {allSelected ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                    </button>
                  </th>
                  <th>Công thức</th>
                  <th>Người tạo</th>
                  <th>Trạng thái</th>
                  <th>Cờ moderation</th>
                  <th>Lý do gần nhất</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((recipe) => (
                  <tr key={recipe._id}>
                    <td>
                      <button type="button" className="selection-toggle" onClick={() => toggleSelection(recipe._id)}>
                        {selectedIds.includes(recipe._id) ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                      </button>
                    </td>
                    <td>
                      <button type="button" className="moderation-recipe-link" onClick={() => setDetailItem(recipe)}>
                        {recipe.name}
                      </button>
                    </td>
                    <td>{recipe.author?.fullName || recipe.author?.email || 'Ẩn danh'}</td>
                    <td>
                      <BadgePill
                        label={recipe.status === 'approved' ? 'Đã duyệt' : recipe.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                        tone={recipe.status === 'approved' ? 'success' : recipe.status === 'rejected' ? 'danger' : 'warning'}
                      />
                    </td>
                    <td>{getFlagSummary(recipe)}</td>
                    <td>
                      <div className="moderation-reason-stack">
                        {recipe.hiddenReason ? <span>Ẩn: {recipe.hiddenReason}</span> : null}
                        {recipe.pinnedReason ? <span>Pin: {recipe.pinnedReason}</span> : null}
                        {recipe.featuredReason ? <span>Feature: {recipe.featuredReason}</span> : null}
                        {!recipe.hiddenReason && !recipe.pinnedReason && !recipe.featuredReason ? <span>-</span> : null}
                      </div>
                    </td>
                    <td>
                      <TableActionMenu
                        onView={() => setDetailItem(recipe)}
                        customActions={[
                          {
                            label: recipe.isHidden ? 'Khôi phục' : 'Ẩn',
                            icon: <EyeOff size={16} color={recipe.isHidden ? '#10b981' : '#ef4444'} />,
                            onClick: () => runSingleAction(recipe, recipe.isHidden ? 'restore' : 'hide'),
                          },
                          {
                            label: recipe.isPinned ? 'Bỏ pin' : 'Pin',
                            icon: <Pin size={16} color="#0284c7" />,
                            onClick: () => runSingleAction(recipe, 'pin'),
                          },
                          {
                            label: recipe.isFeatured ? 'Bỏ feature' : 'Feature',
                            icon: <Star size={16} color="#f59e0b" />,
                            onClick: () => runSingleAction(recipe, 'feature'),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="recipes-pagination-footer">
            <span className="recipes-pagination-meta">
              Trang <strong>{page}</strong> / {totalPages}
            </span>
            <div className="recipes-pagination-controls">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
                <FiChevronLeft size={14} /> Trước
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
                Sau <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {detailItem && (
        <div className="moderation-detail-overlay" role="presentation" onClick={() => setDetailItem(null)}>
          <div className="moderation-detail-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="moderation-detail-closebar">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetailItem(null)}>
                Đóng
              </button>
            </div>
            <RecipeDetailCard recipe={detailItem} />
          </div>
        </div>
      )}
    </div>
  )
}