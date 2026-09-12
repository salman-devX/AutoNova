import Part from '../models/Part.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const listParts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { workshopId: req.tenantId, isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { sku: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.lowStock === 'true') filter.$expr = { $lte: ['$quantity', '$minimumStockLevel'] };

  const [data, total] = await Promise.all([
    Part.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Part.countDocuments(filter),
  ]);
  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const getPart = asyncHandler(async (req, res) => {
  const part = await Part.findOne({ _id: req.params.id, workshopId: req.tenantId });
  if (!part) throw ApiError.notFound('Part not found.');
  return sendSuccess(res, { data: part });
});

export const createPart = asyncHandler(async (req, res) => {
  const part = await Part.create({ ...req.body, workshopId: req.tenantId });
  return sendSuccess(res, { statusCode: 201, message: 'Part created', data: part });
});

export const updatePart = asyncHandler(async (req, res) => {
  // Quantity must never be edited directly here — it can only change via
  // inventoryService's audited stock-change operations (see inventoryController).
  const { quantity, ...rest } = req.body;
  const part = await Part.findOneAndUpdate(
    { _id: req.params.id, workshopId: req.tenantId },
    { $set: rest },
    { new: true, runValidators: true }
  );
  if (!part) throw ApiError.notFound('Part not found.');
  return sendSuccess(res, { message: 'Part updated', data: part });
});

export const deletePart = asyncHandler(async (req, res) => {
  const part = await Part.findOneAndUpdate({ _id: req.params.id, workshopId: req.tenantId }, { isActive: false }, { new: true });
  if (!part) throw ApiError.notFound('Part not found.');
  return sendSuccess(res, { message: 'Part removed', data: part });
});
