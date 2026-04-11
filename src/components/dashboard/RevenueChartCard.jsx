import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

export default function RevenueChartCard({ chartData, selectedYear, years, onYearChange, yAxisFormatter, tooltipContent }) {
  return (
    <section className="dashboard-panel dashboard-chart-card">
      <div className="dashboard-panel-header">
        <div className="panel-header-left">
          <h3>Chi tiet doanh thu</h3>
          <div className="chart-legend-mini">
            <span className="legend-dot"></span>
            <span>Doanh thu</span>
          </div>
        </div>
        <label className="dashboard-year-select-wrap">
          <span>Nam</span>
          <div className="select-wrapper">
            <select
              value={selectedYear}
              onChange={(event) => onYearChange(Number(event.target.value))}
              className="dashboard-year-select"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>

      <div className="dashboard-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dashboardRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="revenueLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              width={60}
              tickFormatter={yAxisFormatter}
            />
            <Tooltip content={tooltipContent} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="url(#revenueLineGradient)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#dashboardRevenueGradient)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
