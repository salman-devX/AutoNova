# AutoHubX Backend (Phase 2)

Production-oriented REST API for **AutoHubX** — a multi-workshop Car Service Center
Management System. Built with Node.js, Express, MongoDB/Mongoose, Firebase Authentication,
Cloudinary, Cloudflare Turnstile, and Resend.

> Pairs with the AutoNova frontend (Phase 1). Every mock service in the frontend
> (`src/services/*.js`) maps 1:1 to a route group documented below.

---

## 1. Architecture

```
AutoNova Frontend (React)
        ↓ HTTPS + Firebase ID token
AutoHubX Express API
        ↓
 ┌────────────────────────────┐
 │ authenticate (Firebase)    │
 │ resolveTenant (workshopId) │
 │ authorize (role)           │
 │ validate (express-validator)│
 └────────────────────────────┘
        ↓
Controllers (thin) → Services (business logic) → Mongoose Models → MongoDB
        ↓
External services: Firebase Admin · Cloudinary · Cloudflare Turnstile · Resend
```

```
src/
├── config/       db, firebase, cloudinary, email, turnstile
├── models/       14 Mongoose schemas (see §3)
├── middleware/   authenticate, authorize, tenant, validate, errorHandler, rateLimiter, upload, turnstile
├── services/     appointmentService, inventoryService, invoiceService, serviceOrderService,
│                 notificationService, emailService, uploadService, reportService
├── controllers/  thin HTTP layer — no business logic lives here
├── routes/       one router per resource, mounted in routes/index.js
├── validators/   express-validator chains per resource
├── utils/        ApiError, asyncHandler, pagination, response, date, permissions
├── app.js        Express app assembly (security middleware, routes, error handling)
└── server.js     boot + graceful shutdown
```

---

## 2. Local Development

```bash
npm install
cp .env.example .env      # fill in real credentials — see §9
npm run seed               # optional demo data (safe, no real secrets)
npm run dev                 # http://localhost:5000
npm test                    # vitest — see §11 for a sandbox network note
```

**Important — MongoDB replica set required.** Appointment booking, inventory
consumption, and invoice/payment updates use multi-document transactions
(`session.withTransaction`), which MongoDB only supports on a replica set —
a lone standalone `mongod` will throw. MongoDB Atlas is a replica set by
default, so this "just works" in production. For local development either:
- point `MONGODB_URI` at a free MongoDB Atlas cluster (recommended), or
- run a local single-node replica set: `mongod --replSet rs0` then `mongosh --eval "rs.initiate()"`.

---

## 3. Database Models & Relationships

| Model | Key relationships | Notable indexes |
|---|---|---|
| `Workshop` | tenant root | `slug` unique |
| `User` | mirrors Firebase identity; `workshopId` for staff | `firebaseUid` unique |
| `Customer` | 1:1 `User`, scoped to `primaryWorkshopId` | `primaryWorkshopId + status` |
| `Vehicle` | belongs to `Customer` + `Workshop` | `workshopId + registrationNumber` **unique** |
| `Service` | workshop's catalog | `workshopId + isActive` |
| `Mechanic` | 1:1 `User`, belongs to `Workshop` | `workshopId + isActive` |
| `Appointment` | `Customer`, `Vehicle`, `Service`, optional `Mechanic` | see §5 (double-booking) |
| `ServiceOrder` | central workflow entity; embeds service/part line-item snapshots | `workshopId + status`, `+ assignedMechanics` |
| `Inspection` | belongs to one `ServiceOrder` | `workshopId + serviceOrderId` |
| `Part` | inventory catalog item | `workshopId + sku` unique |
| `InventoryTransaction` | full audit trail of every stock change | `workshopId + partId + createdAt` |
| `Invoice` | generated from a `ServiceOrder`; totals are server-calculated | `workshopId + invoiceNumber` unique |
| `Payment` | applied against an `Invoice` | `workshopId + invoiceId` |
| `Notification` | per-user, per-workshop | `userId + read + createdAt` |

**Why embed vs. reference:** `ServiceOrder.services` / `.parts` and `Invoice.services` / `.parts`
are embedded **price snapshots**, not live references — so a later price change to a
`Service`/`Part` never silently rewrites historical orders/invoices. Everything else
(customer, vehicle, mechanic, workshop) is referenced because those entities are
looked up, filtered, and reused independently across many documents.

---

## 4. Authentication Flow

```
Frontend: Firebase signInWithEmailAndPassword() / signInWithPopup(GoogleAuthProvider)
    ↓ user.getIdToken()
Frontend: Authorization: Bearer <idToken>  on every API request
    ↓
Backend `authenticate` middleware:
  1. verifies the token via firebase-admin (config/firebase.js)
  2. looks up the matching User by the verified firebaseUid
  3. attaches the MongoDB User (with role + workshopId) to req.user
```

The frontend **never sends a role**; the backend never trusts one even if it did.
Role and workshop context always come from the verified token → MongoDB lookup.

`POST /api/auth/register` is called once, right after Firebase sign-up, to create the
matching MongoDB `User` (+ `Customer` profile). Staff accounts (receptionist/mechanic/admin)
are provisioned by an admin via `POST /api/users/staff`, not self-registration.

---

## 5. Double-Booking Prevention

Two layers, both required:

1. **Transactional overlap check** (`services/appointmentService.js`) — inside a MongoDB
   session transaction, re-queries for any overlapping *active* appointment for the
   target mechanic immediately before inserting, closing the "check availability,
   then insert" race window.
2. **Partial unique index** on `Appointment { workshopId, mechanicId, start }`
   (`models/Appointment.js`), scoped to active statuses only. Even if two transactions
   somehow interleave, the database itself rejects the second insert with `E11000`,
   which the global error handler converts to `409 APPOINTMENT_CONFLICT`.

See `tests/appointment.conflict.test.js` for the mandatory concurrency test — two
simultaneous booking requests for the same mechanic/slot; exactly one succeeds.

---

## 6. Multi-Tenant Isolation

`middleware/tenant.js` resolves a trusted `req.tenantId`:
- receptionist/mechanic: **forced** to their own `user.workshopId` — any `workshopId`
  in the request body/query is ignored for scoping.
- admin: may explicitly pass `?workshopId=` to view a specific workshop.
- customer: no single tenant; access is scoped by **ownership** (`customerId`) instead.

Every tenant-sensitive controller query includes `workshopId: req.tenantId` (or the
resolved `customerId` for customer-owned resources) — never a client-supplied ID
outside that resolution. See `tests/tenant.isolation.test.js`.

---

## 7. Inventory & Invoice Integrity

- `inventoryService.applyStockChange` wraps the `Part.quantity` update and the
  `InventoryTransaction` audit record in **one MongoDB transaction** — they can never
  drift apart. Negative resulting stock throws `INSUFFICIENT_STOCK` (409/400) instead
  of silently going negative.
- `invoiceService.calculateTotals` is a **pure function** computing subtotal → discount
  → tax → total purely from line items + the workshop's tax rate. Client-sent
  `subtotal`/`tax`/`total` fields are never read. See `tests/invoice.calculation.test.js`.

---

## 8. API Overview

Base URL: `/api`. Full request/response examples for every route are inline as JSDoc
comments in each controller. Response envelope:

```json
{ "success": true, "message": "...", "data": {...} }
{ "success": true, "data": [...], "pagination": { "page":1,"limit":20,"total":120,"pages":6 } }
{ "success": false, "message": "...", "code": "APPOINTMENT_CONFLICT" }
```

| Resource | Base route | Notes |
|---|---|---|
| Auth | `/api/auth` | `register`, `me` |
| Users | `/api/users` | `me` (patch), admin staff management |
| Customers | `/api/customers` | `me`, list/get/update (receptionist/admin) |
| Vehicles | `/api/vehicles` | owner-safe CRUD |
| Workshops | `/api/workshops` | admin-managed |
| Appointments | `/api/appointments` | `/availability`, create, confirm, cancel, reschedule |
| Service Orders | `/api/service-orders` | `/status`, `/parts`, `/assign-mechanics` |
| Services | `/api/services` | catalog CRUD |
| Mechanics | `/api/mechanics` | roster |
| Inspections | `/api/inspections` | multipart photo upload |
| Parts | `/api/parts` | catalog CRUD + search |
| Inventory | `/api/inventory` | `/transactions`, `/adjust` |
| Invoices | `/api/invoices` | generated from a service order |
| Payments | `/api/payments` | applied to an invoice |
| Notifications | `/api/notifications` | list, mark read |
| Dashboard | `/api/dashboard` | `/admin`, `/receptionist`, `/mechanic`, `/customer` |
| Health | `GET /api/health` | status + DB connectivity, no sensitive detail |

All list endpoints support `?page=&limit=&sortBy=&sortOrder=` with whitelisted sort
fields (see `utils/pagination.js`) and are pagination-capped at 100/page.

---

## 9. Environment Variables

See `.env.example` for the full list (Mongo, Firebase Admin, Cloudinary, Turnstile,
Resend, `FRONTEND_URL` for CORS). `TURNSTILE_DISABLED=true` and `EMAIL_DISABLED=true`
are dev/test-only escape hatches — never set them in production.

---

## 10. Security Checklist

- Firebase ID token verified on every protected route (never trusts client-sent identity/role)
- Role-based authorization (`authorize(...)`) on every mutating route
- Tenant + ownership scoping on every query touching workshop/customer data
- express-validator on all mutating request bodies/params/query
- `express-mongo-sanitize` strips `$`/`.` operators from input (NoSQL injection)
- `helmet` secure headers, strict CORS allow-list via `FRONTEND_URL`
- Tiered rate limiting (global, auth, appointment booking, uploads)
- Cloudflare Turnstile verified server-side on registration/booking
- Multer file-type/size validation before any Cloudinary upload
- Centralized error handler never leaks stack traces/secrets in production

---

## 11. Testing

```bash
npm test
```

- `tests/invoice.calculation.test.js` — **pure unit test, no DB required.** Verified
  passing in this repository (`3 passed`).
- `tests/appointment.conflict.test.js` — mandatory double-booking concurrency test
- `tests/tenant.isolation.test.js` — cross-workshop and cross-customer access rejection
- `tests/auth.test.js` — authentication/authorization middleware (mocked Firebase verification)

The three DB-backed suites use `mongodb-memory-server` to spin up a real single-node
replica set (required for transactions — see §2). **Note:** in the sandbox this project
was built in, outbound network access is restricted to package registries, so the
Mongo test binary could not be downloaded and these three suites could not be executed
here — this was verified directly (`Status Code 403` from `fastdl.mongodb.org`). They
will run normally in any environment with standard internet access, or you can point
them at a real MongoDB Atlas replica set instead (see comments in `tests/setup.js`).

---

## 12. Known Limitations

- Online payment gateway integration is scaffolded (`Payment.method: "online"`) but not
  wired to a real provider — architecture supports adding one without a model change.
- WhatsApp/SMS notifications, real-time (WebSocket) updates, and background jobs are
  not implemented — the notification/service-layer separation makes them additive.
- `POST /api/users/staff` assumes the Firebase account already exists (created via the
  Firebase console, admin SDK invite flow, or the person signing up first); it does not
  itself create Firebase accounts.
- Admin cross-workshop reporting is per-workshop (`?workshopId=`) rather than a single
  aggregated multi-workshop view — straightforward to add via an additional aggregation
  once multi-workshop admin UX is defined.

---

## 13. Deployment

- **API**: Render / Railway (Node web service) — set all `.env.example` vars, `NODE_ENV=production`
- **Database**: MongoDB Atlas (replica set — required, see §2)
- **Auth**: Firebase project (production config)
- **Images**: Cloudinary
- **Email**: Resend (verify sending domain)
- **Bot protection**: Cloudflare Turnstile (production site key/secret)

Confirm before going live: `TURNSTILE_DISABLED` and `EMAIL_DISABLED` are unset/false,
`FRONTEND_URL` matches the deployed frontend origin exactly, and `NODE_ENV=production`
(suppresses stack traces in error responses).
