import React, { useEffect, useState, useRef } from 'react'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import auditApi from '../../api/audit'

function formatDate(iso) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

export default function Audits() {
  const [filters, setFilters] = useState({ action: '', resourceType: '', admin: '', from: '', to: '' })
  const [page, setPage] = useState(1)
  const [limit] = useState(25)
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
      case 'comment': return `/posts` // comment lives under posts; manual lookup in UI
      case 'banner': return `/banners` 
      default: return null
    }
  }

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Activity trail of admin actions" />

      <section className="card">
        <div style={{ padding: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input name="q" placeholder="Search (action, resource, admin)" value={filters.q || ''} onChange={handleFilterChange} />
            <input name="admin" placeholder="Admin id or email" value={filters.admin} onChange={handleFilterChange} />
            <input name="action" placeholder="Action (delete_user, approve_recipe...)" value={filters.action} onChange={handleFilterChange} />
            <input name="resourceType" placeholder="Resource type (User, Recipe...)" value={filters.resourceType} onChange={handleFilterChange} />
            <input name="from" type="date" value={filters.from} onChange={handleFilterChange} />
            <input name="to" type="date" value={filters.to} onChange={handleFilterChange} />
            <button onClick={() => load(1, filters)} disabled={loading}>Refresh</button>
            <button onClick={() => auditApi.exportAudits(filters)} disabled={loading} title="Export CSV">Export CSV</button>
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
                  <td>{it.action}</td>
                  <td>
                    {it.resourceType} {it.resourceId ? `(${it.resourceId})` : ''}
                    {resourceLink(it) && (
                      <a href={resourceLink(it)} style={{ marginLeft: 8 }} onClick={(e) => e.stopPropagation()}>Open</a>
                    )}
                  </td>
                  <td style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(it.details || {}, null, 2)}</pre>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>{loading ? 'Loading...' : 'No audit logs'}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>Total: {data.total}</div>
          <div>
            <button onClick={() => { if (page > 1) load(page - 1, filters) }} disabled={page <= 1 || loading}>Prev</button>
            <span style={{ margin: '0 8px' }}>{page}</span>
            <button onClick={() => { if (page * limit < data.total) load(page + 1, filters) }} disabled={page * limit >= data.total || loading}>Next</button>
          </div>
        </div>
      </section>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.action} — ${selected.resourceType || ''}` : ''} size="large">
        {selected && (
          <div>
            <p><strong>Time:</strong> {formatDate(selected.createdAt)}</p>
            <p><strong>Admin:</strong> {selected.admin?.fullName || selected.admin?.email || selected.admin || '—'}</p>
            <p><strong>Action:</strong> {selected.action}</p>
            <p><strong>Resource:</strong> {selected.resourceType} {selected.resourceId ? `(${selected.resourceId})` : ''} {resourceLink(selected) && (<a href={resourceLink(selected)} onClick={(e) => e.stopPropagation()}>Open resource</a>)}</p>
            <h4>Details</h4>
            <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(selected.details || {}, null, 2)}</pre>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
