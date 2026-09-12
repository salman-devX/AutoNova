import { Router } from 'express';
import { authenticate, verifyIdentity } from '../middleware/authenticate.js';
import { verifyTurnstile } from '../middleware/turnstile.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { registerValidator } from '../validators/authValidators.js';
import { register, me } from '../controllers/authController.js';

const router = Router();

router.post('/register', authLimiter, verifyTurnstile, verifyIdentity, registerValidator, validate, register);
router.get('/me', authenticate, me);

export default router;
