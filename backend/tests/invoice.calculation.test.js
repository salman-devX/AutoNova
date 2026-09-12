import { describe, it, expect } from 'vitest';
import { invoiceService } from '../src/services/invoiceService.js';

describe('invoiceService.calculateTotals', () => {
  it('computes subtotal, tax, and total purely from line items — never trusting client totals', () => {
    const result = invoiceService.calculateTotals({
      services: [{ name: 'General Service', price: 8500, quantity: 1 }],
      parts: [{ name: 'Oil Filter', unitPrice: 1200, quantity: 2 }],
      laborCost: 3000,
      discount: 500,
      taxPercent: 5,
    });

    // servicesTotal 8500 + partsTotal 2400 + labor 3000 = 13900 subtotal
    expect(result.subtotal).toBe(13900);
    // discount 500 -> taxable 13400 -> tax 5% = 670
    expect(result.discount).toBe(500);
    expect(result.taxAmount).toBe(670);
    expect(result.total).toBe(14070);
  });

  it('clamps a discount larger than the subtotal instead of producing a negative total', () => {
    const result = invoiceService.calculateTotals({
      services: [{ name: 'Oil Change', price: 1000, quantity: 1 }],
      parts: [],
      laborCost: 0,
      discount: 5000, // way more than subtotal
      taxPercent: 0,
    });

    expect(result.subtotal).toBe(1000);
    expect(result.discount).toBe(1000); // clamped
    expect(result.total).toBe(0);
  });

  it('ignores any client-supplied total/subtotal/tax fields entirely (they are simply not accepted as input)', () => {
    const maliciousInput = {
      services: [{ name: 'General Service', price: 8500, quantity: 1 }],
      parts: [],
      laborCost: 0,
      discount: 0,
      taxPercent: 0,
      // A malicious client might try to smuggle these in — calculateTotals's
      // signature doesn't even read them, so they can't influence the result.
      total: 1,
      subtotal: 1,
    };
    const result = invoiceService.calculateTotals(maliciousInput);
    expect(result.total).toBe(8500);
  });
});
