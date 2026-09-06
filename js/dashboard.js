import { APP_CONFIG } from "./config.js";
import {
  reportingStatus,
  submissionFor,
  reportingEmployees,
  openIssues,
  observationById,
  employeeById,
  obligationFor,
  findEmployeeByNumber
} from "./domain.js";
import { employeeDisplayName, employeeAreaName, reportingRoleLabel } from "./employeeMaster.js";
import { eventTypeById, equipmentById, areaById } from "./masterData.js";
import { nextIssueStatus, transitionIssue, transitionLabel } from "./issueLifecycle.js";
import { currentShiftPerformance } from "./leadership.js";

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

function toneFor(value, goodAt, watchAt) {
  if (value >= goodAt) return "good";
  if (value >= watchAt) return "watch";
  return "risk";
}

function pulseCard(label, value, note, tone) {
  return `<div class="pulse-card ${tone}">
    <div class="metric-label">${escapeHtml(label)}</div>
    <div class="metric-value">${escapeHtml(value)}</div>
    <div class="metric-note">${escapeHtml(note)}</div>
  </div>`;
}

function attentionCard(label, title, copy, tone = "watch") {
  return `<div class="attention-card ${tone}">
    <div class="attention-label">${escapeHtml(label)}</div>
    <strong>${escapeHtml(title)}</strong>
    <span>${escapeHtml(copy)}</span>
  </div>`;
}

function issueCard(state, issue) {
  const observation = observationById(state, issue.primaryObservationId);
  const type = eventTypeById(issue.eventTypeId);
  const equipment = equipmentById(issue.equipmentId);
  const area = areaById(issue.areaId);
  const next = nextIssueStatus(issue);
  const severity = String(issue.severityId || "INFO").toLowerCase();
  const context = equipment?.code || area?.name || type?.label || "Operational action";

  return `<div class="action-card ${severity}">
    <div class="action-head">
      <div>
        <span class="severity-chip ${severity}">${escapeHtml(issue.severityId)}</span>
        <strong>${escapeHtml(issue.title || type?.label || "Operational action")}</strong>
      </div>
      <span class="status-pill">${escapeHtml(String(issue.currentStatus || "OPEN").replaceAll("_", " "))}</span>
    </div>
    <p>${escapeHtml(observation?.narrative || "Action raised from a shift observation.")}</p>
    <div class="action-meta">
      <span>${escapeHtml(context)}</span>
      <span>${escapeHtml(issue.ownerRole || "Shift Supervisor")}</span>
      <span>Target ${formatTime(issue.targetAt)}</span>
    </div>
    ${next ? `<button class="small secondary" data-issue-transition="${escapeHtml(issue.issueId)}">${escapeHtml(transitionLabel(next))}</button>` : ""}
  </div>`;
}

function controlExceptionCard(item) {
  const area = areaById(item.areaId);
  return `<div class="control-exception">
    <div>
      <div class="attention-label">${escapeHtml(item.hazard)}</div>
      <strong>${escapeHtml(item.control)}</strong>
      <p>${escapeHtml(item.note || "Verification exception requires attention.")}</p>
    </div>
    <div class="control-meta">${escapeHtml(area?.name || "Mine area")} · ${escapeHtml(item.owner || "Supervisor")}</div>
  </div>`;
}

export function renderDashboard(state) {
  const host = document.getElementById("managerDashboard");
  if (!host) return;

  const performance = currentShiftPerformance(state);
  const employees = reportingEmployees(state);
  const outstandingEmployees = employees.filter(employee => reportingStatus(state, employee.id) === "outstanding");
  const issues = openIssues(state);
  const delays = [...(state.delayEvents || [])].sort((a, b) => Number(b.minutes) - Number(a.minutes));
  const controls = state.controlVerifications || [];
  const controlExceptions = controls.filter(item => item.status !== "PASS");

  const attention = [];
  if (controlExceptions.length) {
    attention.push(attentionCard(
      "Safety control",
      `${controlExceptions.length} critical-control exception${controlExceptions.length === 1 ? "" : "s"}`,
      controlExceptions[0].note || "Verification requires manager attention.",
      "risk"
    ));
  }
  if (performance.shortfallTonnes > 0) {
    attention.push(attentionCard(
      "Production",
      `${performance.shortfallTonnes} t below plan`,
      `${performance.delayMinutes || 0} delay minutes recorded; ${delays[0]?.label || "constraint review"} is the largest current loss.`,
      performance.planAttainmentPct < 90 ? "risk" : "watch"
    ));
  }
  if (performance.outstandingHandovers > 0) {
    attention.push(attentionCard(
      "Shift readiness",
      `${performance.outstandingHandovers} handover${performance.outstandingHandovers === 1 ? "" : "s"} outstanding`,
      "Clock-off remains blocked until the required handover is completed or an authorised exception is recorded.",
      "watch"
    ));
  }

  host.innerHTML = `
    <div class="context-line">${escapeHtml(APP_CONFIG.shiftName)} · ${escapeHtml(APP_CONFIG.shiftDateLabel)} · ${escapeHtml(APP_CONFIG.operationTimezone)}</div>

    <div class="pulse-grid">
      ${pulseCard(
        "Critical controls",
        `${performance.criticalControlConformancePct}%`,
        `${controls.length - controlExceptions.length} of ${controls.length} verified`,
        toneFor(performance.criticalControlConformancePct, 98, 95)
      )}
      ${pulseCard(
        "Production",
        `${performance.planAttainmentPct}%`,
        `${performance.actualTonnes || 0} / ${performance.plannedTonnes || 0} t`,
        toneFor(performance.planAttainmentPct, 95, 90)
      )}
      ${pulseCard(
        "Availability",
        `${performance.equipmentAvailabilityPct || 0}%`,
        `${performance.delayMinutes || 0} delay min`,
        toneFor(Number(performance.equipmentAvailabilityPct || 0), 90, 85)
      )}
      ${pulseCard(
        "Handover",
        `${performance.handoverCompliancePct}%`,
        `${performance.completeHandovers} of ${performance.requiredHandovers} complete`,
        toneFor(performance.handoverCompliancePct, 100, 90)
      )}
    </div>

    ${attention.length ? `<section class="section-block">
      <div class="section-title"><div><div class="eyebrow">Requires attention</div><h3>Manager focus</h3></div></div>
      <div class="attention-grid">${attention.join("")}</div>
    </section>` : `<div class="status-box success">No immediate management exceptions are active.</div>`}

    <div class="manager-two-column section-block">
      <section class="card">
        <div class="section-title"><h3>Shift losses</h3><span class="muted">${performance.delayMinutes || 0} min total</span></div>
        <div class="loss-list">
          ${delays.map(item => {
            const area = areaById(item.areaId);
            const equipment = equipmentById(item.equipmentId);
            return `<div class="loss-row">
              <div>
                <strong>${escapeHtml(item.label)}</strong>
                <span>${escapeHtml(equipment?.code || area?.name || item.timeClass || "Operational delay")}</span>
              </div>
              <div class="loss-impact"><strong>${Number(item.minutes || 0)} min</strong><span>≈ ${Number(item.estimatedTonnesImpact || 0)} t</span></div>
            </div>`;
          }).join("") || `<p class="muted">No material shift losses recorded.</p>`}
        </div>
      </section>

      <section class="card">
        <div class="section-title"><h3>Open actions</h3><span class="muted">${issues.length}</span></div>
        <div class="action-list">
          ${issues.length ? issues.map(issue => issueCard(state, issue)).join("") : `<p class="muted">No open actions.</p>`}
        </div>
      </section>
    </div>

    ${controlExceptions.length ? `<section class="card section-block">
      <div class="section-title"><h3>Critical-control exceptions</h3><span class="muted">Mine-defined controls</span></div>
      <div class="control-list">${controlExceptions.map(controlExceptionCard).join("")}</div>
    </section>` : ""}

    <section class="card section-block">
      <div class="section-title"><h3>Handover readiness</h3><span class="muted">${outstandingEmployees.length} outstanding</span></div>
      ${outstandingEmployees.length ? `<div class="handover-list">
        ${outstandingEmployees.map(employee => {
          const submission = submissionFor(state, employee.id);
          return `<div class="handover-row">
            <div><strong>${escapeHtml(employeeDisplayName(employee))}</strong><span>${escapeHtml(reportingRoleLabel(employee.reportingRole))} · ${escapeHtml(employeeAreaName(employee))}</span></div>
            <span class="status-pill warning">Outstanding</span>
          </div>`;
        }).join("")}
      </div>` : `<div class="status-box success">All required handovers are complete.</div>`}

      ${outstandingEmployees.length ? `<details class="exception-panel">
        <summary>Authorise clock-off exception</summary>
        <p class="muted">Use only when the required handover cannot reasonably be completed. The reporting obligation remains visible in the audit record.</p>
        <div class="override-form">
          <label>Employee
            <select id="overrideEmployee">
              <option value="">Choose employee</option>
              ${outstandingEmployees.map(employee => `<option value="${escapeHtml(employee.id)}">${escapeHtml(employeeDisplayName(employee))} · ${escapeHtml(reportingRoleLabel(employee.reportingRole))}</option>`).join("")}
            </select>
          </label>
          <label>Approver employee number<input id="overrideApprover" placeholder="Supervisor employee number" /></label>
          <label class="full">Reason<textarea id="overrideReason" placeholder="Reason for exception"></textarea></label>
          <div class="full"><button id="overrideButton" class="warning">Authorise exception</button></div>
          <div id="overrideStatus" class="full"></div>
        </div>
      </details>` : ""}
    </section>
  `;
}

export function bindDashboardActions({ getState, setState, onStateChange }) {
  const host = document.getElementById("managerDashboard");
  if (!host) return;

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
      statusHost.innerHTML = `<div class="status-box warning">Employee, approver and reason are required.</div>`;
      return;
    }

    const state = getState();
    const obligation = obligationFor(state, employeeId);
    if (!obligation) {
      statusHost.innerHTML = `<div class="status-box warning">No handover obligation exists for this employee and shift.</div>`;
      return;
    }

    const approver = findEmployeeByNumber(approverEmployeeNumber);
    if (!approver || approver.reportingRole !== "SUPERVISOR") {
      statusHost.innerHTML = `<div class="status-box warning">The approver must be an identified supervisor.</div>`;
      return;
    }
    if (approver.id === employeeId) {
      statusHost.innerHTML = `<div class="status-box warning">An employee cannot authorise their own exception.</div>`;
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
    state.auditTrail.push({
      type: "REPORTING_OVERRIDE",
      obligationId: obligation.obligationId,
      employeeId,
      shiftInstanceId: APP_CONFIG.shiftInstanceId,
      approverEmployeeId: approver.id,
      approverEmployeeNumber,
      reason,
      at: approvedAt
    });
    setState(state);
    onStateChange();
  });
}
