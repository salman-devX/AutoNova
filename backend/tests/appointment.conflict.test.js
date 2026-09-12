import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import { appointmentService } from '../src/services/appointmentService.js';
import Workshop from '../src/models/Workshop.js';
import User from '../src/models/User.js';
import Customer from '../src/models/Customer.js';
import Vehicle from '../src/models/Vehicle.js';
import Service from '../src/models/Service.js';
import Mechanic from '../src/models/Mechanic.js';
import Appointment from '../src/models/Appointment.js';

/**
 * MANDATORY TEST (see AutoHubX backend brief §66):
 * Simulates two concurrent requests booking the exact same mechanic/slot.
 * Exactly one must succeed; the other must fail with APPOINTMENT_CONFLICT.
 *
 * Run with: npm test
 * Requires network access to download the mongodb-memory-server binary the
 * first time it runs (or point it at a local/Atlas replica set — see README).
 */
describe('Double-booking prevention', () => {
  let workshop, service, mechanic, customerA, customerB, vehicleA, vehicleB, userA, userB;

  beforeAll(async () => {
    await setupTestDB();
  }, 60000);

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    workshop = await Workshop.create({
      name: 'Test Workshop', slug: 'test-workshop',
      workingHours: [{ day: ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()], open: '00:00', close: '23:59' }],
      settings: { appointmentStepMinutes: 30 },
    });
    service = await Service.create({ workshopId: workshop._id, name: 'General Service', durationMinutes: 60, price: 1000 });

    const mechUser = await User.create({ firebaseUid: 'mech-1', name: 'Mech One', email: 'mech1@test.com', role: 'mechanic', workshopId: workshop._id });
    mechanic = await Mechanic.create({ userId: mechUser._id, workshopId: workshop._id });

    userA = await User.create({ firebaseUid: 'cust-a', name: 'Customer A', email: 'a@test.com', role: 'customer' });
    userB = await User.create({ firebaseUid: 'cust-b', name: 'Customer B', email: 'b@test.com', role: 'customer' });
    customerA = await Customer.create({ userId: userA._id, primaryWorkshopId: workshop._id });
    customerB = await Customer.create({ userId: userB._id, primaryWorkshopId: workshop._id });

    vehicleA = await Vehicle.create({ workshopId: workshop._id, customerId: customerA._id, make: 'Honda', model: 'Civic', registrationNumber: 'AAA-111' });
    vehicleB = await Vehicle.create({ workshopId: workshop._id, customerId: customerB._id, make: 'Toyota', model: 'Corolla', registrationNumber: 'BBB-222' });
  });

  it('allows only one of two simultaneous bookings for the same mechanic/slot to succeed', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
    start.setMinutes(0, 0, 0);

    const bookingA = appointmentService.createAppointment({
      workshopId: workshop._id, customerId: customerA._id, vehicleId: vehicleA._id,
      serviceId: service._id, mechanicId: mechanic._id, start, createdBy: userA._id,
    });
    const bookingB = appointmentService.createAppointment({
      workshopId: workshop._id, customerId: customerB._id, vehicleId: vehicleB._id,
      serviceId: service._id, mechanicId: mechanic._id, start, createdBy: userB._id,
    });

    const results = await Promise.allSettled([bookingA, bookingB]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason.statusCode).toBe(409);
    expect(rejected[0].reason.code).toBe('APPOINTMENT_CONFLICT');

    const activeCount = await Appointment.countDocuments({
      workshopId: workshop._id, mechanicId: mechanic._id, status: { $in: ['pending', 'confirmed', 'in-progress'] },
    });
    expect(activeCount).toBe(1);
  });

  it('allows a second appointment for a different mechanic at the same time', async () => {
    const mechUser2 = await User.create({ firebaseUid: 'mech-2', name: 'Mech Two', email: 'mech2@test.com', role: 'mechanic', workshopId: workshop._id });
    const mechanic2 = await Mechanic.create({ userId: mechUser2._id, workshopId: workshop._id });

    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    start.setMinutes(0, 0, 0);

    const [apptA, apptB] = await Promise.all([
      appointmentService.createAppointment({
        workshopId: workshop._id, customerId: customerA._id, vehicleId: vehicleA._id,
        serviceId: service._id, mechanicId: mechanic._id, start, createdBy: userA._id,
      }),
      appointmentService.createAppointment({
        workshopId: workshop._id, customerId: customerB._id, vehicleId: vehicleB._id,
        serviceId: service._id, mechanicId: mechanic2._id, start, createdBy: userB._id,
      }),
    ]);

    expect(apptA._id).toBeDefined();
    expect(apptB._id).toBeDefined();
  });
});
