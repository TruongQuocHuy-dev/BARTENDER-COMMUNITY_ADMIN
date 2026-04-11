import React from 'react'
import { TrendingUp, DollarSign, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RevenueSummaryCard({ totalRevenue, formatCurrency, monthlyGrowth }) {
  const growth = monthlyGrowth || 12.5
  const isPositiveGrowth = growth >= 0

  return (
    <article className="dashboard-revenue-card">
      <div className="revenue-card-bg">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
      
      <div className="revenue-header">
        <div className="revenue-icon-wrapper">
          <DollarSign size={20} />
        </div>
        <span className="revenue-badge">
          <Sparkles size={12} />
          Premium
        </span>
      </div>

      <h3>Tong doanh thu</h3>
      <p className="dashboard-revenue-amount">{formatCurrency(totalRevenue || 0)}</p>
      
      <div className="revenue-growth">
        <span className={`growth-badge ${isPositiveGrowth ? 'positive' : 'negative'}`}>
          <TrendingUp size={12} />
          {isPositiveGrowth ? '+' : ''}{growth}%
        </span>
        <span className="growth-label">so voi thang truoc</span>
      </div>

      <p className="dashboard-revenue-note">
        Tong doanh thu tu cac goi Premium.
      </p>

      <Link to="/reports" className="dashboard-link-button">
        Xem bao cao chi tiet
        <ArrowRight size={14} />
      </Link>

      <div className="revenue-decoration">
        <svg viewBox="0 0 120 120" className="decoration-ring">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
        </svg>
      </div>
    </article>
  )
}
