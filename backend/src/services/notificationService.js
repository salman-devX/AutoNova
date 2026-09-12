import Notification from '../models/Notification.js';

async function notify({ userId, workshopId, type, title, message, relatedEntity, relatedEntityId }) {
  return Notification.create({ userId, workshopId, type, title, message, relatedEntity, relatedEntityId: relatedEntityId || null });
}

/** Notifies every active receptionist/admin in a workshop — used for e.g. low-stock alerts. */
async function notifyWorkshopStaff({ workshopId, staffUserIds, type, title, message, relatedEntity, relatedEntityId }) {
  const docs = staffUserIds.map((userId) => ({
    userId, workshopId, type, title, message, relatedEntity, relatedEntityId: relatedEntityId || null,
  }));
  if (docs.length) return Notification.insertMany(docs);
  return [];
}

async function markAsRead(notificationId, userId) {
  return Notification.findOneAndUpdate({ _id: notificationId, userId }, { read: true }, { new: true });
}

async function markAllAsRead(userId) {
  return Notification.updateMany({ userId, read: false }, { read: true });
}

export const notificationService = { notify, notifyWorkshopStaff, markAsRead, markAllAsRead };
