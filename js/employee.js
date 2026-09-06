import { APP_CONFIG } from "./config.js";
import { authenticateEmployee, attendanceFor, obligationFor, submissionFor, reportingStatus, mayClockOff } from "./domain.js";
import { employeeDisplayName, employeeAreaName, employeeDepartmentName, reportingRoleLabel } from "./employeeMaster.js";
import { renderReportForm, readReportAnswers } from "./reporting.js";
import { bindObservationComposer } from "./observation.js";
import { createSubmissionArtifacts } from "./records.js";

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function bindEmployeeExperience({ getState, setState, onStateChange }) {
  const loginCard = document.getElementById("employeeLoginCard");
  const workspace = document.getElementById("employeeWorkspace");
  const employeeNumber = document.getElementById("employeeNumber");
  const employeePin = document.getElementById("employeePin");
  const loginButton = document.getElementById("employeeLoginButton");
  const loginStatus = document.getElementById("employeeLoginStatus");
  let observationComposer = null;

  const capture = {
    channel: APP_CONFIG.defaultCaptureChannel,
    capturePointId: APP_CONFIG.defaultCapturePointId
  };

  function showStatus(message, tone = "danger") {
    loginStatus.innerHTML = `<div class="status-box ${tone}">${message}</div>`;
  }

  function renderEmployeeWorkspace(employee) {
    const state = getState();
    const attendance = attendanceFor(employee.id);
    const obligation = obligationFor(state, employee.id);
    const submission = submissionFor(state, employee.id);
    const status = reportingStatus(state, employee.id);
    const clockOff = mayClockOff(state, employee.id);

    if (!obligation) {
      workspace.innerHTML = `
        <div class="card employee-head">
          <div class="identity-block">
            <div class="eyebrow">${employeeAreaName(employee)}</div>
            <h3>${employeeDisplayName(employee)}</h3>
            <div class="muted">${employee.employeeNumber} · ${reportingRoleLabel(employee.reportingRole)}</div>
          </div>
          <div class="status-box warning">No handover is assigned for this shift. Contact your supervisor.</div>
        </div>
        <div class="card"><button id="employeeSignOutButton" class="secondary">Sign out</button></div>`;
      workspace.classList.remove("hidden");
      loginCard.classList.add("hidden");
      document.getElementById("employeeSignOutButton")?.addEventListener("click", signOut);
      return;
    }

    workspace.innerHTML = `
      <div class="card employee-head">
        <div class="identity-block">
          <div class="eyebrow">${APP_CONFIG.shiftName} · ${employeeAreaName(employee)}</div>
          <h3>${employeeDisplayName(employee)}</h3>
          <div class="muted">${employee.employeeNumber} · ${reportingRoleLabel(employee.reportingRole)} · ${employeeDepartmentName(employee)}</div>
          <div class="badges">
            <span class="badge">Clocked in ${formatTime(attendance?.clockInAt)}</span>
            <span class="badge ${status}">${status === "complete" ? "Handover complete" : status === "excused" ? "Exception authorised" : "Handover required"}</span>
          </div>
        </div>
        <div class="clockoff-block">
          <div class="muted">Clock-off</div>
          <div class="status-box ${clockOff.allowed ? "success" : "warning"}">${clockOff.allowed ? "Allowed" : "Blocked"}<br /><small>${clockOff.reason}</small></div>
        </div>
      </div>
      ${status === "complete"
        ? `<div class="card completion-card"><div class="eyebrow">Handover complete</div><h3>Shift report recorded</h3><p class="muted">Submitted at ${new Date(submission.completedAt).toLocaleString()}. Your handover is available to the next shift and management.</p><button id="employeeSignOutButton" class="secondary">Sign out</button></div>`
        : renderReportForm(employee, submission)}
    `;

    workspace.classList.remove("hidden");
    loginCard.classList.add("hidden");

    document.getElementById("employeeSignOutButton")?.addEventListener("click", signOut);
    const reportForm = document.getElementById("shiftReportForm");
    if (reportForm) {
      observationComposer = bindObservationComposer(reportForm, employee);
      reportForm.addEventListener("submit", event => submitReport(event, employee));
    }
  }

  function signOut() {
    observationComposer = null;
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
    const answerResult = readReportAnswers(form, employee.reportingRole);
    const observationResult = observationComposer?.read() || { declared: "", observations: [], missing: ["Observation declaration"] };
    const formStatus = document.getElementById("reportFormStatus");
    const missing = [...answerResult.missing, ...observationResult.missing];

    if (answerResult.requiresObservation && observationResult.declared !== "yes") {
      missing.push("A reported abnormal condition requires an observation");
    }

    if (missing.length) {
      formStatus.innerHTML = `<div class="status-box warning">Complete the required items before submitting.<br /><small>${missing.join(" · ")}</small></div>`;
      return;
    }

    const state = getState();
    const obligation = obligationFor(state, employee.id);

    try {
      const { submission, checkFacts, observations, issues } = createSubmissionArtifacts(employee, obligation, answerResult.answers, observationResult, capture);
      state.submissions = state.submissions.filter(item => item.obligationId !== obligation.obligationId);
      state.submissions.push(submission);
      state.checkFacts.push(...checkFacts);
      state.observations.push(...observations);
      state.issues.push(...issues);
      state.auditTrail.push({
        type: "SHIFT_REPORT_SUBMITTED",
        employeeId: employee.id,
        shiftInstanceId: APP_CONFIG.shiftInstanceId,
        obligationId: obligation.obligationId,
        submissionId: submission.submissionId,
        at: submission.completedAt,
        provenance: submission.provenance
      });

      setState(state);
      onStateChange();
      renderEmployeeWorkspace(employee);
    } catch (error) {
      formStatus.innerHTML = `<div class="status-box warning">${error?.message || "The report could not be recorded."}</div>`;
    }
  }

  loginButton.addEventListener("click", login);
  employeePin.addEventListener("keydown", event => {
    if (event.key === "Enter") login();
  });

  return {
    reset() {
      observationComposer = null;
      workspace.innerHTML = "";
      workspace.classList.add("hidden");
      loginCard.classList.remove("hidden");
      employeeNumber.value = "";
      employeePin.value = "";
      loginStatus.innerHTML = "";
    }
  };
}
