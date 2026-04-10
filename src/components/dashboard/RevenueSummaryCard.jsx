import React from 'react'

export default function RevenueSummaryCard({ totalRevenue, formatCurrency }) {
  return (
    <article className="dashboard-revenue-card">
      <h3>Tong doanh thu</h3>
      <p className="dashboard-revenue-amount">{formatCurrency(totalRevenue || 0)}</p>
      <p className="dashboard-revenue-note">
        Tong doanh thu tich luy tu cac goi dang ky Premium.
      </p>
      <button type="button" className="dashboard-link-button">
        Xem bao cao chi tiet
      </button>
    </article>
  )
}
