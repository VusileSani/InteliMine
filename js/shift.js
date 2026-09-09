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
function usableShift(shift) {
  return shift && shift.businessDate && shift.startsAtLocal && shift.endsAtLocal ? shift : SHIFT_INSTANCE;
}

export function resolveObservedTimestamp(timeValue, fallbackIso = new Date().toISOString(), shiftInstance = SHIFT_INSTANCE) {
  const shift = usableShift(shiftInstance);
  if (!timeValue) return {
    observedAt: fallbackIso,
    observedAtUtc: new Date(fallbackIso).toISOString(),
    localObservedDate: null,
    localObservedTime: null
  };

  const [startHour, startMinute] = String(shift.startsAtLocal).slice(11, 16).split(":").map(Number);
  const [hour, minute] = String(timeValue).split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) throw new Error("Observed time is invalid.");
  const beforeShiftStart = hour < startHour || (hour === startHour && minute < startMinute);
  const localDate = beforeShiftStart ? addDays(shift.businessDate, 1) : shift.businessDate;
  const offset = shift.utcOffset || APP_CONFIG.operationUtcOffset;
  const observedAt = `${localDate}T${String(timeValue).slice(0,5)}:00${offset}`;

  const instant = new Date(observedAt);
  const start = new Date(shift.startsAtLocal);
  const end = new Date(shift.endsAtLocal);
  if (!Number.isFinite(instant.getTime()) || instant < start || instant > end) {
    throw new Error("Observed time falls outside the assigned shift instance.");
  }
  return { observedAt, observedAtUtc: instant.toISOString(), localObservedDate: localDate, localObservedTime:String(timeValue).slice(0,5) };
}

export function shiftContains(timestamp, shiftInstance = SHIFT_INSTANCE) {
  const shift = usableShift(shiftInstance);
  const instant = new Date(timestamp);
  return instant >= new Date(shift.startsAtLocal) && instant <= new Date(shift.endsAtLocal);
}
