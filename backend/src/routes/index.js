import { Router } from 'express';
import mongoose from 'mongoose';

import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import customerRoutes from './customerRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import workshopRoutes from './workshopRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import serviceOrderRoutes from './serviceOrderRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import mechanicRoutes from './mechanicRoutes.js';
import inspectionRoutes from './inspectionRoutes.js';
import partRoutes from './partRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: dbStates[mongoose.connection.readyState] || 'unknown',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/workshops', workshopRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/service-orders', serviceOrderRoutes);
router.use('/services', serviceRoutes);
router.use('/mechanics', mechanicRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/parts', partRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', reportRoutes);

export default router;
