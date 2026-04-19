import React, { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard, Users, Utensils, FolderOpen,
  Image as ImageIcon, FileText, CreditCard,
  ChevronLeft, ChevronRight, Coffee, X, BarChart3, Bell, Settings,
  DollarSign, ShieldAlert, LifeBuoy, ChevronDown
} from "lucide-react"

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const shouldCollapse = collapsed && !isMobileOpen

  const [expandedMenus, setExpandedMenus] = useState(() => {
    try {
      const stored = localStorage.getItem("admin_sidebar_expanded")
      return stored ? JSON.parse(stored) : {}
    } catch (e) {
      return {}
    }
  })

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
        {
          path: "/reports",
          label: "Bao cao",
          icon: BarChart3,
          children: [
            { path: "/reports/revenue", label: "Doanh thu", icon: DollarSign },
            { path: "/reports/user-reports", label: "Bao cao nguoi dung", icon: ShieldAlert },
            { path: "/reports/support", label: "Ho tro", icon: LifeBuoy },
          ],
        },
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

  // Sync expanded state with current route
  useEffect(() => {
    const newExpanded = { ...expandedMenus }
    let changed = false
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.children) {
          const isChildActive = item.children.some(child => location.pathname.startsWith(child.path))
          if (isChildActive && !newExpanded[item.path]) {
            newExpanded[item.path] = true
            changed = true
          }
        }
      })
    })
    if (changed) {
      setExpandedMenus(newExpanded)
    }
  }, [location.pathname])

  // Save expanded state
  useEffect(() => {
    try {
      localStorage.setItem("admin_sidebar_expanded", JSON.stringify(expandedMenus))
    } catch (e) { }
  }, [expandedMenus])

  const toggleMenu = (path, e) => {
    if (shouldCollapse) return // Don't toggle when collapsed side-wise
    
    // If it's a link click and we have children, we might want to just toggle or navigate
    // Here we'll toggle
    setExpandedMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

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
                const hasChildren = Array.isArray(item.children) && item.children.length > 0
                const isExpanded = expandedMenus[item.path]
                const childActive = hasChildren ? item.children.some((child) => isActive(child.path)) : false
                const rootActive = active || childActive

                return (
                  <div key={item.path} className={`sidebar-item-wrap ${isExpanded ? "expanded" : ""}`}>
                    {hasChildren ? (
                      <div
                        className={`sidebar-item ${rootActive ? "active" : ""} ${hasChildren ? "has-children" : ""}`}
                        title={shouldCollapse ? item.label : ""}
                        onClick={(e) => toggleMenu(item.path, e)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="sidebar-icon">
                          <Icon size={20} strokeWidth={rootActive ? 2.5 : 2} />
                        </span>
                        {!shouldCollapse && (
                          <>
                            <span className="sidebar-label">{item.label}</span>
                            <span className={`menu-chevron ${isExpanded ? "rotated" : ""}`}>
                              <ChevronDown size={14} />
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        className={`sidebar-item ${rootActive ? "active" : ""}`}
                        title={shouldCollapse ? item.label : ""}
                      >
                        <span className="sidebar-icon">
                          <Icon size={20} strokeWidth={rootActive ? 2.5 : 2} />
                        </span>
                        {!shouldCollapse && (
                          <span className="sidebar-label">{item.label}</span>
                        )}
                      </Link>
                    )}

                    {!shouldCollapse && hasChildren && (
                      <div className={`sidebar-submenu ${isExpanded ? "show" : ""}`}>
                        {item.children.map((child) => {
                          const ChildIcon = child.icon
                          const childIsActive = isActive(child.path)

                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`sidebar-subitem ${childIsActive ? "active" : ""}`}
                            >
                              <ChildIcon size={14} />
                              <span>{child.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
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

