import Invoice from '../models/Invoice.js';
import ServiceOrder from '../models/ServiceOrder.js';
import Customer from '../models/Customer.js';
import { invoiceService } from '../services/invoiceService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

async function resolveCustomerId(req) {
  if (req.user.role !== 'customer') return null;
  const customer = await Customer.findOne({ userId: req.user._id });
  if (!customer) throw ApiError.notFound('Customer profile not found.');
  return customer._id;
}

export const listInvoices = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.user.role === 'customer') filter.customerId = await resolveCustomerId(req);
  else {
    if (!req.tenantId) throw ApiError.badRequest('workshopId is required.', 'WORKSHOP_REQUIRED');
    filter.workshopId = req.tenantId;
  }
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const [data, total] = await Promise.all([
    Invoice.find(filter).populate('customerId vehicleId').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Invoice.countDocuments(filter),
  ]);
  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === 'customer') filter.customerId = await resolveCustomerId(req);
  else filter.workshopId = req.tenantId;

  const invoice = await Invoice.findOne(filter).populate('customerId vehicleId serviceOrderId');
  if (!invoice) throw ApiError.notFound('Invoice not found.');
  return sendSuccess(res, { data: invoice });
});

/** POST /api/invoices — generates from a service order; all totals computed server-side. */
export const createInvoice = asyncHandler(async (req, res) => {
  const order = await ServiceOrder.findOne({ _id: req.body.serviceOrderId, workshopId: req.tenantId });
  if (!order) throw ApiError.notFound('Service order not found.');

  const invoice = await invoiceService.createInvoiceFromServiceOrder({
    workshopId: req.tenantId,
    customerId: order.customerId,
    vehicleId: order.vehicleId,
    serviceOrder: order,
    discount: req.body.discount || 0,
    dueDate: req.body.dueDate,
    notes: req.body.notes,
    createdBy: req.user._id,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Invoice generated', data: invoice });
});
