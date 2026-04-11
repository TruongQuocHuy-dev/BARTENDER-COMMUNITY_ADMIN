import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ label, value, icon: Icon, toneClass, iconClass, trend, trendValue }) {
  const isPositiveTrend = trend === 'up' || (trendValue && trendValue > 0)
  const isNegativeTrend = trend === 'down' || (trendValue && trendValue < 0)

  return (
    <article className="dashboard-stat-card">
      <div className="stat-card-glow"></div>
      <div className="dashboard-stat-content">
        <span className="dashboard-stat-label">{label}</span>
        <div className="stat-value-row">
          <span className="dashboard-stat-value">{value?.toLocaleString() || 0}</span>
          {(isPositiveTrend || isNegativeTrend) && (
            <span className={`stat-trend ${isPositiveTrend ? 'positive' : 'negative'}`}>
              {isPositiveTrend ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(trendValue || 0)}%</span>
            </span>
          )}
        </div>
      </div>
      <div className={`dashboard-stat-icon ${toneClass}`}>
        <Icon size={24} className={iconClass} strokeWidth={2} />
      </div>
    </article>
  )
}
