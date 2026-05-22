import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Clock3, Download, ExternalLink, FileText, Filter, Search, Shield } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import FormSearchField from '../../components/common/FormSearchField'
import FormSelectField from '../../components/common/FormSelectField'
import EmptyState from '../../components/common/EmptyState'
import BadgePill from '../../components/common/BadgePill'
import auditApi from '../../api/audit'

function formatDate(iso) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

export default function Audits() {
  const [filters, setFilters] = useState({ q: '', admin: '', action: '', resourceType: '', from: '', to: '' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({ items: [], total: 0 })
  const [selected, setSelected] = useState(null)

  const debounceRef = useRef(null)

  const load = async (p = page, params = filters) => {
    setLoading(true)
    try {
      const query = { ...params, page: p, limit }
      const res = await auditApi.queryAudits(query)
      setData({ items: res.items || [], total: res.total || 0 })
      setPage(res.page || p)
    } catch (err) {
      console.error('Failed to load audits', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [])

  // Debounced filter apply
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      load(1, filters)
    }, 450)
    return () => clearTimeout(debounceRef.current)
  }, [filters])

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  const resourceLink = (item) => {
    if (!item || !item.resourceType || !item.resourceId) return null
    const id = item.resourceId
    switch ((item.resourceType || '').toLowerCase()) {
      case 'user': return `/users/${id}`
      case 'recipe': return `/recipes/${id}`
      case 'post': return `/posts/${id}`
      case 'comment': return `/posts`
      case 'banner': return `/banners`
      default: return null
    }
  }

  const summary = useMemo(() => ({
    total: data.total,
    currentPage: page,
    pageSize: limit,
    currentItems: data.items.length,
  }), [data.total, page, limit, data.items.length])

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / limit))

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    load(p, filters)
  }

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 25
    setLimit(newLimit)
    // reload from page 1 with new page size
    setPage(1)
    load(1, filters)
  }

  const actionTone = (action = '') => {
    const normalized = action.toLowerCase()
    if (normalized.includes('delete') || normalized.includes('reject')) return 'danger'
    if (normalized.includes('approve')) return 'success'
    if (normalized.includes('update')) return 'warning'
    return 'info'
  }

  return (
    <div className="admin-page audit-page">
      <PageHeader
        title="Nhật ký hệ thống"
        subtitle={`${summary.total} ban ghi • ${summary.currentItems} hien thi trang ${summary.currentPage}`}
        icon={<Shield size={24} />}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => auditApi.exportAudits(filters)} disabled={loading}>
            <Download size={16} />
            Export CSV
          </button>
        }
      />

      <div className="audit-insights-grid three-col">
        <div className="audit-summary-card tone-blue">
          <div className="summary-card-head">
            <span className="summary-card-icon"><Shield size={14} /></span>
            <span>Tổng log</span>
          </div>
          <h3>{summary.total}</h3>
          <p>Tổng số bản ghi audit hiện có</p>
        </div>

        <div className="audit-summary-card tone-amber">
          <div className="summary-card-head">
            <span className="summary-card-icon"><Clock3 size={14} /></span>
            <span>Trang hiện tại</span>
          </div>
          <h3>{summary.currentPage}</h3>
          <p>Trang dữ liệu đang xem</p>
        </div>

        <div className="audit-summary-card tone-green">
          <div className="summary-card-head">
            <span className="summary-card-icon"><Filter size={14} /></span>
            <span>Số bản ghi/trang</span>
          </div>
          <h3>{summary.pageSize}</h3>
          <p>Số dòng mỗi trang</p>
        </div>
      </div>

      <section className="card">
        <div className="search-filter-bar">
          <div style={{ flex: 2, minWidth: 260 }}>
            <FormSearchField
              value={filters.q}
              onChange={handleFilterChange}
              placeholder="Tim theo action, resource, admin"
              icon={Search}
              name="q"
            />
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <FormSelectField
              value={filters.action || 'all'}
              onChange={handleFilterChange}
              name="action"
              icon={Filter}
              options={[
                { value: '', label: 'Tat ca action' },
                { value: 'delete_user', label: 'delete_user' },
                { value: 'update_user', label: 'update_user' },
                { value: 'approve_recipe', label: 'approve_recipe' },
                { value: 'reject_recipe', label: 'reject_recipe' },
                { value: 'delete_post', label: 'delete_post' },
                { value: 'delete_comment', label: 'delete_comment' },
              ]}
            />
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <FormSelectField
              value={filters.resourceType || 'all'}
              onChange={handleFilterChange}
              name="resourceType"
              icon={FileText}
              options={[
                { value: '', label: 'Tat ca resource' },
                { value: 'User', label: 'User' },
                { value: 'Recipe', label: 'Recipe' },
                { value: 'Post', label: 'Post' },
                { value: 'Comment', label: 'Comment' },
                { value: 'Banner', label: 'Banner' },
              ]}
            />
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <input className="input-field common-input" type="date" name="from" value={filters.from} onChange={handleFilterChange} />
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <input className="input-field common-input" type="date" name="to" value={filters.to} onChange={handleFilterChange} />
          </div>
        </div>

        <div className="audit-toolbar-meta">
          <div className="audit-toolbar-item">
            <Clock3 size={16} />
            <span>Debounce 450ms cho bo loc</span>
          </div>
          <div className="audit-toolbar-item">
            <span>Trang {page}</span>
            <span>•</span>
            <span>{data.items.length} ban ghi</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it) => (
                <tr key={it._id} onClick={() => setSelected(it)} style={{ cursor: 'pointer' }}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(it.createdAt)}</td>
                  <td>{it.admin?.fullName || it.admin?.email || it.admin || '—'}</td>
                  <td>
                    <BadgePill label={it.action} tone={actionTone(it.action)} />
                  </td>
                  <td>
                    {it.resourceType} {it.resourceId ? `(${it.resourceId})` : ''}
                    {resourceLink(it) && (
                      <a href={resourceLink(it)} style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        Open
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </td>
                  <td style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(it.details || {}, null, 2)}</pre>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>
                    {loading ? 'Dang tai...' : <EmptyState icon="📭" message="Khong co audit logs phu hop voi bo loc hien tai." />}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="audit-footer-bar">
          <div>Total: {data.total}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => goToPage(page - 1)} disabled={page <= 1 || loading}>Prev</button>
              <div className="pagination-buttons">
                {(() => {
                  const pages = []
                  const start = Math.max(1, page - 2)
                  const end = Math.min(totalPages, page + 2)
                  for (let i = start; i <= end; i += 1) {
                    pages.push(
                      <button key={i} className={`page-btn ${i === page ? 'active' : ''}`} onClick={() => goToPage(i)} disabled={loading}>{i}</button>
                    )
                  }
                  if (end < totalPages) {
                    pages.push(<span key="ellipsis">…</span>)
                    pages.push(<button key={totalPages} className={`page-btn ${totalPages === page ? 'active' : ''}`} onClick={() => goToPage(totalPages)} disabled={loading}>{totalPages}</button>)
                  }
                  return pages
                })()}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages || loading}>Next</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>Số dòng/trang</label>
              <select value={limit} onChange={handleLimitChange} className="common-input" style={{ width: 96 }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.action} — ${selected.resourceType || ''}` : ''} size="large">
        {selected && (
          <div>
            <p><strong>Time:</strong> {formatDate(selected.createdAt)}</p>
            <p><strong>Admin:</strong> {selected.admin?.fullName || selected.admin?.email || selected.admin || '—'}</p>
            <p><strong>Action:</strong> <BadgePill label={selected.action} tone={actionTone(selected.action)} /></p>
            <p><strong>Resource:</strong> {selected.resourceType} {selected.resourceId ? `(${selected.resourceId})` : ''} {resourceLink(selected) && (<a href={resourceLink(selected)} onClick={(e) => e.stopPropagation()} style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Open resource <ExternalLink size={14} /></a>)}</p>
            <h4>Details</h4>
            <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(selected.details || {}, null, 2)}</pre>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
