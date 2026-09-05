import { APP_CONFIG } from "./config.js";

export const SHIFT_INSTANCE = Object.freeze({
  shiftInstanceId: APP_CONFIG.shiftInstanceId,
  shiftId: APP_CONFIG.shiftId,
  shiftName: APP_CONFIG.shiftName,
  businessDate: APP_CONFIG.shiftBusinessDate,
  operationId: APP_CONFIG.operationId,
  timezone: APP_CONFIG.operationTimezone,
  utcOffset: APP_CONFIG.operationUtcOffset,
  startsAtLocal: APP_CONFIG.shiftStartLocal,
  endsAtLocal: APP_CONFIG.shiftEndLocal,
  startsAtUtc: new Date(APP_CONFIG.shiftStartLocal).toISOString(),
  endsAtUtc: new Date(APP_CONFIG.shiftEndLocal).toISOString()
});

function localDateString(date) {
  return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return localDateString(date);
}

export function resolveObservedTimestamp(timeValue, fallbackIso = new Date().toISOString()) {
  if (!timeValue) return {
    observedAt: fallbackIso,
    observedAtUtc: new Date(fallbackIso).toISOString(),
    localObservedDate: null,
    localObservedTime: null
  };

  const [startHour, startMinute] = APP_CONFIG.shiftStartLocal.slice(11, 16).split(":").map(Number);
  const [hour, minute] = String(timeValue).split(":").map(Number);
  const beforeShiftStart = hour < startHour || (hour === startHour && minute < startMinute);
  const localDate = beforeShiftStart ? addDays(APP_CONFIG.shiftBusinessDate, 1) : APP_CONFIG.shiftBusinessDate;
  const observedAt = `${localDate}T${String(timeValue).padEnd(5, "0")}:00${APP_CONFIG.operationUtcOffset}`;

  const instant = new Date(observedAt);
  const start = new Date(APP_CONFIG.shiftStartLocal);
  const end = new Date(APP_CONFIG.shiftEndLocal);
  if (instant < start || instant > end) {
    throw new Error("Observed time falls outside the configured shift instance.");
  }

  return {
    observedAt,
    observedAtUtc: instant.toISOString(),
    localObservedDate: localDate,
    localObservedTime: String(timeValue).slice(0, 5)
  };
}

export function shiftContains(timestamp) {
  const instant = new Date(timestamp);
  return instant >= new Date(APP_CONFIG.shiftStartLocal) && instant <= new Date(APP_CONFIG.shiftEndLocal);
}
