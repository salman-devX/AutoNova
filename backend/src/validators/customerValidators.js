import { body, param } from 'express-validator';

export const customerIdParamValidator = [param('id').isMongoId().withMessage('Invalid customer id')];

export const createCustomerValidator = [
  body('name').trim().notEmpty().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isString(),
  body('address').optional().isObject(),
];

export const updateCustomerValidator = [
  ...customerIdParamValidator,
  body('phone').optional().isString(),
  body('address').optional().isObject(),
  body('status').optional().isIn(['active', 'inactive', 'blocked']),
  body('notes').optional().isString(),
];
