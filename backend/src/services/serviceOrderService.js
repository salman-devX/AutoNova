import ServiceOrder, { STATUS_TRANSITIONS } from '../models/ServiceOrder.js';
import Part from '../models/Part.js';
import { ApiError } from '../utils/ApiError.js';
import { inventoryService } from './inventoryService.js';
import { notificationService } from './notificationService.js';
import { emailService } from './emailService.js';

const NOTIFICATION_BY_STATUS = {
  inspection: { type: 'inspection_started', title: 'Inspection started', message: 'Your vehicle inspection has started.' },
  in_progress: { type: 'service_started', title: 'Service started', message: 'Work has started on your vehicle.' },
  ready_for_pickup: { type: 'vehicle_ready', title: 'Vehicle ready', message: 'Your vehicle is ready for pickup.' },
  completed: { type: 'service_completed', title: 'Service completed', message: 'Your service has been completed.' },
};

/**
 * Validates a proposed status change against STATUS_TRANSITIONS (see model)
 * and applies it — this is the single gate that prevents e.g. jumping
 * directly from "booked" to "completed" or bouncing "completed" back to "pending".
 */
async function updateStatus({ workshopId, serviceOrderId, nextStatus, changedBy }) {
  const order = await ServiceOrder.findOne({ _id: serviceOrderId, workshopId });
  if (!order) throw ApiError.notFound('Service order not found for this workshop.');

  const allowed = STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw ApiError.badRequest(
      `Cannot move a service order from "${order.status}" to "${nextStatus}".`,
      'INVALID_STATUS_TRANSITION'
    );
  }

  order.status = nextStatus;
  order.statusHistory.push({ status: nextStatus, changedBy, changedAt: new Date() });
  await order.save();

  const notif = NOTIFICATION_BY_STATUS[nextStatus];
  if (notif) {
    await notificationService.notify({
      userId: changedBy, workshopId, ...notif,
      relatedEntity: 'ServiceOrder', relatedEntityId: order._id,
    });
    emailService.sendServiceStatusUpdate({ to: null, statusLabel: nextStatus, vehicleLabel: 'Your vehicle' }).catch(() => {});
  }

  return order;
}

/**
 * Adds/replaces the parts line-items on a service order AND consumes the
 * corresponding stock via inventoryService in the same logical operation,
 * so a service order can never show parts that were never actually deducted
 * from inventory (or vice versa).
 */
async function addParts({ workshopId, serviceOrderId, items, userId }) {
  const order = await ServiceOrder.findOne({ _id: serviceOrderId, workshopId });
  if (!order) throw ApiError.notFound('Service order not found for this workshop.');
  if (['completed', 'cancelled'].includes(order.status)) {
    throw ApiError.badRequest('Cannot add parts to a completed or cancelled service order.', 'INVALID_STATUS');
  }

  const partIds = items.map((i) => i.partId);
  const parts = await Part.find({ _id: { $in: partIds }, workshopId });
  if (parts.length !== partIds.length) {
    throw ApiError.badRequest('One or more parts do not belong to this workshop.', 'INVALID_PART');
  }
  const partMap = new Map(parts.map((p) => [p._id.toString(), p]));

  // Consume stock first — if any part has insufficient quantity, this throws
  // and nothing on the service order is modified (all-or-nothing per part call).
  await inventoryService.consumeParts({ workshopId, serviceOrderId, items, userId });

  const newLines = items.map((i) => {
    const part = partMap.get(i.partId.toString());
    return { partId: part._id, name: part.name, unitPrice: part.sellingPrice, quantity: i.quantity };
  });

  order.parts.push(...newLines);
  order.estimatedCost = computeEstimatedCost(order);
  await order.save();

  return order;
}

function computeEstimatedCost(order) {
  const servicesTotal = order.services.reduce((s, l) => s + l.price * l.quantity, 0);
  const partsTotal = order.parts.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  return servicesTotal + partsTotal + (order.laborCost || 0);
}

export const serviceOrderService = { updateStatus, addParts, computeEstimatedCost };
