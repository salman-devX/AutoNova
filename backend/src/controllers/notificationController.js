import Notification from '../models/Notification.js';
import { notificationService } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendList } from '../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const listMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { userId: req.user._id };
  if (req.query.unreadOnly === 'true') filter.read = false;

  const [data, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);
  return sendList(res, { data, pagination: buildPaginationMeta({ page, limit, total }) });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  if (!notification) throw ApiError.notFound('Notification not found.');
  return sendSuccess(res, { message: 'Notification marked as read', data: notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return sendSuccess(res, { message: 'All notifications marked as read' });
});
