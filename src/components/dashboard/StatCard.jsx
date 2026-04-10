import React from 'react'

export default function StatCard({ label, value, icon: Icon, toneClass, iconClass }) {
  return (
    <article className="dashboard-stat-card">
      <div className="dashboard-stat-content">
        <span className="dashboard-stat-label">{label}</span>
        <span className="dashboard-stat-value">{value}</span>
      </div>
      <div className={`dashboard-stat-icon ${toneClass}`}>
        <Icon size={22} className={iconClass} strokeWidth={2} />
      </div>
    </article>
  )
}
