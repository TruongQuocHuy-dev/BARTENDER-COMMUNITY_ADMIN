import React from 'react'
import { MoreHorizontal, CheckCircle, AlertCircle, Activity } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PIE_COLORS = ['#10b981', '#e5e7eb']
const ACCENT_COLORS = ['#10b981', '#f59e0b', '#3b82f6']

export default function ReportStatusCard({ resolvedCount, pendingCount, pieData }) {
  const total = pieData?.reduce((sum, item) => sum + item.value, 0) || 0
  const resolvedPercent = total > 0 ? Math.round((resolvedCount / total) * 100) : 0

  const statusItems = [
    { 
      icon: CheckCircle, 
      label: 'Da giai quyet', 
      value: resolvedCount || 0, 
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    { 
      icon: AlertCircle, 
      label: 'Cho xu ly', 
      value: pendingCount || 0, 
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)'
    }
  ]

  return (
    <section className="dashboard-panel dashboard-report-card">
      <div className="dashboard-panel-header">
        <div className="panel-header-left">
          <h3>Tinh trang ho tro</h3>
        </div>
        <button type="button" className="dashboard-icon-button" aria-label="Them thao tac">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="report-chart-section">
        <div className="dashboard-report-chart-wrap">
          <div className="dashboard-report-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={pieData}
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  animationBegin={0}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {pieData?.map((entry, index) => (
                    <Cell 
                      key={`${entry.name}-${index}`} 
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="dashboard-report-center">
              <span className="report-percent">{resolvedPercent}%</span>
              <p>Hoan thanh</p>
            </div>
          </div>
        </div>

        <div className="status-items-grid">
          {statusItems.map((item, idx) => (
            <div key={idx} className="status-item-card">
              <div className="status-item-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                <item.icon size={16} />
              </div>
              <div className="status-item-info">
                <span className="status-item-value" style={{ color: item.color }}>{item.value}</span>
                <span className="status-item-label">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-system-health">
        <div className="dashboard-health-icon">
          <Activity size={16} />
        </div>
        <div>
          <h4>He thong on dinh</h4>
          <p>Tat ca bao cao dang duoc theo doi.</p>
        </div>
      </div>
    </section>
  )
}
