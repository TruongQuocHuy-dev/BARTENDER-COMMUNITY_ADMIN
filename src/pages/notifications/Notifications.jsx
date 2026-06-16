import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  BellRing,
  CheckCheck,
  Search,
  Plus,
  Megaphone,
  UserPlus,
  Heart,
  MessageSquare,
  BookOpen,
  FileText,
  Check,
  Clock,
  Eye,
  EyeOff
} from "lucide-react"
import PageHeader from "../../components/PageHeader"
import FormSearchField from "../../components/common/FormSearchField"
import FormSelectField from "../../components/common/FormSelectField"
import EmptyState from "../../components/common/EmptyState"
import BadgePill from "../../components/common/BadgePill"
import api from "../../api/client"

const typeConfig = {
  new_follower: {
    title: "Có người theo dõi mới",
    type: "info",
    tone: "info",
    icon: UserPlus,
  },
  new_like: {
    title: "Nội dung vừa được thích",
    type: "success",
    tone: "success",
    icon: Heart,
  },
  new_comment: {
    title: "Có bình luận mới",
    type: "warning",
    tone: "warning",
    icon: MessageSquare,
  },
  new_recipe: {
    title: "Có công thức mới",
    type: "info",
    tone: "info",
    icon: BookOpen,
  },
  new_post: {
    title: "Có bài viết mới",
    type: "info",
    tone: "info",
    icon: FileText,
  },
}

const toneByType = {
  warning: "warning",
  success: "success",
  info: "info",
  danger: "danger",
}

const labelByType = {
  warning: "Cần xử lý",
  success: "Hệ thống",
  info: "Thông tin",
  danger: "Cảnh báo",
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/activities")
      const items = Array.isArray(response?.activities)
        ? response.activities
        : Array.isArray(response)
          ? response
          : []

      const mapped = items.map((activity) => {
        const config = typeConfig[activity.type] || {
          title: "Thông báo hệ thống",
          type: "info",
          tone: "info",
          icon: BellRing
        }
        const actorName = activity.actor?.fullName || activity.actor?.username || "Hệ thống"
        const description = activity.message || `${actorName} đã tạo một thông báo mới.`

        return {
          id: activity._id,
          title: config.title,
          description,
          time: activity.createdAt ? new Date(activity.createdAt).toLocaleString("vi-VN") : "Vừa xong",
          unread: !activity.read,
          type: activity.type,
          tone: config.tone,
          icon: config.icon,
        }
      })

      setNotifications(mapped)
    } catch (fetchError) {
      console.error(fetchError)
      setError("Không thể tải thông báo từ máy chủ.")
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter((item) => item.unread).length

  const filtered = useMemo(() => {
    return notifications.filter((item) => {
      const text = `${item.title} ${item.description}`.toLowerCase()
      const matchQuery = text.includes(query.toLowerCase())
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "unread"
            ? item.unread
            : !item.unread

      return matchQuery && matchStatus
    })
  }, [notifications, query, statusFilter])

  const markAsRead = async (id) => {
    try {
      await api.patch(`/activities/${id}/read`)
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
      )
    } catch (markError) {
      console.error(markError)
    }
  }

  const markAllRead = async () => {
    try {
      await api.post("/activities/mark-read", {})
      setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
    } catch (markError) {
      console.error(markError)
    }
  }

  return (
    <div className="admin-page notification-page">
      <PageHeader
        title="Thông báo hệ thống"
        subtitle={`${notifications.length} thông báo • ${unreadCount} chưa đọc`}
        icon={<BellRing size={24} />}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate("/notifications/compose")}
            >
              <Plus size={16} />
              Soạn chiến dịch
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate("/notifications/campaigns")}
            >
              <Megaphone size={16} />
              Chiến dịch
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={16} />
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="notification-stats-grid">
        <div className="report-summary-card tone-blue">
          <div className="summary-card-head">
            <span className="summary-card-icon"><BellRing size={14} /></span>
            <span>Tổng thông báo</span>
          </div>
          <h3>{notifications.length}</h3>
          <p>Tổng số thông báo hệ thống đã ghi nhận</p>
        </div>

        <div className="report-summary-card tone-amber">
          <div className="summary-card-head">
            <span className="summary-card-icon"><EyeOff size={14} /></span>
            <span>Chưa đọc</span>
          </div>
          <h3>{unreadCount}</h3>
          <p>Số lượng thông báo mới đang chờ xử lý</p>
        </div>

        <div className="report-summary-card tone-green">
          <div className="summary-card-head">
            <span className="summary-card-icon"><Eye size={14} /></span>
            <span>Đã đọc</span>
          </div>
          <h3>{notifications.length - unreadCount}</h3>
          <p>Các thông báo đã được xem xét</p>
        </div>
      </div>

      <div className="search-filter-bar notification-toolbar">
        <div style={{ flex: 2, minWidth: 0 }}>
          <FormSearchField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tiêu đề hoặc nội dung thông báo..."
            icon={Search}
          />
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <FormSelectField
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "unread", label: "Chưa đọc" },
              { value: "read", label: "Đã đọc" },
            ]}
          />
        </div>
      </div>

      <section className="notification-list-page">
        {loading ? (
          <div className="rounded-xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-500 shadow-sm flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span>Đang tải danh sách thông báo từ hệ thống...</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message="Không tìm thấy thông báo nào phù hợp với bộ lọc." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((item, index) => {
                const NotiIcon = item.icon || BellRing
                const tone = toneByType[item.type] || "info"
                return (
                  <motion.article
                    className={`notification-row ${item.unread ? "unread" : ""}`}
                    key={item.id || index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <div className={`notification-row-icon ${tone}`}>
                      <NotiIcon size={20} />
                    </div>

                    <div className="notification-row-main">
                      <div className="notification-row-head">
                        <h3>{item.title}</h3>
                        <BadgePill
                          label={labelByType[item.type] || "Thông báo"}
                          tone={item.tone || "neutral"}
                        />
                      </div>

                      <p>{item.description}</p>

                      <div className="notification-row-meta">
                        <span>
                          <Clock size={13} />
                          {item.time}
                        </span>
                        <span>
                          {item.unread ? (
                            <span style={{ color: "var(--warning-color)", fontWeight: 700 }}>Chưa đọc</span>
                          ) : (
                            <span style={{ color: "var(--success-color)" }}>Đã đọc</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {item.unread && (
                      <button
                        type="button"
                        className="button-secondary btn-sm"
                        onClick={() => markAsRead(item.id)}
                        style={{ padding: "6px 12px", display: "inline-flex", gap: 6 }}
                      >
                        <Check size={14} />
                        Đọc
                      </button>
                    )}
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  )
}

