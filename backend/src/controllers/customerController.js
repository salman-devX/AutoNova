import Customer from '../models/Customer.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta, parseSort } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

/** Resolves the Customer document owned by the currently authenticated user. */
async function getOwnCustomerOrThrow(userId) {
  const customer = await Customer.findOne({ userId });
  if (!customer) throw ApiError.notFound('Customer profile not found.');
  return customer;
}

export const getMyCustomerProfile = asyncHandler(async (req, res) => {
  const customer = await getOwnCustomerOrThrow(req.user._id);
  return sendSuccess(res, { data: customer });
});

/** GET /api/customers — receptionist/admin, tenant + backend search/filter/pagination. */
export const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query, ['createdAt', 'name'], 'createdAt');
  const filter = { primaryWorkshopId: req.tenantId };
  if (req.query.status) filter.status = req.query.status;

  let userIdFilter = null;
  if (req.query.search) {
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ],
    }).select('_id');
    userIdFilter = matchingUsers.map((u) => u._id);
    filter.userId = { $in: userIdFilter };
  }

  const [data, total] = await Promise.all([
    Customer.find(filter).populate('userId', 'name email phone avatar').sort(sort).skip(skip).limit(limit).lean(),
    Customer.countDocuments(filter),
  ]);

  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, primaryWorkshopId: req.tenantId }).populate('userId', 'name email phone avatar');
  if (!customer) throw ApiError.notFound('Customer not found.');
  return sendSuccess(res, { data: customer });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const { phone, address, status, notes } = req.body;
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, primaryWorkshopId: req.tenantId },
    { $set: { ...(phone && { phone }), ...(address && { address }), ...(status && { status }), ...(notes !== undefined && { notes }) } },
    { new: true, runValidators: true }
  );
  if (!customer) throw ApiError.notFound('Customer not found.');
  return sendSuccess(res, { message: 'Customer updated', data: customer });
});
