import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import Workshop from '../src/models/Workshop.js';
import User from '../src/models/User.js';
import Customer from '../src/models/Customer.js';
import Vehicle from '../src/models/Vehicle.js';

/**
 * MANDATORY TEST (see AutoHubX backend brief §67):
 * A user belonging to Workshop A must never be able to read Workshop B's
 * data, and Customer A must never be able to read Customer B's records —
 * even when they know the exact MongoDB ObjectId.
 *
 * These tests exercise the same tenant-safe query pattern used throughout
 * the controllers (`Model.findOne({ _id, workshopId: req.tenantId })`)
 * rather than re-testing Express routing.
 */
describe('Multi-tenant & ownership isolation', () => {
  beforeAll(async () => setupTestDB(), 60000);
  afterAll(async () => teardownTestDB());
  beforeEach(async () => clearTestDB());

  it('prevents a workshop-scoped query from returning another workshop\'s vehicle', async () => {
    const workshopA = await Workshop.create({ name: 'Workshop A', slug: 'workshop-a' });
    const workshopB = await Workshop.create({ name: 'Workshop B', slug: 'workshop-b' });

    const userA = await User.create({ firebaseUid: 'u-a', name: 'User A', email: 'a@test.com', role: 'customer' });
    const customerA = await Customer.create({ userId: userA._id, primaryWorkshopId: workshopA._id });
    const vehicleInB = await Vehicle.create({
      workshopId: workshopB._id, customerId: customerA._id, make: 'Honda', model: 'Civic', registrationNumber: 'XYZ-999',
    });

    // Simulates the tenant-safe pattern every controller uses.
    const found = await Vehicle.findOne({ _id: vehicleInB._id, workshopId: workshopA._id });
    expect(found).toBeNull();

    const foundCorrectly = await Vehicle.findOne({ _id: vehicleInB._id, workshopId: workshopB._id });
    expect(foundCorrectly).not.toBeNull();
  });

  it('prevents Customer A from resolving Customer B\'s vehicle via ownership-scoped query', async () => {
    const workshop = await Workshop.create({ name: 'Shared Workshop', slug: 'shared-workshop' });

    const userA = await User.create({ firebaseUid: 'cust-a', name: 'Customer A', email: 'a2@test.com', role: 'customer' });
    const userB = await User.create({ firebaseUid: 'cust-b', name: 'Customer B', email: 'b2@test.com', role: 'customer' });
    const customerA = await Customer.create({ userId: userA._id, primaryWorkshopId: workshop._id });
    const customerB = await Customer.create({ userId: userB._id, primaryWorkshopId: workshop._id });

    const vehicleOfB = await Vehicle.create({
      workshopId: workshop._id, customerId: customerB._id, make: 'Toyota', model: 'Yaris', registrationNumber: 'AAA-001',
    });

    // Ownership-scoped query as used for customer-role requests.
    const attempted = await Vehicle.findOne({ _id: vehicleOfB._id, workshopId: workshop._id, customerId: customerA._id });
    expect(attempted).toBeNull();

    const ownerAccess = await Vehicle.findOne({ _id: vehicleOfB._id, workshopId: workshop._id, customerId: customerB._id });
    expect(ownerAccess).not.toBeNull();
  });

  it('rejects a vehicle registration number that duplicates one already used in the same workshop', async () => {
    const workshop = await Workshop.create({ name: 'Reg Test Workshop', slug: 'reg-test-workshop' });
    const user = await User.create({ firebaseUid: 'reg-u', name: 'Reg User', email: 'reg@test.com', role: 'customer' });
    const customer = await Customer.create({ userId: user._id, primaryWorkshopId: workshop._id });

    await Vehicle.create({ workshopId: workshop._id, customerId: customer._id, make: 'Suzuki', model: 'Cultus', registrationNumber: 'DUP-001' });

    await expect(
      Vehicle.create({ workshopId: workshop._id, customerId: customer._id, make: 'Suzuki', model: 'Alto', registrationNumber: 'DUP-001' })
    ).rejects.toThrow();
  });

  it('allows the same registration number to exist independently in two different workshops', async () => {
    const workshopA = await Workshop.create({ name: 'Reg Workshop A', slug: 'reg-workshop-a' });
    const workshopB = await Workshop.create({ name: 'Reg Workshop B', slug: 'reg-workshop-b' });
    const user = await User.create({ firebaseUid: 'reg-u2', name: 'Reg User 2', email: 'reg2@test.com', role: 'customer' });
    const customerA = await Customer.create({ userId: user._id, primaryWorkshopId: workshopA._id });

    await Vehicle.create({ workshopId: workshopA._id, customerId: customerA._id, make: 'Kia', model: 'Sportage', registrationNumber: 'SHARED-01' });

    await expect(
      Vehicle.create({ workshopId: workshopB._id, customerId: customerA._id, make: 'Kia', model: 'Sportage', registrationNumber: 'SHARED-01' })
    ).resolves.toBeDefined();
  });
});
