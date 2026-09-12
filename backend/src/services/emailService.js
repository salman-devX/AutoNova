import { getResendClient, EMAIL_FROM } from '../config/email.js';

/** Wraps every send in a try/catch at the call site's discretion; this module never throws to callers by default. */
async function send({ to, subject, html }) {
  if (process.env.NODE_ENV === 'test' || process.env.EMAIL_DISABLED === 'true') {
    return { skipped: true };
  }
  const resend = getResendClient();
  return resend.emails.send({ from: EMAIL_FROM, to, subject, html });
}

function layout(title, bodyHtml) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
      <h2 style="color:#0891b2">${title}</h2>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#64748b">AutoHubX Workshop Systems</p>
    </div>`;
}

async function sendAppointmentBooked({ appointment, service, workshop }) {
  return send({
    to: appointment.customerEmail, // populated by caller when available
    subject: 'Appointment request received',
    html: layout('Appointment Requested', `
      <p>We've received your request for <strong>${service.name}</strong> at ${workshop.name}
      on ${new Date(appointment.start).toLocaleString()}.</p>
      <p>You'll receive another email once it's confirmed.</p>`),
  }).catch(() => null);
}

async function sendAppointmentConfirmed({ to, appointment, service, workshop }) {
  return send({
    to,
    subject: 'Your appointment is confirmed',
    html: layout('Appointment Confirmed', `
      <p>Your appointment for <strong>${service.name}</strong> at ${workshop.name}
      on ${new Date(appointment.start).toLocaleString()} is confirmed.</p>`),
  }).catch(() => null);
}

async function sendServiceStatusUpdate({ to, statusLabel, vehicleLabel }) {
  return send({
    to,
    subject: `Service update: ${statusLabel}`,
    html: layout('Service Status Update', `<p>${vehicleLabel} is now <strong>${statusLabel}</strong>.</p>`),
  }).catch(() => null);
}

async function sendVehicleReady({ to, vehicleLabel, workshop }) {
  return send({
    to,
    subject: 'Your vehicle is ready for pickup',
    html: layout('Vehicle Ready', `<p>${vehicleLabel} is ready for pickup at ${workshop.name}.</p>`),
  }).catch(() => null);
}

async function sendInvoiceGenerated({ to, invoice }) {
  return send({
    to,
    subject: `Invoice ${invoice.invoiceNumber}`,
    html: layout('Invoice Generated', `
      <p>Invoice <strong>${invoice.invoiceNumber}</strong> has been generated. Total due: ${invoice.total}.</p>`),
  }).catch(() => null);
}

export const emailService = {
  sendAppointmentBooked,
  sendAppointmentConfirmed,
  sendServiceStatusUpdate,
  sendVehicleReady,
  sendInvoiceGenerated,
};
