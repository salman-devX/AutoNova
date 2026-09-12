import Appointment from '../models/Appointment.js';
import Customer from '../models/Customer.js';
import { appointmentService } from '../services/appointmentService.js';
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

/** GET /api/appointments/availability */
export const getAvailability = asyncHandler(async (req, res) => {
  const { workshopId, serviceId, date, mechanicId } = req.query;
  const result = await appointmentService.getAvailability({ workshopId, serviceId, date, mechanicId });
  return sendSuccess(res, { data: result });
});

const APPOINTMENT_POPULATE = [
  { path: 'customerId', populate: { path: 'userId', select: 'name email phone' } },
  { path: 'vehicleId' },
  { path: 'serviceId' },
  { path: 'mechanicId', populate: { path: 'userId', select: 'name email' } },
];

export const listAppointments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query, ['start', 'createdAt'], 'start');

  const filter = {};
  if (req.user.role === 'customer') {
    filter.customerId = await resolveCustomerId(req);
  } else {
    if (!req.tenantId) throw ApiError.badRequest('workshopId is required.', 'WORKSHOP_REQUIRED');
    filter.workshopId = req.tenantId;
    if (req.query.mechanicId) filter.mechanicId = req.query.mechanicId;
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.date) {
    const d = new Date(req.query.date);
    filter.start = { $gte: new Date(d.setUTCHours(0, 0, 0, 0)), $lte: new Date(d.setUTCHours(23, 59, 59, 999)) };
  }

  const [data, total] = await Promise.all([
    Appointment.find(filter).populate(APPOINTMENT_POPULATE).sort(sort).skip(skip).limit(limit).lean(),
    Appointment.countDocuments(filter),
  ]);

  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const getAppointment = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === 'customer') filter.customerId = await resolveCustomerId(req);
  else filter.workshopId = req.tenantId;

  const appointment = await Appointment.findOne(filter).populate(APPOINTMENT_POPULATE);
  if (!appointment) throw ApiError.notFound('Appointment not found.');
  return sendSuccess(res, { data: appointment });
});

export const createAppointment = asyncHandler(async (req, res) => {
  const customerId = await resolveCustomerId(req);
  const appointment = await appointmentService.createAppointment({
    workshopId: req.body.workshopId,
    customerId,
    vehicleId: req.body.vehicleId,
    serviceId: req.body.serviceId,
    mechanicId: req.body.mechanicId,
    start: req.body.start,
    notes: req.body.notes,
    createdBy: req.user._id,
  });
  return sendSuccess(res, { statusCode: 201, message: 'Appointment requested', data: appointment });
});

export const confirmAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, workshopId: req.tenantId });
  if (!appointment) throw ApiError.notFound('Appointment not found.');
  const updated = await appointmentService.confirmAppointment(appointment, req.user._id);
  return sendSuccess(res, { message: 'Appointment confirmed', data: updated });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === 'customer') filter.customerId = await resolveCustomerId(req);
  else filter.workshopId = req.tenantId;

  const appointment = await Appointment.findOne(filter);
  if (!appointment) throw ApiError.notFound('Appointment not found.');
  const updated = await appointmentService.cancelAppointment(appointment, req.body.reason, req.user._id);
  return sendSuccess(res, { message: 'Appointment cancelled', data: updated });
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === 'customer') filter.customerId = await resolveCustomerId(req);
  else filter.workshopId = req.tenantId;

  const appointment = await Appointment.findOne(filter);
  if (!appointment) throw ApiError.notFound('Appointment not found.');
  const replacement = await appointmentService.rescheduleAppointment(appointment, req.body.start, req.user._id);
  return sendSuccess(res, { message: 'Appointment rescheduled', data: replacement });
});
