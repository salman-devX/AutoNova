import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { getFirebaseAdmin } from '../src/config/firebase.js';
import Workshop from '../src/models/Workshop.js';
import User from '../src/models/User.js';
import Mechanic from '../src/models/Mechanic.js';

/**
 * Creates REAL Firebase Authentication accounts (not placeholder UIDs) for
 * the three fixed staff logins, plus their matching MongoDB User records —
 * so logging in with these emails/passwords works end-to-end and lands on
 * the right dashboard (role comes from MongoDB, looked up by firebaseUid).
 *
 * Safe to re-run: if the Firebase account or MongoDB user already exists,
 * it's reused/updated instead of duplicated.
 *
 * Usage: npm run seed:staff   (run from backend/, after backend/.env is filled in)
 */
const STAFF_ACCOUNTS = [
  { email: 'admin123@gmail.com', password: 'password123', name: 'Admin User', role: 'admin' },
  { email: 'reception123@gmail.com', password: 'password123', name: 'Reception User', role: 'receptionist' },
  { email: 'mechanic123@gmail.com', password: 'password123', name: 'Mechanic User', role: 'mechanic' },
];

async function getOrCreateFirebaseUser(admin, { email, password, name }) {
  try {
    return await admin.auth().getUserByEmail(email);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err;
    return admin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: true, // staff accounts are provisioned by the business, not self-signed-up
    });
  }
}

async function seedStaff() {
  await connectDB();
  const admin = getFirebaseAdmin();

  console.log('[seed:staff] Ensuring a workshop exists for staff to belong to...');
  let workshop = await Workshop.findOne({ isActive: true }).sort({ createdAt: 1 });
  if (!workshop) {
    workshop = await Workshop.create({
      name: 'AutoNova Lahore',
      slug: 'autonova-lahore',
      address: { line1: '42 Industrial Road', city: 'Lahore', country: 'Pakistan' },
      phone: '+92 300 1234567',
      email: 'lahore@autonova.app',
      workingHours: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => ({ day, open: '09:00', close: '18:00' }))
        .concat([{ day: 'sun', isClosed: true }]),
      settings: { appointmentStepMinutes: 30, defaultServiceDurationMinutes: 60, taxPercent: 5, currency: 'PKR' },
    });
    console.log(`[seed:staff] Created workshop: ${workshop.name} (${workshop._id})`);
  }

  for (const account of STAFF_ACCOUNTS) {
    console.log(`\n[seed:staff] --- ${account.role} (${account.email}) ---`);

    const firebaseUser = await getOrCreateFirebaseUser(admin, account);
    console.log(`[seed:staff] Firebase UID: ${firebaseUser.uid}`);

    let user = await User.findOne({ email: account.email });
    if (user) {
      user.firebaseUid = firebaseUser.uid;
      user.role = account.role;
      user.workshopId = workshop._id;
      user.isActive = true;
      await user.save();
      console.log(`[seed:staff] Updated existing MongoDB user: ${user._id}`);
    } else {
      user = await User.create({
        firebaseUid: firebaseUser.uid,
        name: account.name,
        email: account.email,
        role: account.role,
        workshopId: workshop._id,
      });
      console.log(`[seed:staff] Created MongoDB user: ${user._id}`);
    }

    if (account.role === 'mechanic') {
      const existingMechanic = await Mechanic.findOne({ userId: user._id });
      if (!existingMechanic) {
        await Mechanic.create({
          userId: user._id,
          workshopId: workshop._id,
          employeeId: `EMP-${firebaseUser.uid.slice(0, 6).toUpperCase()}`,
          specializations: ['general'],
        });
        console.log('[seed:staff] Created Mechanic profile.');
      }
    }
  }

  console.log('\n[seed:staff] Done. These accounts will now log in and land on their role dashboard:');
  STAFF_ACCOUNTS.forEach((a) => console.log(`  ${a.role.padEnd(13)} ${a.email} / ${a.password}`));

  await disconnectDB();
  process.exit(0);
}

seedStaff().catch((err) => {
  console.error('[seed:staff] Failed:', err);
  process.exit(1);
});
