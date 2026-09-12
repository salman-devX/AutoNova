import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';

vi.mock('../src/config/firebase.js', () => ({
  verifyFirebaseToken: vi.fn(async (token) => {
    if (token === 'valid-admin-token') return { uid: 'admin-uid', email: 'admin@test.com' };
    if (token === 'valid-customer-token') return { uid: 'customer-uid', email: 'customer@test.com' };
    throw new Error('invalid token');
  }),
}));

const { authenticate } = await import('../src/middleware/authenticate.js');
const { authorize } = await import('../src/middleware/authorize.js');
const { errorHandler, notFound } = await import('../src/middleware/errorHandler.js');
const User = (await import('../src/models/User.js')).default;

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.get('/protected', authenticate, (req, res) => res.json({ success: true, role: req.user.role }));
  app.get('/admin-only', authenticate, authorize('admin'), (req, res) => res.json({ success: true }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

describe('authenticate + authorize middleware', () => {
  let app;

  beforeAll(async () => setupTestDB(), 60000);
  afterAll(async () => teardownTestDB());
  beforeEach(async () => {
    await clearTestDB();
    app = buildTestApp();
    await User.create({ firebaseUid: 'admin-uid', name: 'Admin', email: 'admin@test.com', role: 'admin' });
    await User.create({ firebaseUid: 'customer-uid', name: 'Customer', email: 'customer@test.com', role: 'customer' });
  });

  it('rejects requests with no Authorization header', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects requests with an invalid Firebase token', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer garbage-token');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('accepts a valid token and resolves the matching MongoDB user', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer valid-customer-token');
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('customer');
  });

  it('allows an admin through a role-gated route', async () => {
    const res = await request(app).get('/admin-only').set('Authorization', 'Bearer valid-admin-token');
    expect(res.status).toBe(200);
  });

  it('rejects a non-admin from a role-gated route with 403', async () => {
    const res = await request(app).get('/admin-only').set('Authorization', 'Bearer valid-customer-token');
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });
});
