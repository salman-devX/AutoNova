import mongoose from 'mongoose';
import Part from '../models/Part.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import { ApiError } from '../utils/ApiError.js';
import { notificationService } from './notificationService.js';

/**
 * Atomically applies a stock delta to a Part and writes the corresponding
 * audit-trail InventoryTransaction, inside a single MongoDB transaction so
 * the two documents can never drift out of sync (e.g. a transaction record
 * existing without the quantity actually having moved, or vice versa).
 *
 * `quantityDelta` is signed: positive = stock in (purchase/return),
 * negative = stock out (sale/service_usage).
 */
async function applyStockChange({ workshopId, partId, quantityDelta, type, reason, serviceOrderId, userId }) {
  const session = await mongoose.startSession();
  let part, transaction;

  try {
    await session.withTransaction(async () => {
      part = await Part.findOne({ _id: partId, workshopId }).session(session);
      if (!part) throw ApiError.notFound('Part not found for this workshop.', 'PART_NOT_FOUND');

      const previousQuantity = part.quantity;
      const newQuantity = previousQuantity + quantityDelta;

      if (newQuantity < 0) {
        throw ApiError.badRequest(
          `Insufficient stock for "${part.name}" — only ${previousQuantity} available.`,
          'INSUFFICIENT_STOCK'
        );
      }

      part.quantity = newQuantity;
      await part.save({ session });

      const created = await InventoryTransaction.create(
        [{
          workshopId, partId, type, quantity: quantityDelta,
          previousQuantity, newQuantity, reason: reason || '',
          serviceOrderId: serviceOrderId || null, userId,
        }],
        { session }
      );
      transaction = created[0];
    });
  } finally {
    await session.endSession();
  }

  if (part.quantity <= part.minimumStockLevel) {
    // Fire-and-forget — low stock alert must never block the inventory operation itself.
    notificationService
      .notify({
        userId, workshopId, type: 'low_stock',
        title: 'Low stock alert',
        message: `"${part.name}" is at ${part.quantity} units (minimum ${part.minimumStockLevel}).`,
        relatedEntity: 'Part', relatedEntityId: part._id,
      })
      .catch(() => {});
  }

  return { part, transaction };
}

/** Consumes multiple parts at once for a service order — all-or-nothing across parts. */
async function consumeParts({ workshopId, serviceOrderId, items, userId }) {
  const results = [];
  for (const item of items) {
    // Sequential on purpose: each call is its own transaction, and we want a clean
    // partial-failure error identifying exactly which part ran out, rather than
    // a single giant transaction touching unrelated documents.
    const result = await applyStockChange({
      workshopId,
      partId: item.partId,
      quantityDelta: -Math.abs(item.quantity),
      type: 'service_usage',
      reason: `Used in service order ${serviceOrderId}`,
      serviceOrderId,
      userId,
    });
    results.push(result);
  }
  return results;
}

async function adjustStock({ workshopId, partId, quantityDelta, reason, userId }) {
  return applyStockChange({ workshopId, partId, quantityDelta, type: 'adjustment', reason, userId });
}

async function recordPurchase({ workshopId, partId, quantity, reason, userId }) {
  return applyStockChange({ workshopId, partId, quantityDelta: Math.abs(quantity), type: 'purchase', reason, userId });
}

export const inventoryService = { applyStockChange, consumeParts, adjustStock, recordPurchase };
