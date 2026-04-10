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
        <h3>Chi tiet doanh thu</h3>
        <label className="dashboard-year-select-wrap">
          <span>Nam</span>
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
        </label>
      </div>

      <div className="dashboard-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dashboardRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              width={68}
              tickFormatter={yAxisFormatter}
            />
            <Tooltip content={tooltipContent} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--primary-color)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#dashboardRevenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
