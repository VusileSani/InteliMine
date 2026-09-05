import { REPORT_SCHEMAS } from "./reportSchemas.js";
import { reportingRoleLabel } from "./employeeMaster.js";
import { renderObservationComposer } from "./observation.js";
import { EQUIPMENT } from "./masterData.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderReportForm(employee, existingSubmission) {
  const roleCode = employee.reportingRole;
  const schema = REPORT_SCHEMAS[roleCode] || [];
  const answers = existingSubmission?.answers || {};

  const fields = schema.map(field => {
    const value = answers[field.key] || "";
    if (field.type === "choice") {
      return `
        <div class="question" data-question="${escapeHtml(field.key)}">
          <div class="question-title">${escapeHtml(field.label)}</div>
          <div class="choice-row">
            ${field.options.map(option => `
              <label class="choice">
                <input type="radio" name="${escapeHtml(field.key)}" value="${escapeHtml(option.value)}" ${value === option.value ? "checked" : ""} />
                <span>${escapeHtml(option.label)}</span>
              </label>
            `).join("")}
          </div>
        </div>`;
    }

    if (field.type === "select") {
      return `
        <div class="question" data-question="${escapeHtml(field.key)}">
          <div class="question-title">${escapeHtml(field.label)}</div>
          <select name="${escapeHtml(field.key)}">
            <option value="">Choose</option>
            ${field.options.map(option => `<option value="${escapeHtml(option.value)}" ${value === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
          </select>
        </div>`;
    }

    if (field.type === "equipment") {
      return `
        <div class="question" data-question="${escapeHtml(field.key)}">
          <div class="question-title">${escapeHtml(field.label)}</div>
          <select name="${escapeHtml(field.key)}">
            <option value="">Choose equipment</option>
            ${EQUIPMENT.filter(item => item.active).map(item => `<option value="${escapeHtml(item.id)}" ${value === item.id ? "selected" : ""}>${escapeHtml(item.code)} · ${escapeHtml(item.name)}</option>`).join("")}
          </select>
        </div>`;
    }

    if (field.type === "textarea") {
      return `
        <div class="question" data-question="${escapeHtml(field.key)}">
          <div class="question-title">${escapeHtml(field.label)}</div>
          <textarea name="${escapeHtml(field.key)}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(value)}</textarea>
        </div>`;
    }

    return `
      <div class="question" data-question="${escapeHtml(field.key)}">
        <div class="question-title">${escapeHtml(field.label)}</div>
        <input type="text" name="${escapeHtml(field.key)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || "")}" />
      </div>`;
  }).join("");

  if (!schema.length) {
    return `<div class="card"><div class="status-box danger">No reporting schema is configured for ${escapeHtml(roleCode || "this employee")}.</div></div>`;
  }

  return `
    <form id="shiftReportForm" class="card">
      <div class="section-title">
        <div>
          <div class="eyebrow">${escapeHtml(reportingRoleLabel(roleCode))} report</div>
          <h3>Compulsory shift handover</h3>
        </div>
        <span class="badge outstanding">Required</span>
      </div>
      <p class="muted">Every required question becomes a structured check fact. Normal conditions are analytically valuable; leaving the report unsubmitted is not.</p>
      <div class="role-report-section">
        ${fields}
      </div>
      ${renderObservationComposer(employee)}
      <div id="reportFormStatus"></div>
      <div class="form-actions">
        <button type="button" class="secondary" id="employeeSignOutButton">Sign out</button>
        <button type="submit" class="primary">Submit shift report</button>
      </div>
    </form>`;
}

export function readReportAnswers(form, roleCode) {
  const schema = REPORT_SCHEMAS[roleCode] || [];
  const answers = {};
  const missing = [];
  let requiresObservation = false;

  for (const field of schema) {
    let value = "";
    if (field.type === "choice") {
      value = form.querySelector(`[name="${CSS.escape(field.key)}"]:checked`)?.value || "";
    } else {
      value = form.elements[field.key]?.value?.trim() || "";
    }

    if (field.required && !value) missing.push(field.label);
    if (field.triggersObservation && value === "yes") requiresObservation = true;
    if (Array.isArray(field.analytics?.abnormalValues) && field.analytics.abnormalValues.includes(value)) requiresObservation = true;
    answers[field.key] = value;
  }

  return { answers, missing, requiresObservation };
}
