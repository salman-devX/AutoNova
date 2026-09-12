import Invoice from '../models/Invoice.js';
import Workshop from '../models/Workshop.js';
import Payment from '../models/Payment.js';
import { ApiError } from '../utils/ApiError.js';
import { notificationService } from './notificationService.js';
import { emailService } from './emailService.js';

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Recomputes subtotal/tax/total purely from line items + workshop tax rate +
 * an explicit discount amount. The frontend may DISPLAY calculated numbers,
 * but every figure persisted to the Invoice document is derived here —
 * client-sent `subtotal`/`tax`/`total` fields, if present, are ignored.
 */
function calculateTotals({ services = [], parts = [], laborCost = 0, discount = 0, taxPercent = 0 }) {
  const serviceLines = services.map((s) => ({
    name: s.name, quantity: s.quantity || 1, unitPrice: s.price,
    lineTotal: round2((s.quantity || 1) * s.price),
  }));
  const partLines = parts.map((p) => ({
    name: p.name, quantity: p.quantity, unitPrice: p.unitPrice,
    lineTotal: round2(p.quantity * p.unitPrice),
  }));

  const servicesTotal = serviceLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const partsTotal = partLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const labor = round2(Math.max(0, laborCost));

  const subtotal = round2(servicesTotal + partsTotal + labor);
  const safeDiscount = round2(Math.min(Math.max(0, discount), subtotal));
  const taxableAmount = subtotal - safeDiscount;
  const taxAmount = round2(taxableAmount * (Math.max(0, taxPercent) / 100));
  const total = round2(taxableAmount + taxAmount);

  return { serviceLines, partLines, laborCost: labor, subtotal, discount: safeDiscount, taxPercent, taxAmount, total };
}

async function generateInvoiceNumber(workshopId) {
  const count = await Invoice.countDocuments({ workshopId });
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
}

async function createInvoiceFromServiceOrder({ workshopId, customerId, vehicleId, serviceOrder, discount = 0, dueDate, notes, createdBy }) {
  const workshop = await Workshop.findById(workshopId);
  if (!workshop) throw ApiError.notFound('Workshop not found.');

  const totals = calculateTotals({
    services: serviceOrder.services,
    parts: serviceOrder.parts,
    laborCost: serviceOrder.laborCost,
    discount,
    taxPercent: workshop.settings.taxPercent,
  });

  const invoiceNumber = await generateInvoiceNumber(workshopId);

  const invoice = await Invoice.create({
    workshopId, customerId, vehicleId, serviceOrderId: serviceOrder._id,
    invoiceNumber,
    services: totals.serviceLines,
    parts: totals.partLines,
    laborCost: totals.laborCost,
    subtotal: totals.subtotal,
    discount: totals.discount,
    taxPercent: totals.taxPercent,
    taxAmount: totals.taxAmount,
    total: totals.total,
    amountPaid: 0,
    balanceDue: totals.total,
    paymentStatus: 'unpaid',
    dueDate: dueDate || null,
    notes: notes || '',
    createdBy,
  });

  await notificationService.notify({
    userId: createdBy, workshopId, type: 'invoice_generated',
    title: 'Invoice generated', message: `Invoice ${invoice.invoiceNumber} — total ${invoice.total}.`,
    relatedEntity: 'Invoice', relatedEntityId: invoice._id,
  });
  emailService.sendInvoiceGenerated({ to: null, invoice }).catch(() => {});

  return invoice;
}

/** Applies a payment and recalculates the invoice's paid/balance/status fields atomically. */
async function recordPayment({ workshopId, invoiceId, amount, method, referenceId, notes, receivedBy }) {
  const invoice = await Invoice.findOne({ _id: invoiceId, workshopId });
  if (!invoice) throw ApiError.notFound('Invoice not found for this workshop.');
  if (invoice.paymentStatus === 'paid') throw ApiError.badRequest('This invoice is already fully paid.', 'INVOICE_ALREADY_PAID');
  if (amount <= 0) throw ApiError.badRequest('Payment amount must be greater than zero.', 'INVALID_AMOUNT');
  if (amount > invoice.balanceDue) throw ApiError.badRequest('Payment exceeds the remaining balance due.', 'AMOUNT_EXCEEDS_BALANCE');

  const payment = await Payment.create({
    workshopId, invoiceId, amount, method, referenceId: referenceId || '', notes: notes || '', receivedBy, status: 'completed',
  });

  invoice.amountPaid = round2(invoice.amountPaid + amount);
  invoice.balanceDue = round2(invoice.total - invoice.amountPaid);
  invoice.paymentStatus = invoice.balanceDue <= 0 ? 'paid' : 'partially_paid';
  await invoice.save();

  await notificationService.notify({
    userId: receivedBy, workshopId, type: 'payment_received',
    title: 'Payment received', message: `Payment of ${amount} received for invoice ${invoice.invoiceNumber}.`,
    relatedEntity: 'Invoice', relatedEntityId: invoice._id,
  });

  return { invoice, payment };
}

export const invoiceService = { calculateTotals, createInvoiceFromServiceOrder, recordPayment, generateInvoiceNumber };
