import React, { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { BellRing, CheckCheck, Search } from "lucide-react"
import PageHeader from "../../components/PageHeader"
import FormSearchField from "../../components/common/FormSearchField"
import FormSelectField from "../../components/common/FormSelectField"
import EmptyState from "../../components/common/EmptyState"
import BadgePill from "../../components/common/BadgePill"

const fallbackNotifications = [
  {
    id: "n-1",
    title: "Co report moi can duyet",
    description: "He thong vua nhan 3 report trong 10 phut qua.",
    time: "10 phut truoc",
    unread: true,
    type: "warning",
  },
  {
    id: "n-2",
    title: "Premium package duoc nang cap",
    description: "Nguoi dung da nang cap goi Annual Premium.",
    time: "35 phut truoc",
    unread: true,
    type: "success",
  },
  {
    id: "n-3",
    title: "Cong thuc moi dang cho phe duyet",
    description: "Co 8 cong thuc can duoc admin xem xet.",
    time: "1 gio truoc",
    unread: false,
    type: "info",
  },
]

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
  const location = useLocation()
  const incoming = location.state?.notifications

  const [notifications, setNotifications] = useState(
    Array.isArray(incoming) && incoming.length ? incoming : fallbackNotifications,
  )
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

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

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    )
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
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
        {filtered.length === 0 ? (
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
