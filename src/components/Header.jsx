import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LogOut, User, ChevronDown, Menu, Bell, Settings
} from "lucide-react"
import NotificationDropdown from "./common/NotificationDropdown"

const notificationPreview = [
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

export default function Header({ user, onLogout, onToggleMobileMenu }) {
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotificationMenu, setShowNotificationMenu] = useState(false)
  const [notifications, setNotifications] = useState(notificationPreview)
  const userDropdownRef = useRef(null)
  const notificationDropdownRef = useRef(null)

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

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
  }

  const handleReadSingle = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    )
  }

  const handleViewAllNotifications = () => {
    setShowNotificationMenu(false)
    navigate("/notifications", {
      state: {
        notifications,
      },
    })
  }

  return (
    <header className="electro-header">
      <div className="header-left">
        <button
          className="action-btn mobile-menu-btn"
          onClick={onToggleMobileMenu}
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="header-right">
        <div className="notification-menu-container" ref={notificationDropdownRef}>
          <button
            className={`action-btn notification-btn ${showNotificationMenu ? "active" : ""}`}
            aria-label="Thong bao"
            aria-expanded={showNotificationMenu}
            onClick={() => {
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
