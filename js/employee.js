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

function capturePointFor(channel) {
  if (channel === "MOBILE") return "SELF-SERVICE-WEB";
  if (channel === "TABLET") return "TABLET-DEMO-01";
  return APP_CONFIG.defaultCapturePointId;
}

export function bindEmployeeExperience({ getState, setState, onStateChange }) {
  const loginCard = document.getElementById("employeeLoginCard");
  const workspace = document.getElementById("employeeWorkspace");
  const employeeNumber = document.getElementById("employeeNumber");
  const employeePin = document.getElementById("employeePin");
  const captureChannel = document.getElementById("captureChannel");
  const loginButton = document.getElementById("employeeLoginButton");
  const loginStatus = document.getElementById("employeeLoginStatus");
  let observationComposer = null;
  let activeCapture = { channel: APP_CONFIG.defaultCaptureChannel, capturePointId: APP_CONFIG.defaultCapturePointId };

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
          <div><div class="eyebrow">Reporting integrity</div><h3>${employeeDisplayName(employee)}</h3><p class="muted">No reporting obligation exists for this shift instance. A report cannot be invented merely because the employee can sign in.</p></div>
          <div class="status-box warning">Supervisor review required</div>
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
          <div class="muted small-copy">Source title: ${employee.jobTitle}</div>
          <div class="badges">
            <span class="badge">Clocked in ${formatTime(attendance?.clockInAt)}</span>
            <span class="badge ${status}">Report: ${status.toUpperCase()}</span>
            <span class="badge">${submission?.provenance?.captureChannel || activeCapture.channel}</span>
          </div>
        </div>
        <div>
          <div class="muted">Clock-off status</div>
          <div class="status-box ${clockOff.allowed ? "success" : "warning"}">${clockOff.allowed ? "Eligible to clock off" : "Clock-off blocked"}<br /><small>${clockOff.reason}</small></div>
        </div>
      </div>
      ${status === "complete"
        ? `<div class="card"><div class="eyebrow">Analytics integrity record captured</div><h3>Shift report complete</h3><p class="muted">Submitted at ${new Date(submission.completedAt).toLocaleString()}. ${submission.checkFactIds?.length || 0} structured check facts, ${submission.observationIds?.length || 0} immutable observation${submission.observationIds?.length === 1 ? "" : "s"}, and ${submission.issueIds?.length || 0} managed issue${submission.issueIds?.length === 1 ? "" : "s"} were recorded.</p><button id="employeeSignOutButton" class="secondary">Sign out</button></div>`
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
    activeCapture = {
      channel: captureChannel?.value || APP_CONFIG.defaultCaptureChannel,
      capturePointId: capturePointFor(captureChannel?.value || APP_CONFIG.defaultCaptureChannel)
    };
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
      missing.push("A role-specific answer indicates an issue; capture at least one structured observation");
    }

    if (missing.length) {
      formStatus.innerHTML = `<div class="status-box warning">Complete every required item before submitting.<br /><small>${missing.join(" · ")}</small></div>`;
      return;
    }

    const state = getState();
    const obligation = obligationFor(state, employee.id);

    try {
      const { submission, checkFacts, observations, issues } = createSubmissionArtifacts(employee, obligation, answerResult.answers, observationResult, activeCapture);
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
      if (captureChannel) captureChannel.value = APP_CONFIG.defaultCaptureChannel;
      loginStatus.innerHTML = "";
    }
  };
}
