import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';

import Workshop from '../src/models/Workshop.js';
import User from '../src/models/User.js';
import Customer from '../src/models/Customer.js';
import Vehicle from '../src/models/Vehicle.js';
import Service from '../src/models/Service.js';
import Mechanic from '../src/models/Mechanic.js';
import Part from '../src/models/Part.js';
import Appointment from '../src/models/Appointment.js';
import ServiceOrder from '../src/models/ServiceOrder.js';
import Notification from '../src/models/Notification.js';

/**
 * Demo/development seed data only — NO real credentials, NO production secrets.
 * `firebaseUid` values here are placeholders; in a real run you would first
 * create these accounts in the Firebase console/emulator and paste their
 * actual UIDs here so login works end-to-end.
 *
 * Usage: npm run seed
 */
async function seed() {
  await connectDB();
  console.log('[seed] Connected. Clearing existing demo collections...');

  await Promise.all([
    Workshop.deleteMany({}), User.deleteMany({}), Customer.deleteMany({}), Vehicle.deleteMany({}),
    Service.deleteMany({}), Mechanic.deleteMany({}), Part.deleteMany({}), Appointment.deleteMany({}),
    ServiceOrder.deleteMany({}), Notification.deleteMany({}),
  ]);

  const workshop = await Workshop.create({
    name: 'AutoNova Lahore', slug: 'autonova-lahore',
    address: { line1: '42 Industrial Road', city: 'Lahore', country: 'Pakistan' },
    phone: '+92 300 1234567', email: 'lahore@autonova.app',
    workingHours: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => ({ day, open: '09:00', close: '18:00' }))
      .concat([{ day: 'sun', isClosed: true }]),
    settings: { appointmentStepMinutes: 30, defaultServiceDurationMinutes: 60, taxPercent: 5, currency: 'PKR' },
  });

  const admin = await User.create({
    firebaseUid: 'seed-admin-uid', name: 'Fatima Sheikh', email: 'admin@demo.com',
    phone: '+92 300 4445566', role: 'admin', workshopId: workshop._id,
  });
  const receptionist = await User.create({
    firebaseUid: 'seed-reception-uid', name: 'Sara Khan', email: 'reception@demo.com',
    phone: '+92 300 2223344', role: 'receptionist', workshopId: workshop._id,
  });
  const mechanicUser = await User.create({
    firebaseUid: 'seed-mechanic-uid', name: 'Bilal Hussain', email: 'mechanic@demo.com',
    phone: '+92 300 3334455', role: 'mechanic', workshopId: workshop._id,
  });
  const customerUser = await User.create({
    firebaseUid: 'seed-customer-uid', name: 'Ahmed Raza', email: 'customer@demo.com',
    phone: '+92 300 1112233', role: 'customer',
  });

  const mechanic = await Mechanic.create({
    userId: mechanicUser._id, workshopId: workshop._id, employeeId: 'EMP-001',
    specializations: ['engine', 'brakes'],
  });

  const customer = await Customer.create({
    userId: customerUser._id, primaryWorkshopId: workshop._id, phone: customerUser.phone,
  });

  const vehicle = await Vehicle.create({
    workshopId: workshop._id, customerId: customer._id,
    make: 'Honda', model: 'Civic', year: 2021, registrationNumber: 'LEA-2043',
    mileage: 34200, color: 'Pearl White',
  });

  const services = await Service.insertMany([
    { workshopId: workshop._id, name: 'General Service', category: 'general', durationMinutes: 60, price: 8500, estimatedLaborCost: 3000 },
    { workshopId: workshop._id, name: 'Brake Repair', category: 'brakes', durationMinutes: 90, price: 12000, estimatedLaborCost: 5000 },
    { workshopId: workshop._id, name: 'Oil Change', category: 'fluids', durationMinutes: 30, price: 4500, estimatedLaborCost: 1000 },
  ]);

  const parts = await Part.insertMany([
    { workshopId: workshop._id, name: 'Brake Pad Set (Front)', sku: 'BRK-1001', category: 'Brakes', purchasePrice: 3000, sellingPrice: 4500, quantity: 4, minimumStockLevel: 10 },
    { workshopId: workshop._id, name: 'Engine Oil 5W-30 (4L)', sku: 'OIL-2003', category: 'Fluids', purchasePrice: 2200, sellingPrice: 3200, quantity: 42, minimumStockLevel: 15 },
    { workshopId: workshop._id, name: 'Car Battery 12V 60Ah', sku: 'BAT-3007', category: 'Electrical', purchasePrice: 9000, sellingPrice: 12500, quantity: 0, minimumStockLevel: 5 },
  ]);

  const appointmentStart = new Date();
  appointmentStart.setDate(appointmentStart.getDate() + 1);
  appointmentStart.setHours(10, 0, 0, 0);

  await Appointment.create({
    workshopId: workshop._id, customerId: customer._id, vehicleId: vehicle._id,
    serviceId: services[0]._id, mechanicId: mechanic._id,
    start: appointmentStart, end: new Date(appointmentStart.getTime() + 60 * 60000),
    durationMinutes: 60, status: 'confirmed', createdBy: customerUser._id,
  });

  await ServiceOrder.create({
    workshopId: workshop._id, customerId: customer._id, vehicleId: vehicle._id,
    assignedMechanics: [mechanic._id],
    complaint: 'Unusual engine noise on startup',
    services: [{ serviceId: services[0]._id, name: services[0].name, price: services[0].price, quantity: 1 }],
    status: 'in_progress', estimatedCost: services[0].price,
    createdBy: receptionist._id,
    statusHistory: [{ status: 'booked', changedBy: receptionist._id }, { status: 'in_progress', changedBy: mechanicUser._id }],
  });

  await Notification.create({
    userId: customerUser._id, workshopId: workshop._id, type: 'appointment_confirmed',
    title: 'Appointment confirmed', message: 'Your appointment has been confirmed.',
  });

  console.log('[seed] Done:');
  console.log(`  Workshop:     ${workshop.name} (${workshop._id})`);
  console.log(`  Admin:        ${admin.email}`);
  console.log(`  Receptionist: ${receptionist.email}`);
  console.log(`  Mechanic:     ${mechanicUser.email}`);
  console.log(`  Customer:     ${customerUser.email}`);
  console.log(`  Services:     ${services.length}, Parts: ${parts.length}`);

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
