import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { listWorkshops, getWorkshop, createWorkshop, updateWorkshop, deleteWorkshop } from '../controllers/workshopController.js';

const router = Router();

router.use(authenticate);

router.get('/', listWorkshops); // any authenticated role can browse active workshops (e.g. registration picker)
router.get('/:id', getWorkshop);
router.post('/', authorize('admin'), createWorkshop);
router.patch('/:id', authorize('admin'), updateWorkshop);
router.delete('/:id', authorize('admin'), deleteWorkshop);

export default router;
