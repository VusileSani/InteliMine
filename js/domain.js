import { EMPLOYEES, DEMO_ATTENDANCE } from "./demoData.js";
import { APP_CONFIG } from "./config.js";

export function findEmployeeByNumber(employeeNumber) {
  return EMPLOYEES.find(employee => employee.employeeNumber === String(employeeNumber).trim()) || null;
}

export function authenticateEmployee(employeeNumber, pin) {
  const employee = findEmployeeByNumber(employeeNumber);
  if (!employee || !employee.active) return null;
  return employee.pin === String(pin).trim() ? employee : null;
}

export function attendanceFor(employeeId) {
  return DEMO_ATTENDANCE.find(entry => entry.employeeId === employeeId) || null;
}

export function submissionFor(state, employeeId) {
  return state.submissions.find(submission => submission.employeeId === employeeId) || null;
}

export function overrideFor(state, employeeId) {
  return [...state.overrides].reverse().find(override => override.employeeId === employeeId && override.shiftId === APP_CONFIG.shiftId) || null;
}

export function reportingStatus(state, employeeId) {
  const submission = submissionFor(state, employeeId);
  if (submission?.status === "complete") return "complete";
  if (overrideFor(state, employeeId)) return "excused";
  return "outstanding";
}

export function mayClockOff(state, employeeId) {
  const attendance = attendanceFor(employeeId);
  if (!attendance?.clockedIn) {
    return { allowed: true, reason: "Employee is not currently clocked in." };
  }

  const status = reportingStatus(state, employeeId);
  if (status === "complete") {
    return { allowed: true, reason: "Required shift report is complete." };
  }
  if (status === "excused") {
    return { allowed: true, reason: "Supervisor-authorised reporting override is recorded." };
  }
  return { allowed: false, reason: "Required shift report is still outstanding." };
}

export function buildOperationalEvents(state) {
  return state.submissions
    .filter(submission => submission.status === "complete")
    .flatMap(submission => {
      const employee = EMPLOYEES.find(item => item.id === submission.employeeId);
      if (!employee) return [];
      const answers = submission.answers || {};
      const events = [];

      const push = (severity, category, title, detail) => {
        if (!detail) return;
        events.push({
          employeeId: employee.id,
          employeeName: employee.name,
          role: employee.role,
          severity,
          category,
          title,
          detail,
          completedAt: submission.completedAt
        });
      };

      if (answers.equipmentConcern === "yes") push("medium", "Equipment", answers.equipmentWorkedOn || "Equipment concern", answers.equipmentCondition);
      if (answers.electricalConcern === "yes") push("medium", "Electrical", answers.equipmentWorkedOn || "Electrical concern", answers.electricalCondition);
      if (answers.hazardsObserved === "yes") push("high", "Safety", "Hazard reported", answers.hazardDetails);
      if (answers.incidentOrNearMiss === "yes") push("high", "Safety", "Incident / near miss", answers.correctiveAction || "Reported");
      if (answers.operationalDelay === "yes") push("medium", "Operations", "Operational delay", answers.constraints || answers.productionStatus);
      if (answers.abnormalCondition === "yes") push("medium", "Operations", answers.workArea || "Abnormal condition", answers.conditionDetails);
      return events;
    })
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
}
