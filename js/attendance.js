import { findEmployeeByNumber, reportingStatus, mayClockOff, overrideFor, submissionFor } from "./domain.js";
import { APP_CONFIG } from "./config.js";

export function bindAttendanceSimulator({ getState }) {
  const employeeNumber = document.getElementById("taEmployeeNumber");
  const button = document.getElementById("taCheckButton");
  const result = document.getElementById("taCheckResult");

  function check() {
    const employee = findEmployeeByNumber(employeeNumber.value);
    if (!employee) {
      result.innerHTML = `<div class="status-box danger">Employee not found.</div>`;
      return;
    }

    const state = getState();
    const status = reportingStatus(state, employee.id);
    const decision = mayClockOff(state, employee.id);
    const submission = submissionFor(state, employee.id);
    const override = overrideFor(state, employee.id);

    const payload = {
      employeeNumber: employee.employeeNumber,
      shiftId: APP_CONFIG.shiftId,
      reportingRequired: true,
      reportingStatus: status.toUpperCase(),
      completedAt: submission?.completedAt || null,
      override: override ? { approvedAt: override.approvedAt, approverEmployeeNumber: override.approverEmployeeNumber, reason: override.reason } : null,
      clockOffAllowed: decision.allowed,
      reason: decision.reason
    };

    result.innerHTML = `
      <div class="status-box ${decision.allowed ? "success" : "warning"}">
        <strong>${decision.allowed ? "CLOCK-OFF ALLOWED" : "CLOCK-OFF BLOCKED"}</strong><br />${decision.reason}
      </div>
      <pre class="code-block">${JSON.stringify(payload, null, 2)}</pre>`;
  }

  button.addEventListener("click", check);
  employeeNumber.addEventListener("keydown", event => {
    if (event.key === "Enter") check();
  });
}
