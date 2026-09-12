import Inspection from '../models/Inspection.js';
import ServiceOrder from '../models/ServiceOrder.js';
import { uploadService } from '../services/uploadService.js';
import { notificationService } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const listInspections = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { workshopId: req.tenantId };
  if (req.query.serviceOrderId) filter.serviceOrderId = req.query.serviceOrderId;

  const [data, total] = await Promise.all([
    Inspection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Inspection.countDocuments(filter),
  ]);
  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const getInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findOne({ _id: req.params.id, workshopId: req.tenantId });
  if (!inspection) throw ApiError.notFound('Inspection not found.');
  return sendSuccess(res, { data: inspection });
});

export const createInspection = asyncHandler(async (req, res) => {
  const Mechanic = (await import('../models/Mechanic.js')).default;
  const mechanic = await Mechanic.findOne({ userId: req.user._id, workshopId: req.tenantId });
  if (!mechanic) throw ApiError.forbidden('Only an assigned mechanic can record an inspection.');

  const order = await ServiceOrder.findOne({ _id: req.body.serviceOrderId, workshopId: req.tenantId });
  if (!order) throw ApiError.notFound('Service order not found.');

  let photos = [];
  if (req.files?.length) {
    const uploaded = await uploadService.uploadImages(req.files, 'inspections');
    photos = uploaded.map((u) => ({ url: u.url, publicId: u.publicId }));
  }

  const inspection = await Inspection.create({
    workshopId: req.tenantId,
    serviceOrderId: order._id,
    vehicleId: req.body.vehicleId,
    mechanicId: mechanic._id,
    items: req.body.items,
    recommendations: req.body.recommendations || '',
    photos,
  });

  order.inspectionId = inspection._id;
  await order.save();

  await notificationService.notify({
    userId: req.user._id, workshopId: req.tenantId, type: 'inspection_completed',
    title: 'Inspection recorded', message: 'A new inspection has been recorded.',
    relatedEntity: 'Inspection', relatedEntityId: inspection._id,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Inspection recorded', data: inspection });
});

export const updateInspection = asyncHandler(async (req, res) => {
  const allowedFields = ['items', 'recommendations', 'completedAt'];
  const updates = {};
  for (const field of allowedFields) if (req.body[field] !== undefined) updates[field] = req.body[field];

  const inspection = await Inspection.findOneAndUpdate(
    { _id: req.params.id, workshopId: req.tenantId },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!inspection) throw ApiError.notFound('Inspection not found.');
  return sendSuccess(res, { message: 'Inspection updated', data: inspection });
});
