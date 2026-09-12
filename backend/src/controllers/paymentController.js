import Payment from '../models/Payment.js';
import { invoiceService } from '../services/invoiceService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { workshopId: req.tenantId };
  if (req.query.invoiceId) filter.invoiceId = req.query.invoiceId;

  const [data, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Payment.countDocuments(filter),
  ]);
  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const createPayment = asyncHandler(async (req, res) => {
  const { invoiceId, amount, method, referenceId, notes } = req.body;
  const result = await invoiceService.recordPayment({
    workshopId: req.tenantId, invoiceId, amount, method, referenceId, notes, receivedBy: req.user._id,
  });
  return sendSuccess(res, { statusCode: 201, message: 'Payment recorded', data: result });
});
