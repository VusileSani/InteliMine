import { APP_CONFIG } from "./config.js";
import { authenticateEmployee, attendanceFor, submissionFor, reportingStatus, mayClockOff } from "./domain.js";
import { employeeDisplayName, reportingRoleLabel } from "./employeeMaster.js";
import { renderReportForm, readReportAnswers } from "./reporting.js";

export function bindEmployeeExperience({ getState, setState, onStateChange }) {
  const loginCard = document.getElementById("employeeLoginCard");
  const workspace = document.getElementById("employeeWorkspace");
  const employeeNumber = document.getElementById("employeeNumber");
  const employeePin = document.getElementById("employeePin");
  const loginButton = document.getElementById("employeeLoginButton");
  const loginStatus = document.getElementById("employeeLoginStatus");

  function showStatus(message, tone = "danger") {
    loginStatus.innerHTML = `<div class="status-box ${tone}">${message}</div>`;
  }

  function renderEmployeeWorkspace(employee) {
    const state = getState();
    const attendance = attendanceFor(employee.id);
    const submission = submissionFor(state, employee.id);
    const status = reportingStatus(state, employee.id);
    const clockOff = mayClockOff(state, employee.id);

    workspace.innerHTML = `
      <div class="card employee-head">
        <div class="identity-block">
          <div class="eyebrow">${APP_CONFIG.shiftName} · ${employee.section}</div>
          <h3>${employeeDisplayName(employee)}</h3>
          <div class="muted">${employee.employeeNumber} · ${reportingRoleLabel(employee.reportingRole)} · ${employee.department}</div>
          <div class="muted small-copy">Source title: ${employee.jobTitle}</div>
          <div class="badges">
            <span class="badge">Clocked in ${attendance?.clockInTime || "—"}</span>
            <span class="badge ${status}">Report: ${status.toUpperCase()}</span>
          </div>
        </div>
        <div>
          <div class="muted">Clock-off status</div>
          <div class="status-box ${clockOff.allowed ? "success" : "warning"}">${clockOff.allowed ? "Eligible to clock off" : "Clock-off blocked"}<br /><small>${clockOff.reason}</small></div>
        </div>
      </div>
      ${status === "complete"
        ? `<div class="card"><h3>Shift report complete</h3><p class="muted">Submitted at ${new Date(submission.completedAt).toLocaleString()}.</p><button id="employeeSignOutButton" class="secondary">Sign out</button></div>`
        : renderReportForm(employee, submission)}
    `;

    workspace.classList.remove("hidden");
    loginCard.classList.add("hidden");

    document.getElementById("employeeSignOutButton")?.addEventListener("click", signOut);
    document.getElementById("shiftReportForm")?.addEventListener("submit", event => submitReport(event, employee));
  }

  function signOut() {
    workspace.classList.add("hidden");
    workspace.innerHTML = "";
    loginCard.classList.remove("hidden");
    employeePin.value = "";
  }

  function login() {
    const employee = authenticateEmployee(employeeNumber.value, employeePin.value);
    if (!employee) {
      showStatus("Employee number or PIN is incorrect, or the employee is inactive.");
      return;
    }
    loginStatus.innerHTML = "";
    renderEmployeeWorkspace(employee);
  }

  function submitReport(event, employee) {
    event.preventDefault();
    const form = event.currentTarget;
    const { answers, missing } = readReportAnswers(form, employee.reportingRole);
    const formStatus = document.getElementById("reportFormStatus");

    if (missing.length) {
      formStatus.innerHTML = `<div class="status-box warning">Complete every required item before submitting.</div>`;
      return;
    }

    const state = getState();
    const newSubmission = {
      employeeId: employee.id,
      shiftId: APP_CONFIG.shiftId,
      reportingRole: employee.reportingRole,
      status: "complete",
      completedAt: new Date().toISOString(),
      answers
    };

    state.submissions = state.submissions.filter(item => item.employeeId !== employee.id);
    state.submissions.push(newSubmission);
    setState(state);
    onStateChange();
    renderEmployeeWorkspace(employee);
  }

  loginButton.addEventListener("click", login);
  employeePin.addEventListener("keydown", event => {
    if (event.key === "Enter") login();
  });

  return {
    reset() {
      workspace.innerHTML = "";
      workspace.classList.add("hidden");
      loginCard.classList.remove("hidden");
      employeeNumber.value = "";
      employeePin.value = "";
      loginStatus.innerHTML = "";
    }
  };
}
