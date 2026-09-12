import Vehicle from '../models/Vehicle.js';
import Customer from '../models/Customer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Resolves the effective workshop + customer scope for a vehicle request:
 *  - customer: forced to their own Customer record, workshopId from it
 *  - receptionist/mechanic/admin: workshopId from req.tenantId, any customerId within it
 */
async function resolveScope(req) {
  if (req.user.role === 'customer') {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) throw ApiError.notFound('Customer profile not found.');
    return { workshopId: customer.primaryWorkshopId, customerId: customer._id, isSelf: true };
  }
  if (!req.tenantId) throw ApiError.badRequest('A workshopId is required.', 'WORKSHOP_REQUIRED');
  return { workshopId: req.tenantId, customerId: req.body.customerId || req.query.customerId, isSelf: false };
}

export const listVehicles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const scope = await resolveScope(req);

  const filter = { workshopId: scope.workshopId };
  if (scope.isSelf) filter.customerId = scope.customerId;
  else if (req.query.customerId) filter.customerId = req.query.customerId;
  if (req.query.search) filter.registrationNumber = { $regex: req.query.search, $options: 'i' };

  const [data, total] = await Promise.all([
    Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Vehicle.countDocuments(filter),
  ]);

  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const getVehicle = asyncHandler(async (req, res) => {
  const scope = await resolveScope(req);
  const filter = { _id: req.params.id, workshopId: scope.workshopId };
  if (scope.isSelf) filter.customerId = scope.customerId;

  const vehicle = await Vehicle.findOne(filter);
  if (!vehicle) throw ApiError.notFound('Vehicle not found.');
  return sendSuccess(res, { data: vehicle });
});

export const createVehicle = asyncHandler(async (req, res) => {
  const scope = await resolveScope(req);
  const customerId = scope.isSelf ? scope.customerId : req.body.customerId;
  if (!customerId) throw ApiError.badRequest('customerId is required.', 'CUSTOMER_REQUIRED');

  const vehicle = await Vehicle.create({
    workshopId: scope.workshopId,
    customerId,
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    registrationNumber: req.body.registrationNumber,
    vin: req.body.vin,
    mileage: req.body.mileage,
    color: req.body.color,
    notes: req.body.notes,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Vehicle added', data: vehicle });
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const scope = await resolveScope(req);
  const filter = { _id: req.params.id, workshopId: scope.workshopId };
  if (scope.isSelf) filter.customerId = scope.customerId;

  const allowedFields = ['make', 'model', 'year', 'mileage', 'color', 'notes', 'vin'];
  const updates = {};
  for (const field of allowedFields) if (req.body[field] !== undefined) updates[field] = req.body[field];

  const vehicle = await Vehicle.findOneAndUpdate(filter, { $set: updates }, { new: true, runValidators: true });
  if (!vehicle) throw ApiError.notFound('Vehicle not found.');
  return sendSuccess(res, { message: 'Vehicle updated', data: vehicle });
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const scope = await resolveScope(req);
  const filter = { _id: req.params.id, workshopId: scope.workshopId };
  if (scope.isSelf) filter.customerId = scope.customerId;

  const vehicle = await Vehicle.findOneAndUpdate(filter, { isActive: false }, { new: true });
  if (!vehicle) throw ApiError.notFound('Vehicle not found.');
  return sendSuccess(res, { message: 'Vehicle removed', data: vehicle });
});
