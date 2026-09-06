import { AREAS, EQUIPMENT, eventTypesForRole, eventTypeById, areaById, equipmentById, SEVERITIES } from "./masterData.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function eventTypeOptions(roleCode) {
  return eventTypesForRole(roleCode)
    .map(type => `<option value="${escapeHtml(type.id)}">${escapeHtml(type.label)}</option>`)
    .join("");
}

function areaOptions(defaultAreaId) {
  return AREAS.filter(area => area.active !== false).map(area => `<option value="${escapeHtml(area.id)}" ${area.id === defaultAreaId ? "selected" : ""}>${escapeHtml(area.code)} · ${escapeHtml(area.name)}</option>`).join("");
}

function equipmentOptions() {
  return EQUIPMENT.filter(item => item.active)
    .map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.code)} · ${escapeHtml(item.name)}</option>`)
    .join("");
}

function severityOptions() {
  return SEVERITIES.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === "MEDIUM" ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("");
}

export function renderObservationComposer(employee) {
  return `
    <section class="observation-section">
      <div class="section-title observation-title">
        <div>
          <div class="eyebrow">Shift observation</div>
          <h3>Operational observations</h3>
        </div>
        
      </div>
      <p class="muted">Record anything the next shift or supervisor needs to know. If action is required, it will be carried into management follow-up.</p>

      <div class="question">
        <div class="question-title">Anything from this shift that needs to be handed over?</div>
        <div class="choice-row">
          <label class="choice"><input type="radio" name="observationDeclared" value="yes" /><span>Yes — add observation</span></label>
          <label class="choice"><input type="radio" name="observationDeclared" value="no" /><span>No</span></label>
        </div>
      </div>

      <div id="observationEditor" class="observation-editor hidden">
        <div class="observation-grid">
          <label>Event type
            <select id="obsEventType"><option value="">Choose event type</option>${eventTypeOptions(employee.reportingRole)}</select>
          </label>
          <label>Severity
            <select id="obsSeverity">${severityOptions()}</select>
          </label>
          <label>Area / location
            <select id="obsArea">${areaOptions(employee.areaId)}</select>
          </label>
          <label>Equipment
            <select id="obsEquipment"><option value="">No specific equipment</option>${equipmentOptions()}</select>
          </label>
          <label>Approx. time observed
            <input id="obsTime" type="time" />
          </label>
          <label>Action required?
            <select id="obsActionRequired"><option value="">Choose</option><option value="yes">Yes</option><option value="no">No</option></select>
          </label>
          <label class="full">What happened?
            <textarea id="obsNarrative" placeholder="Describe what happened and what the next shift needs to know."></textarea>
          </label>
          <div class="full observation-actions">
            <button type="button" id="addObservationButton" class="secondary">+ Add observation</button>
            <div id="observationEditorStatus"></div>
          </div>
        </div>
      </div>

      <div id="observationList" class="observation-list"></div>
    </section>`;
}

export function bindObservationComposer(form, employee) {
  const editor = form.querySelector("#observationEditor");
  const list = form.querySelector("#observationList");
  const status = form.querySelector("#observationEditorStatus");
  const declaredInputs = [...form.querySelectorAll('[name="observationDeclared"]')];
  let observations = [];

  function clearEditor() {
    form.querySelector("#obsEventType").value = "";
    form.querySelector("#obsSeverity").value = "MEDIUM";
    form.querySelector("#obsArea").value = employee.areaId;
    form.querySelector("#obsEquipment").value = "";
    form.querySelector("#obsTime").value = "";
    form.querySelector("#obsActionRequired").value = "";
    form.querySelector("#obsNarrative").value = "";
    status.innerHTML = "";
  }

  function renderList() {
    if (!observations.length) {
      list.innerHTML = "";
      return;
    }

    list.innerHTML = observations.map((item, index) => {
      const type = eventTypeById(item.eventTypeId);
      const area = areaById(item.areaId);
      const equipment = equipmentById(item.equipmentId);
      return `<div class="observation-card">
        <div>
          <strong>${escapeHtml(type?.label || item.eventTypeId)}</strong>
          <div class="muted">${escapeHtml(item.severityId)} · ${escapeHtml(area?.name || item.areaId)}${equipment ? ` · ${escapeHtml(equipment.code)}` : ""} · Action ${item.actionRequired === "yes" ? "required" : "not required"}</div>
          <div class="observation-copy">${escapeHtml(item.narrative)}</div>
        </div>
        <button type="button" class="small danger" data-remove-observation="${index}">Remove</button>
      </div>`;
    }).join("");
  }

  function declaredValue() {
    return form.querySelector('[name="observationDeclared"]:checked')?.value || "";
  }

  function setDeclared(value) {
    if (value === "yes") {
      editor.classList.remove("hidden");
      return;
    }
    editor.classList.add("hidden");
    if (value === "no") {
      observations = [];
      renderList();
      clearEditor();
    }
  }

  function addObservation() {
    const eventTypeId = form.querySelector("#obsEventType").value;
    const severityId = form.querySelector("#obsSeverity").value;
    const areaId = form.querySelector("#obsArea").value;
    const equipmentId = form.querySelector("#obsEquipment").value;
    const observedTime = form.querySelector("#obsTime").value;
    const actionRequired = form.querySelector("#obsActionRequired").value;
    const narrative = form.querySelector("#obsNarrative").value.trim();
    const type = eventTypeById(eventTypeId);

    const missing = [];
    if (!eventTypeId) missing.push("event type");
    if (!severityId) missing.push("severity");
    if (!areaId) missing.push("area");
    if (!observedTime) missing.push("approximate observation time");
    if (!actionRequired) missing.push("action requirement");
    if (!narrative) missing.push("observation context");
    if (type?.requiresEquipment && !equipmentId) missing.push("equipment");

    if (missing.length) {
      status.innerHTML = `<div class="status-box warning">Complete: ${escapeHtml(missing.join(", "))}.</div>`;
      return;
    }

    observations.push({ eventTypeId, severityId, areaId, equipmentId, observedTime, actionRequired, narrative });
    clearEditor();
    renderList();
  }

  declaredInputs.forEach(input => input.addEventListener("change", () => setDeclared(input.value)));
  form.querySelector("#addObservationButton").addEventListener("click", addObservation);
  list.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-observation]");
    if (!button) return;
    observations.splice(Number(button.dataset.removeObservation), 1);
    renderList();
  });

  return {
    read() {
      const declared = declaredValue();
      const missing = [];
      if (!declared) missing.push("Confirm whether you observed anything that should be tracked");
      if (declared === "yes" && !observations.length) missing.push("Add at least one structured observation");
      return { declared, observations: [...observations], missing };
    }
  };
}
