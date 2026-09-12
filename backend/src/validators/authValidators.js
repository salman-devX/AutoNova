import { body } from 'express-validator';

export const registerValidator = [
  // Optional: Google sign-ups don't fill out a name field themselves — the
  // controller falls back to the Firebase display name / email prefix.
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name is too short'),
  body('email').optional().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').optional().isString(),
  body('role').optional().isIn(['customer']).withMessage('Self-registration is only allowed for the customer role'),
  // Optional: only enforced server-side when TURNSTILE_SECRET_KEY is configured (see middleware/turnstile.js).
  body('turnstileToken').optional().isString(),
];

export const syncProfileValidator = [
  body('name').optional().trim().isLength({ min: 2 }),
  body('phone').optional().isString(),
];
