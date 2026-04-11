import React from 'react'
import { ArrowRight, Users, Mail, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RecentUsersCard({ users }) {
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })
  }

  return (
    <section className="dashboard-panel dashboard-users-card">
      <div className="dashboard-panel-header">
        <div className="panel-header-left">
          <h3>Nguoi dung moi</h3>
          <span className="panel-badge">{users?.length || 0}</span>
        </div>
        <Link to="/users" className="dashboard-ghost-button">
          Xem tat ca <ArrowRight size={14} />
        </Link>
      </div>

      <div className="dashboard-user-list">
        {users?.length ? (
          users.map((user, index) => (
            <article 
              key={user._id} 
              className="dashboard-user-item"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="user-avatar-wrapper">
                <div className="dashboard-user-avatar">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <Users size={18} />}
                </div>
                {user.subscription?.tier === 'premium' && (
                  <div className="premium-indicator">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="dashboard-user-meta">
                <h4>{user.fullName || 'Nguoi dung an danh'}</h4>
                <div className="user-meta-details">
                  <span className="meta-item">
                    <Mail size={12} />
                    {user.email || 'Khong co email'}
                  </span>
                  {user.createdAt && (
                    <span className="meta-item">
                      <Clock size={12} />
                      {formatDate(user.createdAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="user-action-area">
                {user.isVerified ? (
                  <span className="verified-badge">Verified</span>
                ) : (
                  <span className="pending-badge">Pending</span>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state-container">
            <div className="empty-icon">
              <Users size={32} strokeWidth={1.5} />
            </div>
            <p>Chua co nguoi dung moi.</p>
          </div>
        )}
      </div>
    </section>
  )
}
