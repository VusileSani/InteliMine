import { APP_CONFIG } from "./config.js";
import { EMPLOYEES } from "./demoData.js";
import { reportingStatus, mayClockOff, buildOperationalEvents, submissionFor, overrideFor } from "./domain.js";

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusBadge(status) {
  return `<span class="badge ${status}">${status.toUpperCase()}</span>`;
}

export function renderDashboard(state) {
  const host = document.getElementById("managerDashboard");
  const statuses = EMPLOYEES.map(employee => ({ employee, status: reportingStatus(state, employee.id) }));
  const complete = statuses.filter(item => item.status === "complete").length;
  const outstanding = statuses.filter(item => item.status === "outstanding").length;
  const overrides = statuses.filter(item => item.status === "excused").length;
  const events = buildOperationalEvents(state);
  const safetyCount = events.filter(event => event.category === "Safety").length;
  const equipmentCount = events.filter(event => ["Equipment", "Electrical"].includes(event.category)).length;
  const completion = Math.round((complete / EMPLOYEES.length) * 100);

  host.innerHTML = `
    <div class="metrics">
      ${metric("Safety", safetyCount, "Reported concerns")}
      ${metric("Equipment", equipmentCount, "Mechanical / electrical")}
      ${metric("Shift Compliance", `${completion}%`, `${complete} of ${EMPLOYEES.length} complete`)}
      ${metric("Outstanding", outstanding, `${overrides} supervisor override${overrides === 1 ? "" : "s"}`)}
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="section-title"><h3>Shift reporting compliance</h3><span class="muted">${APP_CONFIG.shiftName} · ${APP_CONFIG.areaName}</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Role</th><th>Status</th><th>Submitted</th><th>Clock-off</th></tr></thead>
            <tbody>
              ${statuses.map(({ employee, status }) => {
                const submission = submissionFor(state, employee.id);
                const clock = mayClockOff(state, employee.id);
                return `<tr>
                  <td><strong>${employee.name}</strong><br /><span class="muted">${employee.employeeNumber}</span></td>
                  <td>${employee.role}</td>
                  <td>${statusBadge(status)}</td>
                  <td>${submission ? formatTime(submission.completedAt) : "—"}</td>
                  <td>${clock.allowed ? "✓ Allowed" : "⚠ Blocked"}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="section-title"><h3>Priority observations</h3><span class="muted">From submitted reports</span></div>
        <div class="event-list">
          ${events.length ? events.map(event => `<div class="event ${event.severity}">
            <strong>${event.title}</strong>
            <div>${event.detail}</div>
            <small>${event.category} · ${event.employeeName} · ${event.role}</small>
          </div>`).join("") : `<p class="muted">No priority observations captured yet.</p>`}
        </div>
      </div>
    </div>

    <div class="card integration-card">
      <div class="section-title"><h3>Supervisor override</h3><span class="muted">Exception path only</span></div>
      <p class="muted">Use only when a required report cannot reasonably be completed. Every override is auditable.</p>
      <div class="override-form">
        <label>Employee
          <select id="overrideEmployee">
            <option value="">Choose employee</option>
            ${EMPLOYEES.filter(employee => reportingStatus(state, employee.id) === "outstanding").map(employee => `<option value="${employee.id}">${employee.name} · ${employee.role}</option>`).join("")}
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

function metric(label, value, note) {
  return `<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div>`;
}

export function bindDashboardActions({ getState, setState, onStateChange }) {
  const host = document.getElementById("managerDashboard");
  host.addEventListener("click", event => {
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
    state.overrides.push({
      employeeId,
      shiftId: APP_CONFIG.shiftId,
      approverEmployeeNumber,
      reason,
      approvedAt: new Date().toISOString()
    });
    setState(state);
    onStateChange();
  });
}
