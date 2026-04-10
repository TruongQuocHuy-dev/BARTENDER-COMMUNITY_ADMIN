import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Image as ImageIcon, Loader2, Users, Utensils } from 'lucide-react'
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
      <p>{label}</p>
      <span>{formatCurrency(payload[0].value)}</span>
    </div>
  )
}

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

  if (loading && !stats) {
    return (
      <div className="dashboard-page-loader">
        <Loader2 className="dashboard-spinner" size={32} />
      </div>
    )
  }

  if (error) {
    return <div className="dashboard-error-state">{error}</div>
  }

  const counts = stats?.counts || {
    userCount: 0,
    recipeCount: 0,
    bannerCount: 0,
    reportsPending: 0,
    reportsResolved: 0,
    totalRevenue: 0,
  }
  const recentUsers = stats?.recent?.recentUsers || []

  return (
    <div className="dashboard-container">
      <header className="dashboard-title-section">
        <h1>BANG DIEU KHIEN</h1>
        <p>Tong quan so lieu ngay {new Date().toLocaleDateString('vi-VN')}</p>
      </header>

      <section className="dashboard-stats-grid">
        <StatCard label="Nguoi dung" value={counts.userCount} icon={Users} toneClass="tone-rose" iconClass="tone-rose-icon" />
        <StatCard label="Cong thuc" value={counts.recipeCount} icon={Utensils} toneClass="tone-cyan" iconClass="tone-cyan-icon" />
        <StatCard label="Quang cao" value={counts.bannerCount} icon={ImageIcon} toneClass="tone-orange" iconClass="tone-orange-icon" />
        <StatCard label="Cho xu ly" value={counts.reportsPending} icon={AlertCircle} toneClass="tone-purple" iconClass="tone-purple-icon" />
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
          <RevenueSummaryCard totalRevenue={counts.totalRevenue} formatCurrency={formatCurrency} />
          <ReportStatusCard resolvedCount={counts.reportsResolved} pieData={pieData} />
        </aside>
      </section>
    </div>
  )
}