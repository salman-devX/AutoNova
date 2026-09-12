import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Workshop from '../models/Workshop.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * POST /api/auth/register
 * Called right after the client completes Firebase sign-up. The Firebase ID
 * token (already verified by `authenticate`) is the source of truth for
 * identity; this endpoint only creates the matching MongoDB profile.
 * Self-registration is restricted to the "customer" role — staff accounts
 * are provisioned by an admin (see userController.createStaffUser).
 */
export const register = asyncHandler(async (req, res) => {
  const { uid, email: tokenEmail, name: tokenName } = req.firebaseClaims;
  const existing = await User.findOne({ firebaseUid: uid });
  if (existing) throw ApiError.conflict('An account already exists for this identity.', 'USER_EXISTS');

  const { phone, primaryWorkshopId } = req.body;
  // Email/password sign-up sends `name` explicitly from the registration form.
  // Google sign-up doesn't — fall back to the Google profile name (Firebase
  // puts it in the token as `name`), then to the email's local part.
  const name = req.body.name || tokenName || (tokenEmail ? tokenEmail.split('@')[0] : 'New User');

  let workshopId = primaryWorkshopId;
  if (!workshopId) {
    // Default demo/first workshop — in a real multi-workshop rollout the
    // registration form would let the customer pick their nearest branch.
    const fallback = await Workshop.findOne({ isActive: true }).sort({ createdAt: 1 });
    workshopId = fallback?._id || null;
  }

  const user = await User.create({
    firebaseUid: uid,
    name,
    email: (tokenEmail || req.body.email || '').toLowerCase(),
    phone: phone || '',
    role: 'customer',
    lastLogin: new Date(),
  });

  if (workshopId) {
    await Customer.create({ userId: user._id, primaryWorkshopId: workshopId, phone: phone || '' });
  }

  return sendSuccess(res, { statusCode: 201, message: 'Account created', data: user });
});

/**
 * GET /api/auth/me
 * Returns the authenticated user's MongoDB profile (role, workshop, etc.)
 * — this is what the frontend calls immediately after Firebase login to
 * learn "who am I" beyond the bare Firebase identity.
 */
export const me = asyncHandler(async (req, res) => {
  req.user.lastLogin = new Date();
  await req.user.save();
  return sendSuccess(res, { data: req.user });
});
