import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LogOut, User, ChevronDown, Menu, Bell, Settings
} from "lucide-react"

export default function Header({ user, onLogout, onToggleMobileMenu }) {
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false)
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
        <button className="action-btn notification-btn" aria-label="Thong bao">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>

        <div className="user-menu-container" ref={dropdownRef}>
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
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
