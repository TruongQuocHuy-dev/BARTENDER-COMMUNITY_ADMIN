import React from 'react'
import { ArrowRight, Users } from 'lucide-react'

export default function RecentUsersCard({ users }) {
  return (
    <section className="dashboard-panel dashboard-users-card">
      <div className="dashboard-panel-header">
        <h3>Nguoi dung moi</h3>
        <button type="button" className="dashboard-ghost-button">Xem tat ca</button>
      </div>

      <div className="dashboard-user-list">
        {users?.length ? (
          users.map((user) => (
            <article key={user._id} className="dashboard-user-item">
              <div className="dashboard-user-avatar">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : <Users size={16} />}
              </div>
              <div className="dashboard-user-meta">
                <h4>{user.fullName || 'Nguoi dung an danh'}</h4>
                <span>{user.email || 'Khong co email'}</span>
              </div>
              <button type="button" className="dashboard-icon-button" aria-label="Xem nguoi dung">
                <ArrowRight size={15} />
              </button>
            </article>
          ))
        ) : (
          <p className="dashboard-empty-text">Chua co nguoi dung moi.</p>
        )}
      </div>
    </section>
  )
}
