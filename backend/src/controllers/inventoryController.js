import InventoryTransaction from '../models/InventoryTransaction.js';
import { inventoryService } from '../services/inventoryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export const listTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { workshopId: req.tenantId };
  if (req.query.partId) filter.partId = req.query.partId;
  if (req.query.type) filter.type = req.query.type;

  const [data, total] = await Promise.all([
    InventoryTransaction.find(filter).populate('partId', 'name sku').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    InventoryTransaction.countDocuments(filter),
  ]);
  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

/** POST /api/inventory/adjust — receptionist/admin manual correction, fully audited. */
export const adjustInventory = asyncHandler(async (req, res) => {
  const { partId, quantityDelta, reason } = req.body;
  const result = await inventoryService.adjustStock({
    workshopId: req.tenantId, partId, quantityDelta, reason, userId: req.user._id,
  });
  return sendSuccess(res, { message: 'Inventory adjusted', data: result });
});
