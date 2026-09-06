import { APP_CONFIG } from "./config.js";
import { REPORTING_ROLES } from "./employeeMaster.js";
import { DEPARTMENTS, AREAS, OPERATIONS } from "./masterData.js";

let bindings = null;
let activeCategory = "employees";
let editingId = null;

const CATEGORY_LABELS = {
  employees: "Employees",
  departments: "Departments",
  areas: "Areas",
  equipment: "Equipment",
  eventTypes: "Event types",
  criticalControls: "Critical controls",
  operations: "Operation"
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slug(value) {
  return String(value || "")
    .trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function nowIso() { return new Date().toISOString(); }

function option(value, label, selected) {
  return `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function categoryArray(state, category) {
  if (category === "employees") return state.employees || [];
  const md = state.masterData || {};
  return md[category] || [];
}

function itemKey(category) {
  return category === "employees" ? "id" : "id";
}

function itemTitle(category, item) {
  if (category === "employees") return `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.employeeNumber;
  if (category === "criticalControls") return item.label || item.id;
  return item.name || item.label || item.code || item.id;
}

function itemMeta(category, item) {
  if (category === "employees") {
    return `${item.employeeNumber} · ${REPORTING_ROLES[item.reportingRole] || item.reportingRole || "Unmapped"} · ${item.employmentStatus || "ACTIVE"}`;
  }
  if (category === "equipment") return `${item.code || ""} · ${item.equipmentClass || "Equipment"}`;
  if (category === "eventTypes") return `${item.category || ""} · ${(item.roles || []).map(r => REPORTING_ROLES[r] || r).join(", ")}`;
  if (category === "criticalControls") return `${item.hazardLabel || item.hazardId || "Critical control"}`;
  if (category === "areas" || category === "departments" || category === "operations") return item.code || "";
  return item.code || "";
}

function isActive(category, item) {
  if (category === "employees") return item.employmentStatus !== "INACTIVE";
  return item.active !== false;
}

function renderList(state) {
  const items = [...categoryArray(state, activeCategory)].sort((a,b) => itemTitle(activeCategory,a).localeCompare(itemTitle(activeCategory,b)));
  if (!items.length) return `<div class="empty-state">No ${escapeHtml(CATEGORY_LABELS[activeCategory].toLowerCase())} configured.</div>`;
  return `<div class="admin-list">${items.map(item => `
    <div class="admin-row ${isActive(activeCategory,item) ? "" : "inactive"}">
      <div class="admin-row-copy">
        <strong>${escapeHtml(itemTitle(activeCategory,item))}</strong>
        <span>${escapeHtml(itemMeta(activeCategory,item))}</span>
      </div>
      <div class="admin-row-actions">
        <button class="small secondary" data-admin-edit="${escapeHtml(item[itemKey(activeCategory)])}">Edit</button>
        ${activeCategory !== "operations" ? `<button class="small ${isActive(activeCategory,item) ? "ghost-danger" : "secondary"}" data-admin-toggle="${escapeHtml(item[itemKey(activeCategory)])}">${isActive(activeCategory,item) ? "Deactivate" : "Activate"}</button>` : ""}
      </div>
    </div>`).join("")}</div>`;
}

function departmentOptions(selected="") {
  return DEPARTMENTS.filter(item => item.active !== false || item.id === selected).map(item => option(item.id, item.name, selected)).join("");
}
function areaOptions(selected="") {
  return AREAS.filter(item => item.active !== false || item.id === selected).map(item => option(item.id, `${item.code} · ${item.name}`, selected)).join("");
}
function operationOptions(selected="") {
  return OPERATIONS.map(item => option(item.id, item.name, selected)).join("");
}
function roleOptions(selected="") {
  return Object.entries(REPORTING_ROLES).map(([id,label]) => option(id,label,selected)).join("");
}

function editItem(state) {
  return editingId ? categoryArray(state, activeCategory).find(item => item.id === editingId) || null : null;
}

function renderForm(state) {
  const item = editItem(state) || {};
  const editing = Boolean(editingId);
  const heading = editing ? `Edit ${CATEGORY_LABELS[activeCategory].replace(/s$/, "")}` : `Add ${CATEGORY_LABELS[activeCategory].replace(/s$/, "")}`;

  if (activeCategory === "employees") return `
    <div class="admin-form-head"><div><div class="eyebrow">People</div><h3>${heading}</h3></div>${editing ? `<button class="small secondary" data-admin-cancel>Cancel</button>` : ""}</div>
    <form id="adminEditor" class="admin-form" data-category="employees">
      <label>Employee number<input name="employeeNumber" required value="${escapeHtml(item.employeeNumber || "")}" /></label>
      <label>PIN<input name="pin" required inputmode="numeric" value="${escapeHtml(item.pin || "")}" /></label>
      <label>First name<input name="firstName" required value="${escapeHtml(item.firstName || "")}" /></label>
      <label>Last name<input name="lastName" required value="${escapeHtml(item.lastName || "")}" /></label>
      <label>Job title<input name="jobTitle" required value="${escapeHtml(item.jobTitle || "")}" /></label>
      <label>Reporting role<select name="reportingRole" required><option value="">Choose role</option>${roleOptions(item.reportingRole)}</select></label>
      <label>Department<select name="departmentId" required><option value="">Choose department</option>${departmentOptions(item.departmentId)}</select></label>
      <label>Area<select name="areaId" required><option value="">Choose area</option>${areaOptions(item.areaId)}</select></label>
      <label>Shift group<input name="shiftGroup" value="${escapeHtml(item.shiftGroup || "")}" /></label>
      <label>Supervisor employee no.<input name="supervisorEmployeeNo" value="${escapeHtml(item.supervisorEmployeeNo || "")}" /></label>
      <label class="full check-line"><input name="assignCurrentShift" type="checkbox" ${editing ? "" : "checked"} /> Require handover for the current shift</label>
      <div class="full admin-form-actions"><button class="primary" type="submit">${editing ? "Save changes" : "Add employee"}</button></div>
    </form>`;

  if (activeCategory === "departments") return simpleCodeNameForm(heading, item, editing, "departments", "Department");
  if (activeCategory === "areas") return `
    <div class="admin-form-head"><h3>${heading}</h3>${editing ? `<button class="small secondary" data-admin-cancel>Cancel</button>` : ""}</div>
    <form id="adminEditor" class="admin-form" data-category="areas">
      <label>Area code<input name="code" required value="${escapeHtml(item.code || "")}" /></label>
      <label>Area name<input name="name" required value="${escapeHtml(item.name || "")}" /></label>
      <label>Operation<select name="operationId" required>${operationOptions(item.operationId || APP_CONFIG.operationId)}</select></label>
      <div class="full admin-form-actions"><button class="primary" type="submit">${editing ? "Save changes" : "Add area"}</button></div>
    </form>`;
  if (activeCategory === "equipment") return `
    <div class="admin-form-head"><h3>${heading}</h3>${editing ? `<button class="small secondary" data-admin-cancel>Cancel</button>` : ""}</div>
    <form id="adminEditor" class="admin-form" data-category="equipment">
      <label>Equipment code<input name="code" required value="${escapeHtml(item.code || "")}" /></label>
      <label>Equipment name<input name="name" required value="${escapeHtml(item.name || "")}" /></label>
      <label>Class<input name="equipmentClass" required placeholder="e.g. CONVEYOR" value="${escapeHtml(item.equipmentClass || "")}" /></label>
      <label>Area<select name="areaId" required><option value="">Choose area</option>${areaOptions(item.areaId)}</select></label>
      <div class="full admin-form-actions"><button class="primary" type="submit">${editing ? "Save changes" : "Add equipment"}</button></div>
    </form>`;
  if (activeCategory === "eventTypes") return `
    <div class="admin-form-head"><h3>${heading}</h3>${editing ? `<button class="small secondary" data-admin-cancel>Cancel</button>` : ""}</div>
    <form id="adminEditor" class="admin-form" data-category="eventTypes">
      <label>Event label<input name="label" required value="${escapeHtml(item.label || "")}" /></label>
      <label>Category<select name="category" required>${["EQUIPMENT","ELECTRICAL","SAFETY","OPERATIONS","PEOPLE"].map(v=>option(v,v,item.category)).join("")}</select></label>
      <label class="check-line"><input type="checkbox" name="requiresEquipment" ${item.requiresEquipment ? "checked" : ""} /> Equipment required</label>
      <fieldset class="full admin-role-field"><legend>Available to</legend>${Object.entries(REPORTING_ROLES).map(([id,label]) => `<label class="check-line"><input type="checkbox" name="roles" value="${id}" ${(item.roles || []).includes(id) ? "checked" : ""} /> ${escapeHtml(label)}</label>`).join("")}</fieldset>
      <div class="full admin-form-actions"><button class="primary" type="submit">${editing ? "Save changes" : "Add event type"}</button></div>
    </form>`;
  if (activeCategory === "criticalControls") return `
    <div class="admin-form-head"><h3>${heading}</h3>${editing ? `<button class="small secondary" data-admin-cancel>Cancel</button>` : ""}</div>
    <form id="adminEditor" class="admin-form" data-category="criticalControls">
      <label>Hazard group<input name="hazardLabel" required value="${escapeHtml(item.hazardLabel || "")}" /></label>
      <label class="full">Control verification<input name="label" required value="${escapeHtml(item.label || "")}" /></label>
      <div class="full admin-form-actions"><button class="primary" type="submit">${editing ? "Save changes" : "Add critical control"}</button></div>
    </form>`;
  if (activeCategory === "operations") return simpleCodeNameForm("Edit operation", item.id ? item : (categoryArray(state,"operations")[0]||{}), true, "operations", "Operation");
  return "";
}

function simpleCodeNameForm(heading, item, editing, category, noun) {
  return `<div class="admin-form-head"><h3>${heading}</h3>${editing && category !== "operations" ? `<button class="small secondary" data-admin-cancel>Cancel</button>` : ""}</div>
    <form id="adminEditor" class="admin-form" data-category="${category}">
      <label>${noun} code<input name="code" required value="${escapeHtml(item.code || "")}" /></label>
      <label>${noun} name<input name="name" required value="${escapeHtml(item.name || "")}" /></label>
      <div class="full admin-form-actions"><button class="primary" type="submit">Save</button></div>
    </form>`;
}

export function renderAdmin(state) {
  const host = document.getElementById("adminWorkspace");
  if (!host) return;
  if (activeCategory === "operations" && !editingId) editingId = (state.masterData?.operations || [])[0]?.id || null;
  host.innerHTML = `
    <div class="admin-layout">
      <section class="card admin-browser">
        <div class="admin-toolbar">
          <label>Manage
            <select id="adminCategory">${Object.entries(CATEGORY_LABELS).map(([id,label]) => option(id,label,activeCategory)).join("")}</select>
          </label>
          ${activeCategory !== "operations" ? `<button class="secondary" id="adminAddButton">+ Add</button>` : ""}
        </div>
        <div class="admin-summary">${categoryArray(state, activeCategory).filter(item => isActive(activeCategory,item)).length} active · ${categoryArray(state, activeCategory).length} total</div>
        ${renderList(state)}
      </section>
      <section class="card admin-editor">${renderForm(state)}<div id="adminStatus"></div></section>
    </div>`;
}

function setStatus(message, tone="success") {
  const host = document.getElementById("adminStatus");
  if (host) host.innerHTML = `<div class="status-box ${tone}">${escapeHtml(message)}</div>`;
}

function employeeContext(state, employee) {
  const dept = (state.masterData.departments || []).find(x => x.id === employee.departmentId);
  const area = (state.masterData.areas || []).find(x => x.id === employee.areaId);
  const op = (state.masterData.operations || []).find(x => x.id === employee.operationId);
  return {
    employeeId: employee.id,
    employeeNumber: employee.employeeNumber,
    employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
    jobTitle: employee.jobTitle,
    reportingRoleId: employee.reportingRole,
    departmentId: employee.departmentId,
    departmentName: dept?.name || employee.departmentId,
    areaId: employee.areaId,
    areaName: area?.name || employee.areaId,
    operationId: employee.operationId,
    operationName: op?.name || employee.operationId,
    supervisorEmployeeNo: employee.supervisorEmployeeNo || "",
    shiftGroup: employee.shiftGroup || "",
    workLocation: employee.workLocation || "",
    employeeMasterEffectiveFrom: employee.effectiveFrom,
    employeeMasterLastUpdatedAt: employee.lastUpdatedAt
  };
}

function assignCurrentShift(state, employee) {
  const existingAttendance = (state.attendance || []).find(x => x.employeeId === employee.id && x.shiftInstanceId === APP_CONFIG.shiftInstanceId);
  if (!existingAttendance) {
    const attendance = { attendanceId:`ATT-${employee.employeeNumber}-${Date.now()}`, employeeId:employee.id, shiftInstanceId:APP_CONFIG.shiftInstanceId, clockedIn:true, clockInAt:nowIso(), sourceSystem:"INTELIMINE_ADMIN" };
    state.attendance.push(attendance);
    state.obligations.push({
      obligationId:`OBL-${APP_CONFIG.shiftInstanceId}-${employee.employeeNumber}-${Date.now()}`,
      shiftInstanceId:APP_CONFIG.shiftInstanceId,
      shiftId:APP_CONFIG.shiftId,
      employeeId:employee.id,
      reportingRequired:true,
      createdAt:attendance.clockInAt,
      createdFrom:"ADMIN_SHIFT_ASSIGNMENT",
      sourceAttendanceId:attendance.attendanceId,
      dueBy:APP_CONFIG.shiftEndLocal,
      employeeContext:employeeContext(state, employee),
      versions:{ dataContractVersion:APP_CONFIG.dataContractVersion, reportSchemaVersion:APP_CONFIG.reportSchemaVersion, eventTaxonomyVersion:APP_CONFIG.eventTaxonomyVersion, masterDataVersion:APP_CONFIG.masterDataVersion }
    });
  }
}

function saveEditor(form) {
  const state = bindings.getState();
  const category = form.dataset.category;
  const data = new FormData(form);
  let id = editingId;
  let item = id ? categoryArray(state,category).find(x=>x.id===id) : null;

  if (category === "employees") {
    const employeeNumber = String(data.get("employeeNumber")||"").trim();
    const duplicate = (state.employees||[]).find(x => x.employeeNumber === employeeNumber && x.id !== editingId);
    if (duplicate) { setStatus("That employee number already exists.", "warning"); return; }
    id = id || `emp_${employeeNumber}`;
    const existing = item || {};
    item = {
      ...existing, id, employeeNumber,
      pin:String(data.get("pin")||"").trim(), firstName:String(data.get("firstName")||"").trim(), lastName:String(data.get("lastName")||"").trim(),
      jobTitle:String(data.get("jobTitle")||"").trim(), reportingRole:String(data.get("reportingRole")||""), departmentId:String(data.get("departmentId")||""), areaId:String(data.get("areaId")||""),
      operationId:existing.operationId || APP_CONFIG.operationId, supervisorEmployeeNo:String(data.get("supervisorEmployeeNo")||"").trim(), employmentStatus:existing.employmentStatus || "ACTIVE",
      shiftGroup:String(data.get("shiftGroup")||"").trim(), workLocation:existing.workLocation || "", badgeId:existing.badgeId || "", mobileNumber:existing.mobileNumber || "", email:existing.email || "",
      sourceSystem:existing.sourceSystem || "INTELIMINE_ADMIN", sourceRecordId:existing.sourceRecordId || employeeNumber,
      effectiveFrom:existing.effectiveFrom || new Date().toISOString().slice(0,10), effectiveTo:existing.effectiveTo || "", lastUpdatedAt:nowIso()
    };
    const idx=(state.employees||[]).findIndex(x=>x.id===id); if(idx>=0) state.employees[idx]=item; else state.employees.push(item);
    if (data.get("assignCurrentShift") === "on") assignCurrentShift(state,item);
  } else {
    const arr=state.masterData[category];
    const existing=item||{};
    if (category === "departments") { id=id||`DEPT-${slug(data.get("code"))}`; item={...existing,id,code:String(data.get("code")||"").trim(),name:String(data.get("name")||"").trim(),active:existing.active!==false}; }
    if (category === "areas") { id=id||`AREA-${slug(data.get("code"))}`; item={...existing,id,code:String(data.get("code")||"").trim(),name:String(data.get("name")||"").trim(),operationId:String(data.get("operationId")||APP_CONFIG.operationId),active:existing.active!==false}; }
    if (category === "equipment") { id=id||`EQ-${slug(data.get("code"))}`; item={...existing,id,code:String(data.get("code")||"").trim(),name:String(data.get("name")||"").trim(),equipmentClass:String(data.get("equipmentClass")||"").trim().toUpperCase(),areaId:String(data.get("areaId")||""),active:existing.active!==false}; }
    if (category === "eventTypes") { const roles=data.getAll("roles"); if(!roles.length){setStatus("Choose at least one reporting role.","warning");return;} id=id||`EVT-${slug(data.get("label"))}`; item={...existing,id,category:String(data.get("category")||""),label:String(data.get("label")||"").trim(),requiresEquipment:data.get("requiresEquipment")==="on",roles,active:existing.active!==false}; }
    if (category === "criticalControls") { id=id||`CC-${slug(data.get("hazardLabel"))}-${Date.now().toString().slice(-4)}`; item={...existing,id,hazardId:existing.hazardId||slug(data.get("hazardLabel")).replaceAll("-","_"),hazardLabel:String(data.get("hazardLabel")||"").trim(),label:String(data.get("label")||"").trim(),active:existing.active!==false}; }
    if (category === "operations") { id=id||APP_CONFIG.operationId; item={...existing,id,code:String(data.get("code")||"").trim(),name:String(data.get("name")||"").trim()}; }
    const idx=arr.findIndex(x=>x.id===id); if(idx>=0) arr[idx]=item; else arr.push(item);
  }

  state.auditTrail.push({type:"ADMIN_MASTER_DATA_CHANGE",category,itemId:id,action:editingId?"UPDATE":"CREATE",at:nowIso()});
  bindings.setState(state);
  editingId=null;
  bindings.onStateChange();
  renderAdmin(bindings.getState());
  setStatus("Saved.");
}

function toggleItem(id) {
  const state=bindings.getState();
  const arr=categoryArray(state,activeCategory);
  const item=arr.find(x=>x.id===id); if(!item)return;
  if(activeCategory==="employees") item.employmentStatus=item.employmentStatus==="INACTIVE"?"ACTIVE":"INACTIVE";
  else item.active=item.active===false;
  state.auditTrail.push({type:"ADMIN_MASTER_DATA_CHANGE",category:activeCategory,itemId:id,action:isActive(activeCategory,item)?"ACTIVATE":"DEACTIVATE",at:nowIso()});
  bindings.setState(state); bindings.onStateChange(); renderAdmin(bindings.getState());
}

export function bindAdminExperience(args) {
  bindings=args;
  const host=document.getElementById("adminWorkspace"); if(!host)return;
  host.addEventListener("change", e=>{
    if(e.target?.id==="adminCategory") { activeCategory=e.target.value; editingId=null; renderAdmin(bindings.getState()); }
  });
  host.addEventListener("click", e=>{
    const edit=e.target.closest("[data-admin-edit]"); if(edit){ editingId=edit.dataset.adminEdit; renderAdmin(bindings.getState()); return; }
    const tog=e.target.closest("[data-admin-toggle]"); if(tog){ toggleItem(tog.dataset.adminToggle); return; }
    if(e.target.closest("#adminAddButton") || e.target.closest("[data-admin-cancel]")){ editingId=null; renderAdmin(bindings.getState()); return; }
  });
  host.addEventListener("submit", e=>{ if(e.target?.id!=="adminEditor")return; e.preventDefault(); saveEditor(e.target); });
}
