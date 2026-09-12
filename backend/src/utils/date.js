/** Adds minutes to a Date, returning a new Date. */
export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

/** True if two [start,end) time ranges overlap. */
export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/** Returns start-of-day and end-of-day Date objects (UTC) for a given date/string. */
export function dayBounds(dateInput) {
  const d = new Date(dateInput);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
  return { start, end };
}

/** Generates candidate slot start times between open/close hours at a fixed step. */
export function generateSlots({ date, openHour, closeHour, stepMinutes, durationMinutes }) {
  const { start } = dayBounds(date);
  const slots = [];
  let cursor = new Date(start.getTime() + openHour * 60 * 60000);
  const closeAt = new Date(start.getTime() + closeHour * 60 * 60000);

  while (addMinutes(cursor, durationMinutes) <= closeAt) {
    slots.push({ start: new Date(cursor), end: addMinutes(cursor, durationMinutes) });
    cursor = addMinutes(cursor, stepMinutes);
  }
  return slots;
}
