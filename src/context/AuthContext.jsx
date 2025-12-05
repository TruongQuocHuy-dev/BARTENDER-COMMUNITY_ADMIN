import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing auth on mount
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('admin_token');
        // SỬA 1: Đọc từ 'admin_user'
        const savedUser = JSON.parse(localStorage.getItem('admin_user'));

        if (token && savedUser) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // SỬA 2: Xóa 'admin_token' (thay vì 'token')
        localStorage.removeItem('admin_token');
        // SỬA 3: Xóa 'admin_user'
        localStorage.removeItem('admin_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('admin_token', token);
    // SỬA 4: Lưu vào 'admin_user'
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    // SỬA 5: Xóa 'admin_user'
    localStorage.removeItem('admin_user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};