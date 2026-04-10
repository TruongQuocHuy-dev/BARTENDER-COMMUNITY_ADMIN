import React, { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard, Users, Utensils, FolderOpen,
  Image as ImageIcon, FileText, AlertCircle, CreditCard,
  ChevronLeft, ChevronRight, Coffee, X
} from "lucide-react"

// 1. NHẬN PROPS TỪ LAYOUT Ở ĐÂY
export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const shouldCollapse = collapsed && !isMobileOpen

  // Load trạng thái collapsed từ localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_sidebar_collapsed")
      if (stored !== null) setCollapsed(stored === "true")
    } catch (e) { }
  }, [])

  // Lưu trạng thái collapsed
  useEffect(() => {
    try {
      localStorage.setItem("admin_sidebar_collapsed", collapsed ? "true" : "false")
    } catch (e) { }
  }, [collapsed])

  // Tự động đóng sidebar trên mobile khi chuyển trang
  useEffect(() => {
    // Kiểm tra window và hàm setIsMobileOpen có tồn tại không trước khi gọi
    if (window.innerWidth <= 768 && setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, setIsMobileOpen]);

  // Cấu trúc menu phân nhóm
  const menuGroups = [
    {
      title: "Tổng quan",
      items: [
        { path: "/", label: "Bảng điều khiển", icon: LayoutDashboard },
      ],
    },
    {
      title: "Quản lý nội dung",
      items: [
        { path: "/recipes", label: "Công thức", icon: Utensils },
        { path: "/categories", label: "Danh mục", icon: FolderOpen },
        { path: "/posts", label: "Bài viết", icon: FileText },
        { path: "/banners", label: "Quảng cáo", icon: ImageIcon },
      ],
    },
    {
      title: "Người dùng & Hệ thống",
      items: [
        { path: "/users", label: "Người dùng", icon: Users },
        { path: "/reports", label: "Báo cáo & Hỗ trợ", icon: AlertCircle },
        { path: "/payment-methods", label: "Gói thanh toán", icon: CreditCard },
      ],
    },
  ]

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  }

  return (
    <>
      {/* Overlay: Lớp phủ mờ khi mở menu mobile */}
      <div
        className={`sidebar-overlay ${isMobileOpen ? "show" : ""}`}
        onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
      ></div>

      <aside className={`electro-sidebar ${shouldCollapse ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}>
        {/* Header Logo */}
        <div className="sidebar-header">
          {!shouldCollapse && (
            <Link to="/" className="brand-logo">
              <div className="logo-icon">
                <Coffee size={20} strokeWidth={2.0} />
              </div>
              <span>Admin</span>
            </Link>
          )}

          {/* Nút thu gọn cho Desktop */}
          <button
            className="toggle-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            aria-label="Dong menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="menu-group">
              <div className="sidebar-group-label">
                {group.title}
              </div>

              {group.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;

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
                    <span className="sidebar-label">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}