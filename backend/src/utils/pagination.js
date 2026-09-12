const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

/** Parses page/limit query params into safe, bounded values. */
export function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/** Builds the pagination metadata block returned alongside list data. */
export function buildPaginationMeta({ page, limit, total }) {
  return { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
}

/**
 * Whitelists a `sortBy` field against an allowed set to prevent
 * arbitrary/unsafe sort injection, and returns a Mongoose-compatible sort object.
 */
export function parseSort(query, allowedFields = ['createdAt'], defaultField = 'createdAt') {
  const field = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const order = query.sortOrder === 'asc' ? 1 : -1;
  return { [field]: order };
}

/** Runs a paginated Mongoose find + count in parallel and returns the envelope pieces. */
export async function paginateQuery(Model, filter, { page, limit, skip, sort, select, populate }) {
  const queryBuilder = Model.find(filter).sort(sort).skip(skip).limit(limit).lean();
  if (select) queryBuilder.select(select);
  if (populate) queryBuilder.populate(populate);

  const [data, total] = await Promise.all([queryBuilder, Model.countDocuments(filter)]);
  return { data, pagination: buildPaginationMeta({ page, limit, total }) };
}
