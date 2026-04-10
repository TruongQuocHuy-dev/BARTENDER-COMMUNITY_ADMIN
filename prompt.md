Dưới đây là prompt chi tiết bạn có thể sử dụng:

---

**PROMPT:**

```
Tôi cần refactor UI cho trang Admin Dashboard (Bartender Admin) với các yêu cầu sau:

## 📋 HIỆN TRẠNG
- Trang admin đã có đầy đủ business logic và các luồng xử lý
- UI hiện tại đơn giản, cần cải thiện về mặt thẩm mỹ và trải nghiệm người dùng
- Các tính năng chính: Dashboard thống kê, quản lý công thức, danh mục, bài viết, quảng cáo, người dùng, báo cáo

## 🎯 MỤC TIÊU
1. **Giữ nguyên 100% business logic hiện tại** - chỉ refactor phần UI/UX
2. **Xây dựng hệ thống component tái sử dụng** theo nguyên tắc DRY
3. **Áp dụng Clean Architecture** để dễ maintain và mở rộng
4. **Nâng cao UI/UX** với design hiện đại, professional

## 🏗️ YÊU CẦU KIẾN TRÚC

### Clean Architecture Layers:
- **Domain Layer**: Entities, Use Cases (giữ nguyên logic hiện tại)
- **Data Layer**: Repositories, Data Sources (giữ nguyên)
- **Presentation Layer**: 
  - ViewModels/Controllers (giữ nguyên logic)
  - **UI Components** (refactor hoàn toàn)

### Component Structure:
```
components/
├── common/           # Reusable components
│   ├── Button/
│   ├── Card/
│   ├── Table/
│   ├── Modal/
│   ├── Input/
│   ├── Dropdown/
│   └── Loading/
├── layout/
│   ├── Sidebar/
│   ├── Header/
│   └── MainLayout/
├── dashboard/
│   ├── StatCard/
│   ├── Chart/
│   └── RevenueWidget/
└── features/
    ├── recipes/
    ├── categories/
    ├── articles/
    └── users/
```

## 🎨 YÊU CẦU UI/UX

### Design System:
- **Color Palette**: 
  - Primary: Purple/Violet (#6B4EE6 hoặc tương tự)
  - Secondary: Blue, Pink, Orange cho các widgets
  - Neutral: Gray scale cho text và backgrounds
  
- **Typography**: 
  - Font hiện đại (Inter, Poppins, hoặc SF Pro)
  - Hierarchy rõ ràng: H1, H2, H3, Body, Caption

- **Spacing**: 8px grid system (8, 16, 24, 32, 48, 64)

- **Shadows & Elevation**: 
  - Subtle shadows cho cards
  - Hover effects smooth

- **Border Radius**: 
  - Small: 8px (buttons, inputs)
  - Medium: 12px (cards)
  - Large: 16px (modals, widgets)

### Components cần thiết:

1. **Dashboard Widgets**:
   - StatCard: Icon + Title + Value + Trend indicator
   - RevenueCard: Gradient background, currency format
   - Chart Component: Responsive charts (Chart.js/Recharts)

2. **Layout Components**:
   - Sidebar: Collapsible, active state, icons
   - Header: Search, notifications, user profile dropdown
   - Breadcrumb: Navigation path

3. **Data Display**:
   - Table: Sortable, filterable, pagination
   - DataGrid: Virtual scrolling cho large datasets
   - Empty State: Illustrations + CTA

4. **Forms**:
   - Input fields với validation states
   - Select/Dropdown với search
   - Date picker
   - File upload với preview

5. **Feedback**:
   - Toast notifications
   - Loading skeletons
   - Progress bars
   - Modal/Dialog

## 💻 TECHNICAL REQUIREMENTS

### Frontend Stack (đề xuất):
- **Framework**: React/Vue.js/Angular (tùy current stack)
- **Styling**: 
  - Option 1: Tailwind CSS + Headless UI
  - Option 2: Styled Components
  - Option 3: SCSS Modules
- **Component Library** (optional): 
  - Ant Design / Material UI / Chakra UI
  - Hoặc tự build design system riêng
- **State Management**: Redux/Zustand/Context API (giữ nguyên)
- **Charts**: Recharts/Chart.js/ApexCharts
- **Icons**: Lucide React / Heroicons / Phosphor Icons

### Code Quality:
- TypeScript cho type safety
- Component props với interface rõ ràng
- Separation of concerns: Presentational vs Container components
- Custom hooks cho logic reuse
- Unit tests cho components (optional nhưng recommended)

## 📱 RESPONSIVE DESIGN
- Mobile-first approach
- Breakpoints: 
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- Sidebar collapse trên mobile
- Touch-friendly targets (min 44px)

## 🎬 ANIMATIONS & INTERACTIONS
- Smooth transitions (200-300ms)
- Hover effects trên buttons, cards
- Loading states với skeletons
- Micro-interactions cho feedback

## 📦 DELIVERABLES

1. **Design System Documentation**:
   - Color palette
   - Typography scale
   - Component library với variants
   - Spacing & layout guidelines

2. **Refactored Components**:
   - Atomic design approach (Atoms → Molecules → Organisms → Templates)
   - Storybook documentation (optional)
   - Reusable hooks

3. **Updated Pages**:
   - Dashboard với new UI
   - Tất cả các trang quản lý (CRUD)
   - Settings & Profile pages

4. **Code Standards**:
   - ESLint/Prettier config
   - Component naming conventions
   - File structure documentation

## 🔒 CONSTRAINTS
- **KHÔNG THAY ĐỔI** business logic hiện tại
- **KHÔNG THAY ĐỔI** API calls và data structures
- **GIỮ NGUYÊN** authentication/authorization flow
- **TƯƠNG THÍCH** ngược với data hiện tại
- **PERFORMANCE**: Không làm chậm ứng dụng, optimize bundle size

##  CURRENT FEATURES (cần giữ nguyên)
- Dashboard với stats: Người dùng, Công thức, Quảng cáo, Chờ xử lý
- Revenue tracking với Premium packages
- Quản lý: Công thức, Danh mục, Bài viết, Quảng cáo
- User management
- Reports & Support

## 🎨 DESIGN INSPIRATION (tham khảo)
- Modern admin dashboards: Vercel Dashboard, Linear, Notion
- Color schemes: Clean, professional, not too colorful
- Whitespace: Generous breathing room
- Data visualization: Clear, easy to scan

## ✅ ACCEPTANCE CRITERIA
- [ ] UI đẹp hơn, modern hơn
- [ ] Components reusable, không hard-code
- [ ] Code clean, dễ maintain
- [ ] Responsive trên mọi devices
- [ ] Performance tốt (Lighthouse score > 90)
- [ ] Accessibility (WCAG AA compliant)
- [ ] Dark mode support (bonus)

---

**Vui lòng cung cấp:**
1. Architecture diagram cho proposed solution
2. Component hierarchy tree
3. Code samples cho 2-3 key components
4. Implementation roadmap (prioritized tasks)
5. Estimated timeline
```
---