import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { User, Mail, Shield, Calendar, Eye, EyeOff } from 'lucide-react';
import '../../styles/components/table.css';

export default function Profile() {
    const { user } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    // Format date if available
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    const getInitials = (name) => {
        if (!name) return 'A';
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <PageHeader
                title="HỒ SƠ CÁ NHÂN"
                subtitle="Thông tin tài khoản quản trị viên"
            />

            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Profile Card */}
                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb'
                }}>
                    {/* Header Section with Avatar */}
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '40px 32px',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: 'white',
                            margin: '0 auto 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 48,
                            fontWeight: 700,
                            color: '#667eea',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                        }}>
                            {getInitials(user?.fullName)}
                        </div>
                        <h2 style={{
                            color: 'white',
                            fontSize: 28,
                            fontWeight: 700,
                            marginBottom: 8
                        }}>
                            {user?.fullName || 'Admin User'}
                        </h2>
                        <p style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: 16,
                            fontWeight: 500
                        }}>
                            {user?.role === 'admin' ? 'Quản trị viên' : user?.role || 'Administrator'}
                        </p>
                    </div>

                    {/* Information Grid */}
                    <div style={{ padding: 32 }}>
                        <h3 style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#1f2937',
                            marginBottom: 24,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <User size={20} />
                            Thông tin cá nhân
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 20
                        }}>
                            {/* Full Name */}
                            <div className="profile-field">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#6b7280',
                                    marginBottom: 8,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    <User size={16} />
                                    Họ và tên
                                </label>
                                <div style={{
                                    padding: '12px 16px',
                                    background: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    fontSize: 15,
                                    fontWeight: 500,
                                    color: '#1f2937'
                                }}>
                                    {user?.fullName || 'N/A'}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="profile-field">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#6b7280',
                                    marginBottom: 8,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    <Mail size={16} />
                                    Email
                                </label>
                                <div style={{
                                    padding: '12px 16px',
                                    background: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    fontSize: 15,
                                    fontWeight: 500,
                                    color: '#1f2937'
                                }}>
                                    {user?.email || 'N/A'}
                                </div>
                            </div>

                            {/* Role */}
                            <div className="profile-field">
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#6b7280',
                                    marginBottom: 8,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    <Shield size={16} />
                                    Vai trò
                                </label>
                                <div style={{
                                    padding: '12px 16px',
                                    background: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    fontSize: 15,
                                    fontWeight: 500,
                                    color: '#1f2937'
                                }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '4px 12px',
                                        background: '#dbeafe',
                                        color: '#1e40af',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontWeight: 600
                                    }}>
                                        <Shield size={14} />
                                        {user?.role === 'admin' ? 'Quản trị viên' : user?.role || 'Administrator'}
                                    </span>
                                </div>
                            </div>

                            {/* Created At */}
                            {user?.createdAt && (
                                <div className="profile-field">
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#6b7280',
                                        marginBottom: 8,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        <Calendar size={16} />
                                        Ngày tạo tài khoản
                                    </label>
                                    <div style={{
                                        padding: '12px 16px',
                                        background: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8,
                                        fontSize: 15,
                                        fontWeight: 500,
                                        color: '#1f2937'
                                    }}>
                                        {formatDate(user.createdAt)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
