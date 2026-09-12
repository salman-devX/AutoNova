export const mockVehicles = [
  { id: 'v1', make: 'Honda', model: 'Civic', year: 2021, reg: 'LEA-2043', vin: 'JHMFC1F39GX000123', mileage: 34200, color: 'Pearl White' },
  { id: 'v2', make: 'Toyota', model: 'Corolla', year: 2019, reg: 'LEB-9981', vin: '2T1BURHE0KC000456', mileage: 58900, color: 'Silver' },
  { id: 'v3', make: 'Suzuki', model: 'Cultus', year: 2022, reg: 'LED-1120', vin: 'MA3FJEB1S00000789', mileage: 12100, color: 'Red' },
];

export const mockAppointments = [
  { id: 'a1', customer: 'Ahmed Raza', vehicle: 'Honda Civic — LEA-2043', service: 'General Service', date: '2026-09-08', time: '10:00 AM', status: 'Confirmed' },
  { id: 'a2', customer: 'Usman Tariq', vehicle: 'Toyota Corolla — LEB-9981', service: 'Brake Repair', date: '2026-09-08', time: '11:30 AM', status: 'Pending' },
  { id: 'a3', customer: 'Ayesha Malik', vehicle: 'Suzuki Cultus — LED-1120', service: 'Oil Change', date: '2026-09-07', time: '2:00 PM', status: 'In Progress' },
  { id: 'a4', customer: 'Hamza Farooq', vehicle: 'Honda City — LEC-5567', service: 'Engine Diagnostics', date: '2026-09-06', time: '9:00 AM', status: 'Completed' },
  { id: 'a5', customer: 'Sana Bukhari', vehicle: 'KIA Sportage — LEF-3321', service: 'Battery Replacement', date: '2026-09-05', time: '4:00 PM', status: 'Cancelled' },
];

export const mockJobs = [
  { id: 'j1', customer: 'Ahmed Raza', vehicle: 'Honda Civic — LEA-2043', service: 'General Service', priority: 'High', status: 'In Progress', due: '2026-09-07' },
  { id: 'j2', customer: 'Usman Tariq', vehicle: 'Toyota Corolla — LEB-9981', service: 'Brake Repair', priority: 'Medium', status: 'Pending', due: '2026-09-08' },
  { id: 'j3', customer: 'Ayesha Malik', vehicle: 'Suzuki Cultus — LED-1120', service: 'Oil Change', priority: 'Low', status: 'Completed', due: '2026-09-06' },
];

export const mockInvoices = [
  { id: 'INV-2044', customer: 'Ahmed Raza', vehicle: 'Honda Civic — LEA-2043', date: '2026-09-01', total: 18500, status: 'Paid' },
  { id: 'INV-2045', customer: 'Usman Tariq', vehicle: 'Toyota Corolla — LEB-9981', date: '2026-09-03', total: 32000, status: 'Unpaid' },
  { id: 'INV-2046', customer: 'Ayesha Malik', vehicle: 'Suzuki Cultus — LED-1120', date: '2026-09-05', total: 6500, status: 'Paid' },
];

export const mockParts = [
  { id: 'p1', name: 'Brake Pad Set (Front)', sku: 'BRK-1001', category: 'Brakes', qty: 4, minStock: 10, price: 4500, status: 'Low Stock' },
  { id: 'p2', name: 'Engine Oil 5W-30 (4L)', sku: 'OIL-2003', category: 'Fluids', qty: 42, minStock: 15, price: 3200, status: 'Active' },
  { id: 'p3', name: 'Car Battery 12V 60Ah', sku: 'BAT-3007', category: 'Electrical', qty: 0, minStock: 5, price: 12500, status: 'Out of Stock' },
];

export const revenueTrend = [
  { month: 'Apr', revenue: 420000 }, { month: 'May', revenue: 480000 }, { month: 'Jun', revenue: 445000 },
  { month: 'Jul', revenue: 520000 }, { month: 'Aug', revenue: 610000 }, { month: 'Sep', revenue: 390000 },
];

export const serviceStatusBreakdown = [
  { name: 'Completed', value: 62 }, { name: 'In Progress', value: 18 }, { name: 'Pending', value: 14 }, { name: 'Cancelled', value: 6 },
];

export const mechanicWorkload = [
  { name: 'Bilal', jobs: 8 }, { name: 'Kamran', jobs: 5 }, { name: 'Zeeshan', jobs: 6 }, { name: 'Waqas', jobs: 3 },
];
