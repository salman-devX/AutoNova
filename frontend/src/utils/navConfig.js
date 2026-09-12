import {
  LayoutDashboard, Car, CalendarClock, History, Receipt, Bell, User,
  ClipboardList, Users, Package, Wrench, ClipboardCheck, Briefcase,
  Building2, BarChart3, Settings, UserCog,
} from 'lucide-react';
import { ROLES } from './constants';

export const NAV_CONFIG = {
  [ROLES.CUSTOMER]: [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/vehicles', label: 'My Vehicles', icon: Car },
    { to: '/customer/appointments', label: 'Appointments', icon: CalendarClock },
    { to: '/customer/service-history', label: 'Service History', icon: History },
    { to: '/customer/invoices', label: 'Invoices', icon: Receipt },
    { to: '/customer/notifications', label: 'Notifications', icon: Bell },
    { to: '/customer/profile', label: 'Profile', icon: User },
  ],
  [ROLES.RECEPTIONIST]: [
    { to: '/receptionist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/receptionist/appointments', label: 'Appointments', icon: CalendarClock },
    { to: '/receptionist/service-orders', label: 'Service Orders', icon: ClipboardList },
    { to: '/receptionist/customers', label: 'Customers', icon: Users },
    { to: '/receptionist/invoices', label: 'Invoices', icon: Receipt },
  ],
  [ROLES.MECHANIC]: [
    { to: '/mechanic/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/mechanic/jobs', label: 'My Jobs', icon: Wrench },
    { to: '/mechanic/inspections', label: 'Inspections', icon: ClipboardCheck },
    { to: '/mechanic/profile', label: 'Profile', icon: User },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/workshops', label: 'Workshops', icon: Building2 },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/mechanics', label: 'Mechanics', icon: Briefcase },
    { to: '/admin/receptionists', label: 'Receptionists', icon: UserCog },
    { to: '/admin/services', label: 'Services', icon: Wrench },
    { to: '/admin/appointments', label: 'Appointments', icon: CalendarClock },
    { to: '/admin/service-orders', label: 'Service Orders', icon: ClipboardList },
    { to: '/admin/inventory', label: 'Inventory', icon: Package },
    { to: '/admin/invoices', label: 'Invoices', icon: Receipt },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
};

export const ROLE_LABELS = {
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.RECEPTIONIST]: 'Receptionist',
  [ROLES.MECHANIC]: 'Mechanic',
  [ROLES.ADMIN]: 'Administrator',
};
