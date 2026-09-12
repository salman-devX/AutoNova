import Service from '../models/Service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const listServices = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const workshopId = req.tenantId || req.query.workshopId;
  if (!workshopId) throw ApiError.badRequest('workshopId is required.', 'WORKSHOP_REQUIRED');

  const filter = { workshopId, isActive: true };
  if (req.query.category) filter.category = req.query.category;

  const [data, total] = await Promise.all([
    Service.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Service.countDocuments(filter),
  ]);
  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const createService = asyncHandler(async (req, res) => {
  const service = await Service.create({ ...req.body, workshopId: req.tenantId });
  return sendSuccess(res, { statusCode: 201, message: 'Service created', data: service });
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findOneAndUpdate(
    { _id: req.params.id, workshopId: req.tenantId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!service) throw ApiError.notFound('Service not found.');
  return sendSuccess(res, { message: 'Service updated', data: service });
});

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findOneAndUpdate(
    { _id: req.params.id, workshopId: req.tenantId },
    { isActive: false },
    { new: true }
  );
  if (!service) throw ApiError.notFound('Service not found.');
  return sendSuccess(res, { message: 'Service removed', data: service });
});
