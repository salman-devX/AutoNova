/** Standard single-resource success envelope. */
export function sendSuccess(res, { message = 'Success', data = null, statusCode = 200 } = {}) {
  return res.status(statusCode).json({ success: true, message, data });
}

/** Standard paginated list envelope. */
export function sendList(res, { data = [], pagination, message = 'Success' } = {}) {
  return res.status(200).json({ success: true, message, data, pagination });
}
