import Mechanic from '../models/Mechanic.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const listMechanics = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const workshopId = req.tenantId || req.query.workshopId;
  if (!workshopId) throw ApiError.badRequest('workshopId is required.', 'WORKSHOP_REQUIRED');

  const filter = { workshopId, isActive: true };
  const [data, total] = await Promise.all([
    Mechanic.find(filter).populate('userId', 'name email phone avatar').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Mechanic.countDocuments(filter),
  ]);
  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const updateMechanic = asyncHandler(async (req, res) => {
  const { specializations, isAvailable, isActive } = req.body;
  const mechanic = await Mechanic.findOneAndUpdate(
    { _id: req.params.id, workshopId: req.tenantId },
    { $set: { ...(specializations && { specializations }), ...(isAvailable !== undefined && { isAvailable }), ...(isActive !== undefined && { isActive }) } },
    { new: true, runValidators: true }
  );
  if (!mechanic) throw ApiError.notFound('Mechanic not found.');
  return sendSuccess(res, { message: 'Mechanic updated', data: mechanic });
});
