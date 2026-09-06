import { APP_CONFIG } from "./config.js";
import { isEmployeeActive } from "./employeeMaster.js";

export function findEmployeeByNumber(state, employeeNumber) {
  return (state.employees || []).find(employee => employee.employeeNumber === String(employeeNumber).trim()) || null;
}

export function employeeById(state, employeeId) {
  return (state.employees || []).find(employee => employee.id === employeeId) || null;
}

export function authenticateEmployee(state, employeeNumber, pin) {
  const employee = findEmployeeByNumber(state, employeeNumber);
  if (!employee || !isEmployeeActive(employee)) return null;
  return employee.pin === String(pin).trim() ? employee : null;
}

export function attendanceFor(state, employeeId) {
  return (state.attendance || []).find(entry => entry.employeeId === employeeId && entry.shiftInstanceId === APP_CONFIG.shiftInstanceId) || null;
}

export function reportingObligations(state) {
  return (state.obligations || []).filter(item => item.reportingRequired && item.shiftInstanceId === APP_CONFIG.shiftInstanceId);
}

export function obligationFor(state, employeeId) {
  return reportingObligations(state).find(item => item.employeeId === employeeId) || null;
}

export function reportingEmployees(state) {
  const employeeIds = new Set(reportingObligations(state).map(item => item.employeeId));
  return (state.employees || []).filter(employee => employeeIds.has(employee.id));
}

export function submissionFor(state, employeeId) {
  const obligation = obligationFor(state, employeeId);
  if (!obligation) return null;
  return (state.submissions || []).find(submission => submission.obligationId === obligation.obligationId) || null;
}

export function overrideFor(state, employeeId) {
  const obligation = obligationFor(state, employeeId);
  if (!obligation) return null;
  return [...(state.overrides || [])].reverse().find(override => override.obligationId === obligation.obligationId) || null;
}

export function reportingStatus(state, employeeId) {
  const obligation = obligationFor(state, employeeId);
  if (!obligation) return "not_required";
  const submission = submissionFor(state, employeeId);
  if (submission?.status === "COMPLETE") return "complete";
  if (overrideFor(state, employeeId)) return "excused";
  return "outstanding";
}

export function mayClockOff(state, employeeId) {
  const attendance = attendanceFor(state, employeeId);
  if (!attendance?.clockedIn) {
    return { allowed: true, reason: "Employee is not currently clocked in.", code: "NOT_CLOCKED_IN" };
  }

  const obligation = obligationFor(state, employeeId);
  if (!obligation) {
    return { allowed: false, reason: "Clock-in exists but no reporting obligation was generated. Supervisor review is required.", code: "OBLIGATION_MISSING" };
  }

  const status = reportingStatus(state, employeeId);
  if (status === "complete") {
    return { allowed: true, reason: "Required shift report is complete.", code: "REPORT_COMPLETE" };
  }
  if (status === "excused") {
    return { allowed: true, reason: "Supervisor-authorised reporting override is recorded.", code: "OVERRIDE_APPROVED" };
  }
  return { allowed: false, reason: "Required shift report is still outstanding.", code: "REPORT_OUTSTANDING" };
}

export function currentShiftObservations(state) {
  return (state.observations || [])
    .filter(observation => observation.shiftInstanceId === APP_CONFIG.shiftInstanceId)
    .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
}

export function currentIssues(state) {
  return (state.issues || [])
    .filter(issue => issue.operationId === APP_CONFIG.operationId)
    .sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt));
}

export function openIssues(state) {
  return currentIssues(state).filter(issue => !["RESOLVED", "CLOSED"].includes(issue.currentStatus));
}

export function observationById(state, observationId) {
  return (state.observations || []).find(item => item.observationId === observationId) || null;
}
