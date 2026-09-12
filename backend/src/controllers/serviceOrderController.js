import ServiceOrder from '../models/ServiceOrder.js';
import Customer from '../models/Customer.js';
import Vehicle from '../models/Vehicle.js';
import Service from '../models/Service.js';
import { serviceOrderService } from '../services/serviceOrderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta, parseSort } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

async function resolveCustomerId(req) {
  if (req.user.role !== 'customer') return req.body.customerId || req.query.customerId;
  const customer = await Customer.findOne({ userId: req.user._id });
  if (!customer) throw ApiError.notFound('Customer profile not found.');
  return customer._id;
}

const SERVICE_ORDER_POPULATE = [
  { path: 'customerId', populate: { path: 'userId', select: 'name email phone' } },
  { path: 'vehicleId' },
  { path: 'assignedMechanics', populate: { path: 'userId', select: 'name email' } },
];

export const listServiceOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query, ['createdAt', 'status'], 'createdAt');

  const filter = {};
  if (req.user.role === 'customer') {
    filter.customerId = await resolveCustomerId(req);
  } else {
    if (!req.tenantId) throw ApiError.badRequest('workshopId is required.', 'WORKSHOP_REQUIRED');
    filter.workshopId = req.tenantId;
    if (req.user.role === 'mechanic') {
      const Mechanic = (await import('../models/Mechanic.js')).default;
      const mechanic = await Mechanic.findOne({ userId: req.user._id, workshopId: req.tenantId });
      filter.assignedMechanics = mechanic?._id;
    }
    if (req.query.mechanicId) filter.assignedMechanics = req.query.mechanicId;
  }
  if (req.query.status) filter.status = req.query.status;

  const [data, total] = await Promise.all([
    ServiceOrder.find(filter).populate(SERVICE_ORDER_POPULATE).sort(sort).skip(skip).limit(limit).lean(),
    ServiceOrder.countDocuments(filter),
  ]);

  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const getServiceOrder = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === 'customer') filter.customerId = await resolveCustomerId(req);
  else filter.workshopId = req.tenantId;

  const order = await ServiceOrder.findOne(filter).populate([...SERVICE_ORDER_POPULATE, { path: 'inspectionId' }]);
  if (!order) throw ApiError.notFound('Service order not found.');
  return sendSuccess(res, { data: order });
});

export const createServiceOrder = asyncHandler(async (req, res) => {
  
  const { customerId, vehicleId, appointmentId, complaint, services = [] } = req.body;

  const [vehicle, resolvedServices] = await Promise.all([
    Vehicle.findOne({ _id: vehicleId, workshopId: req.tenantId, customerId }),
    services.length ? Service.find({ _id: { $in: services.map((s) => s.serviceId) }, workshopId: req.tenantId }) : [],
  ]);
  if (!vehicle) throw ApiError.badRequest('Vehicle does not belong to this customer/workshop.', 'INVALID_VEHICLE');

  const serviceLines = resolvedServices.map((s) => ({ serviceId: s._id, name: s.name, price: s.price, quantity: 1 }));
  const estimatedCost = serviceLines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const order = await ServiceOrder.create({
    workshopId: req.tenantId, customerId, vehicleId, appointmentId: appointmentId || null,
    complaint: complaint || '', services: serviceLines, estimatedCost,
    createdBy: req.user._id,
    statusHistory: [{ status: 'booked', changedBy: req.user._id }],
  });
  if (appointmentId) {
    const Appointment = (await import('../models/Appointment.js')).default;
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'in-progress' });
  }
  return sendSuccess(res, { statusCode: 201, message: 'Service order created', data: order });
});

export const updateServiceOrder = asyncHandler(async (req, res) => {
  const allowedFields = ['diagnosis', 'notes', 'laborCost'];
  const updates = {};
  for (const field of allowedFields) if (req.body[field] !== undefined) updates[field] = req.body[field];

  const order = await ServiceOrder.findOneAndUpdate(
    { _id: req.params.id, workshopId: req.tenantId },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!order) throw ApiError.notFound('Service order not found.');
  return sendSuccess(res, { message: 'Service order updated', data: order });
});

export const updateServiceOrderStatus = asyncHandler(async (req, res) => {
  const order = await serviceOrderService.updateStatus({
    workshopId: req.tenantId, serviceOrderId: req.params.id, nextStatus: req.body.status, changedBy: req.user._id,
  });
  return sendSuccess(res, { message: `Status updated to "${order.status}"`, data: order });
});

export const addServiceOrderParts = asyncHandler(async (req, res) => {
  const order = await serviceOrderService.addParts({
    workshopId: req.tenantId, serviceOrderId: req.params.id, items: req.body.items, userId: req.user._id,
  });
  return sendSuccess(res, { message: 'Parts added to service order', data: order });
});

export const assignMechanics = asyncHandler(async (req, res) => {
  const order = await ServiceOrder.findOneAndUpdate(
    { _id: req.params.id, workshopId: req.tenantId },
    { $set: { assignedMechanics: req.body.mechanicIds } },
    { new: true, runValidators: true }
  ).populate('assignedMechanics');
  if (!order) throw ApiError.notFound('Service order not found.');
  return sendSuccess(res, { message: 'Mechanics assigned', data: order });
});
