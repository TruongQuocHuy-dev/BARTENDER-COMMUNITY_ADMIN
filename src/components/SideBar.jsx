import React, { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard, Users, Utensils, FolderOpen,
  Image as ImageIcon, FileText, AlertCircle, CreditCard,
  ChevronLeft, ChevronRight, Coffee, X, BarChart3, Bell, Settings
} from "lucide-react"

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const shouldCollapse = collapsed && !isMobileOpen

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_sidebar_collapsed")
      if (stored !== null) setCollapsed(stored === "true")
    } catch (e) { }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("admin_sidebar_collapsed", collapsed ? "true" : "false")
    } catch (e) { }
  }, [collapsed])

  useEffect(() => {
    if (window.innerWidth <= 768 && setIsMobileOpen) {
      setIsMobileOpen(false)
    }
  }, [location.pathname, setIsMobileOpen])

  const menuGroups = [
    {
      title: "Tong quan",
      items: [
        { path: "/", label: "Bang dieu khien", icon: LayoutDashboard },
        { path: "/reports", label: "Bao cao", icon: BarChart3 },
      ],
    },
    {
      title: "Quan ly noi dung",
      items: [
        { path: "/recipes", label: "Cong thuc", icon: Utensils },
        { path: "/categories", label: "Danh muc", icon: FolderOpen },
        { path: "/posts", label: "Bai viet", icon: FileText },
        { path: "/banners", label: "Quang cao", icon: ImageIcon },
      ],
    },
    {
      title: "Nguoi dung & He thong",
      items: [
        { path: "/users", label: "Nguoi dung", icon: Users },
        { path: "/notifications", label: "Thong bao", icon: Bell },
        { path: "/settings", label: "Cai dat", icon: Settings },
        { path: "/payment-methods", label: "Goi thanh toan", icon: CreditCard },
      ],
    },
  ]

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${isMobileOpen ? "show" : ""}`}
        onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
      ></div>

      <aside className={`electro-sidebar ${shouldCollapse ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          {!shouldCollapse && (
            <Link to="/" className="brand-logo">
              <div className="logo-icon">
                <Coffee size={20} strokeWidth={2.0} />
              </div>
              <span>Admin</span>
            </Link>
          )}

          <button
            className="toggle-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            aria-label="Dong menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="menu-group">
              {!shouldCollapse && (
                <div className="sidebar-group-label">
                  {group.title}
                </div>
              )}

              {group.items.map((item) => {
                const active = isActive(item.path)
                const Icon = item.icon

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-item ${active ? "active" : ""}`}
                    title={shouldCollapse ? item.label : ""}
                  >
                    <span className="sidebar-icon">
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    </span>
                    {!shouldCollapse && (
                      <span className="sidebar-label">{item.label}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {!shouldCollapse && (
          <div className="sidebar-footer">
            <div className="version-info">
              <span>Version 1.0.0</span>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
