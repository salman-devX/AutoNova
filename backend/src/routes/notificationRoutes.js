import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { listMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = Router();

router.use(authenticate);

router.get('/', listMyNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
