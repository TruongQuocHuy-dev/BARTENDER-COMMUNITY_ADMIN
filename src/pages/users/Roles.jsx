import { useEffect, useMemo, useState } from 'react'
import { Shield, Plus, Pencil, Trash2, KeyRound } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import BadgePill from '../../components/common/BadgePill'
import EmptyState from '../../components/common/EmptyState'
import FormSearchField from '../../components/common/FormSearchField'
import roleApi from '../../api/roles'
import '../../styles/roles.css'

const DEFAULT_FORM = { name: '', displayName: '', description: '', permissions: [] }

function RoleEditor({ role, permissions, onClose, onSaved }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      name: role?.name || '',
      displayName: role?.displayName || '',
      description: role?.description || '',
      permissions: Array.isArray(role?.permissions) ? role.permissions : [],
    })
  }, [role])

  const togglePermission = (permission) => {
    setForm((current) => {
      const exists = current.permissions.includes(permission)
      return {
        ...current,
        permissions: exists
          ? current.permissions.filter((item) => item !== permission)
          : [...current.permissions, permission],
      }
    })
  }

  const submit = async () => {
    if (!form.name.trim() || !form.displayName.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim().toLowerCase(),
        displayName: form.displayName.trim(),
        description: form.description.trim(),
        permissions: form.permissions,
      }

      if (role?._id) {
        await roleApi.updateRole(role._id, payload)
      } else {
        await roleApi.createRole(payload)
      }

      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={!!role}
      onClose={onClose}
      title={role?._id ? 'Chỉnh sửa role' : 'Tạo role mới'}
      size="medium"
    >
      <div className="modal-form">
        <div className="modal-form-grid">
          <div className="modal-form-group">
            <label className="form-label">Key</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="moderator"
              disabled={!!role?._id && !!role?.isSystem}
            />
          </div>
          <div className="modal-form-group">
            <label className="form-label">Tên hiển thị</label>
            <input
              className="form-input"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Kiểm duyệt"
            />
          </div>
        </div>

        <div className="modal-form-group">
          <label className="form-label">Mô tả</label>
          <textarea
            className="form-input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Phân quyền cho nhóm này"
          />
        </div>

        <div className="modal-form-group">
          <label className="form-label">Permissions</label>
          <div className="permission-grid">
            {permissions.map((permission) => (
              <button
                key={permission}
                type="button"
                className={`permission-pill ${form.permissions.includes(permission) ? 'active' : ''}`}
                onClick={() => togglePermission(permission)}
              >
                {permission}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="button-secondary" onClick={onClose}>Hủy</button>
        <button type="button" className="button-primary" onClick={submit} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </Modal>
  )
}

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)

  const load = async () => {
    const [rolesRes, permissionsRes] = await Promise.all([
      roleApi.getRoles(),
      roleApi.getPermissions(),
    ])

    setRoles(Array.isArray(rolesRes) ? rolesRes : [])
    setPermissions(Array.isArray(permissionsRes?.permissions) ? permissionsRes.permissions : [])
  }

  useEffect(() => {
    load().catch((err) => console.error('Failed to load roles', err))
  }, [])

  const filteredRoles = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return roles
    return roles.filter((role) => {
      const searchable = `${role.name || ''} ${role.displayName || ''} ${role.description || ''} ${(role.permissions || []).join(' ')}`.toLowerCase()
      return searchable.includes(keyword)
    })
  }, [roles, query])

  const remove = async (role) => {
    if (!confirm(`Xóa role ${role.displayName || role.name}?`)) return
    await roleApi.deleteRole(role._id)
    await load()
  }

  return (
    <div className="admin-page roles-page">
      <PageHeader
        title="Quản lý Roles"
        subtitle={`${roles.length} role đã cấu hình`}
        icon={<Shield size={26} />}
        actions={(
          <button type="button" className="button-primary" onClick={() => setEditing({})}>
            <Plus size={16} /> Tạo role
          </button>
        )}
      />

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <FormSearchField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên role, mô tả hoặc permission"
          icon={KeyRound}
        />
      </div>

      <div className="roles-grid">
        {filteredRoles.length === 0 ? (
          <EmptyState icon="🛡️" message="Chưa có role nào khớp với bộ lọc." />
        ) : (
          filteredRoles.map((role) => (
            <section key={role._id} className="role-card card">
              <div className="role-card-head">
                <div>
                  <h3>{role.displayName || role.name}</h3>
                  <p>{role.description || 'Không có mô tả'}</p>
                </div>
                <BadgePill label={role.isSystem ? 'System' : 'Custom'} tone={role.isSystem ? 'warning' : 'info'} />
              </div>

              <div className="role-card-meta">
                <span className="role-key">{role.name}</span>
                <span>{Array.isArray(role.permissions) ? role.permissions.length : 0} permissions</span>
              </div>

              <div className="role-permission-chips">
                {(role.permissions || []).map((permission) => (
                  <BadgePill key={permission} label={permission} tone="neutral" />
                ))}
              </div>

              <div className="role-card-actions">
                <button className="button-secondary" onClick={() => setEditing(role)}>
                  <Pencil size={14} /> Sửa
                </button>
                <button type="button" className="button-danger" onClick={() => remove(role)} disabled={role.isSystem}>
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            </section>
          ))
        )}
      </div>

      <RoleEditor
        role={editing}
        permissions={permissions}
        onClose={() => setEditing(null)}
        onSaved={load}
      />
    </div>
  )
}