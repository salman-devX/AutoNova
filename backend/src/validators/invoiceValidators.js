import { body, param } from 'express-validator';
import { PAYMENT_METHODS } from '../models/Payment.js';

export const invoiceIdParamValidator = [param('id').isMongoId().withMessage('Invalid invoice id')];

export const createInvoiceValidator = [
  body('serviceOrderId').isMongoId(),
  body('discount').optional().isFloat({ min: 0 }),
  body('dueDate').optional().isISO8601(),
  body('notes').optional().isString().isLength({ max: 1000 }),
];

export const createPaymentValidator = [
  body('invoiceId').isMongoId(),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  body('method').isIn(PAYMENT_METHODS),
  body('referenceId').optional().isString(),
];
