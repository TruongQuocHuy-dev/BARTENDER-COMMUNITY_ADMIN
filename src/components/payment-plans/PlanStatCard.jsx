import React from 'react'

export default function PlanStatCard({ label, value, description, accent = 'primary' }) {
  return (
    <article className={`plan-stat-card accent-${accent}`}>
      <span className="plan-stat-label">{label}</span>
      <div className="plan-stat-value">{value}</div>
      {description ? <p className="plan-stat-description">{description}</p> : null}
    </article>
  )
}
