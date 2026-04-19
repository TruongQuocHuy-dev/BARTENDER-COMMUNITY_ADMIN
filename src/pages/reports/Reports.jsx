import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiFilter, FiSearch } from 'react-icons/fi';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  DollarSign,
  Flag,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../api/client';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import TableActionMenu from '../../components/TableActionMenu';
import BadgePill from '../../components/common/BadgePill';
import EmptyState from '../../components/common/EmptyState';
import FormSearchField from '../../components/common/FormSearchField';
import FormSelectField from '../../components/common/FormSelectField';

const REPORT_SECTIONS = [
  { key: 'overview', label: 'Tong quan', path: '/reports' },
  { key: 'revenue', label: 'Bao cao doanh thu', path: '/reports/revenue' },
  { key: 'user-reports', label: 'Bao cao tu nguoi dung', path: '/reports/user-reports' },
  { key: 'support', label: 'Ho tro nguoi dung', path: '/reports/support' },
];

const getCurrentSection = (pathname) => {
  if (pathname === '/reports/revenue') return 'revenue';
  if (pathname === '/reports/user-reports') return 'user-reports';
  if (pathname === '/reports/support') return 'support';
  return 'overview';
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getShortDate = (year, month, day) => `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;

// --- 1. Helper: Status Badge (Giữ nguyên) ---
const StatusBadge = ({ status }) => {
  const isPending = status === 'pending';
  const Icon = isPending ? AlertTriangle : CheckCircle;
  const label = isPending ? 'Chờ xử lý' : 'Đã xong';
  const tone = isPending ? 'warning' : 'success';

  return <BadgePill label={label} icon={Icon} tone={tone} />;
};

// --- 2. Helper: Type Badge (MỚI) ---
// Phân biệt màu sắc giữa Hỗ trợ và Báo cáo xấu
const TypeBadge = ({ type, targetType }) => {
  const isSupport = type === 'support';
  const Icon = isSupport ? Mail : Flag;

  // Text hiển thị: Nếu là support thì ghi "Hỗ trợ", nếu không thì ghi loại (Post/Comment)
  const label = isSupport ? 'Yêu cầu Hỗ trợ' : `Báo cáo: ${targetType || 'Khác'}`;
  const tone = isSupport ? 'info' : 'danger';

  return <BadgePill label={label} icon={Icon} tone={tone} />;
};

// --- 3. Modal Chi Tiết (NÂNG CẤP) ---
// Tự động render giao diện dựa trên item.type
function DetailModal({ item, onClose, onResolve, onDelete }) {
  if (!item) return null;

  const isSupport = item.type === 'support';

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={isSupport ? "Chi tiết Yêu cầu Hỗ trợ" : "Chi tiết Báo cáo Vi phạm"}
      size="medium"
      subtitle={`ID: ${item._id} • Gửi ngày: ${new Date(item.createdAt).toLocaleDateString('vi-VN')}`}
    >
      {/* Thông tin người gửi */}
      <div style={{ marginBottom: 16, padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>
          Người gửi / Báo cáo
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Họ tên:</span>
            <div style={{ fontWeight: 600 }}>{item.reporter?.fullName || 'Ẩn danh'}</div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Email:</span>
            <div style={{ fontWeight: 600 }}>{item.reporter?.email || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Grid trạng thái */}
      <div className="modal-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label className="modal-field-label">Loại phiếu</label>
          <div style={{ marginTop: 4 }}><TypeBadge type={item.type} targetType={item.targetType} /></div>
        </div>
        <div>
          <label className="modal-field-label">Trạng thái</label>
          <div style={{ marginTop: 4 }}><StatusBadge status={item.status} /></div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH (Thay đổi theo loại) */}

      {/* 1. Nếu là Support: Hiện Tiêu đề */}
      {isSupport && (
        <div className="modal-form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Tiêu đề</label>
          <div className="detail-box" style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 10, fontWeight: 700 }}>
            {item.title}
          </div>
        </div>
      )}

      {/* 2. Nội dung / Lý do */}
      <div className="modal-form-group">
        <label className="form-label" style={{ fontWeight: 600 }}>
          {isSupport ? "Nội dung tin nhắn" : "Lý do báo cáo"}
        </label>
        <div className="detail-box" style={{ background: '#f3f4f6', padding: 12, borderRadius: 6, minHeight: 60, whiteSpace: 'pre-wrap' }}>
          {item.reason}
        </div>
      </div>

      {/* 3. Nếu là Vi phạm: Hiện chi tiết bổ sung (nếu có) */}
      {!isSupport && item.details && (
        <div className="modal-form-group">
          <label className="form-label">Chi tiết bổ sung</label>
          <div className="detail-box" style={{ background: '#fff', border: '1px solid #eee', padding: 8, fontSize: 13 }}>
            {item.details}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="modal-footer" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {item.status === 'pending' && (
          <button
            onClick={() => { onResolve(item._id); onClose(); }}
            style={{
              backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <CheckCircle size={16} /> Đánh dấu Đã xử lý
          </button>
        )}
        <button
          onClick={() => { onDelete(item._id); onClose(); }}
          style={{
            backgroundColor: '#fff', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600
          }}
        >
          Xóa phiếu
        </button>
      </div>
    </Modal>
  );
}

function SectionTabs({ section }) {
  return (
    <div className="report-section-tabs">
      {REPORT_SECTIONS.map((tab) => (
        <Link
          key={tab.key}
          to={tab.path}
          className={`report-section-tab ${section === tab.key ? 'active' : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function SummaryCard({ icon: Icon, title, value, note, tone = 'violet' }) {
  return (
    <article className={`report-summary-card tone-${tone}`}>
      <div className="summary-card-head">
        <div className="summary-card-icon">
          <Icon size={16} />
        </div>
        <span>{title}</span>
      </div>
      <h3>{value}</h3>
      <p>{note}</p>
    </article>
  );
}

function renderSectionInsights({ section, overview, revenueStats, items }) {
  const counts = overview?.counts || {};
  const queueHealth = overview?.queueHealth || {};
  const pendingCount = counts.pending || 0;
  const resolvedCount = counts.resolved || 0;
  const supportCount = counts.support || 0;
  const violationCount = counts.violation || 0;

  const dailyData = (overview?.recent7Days || []).map((row) => ({
    label: getShortDate(row.year, row.month, row.day),
    value: row.count,
  }));

  if (section === 'revenue') {
    const monthlyRevenue = (revenueStats?.monthlyRevenue || []).slice(-8).map((row) => ({
      label: `${String(row.month).padStart(2, '0')}/${row.year}`,
      value: row.total,
    }));

    return (
      <section className="report-insights-grid two-col">
        <SummaryCard
          icon={DollarSign}
          title="Tong doanh thu"
          value={formatCurrency(revenueStats?.totalRevenue || 0)}
          note="Tong doanh thu tu cac giao dich completed"
          tone="orange"
        />
        <SummaryCard
          icon={ArrowUpRight}
          title="Xu huong"
          value={`${monthlyRevenue.length} thang du lieu`}
          note="Theo doi bien dong theo tung thang"
          tone="blue"
        />

        <div className="report-chart-card span-2">
          <div className="report-chart-head">
            <h3>Doanh thu theo thang</h3>
            <span>8 thang gan nhat</span>
          </div>
          <div className="report-chart-wrap">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="reportRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000000)}M`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="value" stroke="#ea580c" fill="url(#reportRevenueGradient)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    );
  }

  if (section === 'support') {
    return (
      <section className="report-insights-grid three-col">
        <SummaryCard
          icon={Mail}
          title="Tong yeu cau ho tro"
          value={supportCount}
          note="Tong so phieu support da tiep nhan"
          tone="blue"
        />
        <SummaryCard
          icon={AlertTriangle}
          title="Support cho xu ly"
          value={pendingCount}
          note="Can phan bo nguoi phu trach xu ly"
          tone="amber"
        />
        <SummaryCard
          icon={CheckCircle}
          title="Da dong"
          value={resolvedCount}
          note={`Ty le giai quyet ${queueHealth.resolvedRatio || 0}%`}
          tone="green"
        />
      </section>
    );
  }

  if (section === 'user-reports') {
    return (
      <section className="report-insights-grid two-col">
        <SummaryCard
          icon={ShieldAlert}
          title="Bao cao vi pham"
          value={violationCount}
          note="Tong so bao cao post/comment"
          tone="red"
        />
        <SummaryCard
          icon={AlertTriangle}
          title="Dang cho kiem duyet"
          value={pendingCount}
          note={`Ton dong ${queueHealth.pendingRatio || 0}% trong queue`}
          tone="amber"
        />

        <div className="report-list-card span-2">
          <div className="report-chart-head">
            <h3>Ly do duoc bao cao nhieu</h3>
            <span>Top 5</span>
          </div>
          {(overview?.topReasons || []).length === 0 ? (
            <p className="muted">Chua co du lieu ly do.</p>
          ) : (
            <div className="reason-list">
              {(overview?.topReasons || []).map((reason, idx) => (
                <div key={`${reason.reason}-${idx}`} className="reason-row">
                  <span>{reason.reason}</span>
                  <strong>{reason.count}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="report-insights-grid three-col">
      <SummaryCard
        icon={BarChart3}
        title="Tong phieu"
        value={counts.total || 0}
        note="Bao gom support va vi pham"
      />
      <SummaryCard
        icon={AlertTriangle}
        title="Can xu ly"
        value={pendingCount}
        note={`Dang ton ${queueHealth.pendingRatio || 0}%`}
        tone="amber"
      />
      <SummaryCard
        icon={DollarSign}
        title="Doanh thu premium"
        value={formatCurrency(overview?.revenue?.totalRevenue || 0)}
        note="Thong ke nhanh trong cung module"
        tone="orange"
      />

      <div className="report-chart-card span-3">
        <div className="report-chart-head">
          <h3>Luong phieu 7 ngay gan nhat</h3>
          <span>Realtime overview</span>
        </div>
        <div className="report-chart-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="reportFlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" fill="url(#reportFlowGradient)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// --- 4. Main Component ---
export default function ReportsAndSupport() {
  const location = useLocation();
  const section = getCurrentSection(location.pathname);

  const [items, setItems] = useState([]);
  const [overview, setOverview] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [detail, setDetail] = useState(null);

  useEffect(() => {
    load();
    loadOverview();
    loadRevenueStats();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/reports');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      const data = await api.get('/admin/reports/overview');
      setOverview(data || null);
    } catch (e) {
      console.error(e);
      setOverview(null);
    }
  };

  const loadRevenueStats = async () => {
    try {
      const data = await api.get('/admin/stats/revenue');
      setRevenueStats(data || null);
    } catch (e) {
      console.error(e);
      setRevenueStats(null);
    }
  };

  const remove = async (id) => {
    if (!confirm('Bạn có chắc muốn XÓA phiếu này vĩnh viễn?')) return;
    try {
      await api.del('/admin/reports/' + id);
      await Promise.all([load(), loadOverview()]);
      setDetail(null);
    } catch (e) { console.error(e) }
  };

  const resolve = async (id) => {
    try {
      await api.put('/admin/reports/' + id, { status: 'resolved' });
      await Promise.all([load(), loadOverview()]);
      setDetail(null);
    } catch (e) { console.error(e) }
  };

  // Logic lọc dữ liệu
  const sectionTypeFilter = section === 'support' ? 'support' : section === 'user-reports' ? 'violation' : typeFilter;

  const filtered = useMemo(() => items.filter((r) => {
    // 1. Lọc theo text search (Tìm cả trong title, reason, tên người gửi)
    const txt = ((r.title || '') + ' ' + (r.reason || '') + ' ' + (r.reporter?.fullName || '') + ' ' + (r.reporter?.email || '')).toLowerCase();
    const matchesQuery = txt.includes(query.toLowerCase());

    // 2. Lọc theo trạng thái
    const matchesStatus = statusFilter === 'all' ? true : (r.status === statusFilter);

    // 3. Lọc theo loại (Support vs Violation)
    let matchesType = true;
    if (sectionTypeFilter === 'support') matchesType = (r.type === 'support');
    if (sectionTypeFilter === 'violation') matchesType = (r.type !== 'support');

    return matchesQuery && matchesStatus && matchesType;
  }), [items, query, statusFilter, sectionTypeFilter]);

  return (
    <div className="admin-page">
      <PageHeader
        title="QUẢN LÝ BÁO CÁO & HỖ TRỢ"
        subtitle={`Hien co ${filtered.length} phieu trong muc ${REPORT_SECTIONS.find((it) => it.key === section)?.label || 'Tong quan'}`}
        icon={<BarChart3 size={26} />}
      />

      <SectionTabs section={section} />
      {renderSectionInsights({ section, overview, revenueStats, items })}

      {/* --- THANH CÔNG CỤ (Search & Filter) --- */}
      <div className="search-filter-bar"
        style={{
          display: 'flex',
          width: '100%',       // Đảm bảo chiếm hết chiều ngang
          gap: 12,             // Khoảng cách giữa các ô
          alignItems: 'center' // Căn giữa theo chiều dọc
        }}>

        {/* 1. Search Box (Chiếm 3 phần - Rộng nhất) */}
        <div style={{ position: 'relative', flex: 3, minWidth: 0 }}>
          <FormSearchField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm nội dung, tiêu đề, email..."
            icon={FiSearch}
          />
        </div>

        {/* 2. Filter Type (Chiếm 1 phần) */}
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <FormSelectField
            value={sectionTypeFilter === 'support' || sectionTypeFilter === 'violation' ? sectionTypeFilter : typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            icon={FiFilter}
            options={
              section === 'support' || section === 'user-reports'
                ? [
                    {
                      value: section === 'support' ? 'support' : 'violation',
                      label: section === 'support' ? 'Dang xem: Ho tro' : 'Dang xem: Bao cao nguoi dung',
                    },
                  ]
                : [
                    { value: 'all', label: 'Tat ca loai phieu' },
                    { value: 'support', label: 'Chi Ho tro' },
                    { value: 'violation', label: 'Chi Bao cao xau' },
                  ]
            }
          />
        </div>

        {/* 3. Filter Status (Chiếm 1 phần) */}
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <FormSelectField
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            icon={CheckCircle}
            options={[
              { value: 'all', label: 'Mọi trạng thái' },
              { value: 'pending', label: 'Chờ xử lý' },
              { value: 'resolved', label: 'Đã xử lý' },
            ]}
          />
        </div>
      </div>

      {/* --- TABLE HIỂN THỊ --- */}
      <div className="table-section">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📭" message="Không tìm thấy phiếu nào khớp với bộ lọc." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table reports-table">
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ ...tableHeaderStyle, width: '12%' }}>Loại phiếu</th>
                  <th style={{ ...tableHeaderStyle, width: '30%' }}>Nội dung / Tiêu đề</th>
                  <th style={{ ...tableHeaderStyle, width: '20%' }}>Người gửi</th>
                  <th style={{ ...tableHeaderStyle, width: '15%' }}>Ngày gửi</th>
                  <th style={{ ...tableHeaderStyle, width: '13%' }}>Trạng thái</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'center', width: '10%' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }} className="hover:bg-gray-50">

                    {/* Cột 1: Loại */}
                    <td style={tableCellStyle}>
                      <TypeBadge type={r.type} targetType={r.targetType} />
                    </td>

                    {/* Cột 2: Nội dung (Thông minh) */}
                    <td style={{ ...tableCellStyle, maxWidth: 350 }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Nếu là Support -> Hiện Title đậm. Nếu là Report -> Không có title */}
                        {r.type === 'support' && (
                          <span style={{ fontWeight: 700, color: '#1f2937', marginBottom: 2 }}>{r.title}</span>
                        )}
                        <span style={{
                          color: r.type === 'support' ? '#4b5563' : '#1f2937',
                          fontSize: r.type === 'support' ? 13 : 14,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {r.reason}
                        </span>
                      </div>
                    </td>

                    {/* Cột 3: Người gửi */}
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: 500, color: '#374151' }}>{r.reporter?.fullName || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{r.reporter?.email}</div>
                    </td>

                    {/* Cột 4: Ngày gửi */}
                    <td style={tableCellStyle}>
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    {/* Cột 5: Trạng thái */}
                    <td style={tableCellStyle}>
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Cột 6: Hành động */}
                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                      <TableActionMenu
                        onView={() => setDetail(r)}
                        onDelete={() => remove(r._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DetailModal
        item={detail}
        onClose={() => setDetail(null)}
        onResolve={resolve}
        onDelete={remove}
      />
    </div>
  );
}

// --- Styles (Giữ nguyên hoặc tinh chỉnh nhẹ) ---
const tableHeaderStyle = { padding: '16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' };
const tableCellStyle = { padding: '16px', fontSize: 14, verticalAlign: 'middle', color: '#374151' };