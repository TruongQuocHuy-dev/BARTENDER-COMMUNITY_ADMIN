import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LogOut, User, ChevronDown, Menu, Bell, Settings, X
} from "lucide-react"
import NotificationDropdown from "./common/NotificationDropdown"
import api from "../api/client"

const activityTypeMap = {
  new_follower: {
    title: "Có người theo dõi mới",
    type: "info",
  },
  new_like: {
    title: "Nội dung vừa được thích",
    type: "success",
  },
  new_comment: {
    title: "Có bình luận mới",
    type: "warning",
  },
  new_recipe: {
    title: "Có công thức mới",
    type: "info",
  },
  new_post: {
    title: "Có bài viết mới",
    type: "info",
  },
}

export default function Header({ user, onLogout, onToggleMobileMenu, isMobileMenuOpen = false }) {
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotificationMenu, setShowNotificationMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const userDropdownRef = useRef(null)
  const notificationDropdownRef = useRef(null)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true)
      const response = await api.get("/activities")
      const items = Array.isArray(response?.activities)
        ? response.activities
        : Array.isArray(response)
          ? response
          : []

      const mapped = items.map((activity) => {
        const config = activityTypeMap[activity.type] || { title: "Thông báo hệ thống", type: "info" }
        const actorName = activity.actor?.fullName || activity.actor?.username || "Hệ thống"

        return {
          id: activity._id,
          title: config.title,
          description: activity.message || `${actorName} đã tạo một thông báo mới.`,
          time: activity.createdAt ? new Date(activity.createdAt).toLocaleString("vi-VN") : "Vừa xong",
          unread: !activity.read,
          type: config.type,
        }
      })

      setNotifications(mapped)
    } catch (error) {
      console.error(error)
      setNotifications([])
    } finally {
      setNotificationsLoading(false)
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }

      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotificationMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const getInitials = (name) => {
    if (!name) return "A"
    return name.charAt(0).toUpperCase()
  }

  const unreadCount = notifications.filter((item) => item.unread).length

  const handleMarkAllRead = async () => {
    try {
      await api.post("/activities/mark-read", {})
      setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
    } catch (error) {
      console.error(error)
    }
  }

  const handleReadSingle = async (id) => {
    try {
      await api.patch(`/activities/${id}/read`)
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleViewAllNotifications = () => {
    setShowNotificationMenu(false)
    navigate("/notifications")
  }

  return (
    <header className="electro-header">
      <div className="header-left">
        <button
          className={`action-btn mobile-menu-btn ${isMobileMenuOpen ? "menu-open" : ""}`}
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Dong menu" : "Mo menu"}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="header-right">
        <div className="notification-menu-container" ref={notificationDropdownRef}>
          <button
            className={`action-btn notification-btn ${showNotificationMenu ? "active" : ""}`}
            aria-label="Thong bao"
            aria-expanded={showNotificationMenu}
            onClick={() => {
              if (notificationsLoading) return
              setShowNotificationMenu(!showNotificationMenu)
              setShowUserMenu(false)
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          <NotificationDropdown
            open={showNotificationMenu}
            notifications={notifications}
            onClose={() => setShowNotificationMenu(false)}
            onMarkAllRead={handleMarkAllRead}
            onItemClick={handleReadSingle}
            onViewAll={handleViewAllNotifications}
          />
        </div>

        <div className="user-menu-container" ref={userDropdownRef}>
          <button
            className="user-button"
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotificationMenu(false)
            }}
          >
            <div className="user-info">
              <span className="user-name">{user?.fullName || "Admin"}</span>
              <span className="user-role">{user?.role || "Administrator"}</span>
            </div>

            <div className="user-avatar-circle">
              {getInitials(user?.fullName)}
            </div>

            <ChevronDown size={16} className={`chevron-icon ${showUserMenu ? 'rotated' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div
                className="dropdown-item"
                onClick={() => {
                  navigate("/profile")
                  setShowUserMenu(false)
                }}
              >
                <User size={16} /> Hồ sơ cá nhân
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  navigate("/settings")
                  setShowUserMenu(false)
                }}
              >
                <Settings size={16} /> Cài đặt
              </div>

              <div className="dropdown-divider"></div>

              <div
                className="dropdown-item danger"
                onClick={(e) => {
                  e.preventDefault()
                  onLogout()
                }}
              >
                <LogOut size={16} />Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
