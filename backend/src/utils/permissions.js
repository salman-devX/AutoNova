export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  RECEPTIONIST: 'receptionist',
  MECHANIC: 'mechanic',
  ADMIN: 'admin',
});

/**
 * Coarse feature-level permission map, mirroring the PDF's permission table.
 * Fine-grained ownership/tenant checks still happen in the service layer —
 * this only decides whether a role may reach an endpoint at all.
 */
export const PERMISSIONS = Object.freeze({
  MANAGE_OWN_VEHICLES: [ROLES.CUSTOMER, ROLES.ADMIN],
  BOOK_APPOINTMENT: [ROLES.CUSTOMER, ROLES.RECEPTIONIST, ROLES.ADMIN],
  MANAGE_APPOINTMENTS: [ROLES.RECEPTIONIST, ROLES.ADMIN],
  MANAGE_SERVICE_ORDERS: [ROLES.RECEPTIONIST, ROLES.MECHANIC, ROLES.ADMIN],
  MANAGE_MECHANICS: [ROLES.ADMIN],
  MANAGE_INVENTORY: [ROLES.RECEPTIONIST, ROLES.ADMIN],
  VIEW_INVOICES: [ROLES.CUSTOMER, ROLES.RECEPTIONIST, ROLES.ADMIN],
  MANAGE_WORKSHOPS: [ROLES.ADMIN],
  MANAGE_CUSTOMERS: [ROLES.RECEPTIONIST, ROLES.ADMIN],
  MANAGE_SERVICES: [ROLES.ADMIN],
  MANAGE_INSPECTIONS: [ROLES.MECHANIC, ROLES.ADMIN],
  VIEW_REPORTS: [ROLES.ADMIN],
});

export function isRoleAllowed(role, permission) {
  return PERMISSIONS[permission]?.includes(role) ?? false;
}
