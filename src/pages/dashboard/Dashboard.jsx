import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  Download,
  Loader2,
  PieChart as PieChartIcon,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  TrendingUp,
  Users,
  Utensils,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../../api/client'
import auditApi from '../../api/audit'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/dashboard/StatCard'
import BadgePill from '../../components/common/BadgePill'
import EmptyState from '../../components/common/EmptyState'
import '../../styles/dashboard.css'

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

const formatAxisValue = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
  return value
}

const formatAction = (value = '') => String(value)
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase())

const formatTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const DashboardTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="dashboard-tooltip">
      <p className="tooltip-label">{label}</p>
      <span className="tooltip-value">{formatter ? formatter(payload[0].value) : payload[0].value}</span>
    </div>
  )
}

function DashboardChartCard({ title, subtitle, icon: Icon, loading, emptyMessage, children }) {
  return (
    <section className="dashboard-panel dashboard-chart-card">
      <div className="dashboard-panel-header dashboard-panel-header-tight">
        <div className="panel-header-left">
          {Icon ? <span className="dashboard-panel-icon"><Icon size={16} /></span> : null}
          <div>
            <h3>{title}</h3>
            <p className="dashboard-panel-subtitle">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-chart-area dashboard-chart-area-compact">
        {loading ? (
          <div className="dashboard-chart-loading">
            <Loader2 size={20} className="dashboard-spinner" />
            <span>Đang tải...</span>
          </div>
        ) : children ? (
          children
        ) : (
          <EmptyState icon="📊" message={emptyMessage} />
        )}
      </div>
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton-shell">
      <div className="dashboard-skeleton-row dashboard-skeleton-stats">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="dashboard-skeleton-card">
            <div className="dashboard-skeleton-line short"></div>
            <div className="dashboard-skeleton-line medium"></div>
            <div className="dashboard-skeleton-icon"></div>
          </div>
        ))}
      </div>

      <div className="dashboard-skeleton-row dashboard-skeleton-charts">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="dashboard-skeleton-card dashboard-skeleton-chart-card">
            <div className="dashboard-skeleton-line medium"></div>
            <div className="dashboard-skeleton-chart"></div>
          </div>
        ))}
      </div>

      <div className="dashboard-skeleton-row dashboard-skeleton-bottom">
        <div className="dashboard-skeleton-card dashboard-skeleton-table-card">
          <div className="dashboard-skeleton-line medium"></div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="dashboard-skeleton-table-row"></div>
          ))}
        </div>
        <div className="dashboard-skeleton-card dashboard-skeleton-actions-card">
          <div className="dashboard-skeleton-line medium"></div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="dashboard-skeleton-action"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(null)
  const [activity, setActivity] = useState({ items: [], total: 0, page: 1, limit: 8 })
  const [activityLoading, setActivityLoading] = useState(true)
  const [activityPage, setActivityPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true)
      setSummaryError(null)
      try {
        const data = await api.get('/admin/stats/dashboard')
        setDashboard(data)
      } catch (error) {
        const fallbackStats = await api.get('/admin/stats')
        const fallbackRevenue = await api.get('/admin/stats/revenue')

        setDashboard({
          counts: {
            totalUsers: fallbackStats?.counts?.userCount || 0,
            activeRecipeCount: fallbackStats?.counts?.recipeCount || 0,
            pendingModeration: (fallbackStats?.counts?.reportsPending || 0) + (fallbackStats?.counts?.reportsResolved || 0),
            revenue7d: fallbackRevenue?.totalRevenue || fallbackStats?.counts?.totalRevenue || 0,
          },
          trends: {},
          charts: {
            userGrowth: [],
            recipeStatus: [],
            revenue7d: [],
          },
        })

        console.warn('Dashboard snapshot endpoint unavailable, fell back to legacy stats.', error)
      }
    } catch (error) {
      console.error(error)
      setSummaryError('Không thể tải bảng điều khiển.')
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  const loadActivity = useCallback(async (page) => {
    try {
      setActivityLoading(true)
      const data = await auditApi.queryAudits({ page, limit: 8 })
      setActivity({
        items: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || 8,
      })
    } catch (error) {
      console.error(error)
      setActivity({ items: [], total: 0, page, limit: 8 })
    } finally {
      setActivityLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    loadActivity(activityPage)
  }, [activityPage, loadActivity])

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const counts = dashboard?.counts || {}
  const trends = dashboard?.trends || {}
  const charts = dashboard?.charts || {}

  const summaryCards = useMemo(() => ([
    {
      key: 'totalUsers',
      label: 'Tổng người dùng',
      value: counts.totalUsers || 0,
      icon: Users,
      toneClass: 'tone-rose',
      iconClass: 'tone-rose-icon',
      to: '/users',
      trend: trends.totalUsers,
    },
    {
      key: 'activeRecipeCount',
      label: 'Công thức hoạt động',
      value: counts.activeRecipeCount || 0,
      icon: Utensils,
      toneClass: 'tone-cyan',
      iconClass: 'tone-cyan-icon',
      to: '/recipes',
      trend: trends.activeRecipeCount,
    },
    {
      key: 'pendingModeration',
      label: 'Chờ moderation',
      value: counts.pendingModeration || 0,
      icon: ShieldAlert,
      toneClass: 'tone-orange',
      iconClass: 'tone-orange-icon',
      to: '/audits',
      trend: trends.pendingModeration,
    },
    {
      key: 'revenue7d',
      label: 'Revenue (7d)',
      value: formatCurrency(counts.revenue7d || 0),
      icon: TrendingUp,
      toneClass: 'tone-purple',
      iconClass: 'tone-purple-icon',
      to: '/reports/revenue',
      trend: trends.revenue7d,
    },
  ]), [counts, trends])

  const summaryActions = useMemo(() => ([
    {
      key: 'new-recipe',
      label: '+ New Recipe',
      description: 'Mở form tạo công thức mới',
      icon: Plus,
      toneClass: 'tone-rose',
      kind: 'button',
      onClick: () => navigate('/recipes', { state: { openCreate: true } }),
    },
    {
      key: 'broadcast',
      label: 'Send Broadcast',
      description: 'Đi tới khu vực thông báo hệ thống',
      icon: Send,
      toneClass: 'tone-cyan',
      kind: 'button',
      allowedRoles: ['admin', 'superadmin'],
      onClick: () => navigate('/notifications'),
    },
    {
      key: 'review-queue',
      label: 'Review Queue',
      description: 'Xem các mục cần xử lý moderation',
      icon: Activity,
      toneClass: 'tone-orange',
      kind: 'link',
      to: '/audits',
    },
    {
      key: 'export-report',
      label: 'Export Report',
      description: 'Tải nhanh báo cáo hoạt động',
      icon: Download,
      toneClass: 'tone-purple',
      kind: 'button',
      onClick: async () => {
        setIsExporting(true)
        try {
          await auditApi.exportAudits({})
        } finally {
          setIsExporting(false)
        }
      },
    },
  ]), [navigate])

  const activeActions = summaryActions.filter((action) => {
    if (!action.allowedRoles || !action.allowedRoles.length) return true
    if (!user?.role) return true
    return action.allowedRoles.includes(user.role)
  })

  const activityPages = Math.max(1, Math.ceil((activity.total || 0) / (activity.limit || 8)))

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= activityPages) {
      setActivityPage(newPage)
    }
  }

  if (summaryLoading && !dashboard) {
    return (
      <div className="dashboard-container dashboard-command-center">
        <DashboardSkeleton />
      </div>
    )
  }

  if (summaryError) {
    return (
      <div className="dashboard-container dashboard-command-center">
        <div className="dashboard-error-state">
          <Loader2 size={18} className="dashboard-spinner" />
          <span>{summaryError}</span>
          <button type="button" className="dashboard-retry-button" onClick={loadSummary}>Tải lại</button>
        </div>
      </div>
    )
  }

  const userGrowthSeries = charts.userGrowth || []
  const recipeStatusSeries = charts.recipeStatus || []
  const revenueSeries = charts.revenue7d || []
  const revenueByPlanSeries = charts.revenueByPlan || []

  return (
    <div className="dashboard-container dashboard-command-center">
      <header className="dashboard-title-section">
        <div className="title-content">
          <div className="title-text">
            <p className="dashboard-kicker">Command center</p>
            <h1>Bảng điều khiển</h1>
            <p className="subtitle">
              <Calendar size={16} />
              {today}
            </p>
          </div>
          <div className="title-actions">
            <button type="button" className="dashboard-toolbar-button" onClick={loadSummary} aria-label="Làm mới dashboard">
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>
        </div>
      </header>

      <section className="dashboard-stats-grid dashboard-summary-grid">
        {summaryCards.map((card, index) => (
          <Link
            key={card.key}
            to={card.to}
            className="dashboard-stat-link"
            aria-label={`Đi tới ${card.label}`}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <StatCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              toneClass={card.toneClass}
              iconClass={card.iconClass}
              trend={card.trend >= 0 ? 'up' : 'down'}
              trendValue={Math.abs(card.trend || 0)}
            />
          </Link>
        ))}
      </section>

      <section className="dashboard-charts-grid">
        <DashboardChartCard
          title="User Growth"
          subtitle="Tăng trưởng đăng ký 7 ngày gần nhất"
          icon={TrendingUp}
          loading={summaryLoading && !userGrowthSeries.length}
          emptyMessage="Chưa có dữ liệu tăng trưởng người dùng."
        >
          {userGrowthSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthSeries} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={44} />
                <Tooltip content={<DashboardTooltip formatter={(value) => `${value} users`} />} />
                <Line type="monotone" dataKey="total" stroke="#f35f87" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </DashboardChartCard>

        <DashboardChartCard
          title="Recipe Status"
          subtitle="Phân bố trạng thái công thức"
          icon={PieChartIcon}
          loading={summaryLoading && !recipeStatusSeries.length}
          emptyMessage="Chưa có công thức để hiển thị."
        >
          {recipeStatusSeries.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={recipeStatusSeries} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={4}>
                  {recipeStatusSeries.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DashboardTooltip formatter={(value) => `${value} recipes`} />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : null}
        </DashboardChartCard>

        <DashboardChartCard
          title="Revenue"
          subtitle="Doanh thu 7 ngày gần nhất"
          icon={BarChart3}
          loading={summaryLoading && !revenueSeries.length}
          emptyMessage="Chưa có doanh thu trong khoảng này."
        >
          {revenueSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={60} tickFormatter={formatAxisValue} />
                <Tooltip content={<DashboardTooltip formatter={formatCurrency} />} />
                <Bar dataKey="total" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </DashboardChartCard>

        <DashboardChartCard
          title="Revenue by Package"
          subtitle="Doanh thu theo gói thanh toán"
          icon={BarChart3}
          loading={summaryLoading && !revenueByPlanSeries.length}
          emptyMessage="Chưa có dữ liệu doanh thu theo gói."
        >
          {revenueByPlanSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPlanSeries} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={60} tickFormatter={formatAxisValue} />
                <Tooltip content={<DashboardTooltip formatter={formatCurrency} />} />
                <Bar dataKey="total" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </DashboardChartCard>
      </section>

      <section className="dashboard-bottom-grid">
        <section className="dashboard-panel dashboard-activity-panel">
          <div className="dashboard-panel-header dashboard-panel-header-tight">
            <div className="panel-header-left">
              <h3>Recent Activity</h3>
              <span className="panel-badge">{activity.total || 0}</span>
            </div>
            <Link to="/audits" className="dashboard-ghost-button">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {activityLoading ? (
            <div className="dashboard-chart-loading dashboard-activity-loading">
              <Loader2 size={20} className="dashboard-spinner" />
              <span>Đang tải...</span>
            </div>
          ) : activity.items.length > 0 ? (
            <div className="dashboard-activity-table-wrap">
              <table className="dashboard-activity-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.items.map((item) => (
                    <tr key={item._id}>
                      <td>{formatTime(item.createdAt)}</td>
                      <td>{item.admin?.fullName || item.admin?.email || 'Unknown'}</td>
                      <td><BadgePill label={formatAction(item.action)} tone="neutral" /></td>
                      <td>
                        <div className="dashboard-resource-cell">
                          <span>{item.resourceType}</span>
                          <small>{String(item.resourceId || '').slice(-8)}</small>
                        </div>
                      </td>
                      <td><BadgePill label="Recorded" tone="success" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {activityPages > 1 && (
                <div className="dashboard-activity-footer">
                  <span>Page {activity.page} of {activityPages}</span>
                  <div className="dashboard-activity-pagination">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handlePageChange(activity.page - 1)} disabled={activity.page === 1}>Prev</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handlePageChange(activity.page + 1)} disabled={activity.page === activityPages}>Next</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon="📭" message="Chưa có hoạt động gần đây." />
          )}
        </section>

        <aside className="dashboard-panel dashboard-quick-actions-panel">
          <div className="dashboard-panel-header dashboard-panel-header-tight">
            <div className="panel-header-left">
              <h3>Quick Actions</h3>
            </div>
            <span className="panel-badge">{activeActions.length}</span>
          </div>

          <div className="dashboard-quick-actions">
            {activeActions.map((action) => {
              const Icon = action.icon
              const disabled = action.key === 'export-report' && isExporting

              if (action.kind === 'link') {
                return (
                  <Link key={action.key} to={action.to} className={`dashboard-quick-action ${action.toneClass}`}>
                    <span className="dashboard-quick-action-icon"><Icon size={18} /></span>
                    <span className="dashboard-quick-action-copy">
                      <strong>{action.label}</strong>
                      <small>{action.description}</small>
                    </span>
                    <ArrowRight size={14} className="dashboard-quick-action-arrow" />
                  </Link>
                )
              }

              return (
                <button
                  key={action.key}
                  type="button"
                  className={`dashboard-quick-action ${action.toneClass} ${disabled ? 'is-loading' : ''}`}
                  onClick={action.onClick}
                  disabled={disabled}
                >
                  <span className="dashboard-quick-action-icon"><Icon size={18} /></span>
                  <span className="dashboard-quick-action-copy">
                    <strong>{disabled ? 'Đang export...' : action.label}</strong>
                    <small>{action.description}</small>
                  </span>
                  <ArrowRight size={14} className="dashboard-quick-action-arrow" />
                </button>
              )
            })}
          </div>
        </aside>
      </section>
    </div>
  )
}