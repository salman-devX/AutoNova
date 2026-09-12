import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { Loader } from './components/common/States';
import { ROLES } from './utils/constants';
import ComingSoon from './components/common/ComingSoon';

const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));

const Landing = lazy(() => import('./pages/public/Landing'));
const ServicesPage = lazy(() => import('./pages/public/Services'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorks'));
const FeaturesPage = lazy(() => import('./pages/public/Features'));
const ContactPage = lazy(() => import('./pages/public/Contact'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));

const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const ReceptionistDashboard = lazy(() => import('./pages/receptionist/Dashboard'));
const MechanicDashboard = lazy(() => import('./pages/mechanic/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Profile = lazy(() => import('./pages/shared/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const CustomerVehicles = lazy(() => import('./pages/customer/Vehicles'));
const CustomerAppointments = lazy(() => import('./pages/customer/Appointments'));
const CustomerServiceHistory = lazy(() => import('./pages/customer/ServiceHistory'));
const CustomerNotifications = lazy(() => import('./pages/customer/Notifications'));
const ReceptionistServiceOrders = lazy(() => import('./pages/receptionist/ServiceOrders'));
const MechanicJobs = lazy(() => import('./pages/mechanic/Jobs'));
const MechanicInspections = lazy(() => import('./pages/mechanic/Inspections'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminWorkshops = lazy(() => import('./pages/admin/Workshops'));
const AdminMechanics = lazy(() => import('./pages/admin/Mechanics'));
const AdminReceptionists = lazy(() => import('./pages/admin/Receptionists'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const Invoices = lazy(() => import('./pages/shared/Invoices'));
const Customers = lazy(() => import('./pages/shared/Customers'));
const AppointmentsManagement = lazy(() => import('./pages/shared/AppointmentsManagement'));

// Real, wired-up pages per role, beyond dashboard/profile.
const REAL_ROUTES = {
  [ROLES.CUSTOMER]: [
    ['vehicles', CustomerVehicles], ['appointments', CustomerAppointments],
    ['service-history', CustomerServiceHistory], ['notifications', CustomerNotifications], ['invoices', Invoices],
  ],
  [ROLES.RECEPTIONIST]: [
    ['appointments', AppointmentsManagement], ['service-orders', ReceptionistServiceOrders],
    ['customers', Customers], ['invoices', Invoices],
  ],
  [ROLES.MECHANIC]: [
    ['jobs', MechanicJobs], ['inspections', MechanicInspections],
  ],
  [ROLES.ADMIN]: [
    ['workshops', AdminWorkshops], ['customers', Customers], ['mechanics', AdminMechanics],
    ['receptionists', AdminReceptionists], ['services', AdminServices], ['appointments', AppointmentsManagement],
    ['service-orders', ReceptionistServiceOrders], ['inventory', AdminInventory], ['invoices', Invoices],
    ['reports', AdminReports], ['settings', AdminSettings],
  ],
};

// No remaining placeholders — every navigable route now has a real page.
const PLACEHOLDER_ROUTES = {
  [ROLES.CUSTOMER]: [],
  [ROLES.RECEPTIONIST]: [],
  [ROLES.MECHANIC]: [],
  [ROLES.ADMIN]: [],
};

function RoleSection({ role, DashboardComponent }) {
  return (
    <Route element={<ProtectedRoute roles={[role]}><DashboardLayout /></ProtectedRoute>}>
      <Route path={`${role}/dashboard`} element={<DashboardComponent />} />
      <Route path={`${role}/profile`} element={<Profile />} />
      {REAL_ROUTES[role].map(([slug, Component]) => (
        <Route key={slug} path={`${role}/${slug}`} element={<Component />} />
      ))}
      {PLACEHOLDER_ROUTES[role].map(([slug, title]) => (
        <Route key={slug} path={`${role}/${slug}`} element={<ComingSoon title={title} />} />
      ))}
    </Route>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<Loader label="Loading AutoNova..." className="min-h-screen" />}>
            <Routes>
              {/* Public site */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              {/* Auth screens */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
              </Route>

              {/* Role dashboards */}
              {RoleSection({ role: ROLES.CUSTOMER, DashboardComponent: CustomerDashboard })}
              {RoleSection({ role: ROLES.RECEPTIONIST, DashboardComponent: ReceptionistDashboard })}
              {RoleSection({ role: ROLES.MECHANIC, DashboardComponent: MechanicDashboard })}
              {RoleSection({ role: ROLES.ADMIN, DashboardComponent: AdminDashboard })}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}
