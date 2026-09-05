import { APP_CONFIG } from "./config.js";
import { SHIFT_INSTANCE } from "./shift.js";
import { buildObservationFactRows, buildCheckFactRows, buildComplianceFactRows, buildIssueFactRows, analyticsDataQuality } from "./analyticsModel.js";
import { EVENT_TYPES, EQUIPMENT, AREAS } from "./masterData.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function csvValue(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function rowsToCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map(row => headers.map(header => csvValue(row[header])).join(","))].join("\n");
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function latestRows(rows) {
  return [...rows].sort((a, b) => new Date(b.reportedAtUtc) - new Date(a.reportedAtUtc)).slice(0, 8);
}

export function renderAnalytics(state) {
  const host = document.getElementById("analyticsWorkspace");
  const observationRows = buildObservationFactRows(state);
  const checkRows = buildCheckFactRows(state);
  const complianceRows = buildComplianceFactRows(state);
  const issueRows = buildIssueFactRows(state);
  const quality = analyticsDataQuality(state);
  const normalChecks = checkRows.filter(row => !row.abnormalFlag).length;
  const abnormalChecks = checkRows.filter(row => row.abnormalFlag).length;
  const openIssues = issueRows.filter(row => !["RESOLVED", "CLOSED"].includes(row.currentStatus)).length;

  host.innerHTML = `
    <div class="metrics">
      <div class="metric-card"><div class="metric-label">Structured checks</div><div class="metric-value">${checkRows.length}</div><div class="metric-note">${normalChecks} normal · ${abnormalChecks} abnormal</div></div>
      <div class="metric-card"><div class="metric-label">Observations</div><div class="metric-value">${observationRows.length}</div><div class="metric-note">Immutable operational facts</div></div>
      <div class="metric-card"><div class="metric-label">Managed issues</div><div class="metric-value">${issueRows.length}</div><div class="metric-note">${openIssues} currently open</div></div>
      <div class="metric-card"><div class="metric-label">Data integrity</div><div class="metric-value">${quality.completeness}%</div><div class="metric-note">Contract v${APP_CONFIG.dataContractVersion}</div></div>
    </div>

    <div class="card analytics-hero">
      <div class="section-title">
        <div><div class="eyebrow">Analytics integrity</div><h3>Preserve the fact. Manage the issue separately.</h3></div>
        <div class="download-actions">
          <button id="downloadObservationFacts" class="primary small">Observation facts CSV</button>
          <button id="downloadCheckFacts" class="secondary small">Check facts CSV</button>
          <button id="downloadComplianceFacts" class="secondary small">Compliance facts CSV</button>
          <button id="downloadIssueFacts" class="secondary small">Issue facts CSV</button>
          <button id="downloadAnalyticsDictionary" class="secondary small">Data dictionary JSON</button>
        </div>
      </div>
      <p class="muted">The operational application captures work; the analytical model preserves denominators, immutable observations, managed issue lifecycles, frozen employee context, version envelopes and provenance. A downstream BI or analytics platform can consume these datasets without reverse-engineering screens or free-text forms.</p>
      <div class="analytics-principles">
        <div><strong>Explicit denominator</strong><span>Every reporting obligation and every structured check is retained, including normal conditions.</span></div>
        <div><strong>Observation ≠ issue</strong><span>What an employee observed is immutable. How management responds lives in a separate lifecycle record.</span></div>
        <div><strong>Context frozen</strong><span>Role, department, area and job-title context are captured with the fact so future transfers do not rewrite history.</span></div>
        <div><strong>Time is shift-aware</strong><span>${escapeHtml(SHIFT_INSTANCE.shiftName)} runs ${escapeHtml(APP_CONFIG.shiftStartLocal)} to ${escapeHtml(APP_CONFIG.shiftEndLocal)}; cross-midnight observations resolve inside that interval.</span></div>
        <div><strong>Versioned meaning</strong><span>Report schema, taxonomy, master-data and analytical contract versions travel with the record.</span></div>
        <div><strong>Provenance retained</strong><span>Kiosk, cellphone, tablet and future integration sources remain distinguishable.</span></div>
      </div>
    </div>

    <div class="dashboard-grid integration-card">
      <div class="card">
        <div class="section-title"><h3>Latest immutable observations</h3><span class="muted">Observation fact grain</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Observation</th><th>Type</th><th>Asset / area</th><th>Severity</th><th>Issue</th><th>Reporter context</th></tr></thead>
            <tbody>${latestRows(observationRows).map(row => `<tr>
              <td><code>${escapeHtml(row.observationId)}</code><br /><span class="muted">${escapeHtml(row.localObservedDate)} ${escapeHtml(row.localObservedTime)}</span></td>
              <td>${escapeHtml(row.eventTypeName)}<br /><span class="muted">${escapeHtml(row.eventCategoryId)}</span></td>
              <td>${escapeHtml(row.equipmentCode || "—")}<br /><span class="muted">${escapeHtml(row.areaName)}</span></td>
              <td><span class="severity-chip ${escapeHtml(String(row.severityId).toLowerCase())}">${escapeHtml(row.severityId)}</span></td>
              <td>${row.issueId ? `<code>${escapeHtml(row.issueId)}</code>` : "No managed issue"}</td>
              <td>${escapeHtml(row.employeeName)}<br /><span class="muted">${escapeHtml(row.reportingRoleId)} · ${escapeHtml(row.departmentName)}</span></td>
            </tr>`).join("") || `<tr><td colspan="6" class="muted">No observation rows yet.</td></tr>`}</tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="section-title"><h3>Dataset families</h3><span class="muted">Separate analytical grains</span></div>
        <div class="principle-stack">
          <div><strong>${complianceRows.length} reporting obligations</strong><span>Who was required to report, completion status, override status and clock-off decision.</span></div>
          <div><strong>${checkRows.length} structured check facts</strong><span>Normal and abnormal answers provide both numerator and denominator.</span></div>
          <div><strong>${observationRows.length} observation facts</strong><span>One immutable row per noteworthy operational observation.</span></div>
          <div><strong>${issueRows.length} issue facts</strong><span>Operational problems managed across status transitions and, later, multiple observations/shifts.</span></div>
          <div><strong>${EVENT_TYPES.length} event taxonomy values</strong><span>Controlled vocabulary avoids fragmented synonyms.</span></div>
          <div><strong>${EQUIPMENT.length} assets · ${AREAS.length} areas</strong><span>Stable master-data keys keep facts joinable across years.</span></div>
        </div>
      </div>
    </div>

    <div class="card integration-card">
      <div class="section-title"><h3>Questions the model is now designed to answer</h3><span class="muted">Vendor-neutral analytics</span></div>
      <div class="question-grid">
        <span>Which assets have the highest abnormal-check rate, not merely the most defect counts?</span>
        <span>Which issues persist across shifts and accumulate repeated observations?</span>
        <span>How long do issues take to acknowledge, start, resolve and close?</span>
        <span>Which locations repeatedly move from normal checks to abnormal observations?</span>
        <span>Was a reporting obligation actually created for every person who clocked in?</span>
        <span>What did the employee's role and organisational context look like when the fact was captured?</span>
        <span>Which capture channels produce incomplete or lower-quality records?</span>
        <span>What was known, by whom and when, before an incident or failure?</span>
      </div>
    </div>

    ${quality.errors.length ? `<div class="card integration-card"><div class="status-box warning"><strong>Data integrity issues detected</strong><br />${quality.errors.map(escapeHtml).join("<br />")}</div></div>` : ""}
  `;
}

export function bindAnalyticsActions({ getState }) {
  const host = document.getElementById("analyticsWorkspace");
  host.addEventListener("click", event => {
    if (event.target?.id === "downloadObservationFacts") {
      downloadText(`intelimine-observation-facts-${APP_CONFIG.shiftId}.csv`, rowsToCsv(buildObservationFactRows(getState())), "text/csv;charset=utf-8");
    }
    if (event.target?.id === "downloadCheckFacts") {
      downloadText(`intelimine-check-facts-${APP_CONFIG.shiftId}.csv`, rowsToCsv(buildCheckFactRows(getState())), "text/csv;charset=utf-8");
    }
    if (event.target?.id === "downloadComplianceFacts") {
      downloadText(`intelimine-compliance-facts-${APP_CONFIG.shiftId}.csv`, rowsToCsv(buildComplianceFactRows(getState())), "text/csv;charset=utf-8");
    }
    if (event.target?.id === "downloadIssueFacts") {
      downloadText(`intelimine-issue-facts-${APP_CONFIG.shiftId}.csv`, rowsToCsv(buildIssueFactRows(getState())), "text/csv;charset=utf-8");
    }
    if (event.target?.id === "downloadAnalyticsDictionary") {
      const state = getState();
      const dictionary = {
        contractVersion: APP_CONFIG.dataContractVersion,
        reportSchemaVersion: APP_CONFIG.reportSchemaVersion,
        eventTaxonomyVersion: APP_CONFIG.eventTaxonomyVersion,
        observationFactFields: Object.keys(buildObservationFactRows(state)[0] || {}),
        checkFactFields: Object.keys(buildCheckFactRows(state)[0] || {}),
        complianceFactFields: Object.keys(buildComplianceFactRows(state)[0] || {}),
        issueFactFields: Object.keys(buildIssueFactRows(state)[0] || {})
      };
      downloadText("intelimine-analytics-data-dictionary.json", JSON.stringify(dictionary, null, 2), "application/json;charset=utf-8");
    }
  });
}
