import React from "react"
import {
  Bell,
  CheckCheck,
  Circle,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  BadgeDollarSign,
  Clock3,
} from "lucide-react"

const defaultNotifications = [
  {
    id: "ntf-1",
    title: "Co bao cao moi can duyet",
    description: "3 report moi duoc gui trong 10 phut qua.",
    time: "10 phut truoc",
    unread: true,
    type: "warning",
  },
  {
    id: "ntf-2",
    title: "Doanh thu premium tang",
    description: "Doanh thu hom nay tang 12.5% so voi hom qua.",
    time: "45 phut truoc",
    unread: true,
    type: "success",
  },
  {
    id: "ntf-3",
    title: "Cong thuc moi dang cho phe duyet",
    description: "Co 8 cong thuc moi can admin kiem tra.",
    time: "1 gio truoc",
    unread: false,
    type: "info",
  },
  {
    id: "ntf-4",
    title: "Canh bao dang nhap bat thuong",
    description: "Phat hien dang nhap tu thiet bi moi vao tai khoan admin.",
    time: "2 gio truoc",
    unread: false,
    type: "danger",
  },
]

const typeMap = {
  warning: {
    icon: ShieldAlert,
    className: "warning",
  },
  success: {
    icon: BadgeDollarSign,
    className: "success",
  },
  info: {
    icon: MessageSquare,
    className: "info",
  },
  danger: {
    icon: Sparkles,
    className: "danger",
  },
}

export default function NotificationDropdown({
  open,
  notifications = defaultNotifications,
  onClose,
  onViewAll,
  onMarkAllRead,
  onItemClick,
}) {
  if (!open) return null

  const unreadCount = notifications.filter((item) => item.unread).length

  return (
    <div className="notification-dropdown" role="dialog" aria-label="Thong bao he thong">
      <div className="notification-head">
        <div>
          <h3>Thong bao</h3>
          <p>{unreadCount} muc chua doc</p>
        </div>

        <button type="button" className="notification-head-action" onClick={onMarkAllRead}>
          <CheckCheck size={16} />
          Danh dau da doc
        </button>
      </div>

      <div className="notification-list">
        {notifications.map((item) => {
          const metadata = typeMap[item.type] || typeMap.info
          const Icon = metadata.icon

          return (
            <article
              className={`notification-item ${item.unread ? "unread" : ""}`}
              key={item.id}
              onClick={() => onItemClick && onItemClick(item.id)}
            >
              <div className={`notification-icon ${metadata.className}`}>
                <Icon size={16} />
              </div>

              <div className="notification-content">
                <p className="notification-title">
                  {item.title}
                  {item.unread && <Circle size={8} fill="currentColor" />}
                </p>
                <p className="notification-description">{item.description}</p>
                <p className="notification-time">
                  <Clock3 size={12} />
                  {item.time}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      <button type="button" className="notification-footer-btn" onClick={onViewAll}>
        <Bell size={15} />
        Xem tat ca thong bao
      </button>
    </div>
  )
}
