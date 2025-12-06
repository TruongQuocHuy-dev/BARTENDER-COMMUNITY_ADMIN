import React, { useEffect, useState, useMemo } from 'react'
import api from '../../api/client'
import {
    Loader2, Users, Utensils, Image as ImageIcon,
    AlertCircle, MoreHorizontal, ArrowRight, CheckCircle
} from 'lucide-react'
import {
    ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts'
import '../../styles/dashboard.css'

// --- CÁC HÀM TIỆN ÍCH (HELPER) ---

// Format tiền tệ cho Tooltip và các thẻ hiển thị (VD: 1.000.000 ₫)
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Format trục Y của biểu đồ cho gọn (VD: 1.5tr, 500k)
const formatYAxis = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value;
};

// --- CÁC COMPONENT CON ---

// Component thẻ thống kê nhỏ (Mini Card)
// Component thẻ nhỏ (Users, Recipes, Banners, Pending) - Layout Ngang
const MiniStatCard = ({ label, value, icon: Icon, bgClass, iconColorClass }) => (
    <div className="mini-stat-card">
        {/* Bên trái: Thông tin Text */}
        <div className="mini-stat-info">
            <span className="mini-stat-label">{label}</span>
            <span className="mini-stat-value">{value}</span>
        </div>

        {/* Bên phải: Icon khối vuông bo góc */}
        <div className={`mini-stat-icon ${bgClass}`}>
            <Icon size={24} style={{ color: iconColorClass }} strokeWidth={2} />
        </div>
    </div>
);

// Component Tooltip tùy chỉnh cho biểu đồ Area
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#fff', padding: '10px 15px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', border: 'none' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#374151' }}>{label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8b5cf6', fontWeight: 600 }}>
                    {formatCurrency(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

// --- COMPONENT CHÍNH ---

export default function Dashboard() {
    // 1. State quản lý dữ liệu và trạng thái
    const [stats, setStats] = useState(null)     // Thống kê chung (Users, Reports...)
    const [revenue, setRevenue] = useState(null) // Dữ liệu biểu đồ doanh thu
    const [loading, setLoading] = useState(true) // Trạng thái loading tổng

    // State quản lý năm đang chọn (Mặc định là năm hiện tại)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [error, setError] = useState(null)

    // 2. useEffect: Gọi API

    // a. Load thống kê chung (Chỉ chạy 1 lần khi trang load)
    useEffect(() => {
        loadGeneralStats()
    }, [])

    // b. Load doanh thu (Chạy lại mỗi khi người dùng đổi selectedYear)
    useEffect(() => {
        loadRevenueStats()
    }, [selectedYear])

    // Hàm gọi API thống kê chung
    const loadGeneralStats = async () => {
        try {
            const statsData = await api.get('/admin/stats');
            setStats(statsData);
        } catch (e) {
            console.error(e);
            setError('Không thể tải thống kê chung.');
        }
    }

    // Hàm gọi API doanh thu theo năm
    const loadRevenueStats = async () => {
        try {
            // Nếu chưa có stats (lần đầu vào), set loading true. 
            // Nếu đã có stats (chỉ đổi năm), có thể không cần set loading toàn trang để tránh nháy.
            if (!stats) setLoading(true);

            // Gửi params year lên server (Server cần xử lý req.query.year)
            const revenueData = await api.get('/admin/stats/revenue', {
                params: { year: selectedYear }
            });
            setRevenue(revenueData);
        } catch (e) {
            console.error(e);
            setError('Không thể tải dữ liệu doanh thu.');
        } finally {
            setLoading(false);
        }
    }

    // 3. Xử lý dữ liệu (useMemo)

    // Data cho biểu đồ đường (Doanh thu)
    const chartData = useMemo(() => {
        if (!revenue?.monthlyRevenue) return []
        return revenue.monthlyRevenue.map(m => ({
            name: `Tháng ${m.month}`,
            total: Number(m.total) || 0, // Ép kiểu số để tránh lỗi biểu đồ
        }))
    }, [revenue])

    // Data cho biểu đồ tròn (Trạng thái Báo cáo)
    const pieData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: 'Đã giải quyết', value: stats.counts.reportsResolved || 0 },
            { name: 'Chờ xử lý', value: stats.counts.reportsPending || 0 },
        ];
    }, [stats]);

    const PIE_COLORS = ['#4f46e5', '#e5e7eb']; // Purple & Gray

    // Tạo danh sách năm cho Dropdown (Ví dụ: Năm hiện tại và 2 năm trước)
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    // 4. Render giao diện

    if (loading && !stats) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            <Loader2 className="animate-spin" size={32} color="#8b5cf6" />
        </div>
    )

    if (error) return <div className="p-6 text-red-500">{error}</div>

    // Lấy dữ liệu an toàn để tránh lỗi crash nếu stats null
    const counts = stats?.counts || { userCount: 0, recipeCount: 0, bannerCount: 0, reportsPending: 0, totalRevenue: 0 };
    const recent = stats?.recent || { recentUsers: [] };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-title-section">
                <h1>BẢNG ĐIỀU KHIỂN</h1>
                <p>Tổng quan số liệu ngày {new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            {/* --- KHU VỰC 1: MINI STATS (Nằm trên cùng) --- */}
            <div className="mini-stats-grid">
                <MiniStatCard label="Người dùng" value={counts.userCount} icon={Users} bgClass="bg-red-pastel" iconColorClass="#fa5a7d" />
                <MiniStatCard label="Công thức" value={counts.recipeCount} icon={Utensils} bgClass="bg-blue-pastel" iconColorClass="#009dc7" />
                <MiniStatCard label="Quảng cáo" value={counts.bannerCount} icon={ImageIcon} bgClass="bg-yellow-pastel" iconColorClass="#ff947a" />
                <MiniStatCard label="Chờ xử lý" value={counts.reportsPending} icon={AlertCircle} bgClass="bg-purple-pastel" iconColorClass="#bf83ff" />
            </div>

            {/* --- KHU VỰC 2: GRID CHÍNH --- */}
            <div className="dashboard-grid">

                {/* --- CỘT TRÁI (Biểu đồ & List User) --- */}
                <div className="left-column">

                    {/* 1. Main Chart */}
                    <div className="main-chart-card">
                        <div className="card-header">
                            <h3>Chi tiết Doanh thu</h3>

                            {/* Dropdown chọn năm */}
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #f3f4f6', color: '#6b7280', fontSize: 13, outline: 'none', cursor: 'pointer' }}
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>Năm {y}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ height: 320, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />

                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                    />

                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        width={80} // Đặt chiều rộng cố định để không bị mất số lớn
                                        tickFormatter={formatYAxis} // Rút gọn số (k, tr)
                                    />

                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. New Users List */}
                    <div className="new-users-card">
                        <div className="card-header">
                            <h3>Người dùng mới</h3>
                            <button style={{ background: '#f9fafb', border: 'none', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>Xem tất cả</button>
                        </div>
                        <div className="user-list">
                            {recent.recentUsers.map(u => (
                                <div key={u._id} className="user-list-item">
                                    <div className="user-avatar">
                                        {u.fullName ? u.fullName.charAt(0).toUpperCase() : <Users size={20} />}
                                    </div>
                                    <div className="user-info">
                                        <h4>{u.fullName || 'Người dùng ẩn danh'}</h4>
                                        <span>{u.email}</span>
                                    </div>
                                    <button className="user-action-btn">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI (Revenue & Pie Chart) --- */}
                <div className="right-column">

                    {/* Revenue Card */}
                    <div className="revenue-card">
                        <h3>Tổng Doanh Thu</h3>
                        <div className="amount">{formatCurrency(counts.totalRevenue || 0)}</div>
                        <div className="sub-text">
                            Tổng doanh thu tích lũy từ các gói đăng ký Premium.
                            <br />
                            <a href="#" style={{ color: 'white', fontWeight: 600, marginTop: 10, display: 'inline-block', textDecoration: 'none' }}>Xem báo cáo chi tiết →</a>
                        </div>
                    </div>

                    {/* Progress Card (Pie Chart) */}
                    <div className="progress-card">
                        <div className="card-header">
                            <h3>Báo cáo đã xử lý</h3>
                            <button className="user-action-btn"><MoreHorizontal size={16} /></button>
                        </div>

                        <div className="circular-chart-wrapper">
                            <div style={{ width: 160, height: 160, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1f2937' }}>
                                        {counts.reportsResolved}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Đã xong</div>
                                </div>
                            </div>
                        </div>

                        <div className="progress-legend">
                            <div className="legend-item">
                                <span className="legend-dot" style={{ background: '#4f46e5' }}></span>
                                Đã giải quyết
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{ background: '#e5e7eb' }}></span>
                                Chờ xử lý
                            </div>
                        </div>

                        <div style={{ marginTop: 20, paddingTop: 15, borderTop: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ background: '#dcfce7', padding: 8, borderRadius: 8, color: '#16a34a' }}><CheckCircle size={18} /></div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Hệ thống ổn định</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Tất cả báo cáo đang được theo dõi</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}