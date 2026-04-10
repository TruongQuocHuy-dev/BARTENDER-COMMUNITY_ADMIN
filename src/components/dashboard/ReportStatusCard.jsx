import React from 'react'
import { MoreHorizontal, CheckCircle } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PIE_COLORS = ['var(--primary-color)', 'var(--border-color)']

export default function ReportStatusCard({ resolvedCount, pieData }) {
  return (
    <section className="dashboard-panel dashboard-report-card">
      <div className="dashboard-panel-header">
        <h3>Bao cao da xu ly</h3>
        <button type="button" className="dashboard-icon-button" aria-label="Them thao tac">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="dashboard-report-chart-wrap">
        <div className="dashboard-report-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={54}
                outerRadius={74}
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="dashboard-report-center">
            <span>{resolvedCount || 0}</span>
            <p>Da xong</p>
          </div>
        </div>
      </div>

      <div className="dashboard-legend">
        <div className="dashboard-legend-item">
          <span className="dashboard-dot dashboard-dot-primary" />
          Da giai quyet
        </div>
        <div className="dashboard-legend-item">
          <span className="dashboard-dot dashboard-dot-muted" />
          Cho xu ly
        </div>
      </div>

      <div className="dashboard-system-health">
        <div className="dashboard-health-icon">
          <CheckCircle size={16} />
        </div>
        <div>
          <h4>He thong on dinh</h4>
          <p>Tat ca bao cao dang duoc theo doi.</p>
        </div>
      </div>
    </section>
  )
}
