import Workshop from '../models/Workshop.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const listWorkshops = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const [data, total] = await Promise.all([
    Workshop.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Workshop.countDocuments(filter),
  ]);
  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const getWorkshop = asyncHandler(async (req, res) => {
  const workshop = await Workshop.findById(req.params.id);
  if (!workshop) throw ApiError.notFound('Workshop not found.');
  return sendSuccess(res, { data: workshop });
});

async function generateUniqueSlug(name) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workshop';
  let slug = base;
  let suffix = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Workshop.exists({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export const createWorkshop = asyncHandler(async (req, res) => {
  const { name, city, address, phone, email, ...rest } = req.body;
  const workshop = await Workshop.create({
    ...rest,
    name,
    phone,
    email,
    // The model requires a unique `slug` for internal routing — the client
    // never sends one, it's generated here from the name.
    slug: await generateUniqueSlug(name),
    // Accept either a flat `city` (what the admin form sends) or a full
    // nested `address` object.
    address: address || (city ? { city } : undefined),
  });
  return sendSuccess(res, { statusCode: 201, message: 'Workshop created', data: workshop });
});

export const updateWorkshop = asyncHandler(async (req, res) => {
  const { city, address, ...rest } = req.body;
  const updates = { ...rest };
  if (address) updates.address = address;
  else if (city) updates['address.city'] = city;

  const workshop = await Workshop.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
  if (!workshop) throw ApiError.notFound('Workshop not found.');
  return sendSuccess(res, { message: 'Workshop updated', data: workshop });
});

export const deleteWorkshop = asyncHandler(async (req, res) => {
  const workshop = await Workshop.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!workshop) throw ApiError.notFound('Workshop not found.');
  return sendSuccess(res, { message: 'Workshop deactivated', data: workshop });
});
