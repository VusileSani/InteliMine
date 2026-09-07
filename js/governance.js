import { ACCESS_SCOPES, activeGovernors, normalizeAccessModel, privilegedRolePresets, rolePresetById } from "./accessControl.js";

let bindings = null;
const ACTOR = "MineMind Platform Owner";

function esc(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function nowIso() { return new Date().toISOString(); }
function employeeName(employee) { return employee ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.employeeNumber : "Unknown employee"; }

function authorityRows(state) {
  const authorities = state.platformAuthorities || [];
  if (!authorities.length) return `<div class="empty-state">No privileged authorities configured.</div>`;
  return `<div class="admin-list">${authorities.map(auth => {
    const employee = (state.employees || []).find(e => e.id === auth.employeeId);
    const display = auth.displayName || employeeName(employee);
    const role = rolePresetById(state, auth.rolePresetId);
    const active = auth.status === "ACTIVE";
    const governorCount = activeGovernors(state).length;
    const protectedLastGovernor = active && auth.rolePresetId === "platform_governance" && governorCount <= 1;
    return `<div class="admin-row ${active ? "" : "inactive"}">
      <div class="admin-row-copy"><strong>${esc(display)}</strong><span>${esc(role?.label || auth.rolePresetId)} · ${active ? "Active" : "Inactive"} · granted by ${esc(auth.grantedBy || "Unknown")}</span></div>
      <div class="admin-row-actions">${protectedLastGovernor ? `<span class="badge warning">Last governor protected</span>` : `<button class="small ${active ? "ghost-danger" : "secondary"}" data-authority-toggle="${esc(auth.id)}">${active ? "Revoke" : "Restore"}</button>`}</div>
    </div>`;
  }).join("")}</div>`;
}

function rolePresetRows(state) {
  return (state.rolePresets || []).map(role => `
    <form class="role-preset-row" data-role-preset="${esc(role.id)}">
      <div>
        <strong>${esc(role.tier)}</strong>
        <span class="muted">${role.protected ? "Protected authority tier" : "Operational role preset"}</span>
      </div>
      <label>Display label<input name="label" value="${esc(role.label)}" required /></label>
      <label>Default scope<select name="defaultScope">${Object.entries(ACCESS_SCOPES).map(([id,label]) => `<option value="${id}" ${role.defaultScope===id?"selected":""}>${esc(label)}</option>`).join("")}</select></label>
      <label>Who may assign<select name="assignmentAuthority" ${role.protected ? "disabled" : ""}><option value="SYSTEM_ADMIN" ${(role.assignableBy||[]).includes("SYSTEM_ADMIN")?"selected":""}>System Administration</option><option value="PLATFORM_GOVERNANCE" ${!(role.assignableBy||[]).includes("SYSTEM_ADMIN")?"selected":""}>Platform Governance only</option></select></label>
      <label class="full">Description<input name="description" value="${esc(role.description)}" required /></label>
      <div class="full admin-form-actions"><button class="secondary small" type="submit">Save label & delegation</button></div>
    </form>`).join("");
}

function employeeOptions(state) {
  return (state.employees || []).filter(e => e.employmentStatus !== "INACTIVE").map(e => `<option value="${esc(e.id)}">${esc(employeeName(e))} · ${esc(e.employeeNumber)}</option>`).join("");
}

export function renderGovernance(state) {
  normalizeAccessModel(state);
  const host = document.getElementById("governanceWorkspace");
  if (!host) return;
  host.innerHTML = `
    <div class="governance-stack">
      <section class="card">
        <div class="admin-form-head"><div><div class="eyebrow">Protected authority</div><h3>Administrative Authority</h3><p class="muted">System Administrator and Platform Governance authority can only be granted here. At least one active governor must remain.</p></div></div>
        ${authorityRows(state)}
        <form id="grantAuthorityForm" class="admin-form compact-governance-form">
          <label>Employee<select name="employeeId" required><option value="">Choose employee</option>${employeeOptions(state)}</select></label>
          <label>Authority<select name="rolePresetId" required>${privilegedRolePresets(state).map(role => `<option value="${esc(role.id)}">${esc(role.label)}</option>`).join("")}</select></label>
          <label class="full">Reason<input name="reason" required placeholder="Why this authority is required" /></label>
          <div class="full admin-form-actions"><button class="primary" type="submit">Grant authority</button></div>
        </form>
        <div id="governanceStatus"></div>
      </section>
      <section class="card">
        <div class="admin-form-head"><div><div class="eyebrow">Access model</div><h3>Role labels & delegation</h3><p class="muted">Rename MineMind-facing roles without changing their protected underlying authority tier. Operational job titles remain separate.</p></div></div>
        <div class="role-preset-grid">${rolePresetRows(state)}</div>
      </section>
      <section class="card">
        <div class="admin-form-head"><div><div class="eyebrow">Privileged audit</div><h3>Recent authority activity</h3></div></div>
        <div class="audit-list">${(state.auditTrail || []).filter(x => String(x.type || "").includes("AUTH") || String(x.type || "").includes("ROLE_PRESET")).slice(-12).reverse().map(x => `<div class="audit-row"><strong>${esc(x.type)}</strong><span>${esc(x.subject || x.itemId || "Access model")} · ${new Date(x.at).toLocaleString()} · ${esc(x.actor || ACTOR)}</span><small>${esc(x.reason || x.action || "")}</small></div>`).join("") || `<div class="empty-state">No privileged changes recorded yet.</div>`}</div>
      </section>
    </div>`;
}

function status(message, tone="success") {
  const host = document.getElementById("governanceStatus");
  if (host) host.innerHTML = `<div class="status-box ${tone}">${esc(message)}</div>`;
}

function grantAuthority(form) {
  const state = normalizeAccessModel(bindings.getState());
  const data = new FormData(form);
  const employeeId = String(data.get("employeeId") || "");
  const rolePresetId = String(data.get("rolePresetId") || "");
  const reason = String(data.get("reason") || "").trim();
  const employee = (state.employees || []).find(e => e.id === employeeId);
  const role = rolePresetById(state, rolePresetId);
  if (!employee || !role?.protected || !reason) { status("Choose a valid employee, protected authority and reason.", "warning"); return; }
  if ((state.platformAuthorities || []).some(a => a.employeeId === employeeId && a.rolePresetId === rolePresetId && a.status === "ACTIVE")) { status("That authority is already active for this employee.", "warning"); return; }
  state.platformAuthorities.push({ id:`auth_${Date.now()}`, employeeId, rolePresetId, status:"ACTIVE", grantedBy:ACTOR, grantedAt:nowIso(), reason });
  state.auditTrail.push({ type:"PRIVILEGED_AUTHORITY_GRANTED", subject:employeeName(employee), rolePresetId, actor:ACTOR, reason, at:nowIso() });
  bindings.setState(state); bindings.onStateChange(); renderGovernance(bindings.getState());
}

function toggleAuthority(id) {
  const state = normalizeAccessModel(bindings.getState());
  const auth = state.platformAuthorities.find(a => a.id === id); if (!auth) return;
  if (auth.status === "ACTIVE" && auth.rolePresetId === "platform_governance" && activeGovernors(state).length <= 1) { status("MineMind must retain at least one active Platform Governor.", "warning"); return; }
  auth.status = auth.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const employee = (state.employees || []).find(e => e.id === auth.employeeId);
  state.auditTrail.push({ type: auth.status === "ACTIVE" ? "PRIVILEGED_AUTHORITY_RESTORED" : "PRIVILEGED_AUTHORITY_REVOKED", subject:auth.displayName || employeeName(employee), rolePresetId:auth.rolePresetId, actor:ACTOR, reason:"Governance authority change", at:nowIso() });
  bindings.setState(state); bindings.onStateChange(); renderGovernance(bindings.getState());
}

function savePreset(form) {
  const state = normalizeAccessModel(bindings.getState());
  const role = rolePresetById(state, form.dataset.rolePreset); if (!role) return;
  const data = new FormData(form);
  const oldLabel = role.label;
  role.label = String(data.get("label") || role.label).trim();
  role.description = String(data.get("description") || role.description).trim();
  role.defaultScope = String(data.get("defaultScope") || role.defaultScope);
  if (!role.protected) {
    const authority = String(data.get("assignmentAuthority") || "SYSTEM_ADMIN");
    role.assignableBy = authority === "PLATFORM_GOVERNANCE" ? ["PLATFORM_GOVERNANCE"] : ["SYSTEM_ADMIN", "PLATFORM_GOVERNANCE"];
  }
  state.auditTrail.push({ type:"ROLE_PRESET_UPDATED", subject:role.tier, actor:ACTOR, reason:`Label: ${oldLabel} → ${role.label}`, at:nowIso() });
  bindings.setState(state); bindings.onStateChange(); renderGovernance(bindings.getState());
}

export function bindGovernanceExperience(args) {
  bindings = args;
  const host = document.getElementById("governanceWorkspace"); if (!host) return;
  host.addEventListener("submit", e => {
    if (e.target?.id === "grantAuthorityForm") { e.preventDefault(); grantAuthority(e.target); return; }
    if (e.target?.matches("[data-role-preset]")) { e.preventDefault(); savePreset(e.target); }
  });
  host.addEventListener("click", e => {
    const button = e.target.closest("[data-authority-toggle]");
    if (button) toggleAuthority(button.dataset.authorityToggle);
  });
}
