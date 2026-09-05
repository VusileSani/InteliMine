import { EMPLOYEES } from "./demoData.js";
import { EMPLOYEE_MASTER_FIELDS, employeeDisplayName, reportingRoleLabel, validateEmployeeRecord } from "./employeeMaster.js";
import { ROLE_MAPPINGS } from "./roleMappings.js";
import { OPERATIONS, DEPARTMENTS, AREAS, EQUIPMENT, EVENT_TYPES } from "./masterData.js";
import { APP_CONFIG } from "./config.js";

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
      <td><code>${escapeHtml(employee.operationId)}</code><br /><span class="muted">${escapeHtml(employee.areaId)}</span></td>
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

function batchRows(state) {
  return (state.integrationBatches || []).map(batch => `<tr>
    <td><code>${escapeHtml(batch.batchId)}</code><br /><span class="muted">${escapeHtml(batch.entityType)}</span></td>
    <td>${escapeHtml(batch.sourceSystem)}</td>
    <td>${escapeHtml(new Date(batch.receivedAt).toLocaleString())}</td>
    <td>${batch.receivedCount}</td>
    <td>${batch.validCount}</td>
    <td>${batch.rejectedCount}</td>
    <td>${batch.appliedCount}</td>
    <td><span class="badge ${batch.status === "APPLIED" ? "complete" : "outstanding"}">${escapeHtml(batch.status)}</span>${batch.errorSummary ? `<div class="validation-copy">${escapeHtml(batch.errorSummary)}</div>` : ""}</td>
  </tr>`).join("");
}

export function renderIntegrationHub(state) {
  const host = document.getElementById("integrationHub");
  const invalid = EMPLOYEES.filter(employee => validateEmployeeRecord(employee).length > 0).length;
  const active = EMPLOYEES.filter(employee => employee.employmentStatus === "ACTIVE").length;
  const sourceSystems = [...new Set(EMPLOYEES.map(employee => employee.sourceSystem))].join(", ");
  const batches = state?.integrationBatches || [];
  const rejected = batches.reduce((sum, batch) => sum + Number(batch.rejectedCount || 0), 0);

  host.innerHTML = `
    <div class="metrics">
      <div class="metric-card"><div class="metric-label">Employee source</div><div class="metric-value compact">${escapeHtml(sourceSystems)}</div><div class="metric-note">Adapter-neutral master data</div></div>
      <div class="metric-card"><div class="metric-label">Employee records</div><div class="metric-value">${EMPLOYEES.length}</div><div class="metric-note">${active} active</div></div>
      <div class="metric-card"><div class="metric-label">Staging rejects</div><div class="metric-value">${rejected}</div><div class="metric-note">Rejected before operational use</div></div>
      <div class="metric-card"><div class="metric-label">Contract</div><div class="metric-value compact">v${escapeHtml(APP_CONFIG.dataContractVersion)}</div><div class="metric-note">Versioned canonical interface</div></div>
    </div>

    <div class="card integration-card">
      <div class="section-title"><div><div class="eyebrow">Integration staging</div><h3>Receive → validate → accept/reject → apply</h3></div><span class="muted">Bad source data never silently enters operations</span></div>
      <p class="muted">The prototype records import-batch lineage now so future HR, ERP, asset, roster or middleware feeds can be quarantined and reconciled before changing canonical master data.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Batch</th><th>Source</th><th>Received</th><th>Rows</th><th>Valid</th><th>Rejected</th><th>Applied</th><th>Status</th></tr></thead>
          <tbody>${batchRows(state)}</tbody>
        </table>
      </div>
    </div>

    <div class="card integration-card">
      <div class="section-title">
        <div><div class="eyebrow">Canonical contract</div><h3>Employee Master</h3></div>
        <div class="download-actions">
          <a class="button-link" href="data/employee-master-template.csv" download>Employee template CSV</a>
          <a class="button-link secondary-link" href="data/role-mapping-template.csv" download>Role mapping CSV</a>
          <a class="button-link secondary-link" href="data/reporting-obligation-template.csv" download>Obligation CSV</a>
          <a class="button-link secondary-link" href="data/shift-instance-template.csv" download>Shift instance CSV</a>
        </div>
      </div>
      <p class="muted">SAP, CSV, middleware or another HR source may differ internally. The Integration Hub translates source data into stable canonical identifiers before InteliMine creates reporting obligations or analytical facts.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Employee</th><th>Official job title</th><th>InteliMine role</th><th>Canonical org IDs</th><th>Source</th><th>Validation</th></tr></thead>
          <tbody>${employeeRows()}</tbody>
        </table>
      </div>
    </div>

    <div class="dashboard-grid integration-card">
      <div class="card">
        <div class="section-title"><h3>Role mapping</h3><span class="muted">Business translation layer</span></div>
        <div class="table-wrap">
          <table><thead><tr><th>Source</th><th>Source job title</th><th>Reporting role</th></tr></thead><tbody>${mappingRows()}</tbody></table>
        </div>
      </div>

      <div class="card">
        <div class="section-title"><h3>System boundaries</h3><span class="muted">One truth per responsibility</span></div>
        <div class="principle-stack">
          <div><strong>HR / ERP</strong><span>Owns official employee and organisational source data.</span></div>
          <div><strong>T&amp;A / roster</strong><span>Proves presence and supplies the trigger from which a reporting obligation is created.</span></div>
          <div><strong>Integration Hub</strong><span>Stages, validates, maps and applies source records into canonical IDs.</span></div>
          <div><strong>InteliMine</strong><span>Owns reporting obligations, structured checks, observations, issues and reporting-completion status.</span></div>
          <div><strong>Analytics layer</strong><span>Consumes stable fact grains and frozen context without depending on a specific BI product.</span></div>
        </div>
      </div>
    </div>

    <div class="card integration-card">
      <div class="section-title">
        <div><div class="eyebrow">Master + fact templates</div><h3>Analytics-safe data contracts</h3></div>
        <div class="download-actions">
          <a class="button-link secondary-link" href="data/equipment-master-template.csv" download>Equipment CSV</a>
          <a class="button-link secondary-link" href="data/area-master-template.csv" download>Area CSV</a>
          <a class="button-link secondary-link" href="data/event-type-taxonomy.csv" download>Event taxonomy CSV</a>
          <a class="button-link secondary-link" href="data/shift-check-fact-template.csv" download>Check fact CSV</a>
          <a class="button-link secondary-link" href="data/observation-fact-template.csv" download>Observation fact CSV</a>
          <a class="button-link secondary-link" href="data/issue-fact-template.csv" download>Issue fact CSV</a>
          <a class="button-link secondary-link" href="data/integration-batch-template.csv" download>Import batch CSV</a>
        </div>
      </div>
      <div class="dimension-grid">
        <div><strong>Operations</strong><span>${OPERATIONS.length} records</span></div>
        <div><strong>Departments</strong><span>${DEPARTMENTS.length} records</span></div>
        <div><strong>Areas</strong><span>${AREAS.length} records</span></div>
        <div><strong>Equipment</strong><span>${EQUIPMENT.length} records</span></div>
        <div><strong>Event types</strong><span>${EVENT_TYPES.length} controlled values</span></div>
      </div>
    </div>

    <div class="card integration-card">
      <div class="section-title"><h3>Employee Master field contract</h3><span class="muted">V1.3 canonical model</span></div>
      <div class="table-wrap">
        <table><thead><tr><th>Field</th><th>Requirement</th><th>Purpose</th></tr></thead><tbody>${fieldRows()}</tbody></table>
      </div>
    </div>
  `;
}
