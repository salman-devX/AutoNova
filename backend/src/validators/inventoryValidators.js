import { body, param } from 'express-validator';

export const partIdParamValidator = [param('id').isMongoId().withMessage('Invalid part id')];

export const createPartValidator = [
  body('name').trim().notEmpty(),
  body('sku').trim().notEmpty(),
  body('purchasePrice').isFloat({ min: 0 }),
  body('sellingPrice').isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 0 }),
  body('minimumStockLevel').optional().isInt({ min: 0 }),
];

export const updatePartValidator = [
  ...partIdParamValidator,
  body('name').optional().trim().notEmpty(),
  body('purchasePrice').optional().isFloat({ min: 0 }),
  body('sellingPrice').optional().isFloat({ min: 0 }),
  body('minimumStockLevel').optional().isInt({ min: 0 }),
];

export const adjustStockValidator = [
  body('partId').isMongoId(),
  body('quantityDelta').isInt().withMessage('quantityDelta must be a non-zero integer'),
  body('reason').optional().isString().isLength({ max: 500 }),
];
