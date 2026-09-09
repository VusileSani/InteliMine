import { reportSchemaForRole } from "./reportSchemas.js";
import { reportingRoleLabel } from "./employeeMaster.js";
import { renderObservationComposer } from "./observation.js";
import { EQUIPMENT, eventTypeById } from "./masterData.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function quickCaptureCarryForward(quickCaptures=[]) {
  if(!quickCaptures.length) return "";
  return `<details class="compact-disclosure handover-capture-review" open>
    <summary><div><strong>Captured during this shift</strong><span>Already recorded — untick only what should not carry forward</span></div><span class="chevron">›</span></summary>
    <div class="capture-carry-list">
      ${quickCaptures.map(item=>`<label class="capture-carry-row">
        <input type="checkbox" name="carryObservationId" value="${escapeHtml(item.observationId)}" checked />
        <span><strong>${escapeHtml(eventTypeById(item.eventTypeId)?.label||"Observation")}</strong><small>${escapeHtml(item.narrative)} · ${escapeHtml(item.severityId||"INFO")}</small></span>
      </label>`).join("")}
    </div>
  </details>`;
}

function questionAttrs(field) {
  const base=`data-question="${escapeHtml(field.key)}"`;
  if (!field.requiredWhen) return base;
  return `${base} data-required-when-key="${escapeHtml(field.requiredWhen.key)}" data-required-when-values="${escapeHtml((field.requiredWhen.values||[]).join(","))}"`;
}

export function renderReportForm(employee, existingSubmission, {quickCaptures=[]}={}) {
  const roleCode = employee.reportingRole;
  const schema = reportSchemaForRole(roleCode);
  const answers = existingSubmission?.answers || {};

  const fields = schema.map(field => {
    const value = answers[field.key] || "";
    if (field.type === "choice") {
      return `
        <div class="question" ${questionAttrs(field)}>
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
        <div class="question" ${questionAttrs(field)}>
          <div class="question-title">${escapeHtml(field.label)}</div>
          <select name="${escapeHtml(field.key)}">
            <option value="">Choose</option>
            ${field.options.map(option => `<option value="${escapeHtml(option.value)}" ${value === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
          </select>
        </div>`;
    }

    if (field.type === "equipment") {
      return `
        <div class="question" ${questionAttrs(field)}>
          <div class="question-title">${escapeHtml(field.label)}</div>
          <select name="${escapeHtml(field.key)}">
            <option value="">Choose equipment</option>
            ${EQUIPMENT.filter(item => item.active).map(item => `<option value="${escapeHtml(item.id)}" ${value === item.id ? "selected" : ""}>${escapeHtml(item.code)} · ${escapeHtml(item.name)}</option>`).join("")}
          </select>
        </div>`;
    }

    if (field.type === "textarea") {
      return `
        <div class="question" ${questionAttrs(field)}>
          <div class="question-title">${escapeHtml(field.label)}</div>
          <textarea name="${escapeHtml(field.key)}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(value)}</textarea>
        </div>`;
    }

    return `
      <div class="question" ${questionAttrs(field)}>
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
          <h3>Shift handover</h3>
        </div>
        <span class="badge outstanding">Required</span>
      </div>
      <p class="muted">Record only what the next shift needs to understand, continue or act on.</p>
      <div class="role-report-section">${fields}</div>
      ${quickCaptureCarryForward(quickCaptures)}
      ${renderObservationComposer(employee)}
      <div id="reportFormStatus"></div>
      <div class="form-actions">
        <button type="button" class="secondary" id="employeeSignOutButton">Sign out</button>
        <button type="submit" class="primary">Submit shift report</button>
      </div>
    </form>`;
}

export function bindReportConditionalFields(form) {
  if (!form) return () => {};
  const refresh = () => {
    for (const node of form.querySelectorAll("[data-required-when-key]")) {
      const key=node.dataset.requiredWhenKey;
      const allowed=(node.dataset.requiredWhenValues||"").split(",").filter(Boolean);
      const control=form.elements[key];
      const value=control?.value||"";
      const visible=allowed.includes(value);
      node.classList.toggle("hidden",!visible);
      for(const input of node.querySelectorAll("input,select,textarea")) input.disabled=!visible;
    }
  };
  form.addEventListener("change",refresh);
  refresh();
  return refresh;
}

export function readReportAnswers(form, roleCode) {
  const schema = reportSchemaForRole(roleCode);
  const answers = {};
  const missing = [];
  let requiresObservation = false;

  for (const field of schema) {
    let value = "";
    if (field.type === "choice") value = form.querySelector(`[name="${CSS.escape(field.key)}"]:checked`)?.value || "";
    else value = form.elements[field.key]?.value?.trim() || "";
    answers[field.key] = value;
    if (field.triggersObservation && value === "yes") requiresObservation = true;
  }

  for (const field of schema) {
    const requiredByCondition=field.requiredWhen && field.requiredWhen.key && (field.requiredWhen.values||[]).includes(answers[field.requiredWhen.key]);
    if ((field.required || requiredByCondition) && !answers[field.key]) missing.push(field.label);
  }

  const carryObservationIds=[...form.querySelectorAll?.('[name="carryObservationId"]:checked')||[]].map(input=>input.value).filter(Boolean);
  return { answers, missing, requiresObservation, carryObservationIds };
}
