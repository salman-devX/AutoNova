# AutoNova — Car Service Center Management System (Frontend · Phase 1)

Premium, dark-glassmorphism frontend for a multi-role car service center management platform.
Built with **React + Vite + Tailwind CSS v4 + Framer Motion + React Router + React Hook Form**.

> This is the **frontend-only** phase. All data is mocked via an Axios-ready service layer
> (`src/services/`) so a real Express/MongoDB backend can be wired in later without touching UI code.

## 🚀 Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## 🔑 Demo Accounts

Use these on the **Login** page, or click "Explore a demo role" for instant access:

| Role | Email | Password |
|---|---|---|
| Customer | customer@demo.com | password123 |
| Receptionist | reception@demo.com | password123 |
| Mechanic | mechanic@demo.com | password123 |
| Admin | admin@demo.com | password123 |

## 📁 Structure

```
src/
├── components/   common (Button, Input, Modal, DataTable, Toast...), layout, dashboard widgets
├── pages/        public, auth, customer, receptionist, mechanic, admin
├── layouts/      PublicLayout, AuthLayout, DashboardLayout
├── routes/       ProtectedRoute (role guard — frontend demo only, NOT real security)
├── services/     authService, vehicleService, appointmentService, serviceOrderService,
│                 invoiceService, inventoryService, notificationService — mock now,
│                 Axios (apiClient.js) ready for the real backend
├── context/      AuthContext (mock session), ToastContext
├── data/         mock datasets (users, vehicles, appointments, invoices, parts...)
└── utils/        cn, format, constants, navConfig
```

## ✅ What's built (Phase 1 + 2 + role dashboards)

- Full design system: dark glassmorphism + cyan/blue neon accents, reusable component kit
- Landing page: Hero, Services, How It Works, Features, Why Choose Us, Stats, Testimonials, CTA
- Auth screens: Login, Register, Forgot Password, Reset Password, Verify Email
- Role-based dashboard shell (Sidebar + Header) for Customer / Receptionist / Mechanic / Admin
- Working dashboards for all 4 roles, including charts (Recharts) on the Admin dashboard
- Fully responsive (mobile drawer sidebar, stacked cards, single-column forms)
- Framer Motion micro-interactions throughout, `prefers-reduced-motion` respected

## 🧭 Next build phases (routed as "Coming Soon" placeholders for now)

- Vehicles CRUD, Appointment booking flow, Service tracking timeline, Service history detail
- Service Orders (create/edit), Inspection UI, Inventory & Parts management
- Invoice detail/print view, Admin management tables (Customers/Mechanics/Workshops/Reports)
- **Phase 2 (separate roadmap):** Express + MongoDB backend, Firebase Auth, Cloudinary uploads,
  Cloudflare Turnstile, Resend emails, multi-tenant authorization — per the original project brief.

## ⚠️ Notes

- Authentication and role checks in this phase are **mock/demo only** — real authorization
  will be enforced server-side once the backend is built.
- No reference JS/CSS files were supplied for this build; the design system was implemented
  from the written brief (dark glassmorphism, cyan/blue neon, glass cards, gradient buttons).
