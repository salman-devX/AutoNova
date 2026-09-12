import User from '../models/User.js';
import Mechanic from '../models/Mechanic.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';
import { getFirebaseAdmin } from '../config/firebase.js';

export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (name) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  await req.user.save();
  return sendSuccess(res, { message: 'Profile updated', data: req.user });
});

function generateTempPassword() {
  // e.g. "Xk7mQp2rTw4n" — meets Firebase's 6-char minimum with room to spare.
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
}

/**
 * POST /api/users/staff
 * Admin-only: creates a brand-new receptionist/mechanic/admin account.
 * There's no separate "invite" step in this app yet, so the Firebase Auth
 * account itself is created right here (with a generated temporary
 * password) — the admin shares that password with the new hire, who can
 * change it via "Forgot password" on their first login.
 */
export const createStaffUser = asyncHandler(async (req, res) => {
  const { name, email, phone, role, workshopId, specializations } = req.body;
  if (!['receptionist', 'mechanic', 'admin'].includes(role)) {
    throw ApiError.badRequest('Invalid staff role.', 'INVALID_ROLE');
  }
  if (!name || !email) {
    throw ApiError.badRequest('name and email are required.', 'VALIDATION_ERROR');
  }

  const resolvedWorkshopId = workshopId || req.tenantId;
  if (!resolvedWorkshopId) {
    throw ApiError.badRequest('workshopId is required.', 'WORKSHOP_REQUIRED');
  }

  const firebaseAdmin = getFirebaseAdmin();
  const tempPassword = generateTempPassword();
  let firebaseUser;
  try {
    firebaseUser = await firebaseAdmin.auth().createUser({ email, password: tempPassword, displayName: name });
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      throw ApiError.conflict('An account with this email already exists.', 'USER_EXISTS');
    }
    throw err;
  }

  const user = await User.create({
    firebaseUid: firebaseUser.uid, name, email, phone, role, workshopId: resolvedWorkshopId,
  });

  if (role === 'mechanic') {
    await Mechanic.create({ userId: user._id, workshopId: resolvedWorkshopId, specializations: specializations || [] });
  }

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Staff account created',
    // tempPassword is returned ONCE, here, so the admin can share it —
    // it is never stored anywhere and can't be retrieved again afterwards.
    data: { user, tempPassword },
  });
});

/** GET /api/users — admin-only directory, tenant-scoped unless global admin omits workshopId. */
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.tenantId) filter.workshopId = req.tenantId;
  if (req.query.role) filter.role = req.query.role;

  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.tenantId) filter.workshopId = req.tenantId;
  const user = await User.findOneAndUpdate(filter, { isActive: false }, { new: true });
  if (!user) throw ApiError.notFound('User not found.');
  return sendSuccess(res, { message: 'User deactivated', data: user });
});
