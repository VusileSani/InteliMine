import { EMPLOYEES } from "./demoData.js";
import { EMPLOYEE_MASTER_FIELDS, employeeDisplayName, reportingRoleLabel, validateEmployeeRecord } from "./employeeMaster.js";
import { ROLE_MAPPINGS } from "./roleMappings.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function employeeRows() {
  return EMPLOYEES.map(employee => {
    const errors = validateEmployeeRecord(employee);
    const status = errors.length ? "Needs attention" : "Ready";
    return `<tr>
      <td><strong>${escapeHtml(employeeDisplayName(employee))}</strong><br /><span class="muted">${escapeHtml(employee.employeeNumber)}</span></td>
      <td>${escapeHtml(employee.jobTitle)}</td>
      <td><code>${escapeHtml(employee.reportingRole)}</code><br /><span class="muted">${escapeHtml(reportingRoleLabel(employee.reportingRole))}</span></td>
      <td>${escapeHtml(employee.sourceSystem)}</td>
      <td><span class="badge ${errors.length ? "outstanding" : "complete"}">${status}</span>${errors.length ? `<div class="validation-copy">${errors.map(escapeHtml).join("<br />")}</div>` : ""}</td>
    </tr>`;
  }).join("");
}

function fieldRows() {
  return EMPLOYEE_MASTER_FIELDS.map(field => `<tr>
    <td><code>${escapeHtml(field.key)}</code></td>
    <td>${field.required ? "Required" : "Optional"}</td>
    <td>${escapeHtml(field.description)}</td>
  </tr>`).join("");
}

function mappingRows() {
  return ROLE_MAPPINGS.map(mapping => `<tr>
    <td>${escapeHtml(mapping.sourceSystem)}</td>
    <td>${escapeHtml(mapping.sourceJobTitle)}</td>
    <td><code>${escapeHtml(mapping.reportingRole)}</code><br /><span class="muted">${escapeHtml(reportingRoleLabel(mapping.reportingRole))}</span></td>
  </tr>`).join("");
}

export function renderIntegrationHub() {
  const host = document.getElementById("integrationHub");
  const invalid = EMPLOYEES.filter(employee => validateEmployeeRecord(employee).length > 0).length;
  const active = EMPLOYEES.filter(employee => employee.employmentStatus === "ACTIVE").length;
  const sourceSystems = [...new Set(EMPLOYEES.map(employee => employee.sourceSystem))].join(", ");

  host.innerHTML = `
    <div class="metrics">
      <div class="metric-card"><div class="metric-label">Source</div><div class="metric-value compact">${escapeHtml(sourceSystems)}</div><div class="metric-note">Adapter-neutral employee master</div></div>
      <div class="metric-card"><div class="metric-label">Employee records</div><div class="metric-value">${EMPLOYEES.length}</div><div class="metric-note">${active} active</div></div>
      <div class="metric-card"><div class="metric-label">Validation issues</div><div class="metric-value">${invalid}</div><div class="metric-note">Must resolve before operational use</div></div>
      <div class="metric-card"><div class="metric-label">Role mappings</div><div class="metric-value">${ROLE_MAPPINGS.length}</div><div class="metric-note">Source titles → reporting roles</div></div>
    </div>

    <div class="card integration-card">
      <div class="section-title">
        <div><div class="eyebrow">Canonical contract</div><h3>Employee Master</h3></div>
        <div class="download-actions">
          <a class="button-link" href="data/employee-master-template.csv" download>Employee template CSV</a>
          <a class="button-link secondary-link" href="data/role-mapping-template.csv" download>Role mapping CSV</a>
        </div>
      </div>
      <p class="muted">SAP, CSV, middleware or another HR source may differ internally. The Integration Hub translates source data into this stable InteliMine employee model.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Employee</th><th>Official job title</th><th>InteliMine role</th><th>Source</th><th>Validation</th></tr></thead>
          <tbody>${employeeRows()}</tbody>
        </table>
      </div>
    </div>

    <div class="dashboard-grid integration-card">
      <div class="card">
        <div class="section-title"><h3>Role mapping</h3><span class="muted">Business translation layer</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Source</th><th>Source job title</th><th>Reporting role</th></tr></thead>
            <tbody>${mappingRows()}</tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="section-title"><h3>Interface principle</h3><span class="muted">Stable boundary</span></div>
        <div class="principle-stack">
          <div><strong>HR / SAP</strong><span>Owns official employee and organisational master data.</span></div>
          <div><strong>Integration Hub</strong><span>Validates, maps and reconciles source data.</span></div>
          <div><strong>InteliMine</strong><span>Consumes one canonical employee model and creates reporting obligations.</span></div>
        </div>
      </div>
    </div>

    <div class="card integration-card">
      <div class="section-title"><h3>Employee Master field contract</h3><span class="muted">V1.1</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Field</th><th>Requirement</th><th>Purpose</th></tr></thead>
          <tbody>${fieldRows()}</tbody>
        </table>
      </div>
    </div>
  `;
}
