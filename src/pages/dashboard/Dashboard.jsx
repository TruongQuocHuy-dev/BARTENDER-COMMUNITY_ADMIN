import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Image as ImageIcon, Loader2, Users, Utensils, Calendar } from 'lucide-react'
import api from '../../api/client'
import StatCard from '../../components/dashboard/StatCard'
import RevenueChartCard from '../../components/dashboard/RevenueChartCard'
import RevenueSummaryCard from '../../components/dashboard/RevenueSummaryCard'
import ReportStatusCard from '../../components/dashboard/ReportStatusCard'
import RecentUsersCard from '../../components/dashboard/RecentUsersCard'
import '../../styles/dashboard.css'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const formatYAxis = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
  return value
}

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="dashboard-tooltip">
      <p className="tooltip-label">{label}</p>
      <span className="tooltip-value">{formatCurrency(payload[0].value)}</span>
    </div>
  )
}

const StatCardData = [
  { key: 'users', label: 'Nguoi dung', icon: Users, toneClass: 'tone-rose', iconClass: 'tone-rose-icon', color: '#f35f87', bgColor: 'rgba(243, 95, 135, 0.08)' },
  { key: 'recipes', label: 'Cong thuc', icon: Utensils, toneClass: 'tone-cyan', iconClass: 'tone-cyan-icon', color: '#11a6cb', bgColor: 'rgba(17, 166, 203, 0.08)' },
  { key: 'banners', label: 'Quang cao', icon: ImageIcon, toneClass: 'tone-orange', iconClass: 'tone-orange-icon', color: '#ff8f66', bgColor: 'rgba(255, 143, 102, 0.08)' },
  { key: 'reports', label: 'Cho xu ly', icon: AlertCircle, toneClass: 'tone-purple', iconClass: 'tone-purple-icon', color: '#9d67ea', bgColor: 'rgba(157, 103, 234, 0.08)' },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [error, setError] = useState(null)

  useEffect(() => {
    loadGeneralStats()
  }, [])

  useEffect(() => {
    loadRevenueStats()
  }, [selectedYear])

  const loadGeneralStats = async () => {
    try {
      const statsData = await api.get('/admin/stats')
      setStats(statsData)
    } catch (err) {
      console.error(err)
      setError('Khong the tai thong ke chung.')
    }
  }

  const loadRevenueStats = async () => {
    try {
      if (!stats) setLoading(true)

      const revenueData = await api.get('/admin/stats/revenue', {
        params: { year: selectedYear },
      })
      setRevenue(revenueData)
    } catch (err) {
      console.error(err)
      setError('Khong the tai du lieu doanh thu.')
    } finally {
      setLoading(false)
    }
  }

  const chartData = useMemo(() => {
    if (!revenue?.monthlyRevenue) return []
    return revenue.monthlyRevenue.map((monthData) => ({
      name: `Thang ${monthData.month}`,
      total: Number(monthData.total) || 0,
    }))
  }, [revenue])

  const pieData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Da giai quyet', value: stats.counts.reportsResolved || 0 },
      { name: 'Cho xu ly', value: stats.counts.reportsPending || 0 },
    ]
  }, [stats])

  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  const today = new Date().toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  if (loading && !stats) {
    return (
      <div className="dashboard-page-loader">
        <div className="loader-content">
          <Loader2 className="dashboard-spinner" size={40} />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-error-state">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    )
  }

  const counts = stats?.counts || {
    userCount: 0,
    recipeCount: 0,
    bannerCount: 0,
    reportsPending: 0,
    reportsResolved: 0,
    totalRevenue: 0,
  }

  const statValues = {
    users: counts.userCount,
    recipes: counts.recipeCount,
    banners: counts.bannerCount,
    reports: counts.reportsPending,
  }

  const recentUsers = stats?.recent?.recentUsers || []

  return (
    <div className="dashboard-container">
      <header className="dashboard-title-section">
        <div className="title-content">
          <div className="title-text">
            <h1>Bang dieu khien</h1>
            <p className="subtitle">
              <Calendar size={16} />
              {today}
            </p>
          </div>
          <div className="title-decoration">
            <div className="deco-circle deco-1"></div>
            <div className="deco-circle deco-2"></div>
          </div>
        </div>
      </header>

      <section className="dashboard-stats-grid">
        {StatCardData.map((stat, index) => (
          <div 
            key={stat.key} 
            className="stat-card-wrapper"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatCard 
              label={stat.label} 
              value={statValues[stat.key]} 
              icon={stat.icon} 
              toneClass={stat.toneClass} 
              iconClass={stat.iconClass}
            />
          </div>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-left-column">
          <RevenueChartCard
            chartData={chartData}
            selectedYear={selectedYear}
            years={years}
            onYearChange={setSelectedYear}
            yAxisFormatter={formatYAxis}
            tooltipContent={<RevenueTooltip />}
          />
          <RecentUsersCard users={recentUsers} />
        </div>

        <aside className="dashboard-right-column">
          <RevenueSummaryCard 
            totalRevenue={counts.totalRevenue} 
            formatCurrency={formatCurrency}
            monthlyGrowth={12.5}
          />
          <ReportStatusCard 
            resolvedCount={counts.reportsResolved}
            pendingCount={counts.reportsPending}
            pieData={pieData}
          />
        </aside>
      </section>
    </div>
  )
}
