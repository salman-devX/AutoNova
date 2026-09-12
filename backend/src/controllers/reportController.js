import Customer from '../models/Customer.js';
import { reportService } from '../services/reportService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';

export const getAdminDashboard = asyncHandler(async (req, res) => {
  if (!req.tenantId) throw ApiError.badRequest('workshopId is required.', 'WORKSHOP_REQUIRED');
  const data = await reportService.getAdminDashboard(req.tenantId);
  return sendSuccess(res, { data });
});

export const getReceptionistDashboard = asyncHandler(async (req, res) => {
  const data = await reportService.getReceptionistDashboard(req.tenantId);
  return sendSuccess(res, { data });
});

export const getMechanicDashboard = asyncHandler(async (req, res) => {
  const data = await reportService.getMechanicDashboard(req.tenantId, req.user._id);
  return sendSuccess(res, { data });
});

export const getCustomerDashboard = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ userId: req.user._id });
  if (!customer) throw ApiError.notFound('Customer profile not found.');
  const data = await reportService.getCustomerDashboard(customer._id);
  return sendSuccess(res, { data });
});
