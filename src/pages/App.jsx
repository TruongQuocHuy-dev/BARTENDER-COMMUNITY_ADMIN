import React, { useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { AuthProvider, useAuth } from '../context/AuthContext'

// Styles

// Components
import Dashboard from "./dashboard/Dashboard"
import Users from "./users/Users"
import Categories from "./categories/Categories"
import CategoryDetail from "./categories/CategoryDetail"
import Recipes from "./recipes/Recipes"
import Banners from "./banners/Banners"
import Posts from "./posts/Posts"
import Reports from "./reports/Reports"
import PaymentMethods from "./payment-methods/PaymentMethods"
import Profile from "./profile/Profile"
import Login from "./auth/Login"
import Header from "../components/Header"
import Sidebar from "../components/SideBar"
import { ProtectedRoute, PublicRoute } from "../components/ProtectedRoute"
import { Menu } from "lucide-react" // Import icon Menu náº¿u cáº§n dĂ¹ng trá»±c tiáº¿p trong layout (option)

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
        <Route path="/categories" element={<ProtectedLayout><Categories /></ProtectedLayout>} />
        <Route path="/categories/:id" element={<ProtectedLayout><CategoryDetail /></ProtectedLayout>} />
        <Route path="/recipes" element={<ProtectedLayout><Recipes /></ProtectedLayout>} />
        <Route path="/banners" element={<ProtectedLayout><Banners /></ProtectedLayout>} />
        <Route path="/posts" element={<ProtectedLayout><Posts /></ProtectedLayout>} />
        <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
        <Route path="/payment-methods" element={<ProtectedLayout><PaymentMethods /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      </Routes>
    </AuthProvider>
  )
}


