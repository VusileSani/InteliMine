import { APP_CONFIG } from "./config.js";
import {
  reportingStatus,
  mayClockOff,
  submissionFor,
  reportingEmployees,
  currentShiftObservations,
  currentIssues,
  openIssues,
  observationById,
  employeeById,
  obligationFor,
  findEmployeeByNumber
} from "./domain.js";
import { employeeDisplayName, employeeAreaName, reportingRoleLabel } from "./employeeMaster.js";
import { eventTypeById, equipmentById, areaById } from "./masterData.js";
import { nextIssueStatus, transitionIssue, transitionLabel } from "./issueLifecycle.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusBadge(status) {
  return `<span class="badge ${status}">${String(status).toUpperCase()}</span>`;
}

function metric(label, value, note) {
  return `<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div>`;
}

function issueCard(state, issue) {
  const observation = observationById(state, issue.primaryObservationId);
  const employee = observation ? employeeById(observation.employeeId) : null;
  const type = eventTypeById(issue.eventTypeId);
  const equipment = equipmentById(issue.equipmentId);
  const area = areaById(issue.areaId);
  const next = nextIssueStatus(issue);
  const severity = String(issue.severityId || "INFO").toLowerCase();

  return `<div class="event ${severity}">
    <div class="event-head">
      <div>
        <strong>${escapeHtml(issue.title || type?.label || issue.issueId)}</strong>
        <div class="event-meta">${escapeHtml(equipment?.code || area?.name || "Operational issue")} · ${escapeHtml(issue.severityId)} · ${escapeHtml(issue.currentStatus)}</div>
      </div>
      <code>${escapeHtml(issue.issueId)}</code>
    </div>
    <div>${escapeHtml(observation?.narrative || "Issue created from an operational observation.")}</div>
    <small>${escapeHtml(type?.category || "Issue")} · ${escapeHtml(employee ? employeeDisplayName(employee) : observation?.employeeContext?.employeeName || "Unknown reporter")} · ${escapeHtml(observation?.employeeContext?.reportingRoleId || "")} · ${formatTime(issue.openedAt)} · ${issue.observationIds?.length || 0} observation${issue.observationIds?.length === 1 ? "" : "s"}</small>
    ${next ? `<div class="event-actions"><button class="small secondary" data-issue-transition="${escapeHtml(issue.issueId)}">${escapeHtml(transitionLabel(next))}</button></div>` : ""}
  </div>`;
}

export function renderDashboard(state) {
  const host = document.getElementById("managerDashboard");
  const employees = reportingEmployees(state);
  const statuses = employees.map(employee => ({ employee, status: reportingStatus(state, employee.id) }));
  const complete = statuses.filter(item => item.status === "complete").length;
  const outstanding = statuses.filter(item => item.status === "outstanding").length;
  const overrides = statuses.filter(item => item.status === "excused").length;
  const observations = currentShiftObservations(state);
  const issues = currentIssues(state);
  const open = openIssues(state);
  const safetyCount = observations.filter(observation => eventTypeById(observation.eventTypeId)?.category === "SAFETY").length;
  const completion = employees.length ? Math.round((complete / employees.length) * 100) : 0;
  const checks = (state.checkFacts || []).filter(item => item.shiftInstanceId === APP_CONFIG.shiftInstanceId);

  host.innerHTML = `
    <div class="metrics">
      ${metric("Safety observations", safetyCount, "Immutable shift observations")}
      ${metric("Structured checks", checks.length, "Normal + abnormal conditions")}
      ${metric("Shift Compliance", `${completion}%`, `${complete} of ${employees.length} required reports complete`)}
      ${metric("Open issues", open.length, `${outstanding} report${outstanding === 1 ? "" : "s"} outstanding · ${overrides} override${overrides === 1 ? "" : "s"}`)}
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="section-title"><h3>Shift reporting compliance</h3><span class="muted">${APP_CONFIG.shiftName} · ${APP_CONFIG.shiftDateLabel}</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Role / area</th><th>Obligation</th><th>Status</th><th>Observations</th><th>Submitted</th><th>Clock-off</th></tr></thead>
            <tbody>
              ${statuses.map(({ employee, status }) => {
                const submission = submissionFor(state, employee.id);
                const obligation = obligationFor(state, employee.id);
                const clock = mayClockOff(state, employee.id);
                return `<tr>
                  <td><strong>${escapeHtml(employeeDisplayName(employee))}</strong><br /><span class="muted">${escapeHtml(employee.employeeNumber)}</span></td>
                  <td>${escapeHtml(reportingRoleLabel(employee.reportingRole))}<br /><span class="muted">${escapeHtml(employeeAreaName(employee))}</span></td>
                  <td><code>${escapeHtml(obligation?.obligationId || "—")}</code><br /><span class="muted">${escapeHtml(obligation?.createdFrom || "—")}</span></td>
                  <td>${statusBadge(status)}</td>
                  <td>${submission?.observationIds?.length || 0}</td>
                  <td>${submission ? formatTime(submission.completedAt) : "—"}</td>
                  <td>${clock.allowed ? "✓ Allowed" : "⚠ Blocked"}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="section-title"><h3>Priority issues</h3><span class="muted">Observations remain immutable; issues carry lifecycle</span></div>
        <div class="event-list">
          ${issues.length ? issues.map(issue => issueCard(state, issue)).join("") : `<p class="muted">No managed issues created yet.</p>`}
        </div>
      </div>
    </div>

    <div class="card integration-card">
      <div class="section-title"><h3>Supervisor override</h3><span class="muted">Exception path only</span></div>
      <p class="muted">Use only when a required report cannot reasonably be completed. The override resolves clock-off eligibility but does not pretend the reporting obligation was completed.</p>
      <div class="override-form">
        <label>Employee
          <select id="overrideEmployee">
            <option value="">Choose employee</option>
            ${employees.filter(employee => reportingStatus(state, employee.id) === "outstanding").map(employee => `<option value="${escapeHtml(employee.id)}">${escapeHtml(employeeDisplayName(employee))} · ${escapeHtml(reportingRoleLabel(employee.reportingRole))}</option>`).join("")}
          </select>
        </label>
        <label>Approver employee number<input id="overrideApprover" placeholder="Supervisor employee number" /></label>
        <label class="full">Reason<textarea id="overrideReason" placeholder="e.g. Kiosk/network unavailable"></textarea></label>
        <div class="full"><button id="overrideButton" class="warning">Authorise clock-off override</button></div>
        <div id="overrideStatus" class="full"></div>
      </div>
    </div>
  `;
}

export function bindDashboardActions({ getState, setState, onStateChange }) {
  const host = document.getElementById("managerDashboard");
  host.addEventListener("click", event => {
    const transitionButton = event.target.closest("[data-issue-transition]");
    if (transitionButton) {
      const state = getState();
      const result = transitionIssue(state, transitionButton.dataset.issueTransition);
      if (result.ok) {
        setState(state);
        onStateChange();
      }
      return;
    }

    if (event.target?.id !== "overrideButton") return;

    const employeeId = document.getElementById("overrideEmployee")?.value || "";
    const approverEmployeeNumber = document.getElementById("overrideApprover")?.value.trim() || "";
    const reason = document.getElementById("overrideReason")?.value.trim() || "";
    const statusHost = document.getElementById("overrideStatus");

    if (!employeeId || !approverEmployeeNumber || !reason) {
      statusHost.innerHTML = `<div class="status-box warning">Employee, approver and reason are all required.</div>`;
      return;
    }

    const state = getState();
    const obligation = obligationFor(state, employeeId);
    if (!obligation) {
      statusHost.innerHTML = `<div class="status-box warning">No reporting obligation exists for this employee and shift.</div>`;
      return;
    }

    const approver = findEmployeeByNumber(approverEmployeeNumber);
    if (!approver || approver.reportingRole !== "SUPERVISOR") {
      statusHost.innerHTML = `<div class="status-box warning">The approver must resolve to an identified supervisor in the Employee Master.</div>`;
      return;
    }
    if (approver.id === employeeId) {
      statusHost.innerHTML = `<div class="status-box warning">An employee cannot authorise their own reporting override.</div>`;
      return;
    }

    const approvedAt = new Date().toISOString();
    state.overrides.push({
      overrideId: `OVR-${Date.now()}`,
      obligationId: obligation.obligationId,
      employeeId,
      shiftInstanceId: APP_CONFIG.shiftInstanceId,
      approverEmployeeId: approver.id,
      approverEmployeeNumber,
      reason,
      approvedAt
    });
    state.auditTrail.push({ type: "REPORTING_OVERRIDE", obligationId: obligation.obligationId, employeeId, shiftInstanceId: APP_CONFIG.shiftInstanceId, approverEmployeeId: approver.id, approverEmployeeNumber, reason, at: approvedAt });
    setState(state);
    onStateChange();
  });
}
