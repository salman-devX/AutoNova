import { mockVehicles as seedVehicles, mockAppointments as seedAppointments, mockJobs, mockInvoices as seedInvoices, mockParts as seedParts, mechanicWorkload } from './mockDashboard';
import { services as landingServices } from './mockLanding';

let idCounter = 1000;
export const nextId = (prefix) => `${prefix}_${idCounter++}`;

export const store = {
  vehicles: seedVehicles.map((v) => ({ ...v })),
  appointments: seedAppointments.map((a) => ({ ...a })),
  serviceOrders: mockJobs.map((j) => ({
    id: j.id, customer: j.customer, vehicle: j.vehicle, service: j.service,
    status: j.status === 'Pending' ? 'booked' : j.status === 'In Progress' ? 'in_progress' : 'completed',
    mechanic: 'Bilal Hussain', complaint: 'Customer reported an issue during check-in.',
    estimatedCost: 8500, createdAt: '2026-09-05',
  })),
  parts: seedParts.map((p) => ({ ...p })),
  invoices: seedInvoices.map((i) => ({ ...i, discount: 0, tax: Math.round(i.total * 0.05), status: i.status })),
  services: [
    { id: 'svc1', name: 'General / Periodic Service', durationMinutes: 150, price: 6500, category: 'general', isActive: true },
    { id: 'svc2', name: 'Oil & Filter Change', durationMinutes: 40, price: 3500, category: 'fluids', isActive: true },
    { id: 'svc3', name: 'Brake Pad Replacement', durationMinutes: 60, price: 4000, category: 'brakes', isActive: true },
    { id: 'svc4', name: 'Engine Diagnostics (OBD Scan)', durationMinutes: 45, price: 2000, category: 'engine', isActive: true },
    { id: 'svc5', name: 'Battery Replacement & Testing', durationMinutes: 20, price: 1000, category: 'electrical', isActive: true },
    { id: 'svc6', name: 'AC Service & Gas Refill', durationMinutes: 75, price: 3000, category: 'other', isActive: true },
    { id: 'svc7', name: 'Wheel Alignment', durationMinutes: 45, price: 2500, category: 'tires', isActive: true },
    { id: 'svc8', name: 'Wheel Balancing', durationMinutes: 30, price: 1500, category: 'tires', isActive: true },
    { id: 'svc9', name: 'Tire Replacement & Rotation', durationMinutes: 30, price: 1000, category: 'tires', isActive: true },
    { id: 'svc10', name: 'Suspension Repair', durationMinutes: 180, price: 5000, category: 'other', isActive: true },
    { id: 'svc11', name: 'Electrical & Wiring Repair', durationMinutes: 90, price: 2500, category: 'electrical', isActive: true },
    { id: 'svc12', name: 'Radiator & Cooling System', durationMinutes: 90, price: 3500, category: 'engine', isActive: true },
    { id: 'svc13', name: 'Clutch Replacement', durationMinutes: 240, price: 12000, category: 'engine', isActive: true },
    { id: 'svc14', name: 'Denting & Painting', durationMinutes: 480, price: 4000, category: 'bodywork', isActive: true },
    { id: 'svc15', name: 'Car Wash & Detailing', durationMinutes: 60, price: 1500, category: 'other', isActive: true },
  ],
  customers: [
    { id: 'c1', name: 'Ahmed Raza', email: 'customer@demo.com', phone: '+92 300 1112233', vehicles: 1, status: 'Active', joined: '2025-02-14' },
    { id: 'c2', name: 'Usman Tariq', email: 'usman.tariq@mail.com', phone: '+92 301 5551234', vehicles: 2, status: 'Active', joined: '2025-05-02' },
    { id: 'c3', name: 'Ayesha Malik', email: 'ayesha.malik@mail.com', phone: '+92 302 7778899', vehicles: 1, status: 'Active', joined: '2025-08-19' },
    { id: 'c4', name: 'Hamza Farooq', email: 'hamza.farooq@mail.com', phone: '+92 303 4443322', vehicles: 1, status: 'Inactive', joined: '2024-11-30' },
  ],
  mechanics: mechanicWorkload.map((m, i) => ({
    id: `mech${i + 1}`, name: m.name, email: `${m.name.toLowerCase()}@autonova.app`,
    specializations: ['Engine', 'Brakes', 'Electrical'].slice(0, (i % 3) + 1),
    activeJobs: m.jobs, isAvailable: i !== 2, status: 'Active',
  })),
  receptionists: [
    { id: 'r1', name: 'Sara Khan', email: 'reception@demo.com', phone: '+92 300 2223344', status: 'Active', joined: '2024-06-01' },
    { id: 'r2', name: 'Mehwish Ali', email: 'mehwish.ali@autonova.app', phone: '+92 304 8889900', status: 'Active', joined: '2025-01-15' },
  ],
  workshops: [
    { id: 'ws1', name: 'AutoNova Lahore', city: 'Lahore', phone: '+92 300 1234567', email: 'lahore@autonova.app', status: 'Active', staff: 12 },
    { id: 'ws2', name: 'AutoNova Karachi', city: 'Karachi', phone: '+92 300 9988776', email: 'karachi@autonova.app', status: 'Active', staff: 8 },
  ],
  inspections: [
    {
      id: 'insp1', vehicle: 'Honda Civic — LEA-2043', mechanic: 'Bilal Hussain', date: '2026-09-06',
      items: [
        { category: 'Engine', rating: 'good' }, { category: 'Brakes', rating: 'needs_attention' },
        { category: 'Tires', rating: 'good' }, { category: 'Battery', rating: 'critical' },
      ],
      recommendations: 'Battery should be replaced soon; brake pads at 30% remaining.',
    },
  ],
};
