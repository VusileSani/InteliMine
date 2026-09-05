import { REPORT_SCHEMAS } from "./reportSchemas.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderReportForm(employee, existingSubmission) {
  const schema = REPORT_SCHEMAS[employee.role] || [];
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

  return `
    <form id="shiftReportForm" class="card">
      <div class="section-title">
        <div>
          <div class="eyebrow">${escapeHtml(employee.role)} report</div>
          <h3>Compulsory shift handover</h3>
        </div>
        <span class="badge outstanding">Required</span>
      </div>
      <p class="muted">Every required question must be answered. “No issues observed” is valid information; leaving the report unsubmitted is not.</p>
      ${fields}
      <div id="reportFormStatus"></div>
      <div class="form-actions">
        <button type="button" class="secondary" id="employeeSignOutButton">Sign out</button>
        <button type="submit" class="primary">Submit shift report</button>
      </div>
    </form>`;
}

export function readReportAnswers(form, role) {
  const schema = REPORT_SCHEMAS[role] || [];
  const answers = {};
  const missing = [];

  for (const field of schema) {
    let value = "";
    if (field.type === "choice") {
      value = form.querySelector(`[name="${CSS.escape(field.key)}"]:checked`)?.value || "";
    } else {
      value = form.elements[field.key]?.value?.trim() || "";
    }

    if (field.required && !value) missing.push(field.label);
    answers[field.key] = value;
  }

  return { answers, missing };
}
