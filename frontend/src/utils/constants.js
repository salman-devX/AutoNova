export const ROLES = {
  CUSTOMER: 'customer',
  RECEPTIONIST: 'receptionist',
  MECHANIC: 'mechanic',
  ADMIN: 'admin',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const SERVICE_STAGE = [
  'Appointment',
  'Vehicle Received',
  'Inspection',
  'Service In Progress',
  'Quality Check',
  'Ready for Pickup',
  'Completed',
];

export const INVOICE_STATUS = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
  PARTIAL: 'Partial',
  OVERDUE: 'Overdue',
};

export const INSPECTION_RATING = {
  GOOD: 'Good',
  ATTENTION: 'Needs Attention',
  CRITICAL: 'Critical',
};

export const STATUS_STYLES = {
  Pending: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  Confirmed: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  'In Progress': 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  Completed: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  Cancelled: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  Paid: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  Unpaid: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  Partial: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  Overdue: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  Good: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  'Needs Attention': 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  Critical: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  Active: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  'Low Stock': 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  'Out of Stock': 'bg-rose-400/10 text-rose-300 border-rose-400/20',
};
