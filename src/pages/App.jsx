import React, { useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { AuthProvider, useAuth } from '../context/AuthContext'

// Styles

// Components
import Dashboard from "./dashboard/Dashboard"
import Users from "./users/Users"
import AdminUsers from "./users/AdminUsers"
import Roles from "./users/Roles"
import Categories from "./categories/Categories"
import CategoryDetail from "./categories/CategoryDetail"
import Recipes from "./recipes/Recipes"
import Banners from "./banners/Banners"
import Posts from "./posts/Posts"
import Reports from "./reports/Reports"
import ModerationQueue from "./moderation/Queue"
import Notifications from "./notifications/Notifications"
import Compose from "./notifications/Compose"
import Campaigns from "./notifications/Campaigns"
import CampaignDetail from "./notifications/CampaignDetail"
import Audits from "./audits/Audits"
import PaymentMethods from "./payment-methods/PaymentMethods"
import Payments from "./payments/Payments"
import Profile from "./profile/Profile"
import Settings from "./settings/Settings"
import Login from "./auth/Login"
import Header from "../components/Header"
import Sidebar from "../components/SideBar"
import { ProtectedRoute, PublicRoute } from "../components/ProtectedRoute"

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // 1. THĂM STATE QUáº¢N LĂ MENU MOBILE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="electro-layout">
      {/* 2. TRUYá»€N STATE VĂ€O SIDEBAR */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      <div className="electro-main">
        {/* 3. TRUYỀN HÀM TOGGLE VÀO HEADER */}
        <Header
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onLogout={() => {
            logout()
            navigate("/login")
          }}
        />

        {/* Nội dung chính */}
        <main className="electro-content">
          {children}
        </main>
      </div>
    </div>
  )
}

const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/users" element={<ProtectedLayout><Users /></ProtectedLayout>} />
        <Route path="/users/admin" element={<ProtectedLayout><AdminUsers /></ProtectedLayout>} />
        <Route path="/users/roles" element={<ProtectedLayout><Roles /></ProtectedLayout>} />
        <Route path="/categories" element={<ProtectedLayout><Categories /></ProtectedLayout>} />
        <Route path="/categories/:id" element={<ProtectedLayout><CategoryDetail /></ProtectedLayout>} />
        <Route path="/recipes" element={<ProtectedLayout><Recipes /></ProtectedLayout>} />
        <Route path="/banners" element={<ProtectedLayout><Banners /></ProtectedLayout>} />
        <Route path="/posts" element={<ProtectedLayout><Posts /></ProtectedLayout>} />
        <Route path="/moderation" element={<ProtectedLayout><ModerationQueue /></ProtectedLayout>} />
        <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
        <Route path="/reports/:section" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
        <Route path="/audits" element={<ProtectedLayout><Audits /></ProtectedLayout>} />
        <Route path="/notifications" element={<ProtectedLayout><Notifications /></ProtectedLayout>} />
        <Route path="/notifications/compose" element={<ProtectedLayout><Compose /></ProtectedLayout>} />
        <Route path="/notifications/campaigns" element={<ProtectedLayout><Campaigns /></ProtectedLayout>} />
        <Route path="/notifications/campaigns/:id" element={<ProtectedLayout><CampaignDetail /></ProtectedLayout>} />
        <Route path="/payment-methods" element={<ProtectedLayout><PaymentMethods /></ProtectedLayout>} />
        <Route path="/payments" element={<ProtectedLayout><Payments /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      </Routes>
    </AuthProvider>
  )
}


