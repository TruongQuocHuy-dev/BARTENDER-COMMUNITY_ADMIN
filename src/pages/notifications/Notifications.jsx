import React, { useEffect, useMemo, useState } from "react"
import { BellRing, CheckCheck, Search } from "lucide-react"
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
  },
  new_like: {
    title: "Nội dung vừa được thích",
    type: "success",
    tone: "success",
  },
  new_comment: {
    title: "Có bình luận mới",
    type: "warning",
    tone: "warning",
  },
  new_recipe: {
    title: "Có công thức mới",
    type: "info",
    tone: "info",
  },
  new_post: {
    title: "Có bài viết mới",
    type: "info",
    tone: "info",
  },
}

const toneByType = {
  warning: "warning",
  success: "success",
  info: "info",
  danger: "danger",
}

const labelByType = {
  warning: "Can xu ly",
  success: "He thong",
  info: "Thong tin",
  danger: "Canh bao",
}

export default function Notifications() {
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
        const config = typeConfig[activity.type] || { title: "Thông báo hệ thống", type: "info", tone: "info" }
        const actorName = activity.actor?.fullName || activity.actor?.username || "Hệ thống"
        const description = activity.message || `${actorName} đã tạo một thông báo mới.`

        return {
          id: activity._id,
          title: config.title,
          description,
          time: activity.createdAt ? new Date(activity.createdAt).toLocaleString("vi-VN") : "Vừa xong",
          unread: !activity.read,
          type: config.type,
          tone: config.tone,
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
        title="THONG BAO HE THONG"
        subtitle={`${notifications.length} thong bao • ${unreadCount} chua doc`}
        icon={<BellRing size={24} />}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} />
            Danh dau tat ca da doc
          </button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="search-filter-bar notification-toolbar">
        <div style={{ flex: 2, minWidth: 0 }}>
          <FormSearchField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tim theo tieu de hoac noi dung thong bao"
            icon={Search}
          />
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <FormSelectField
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { value: "all", label: "Tat ca" },
              { value: "unread", label: "Chua doc" },
              { value: "read", label: "Da doc" },
            ]}
          />
        </div>
      </div>

      <section className="notification-list-page">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Đang tải thông báo...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message="Khong co thong bao phu hop voi bo loc hien tai." />
        ) : (
          filtered.map((item) => (
            <article
              className={`notification-row ${item.unread ? "unread" : ""}`}
              key={item.id}
            >
              <div className="notification-row-main">
                <div className="notification-row-head">
                  <h3>{item.title}</h3>
                  <BadgePill
                    label={labelByType[item.type] || "Thong bao"}
                    tone={toneByType[item.type] || "neutral"}
                  />
                </div>

                <p>{item.description}</p>

                <div className="notification-row-meta">
                  <span>{item.time}</span>
                  <span>{item.unread ? "Chua doc" : "Da doc"}</span>
                </div>
              </div>

              {item.unread && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => markAsRead(item.id)}
                >
                  Danh dau da doc
                </button>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  )
}
