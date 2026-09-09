import {
  reportingStatus,
  reportingEmployees,
  openIssues,
  observationById,
  obligationFor,
  findEmployeeByNumber,
  currentShiftObservations
} from "./domain.js";
import { employeeDisplayName, employeeAreaName, reportingRoleLabel } from "./employeeMaster.js";
import { eventTypeById, equipmentById, areaById, criticalControlById } from "./masterData.js";
import { nextIssueStatus, transitionIssue, transitionLabel } from "./issueLifecycle.js";
import { currentShiftPerformance } from "./leadership.js";
import { currentShift, processStageName, workContextName } from "./operationalModel.js";

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function formatTime(value) { if (!value) return "—"; return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function toneFor(value, goodAt, watchAt) { if (value >= goodAt) return "good"; if (value >= watchAt) return "watch"; return "risk"; }
function pulseCard(label, value, note, tone) { return `<div class="pulse-card ${tone}"><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(value)}</div><div class="metric-note">${escapeHtml(note)}</div></div>`; }
function attentionCard(label, title, copy, tone = "watch") { return `<div class="attention-card ${tone}"><div class="attention-label">${escapeHtml(label)}</div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(copy)}</span></div>`; }

function assignmentControls(state,issue){
  const employees=(state.employees||[]).filter(e=>e.employmentStatus!=="INACTIVE");
  const teams=[...new Map((state.shiftAssignments||[]).filter(a=>a.shiftInstanceId===currentShift(state)?.shiftInstanceId&&a.active!==false).map(a=>[a.teamId,a.teamName||a.teamId])).entries()];
  return `<details class="inline-disclosure action-assignment"><summary>Assign / reassign</summary><form class="issue-assignment-row compact-assignment" data-issue-assign="${escapeHtml(issue.issueId)}"><select name="teamId"><option value="">Team</option>${teams.map(([id,name])=>`<option value="${escapeHtml(id)}" ${issue.assignedTeamId===id?"selected":""}>${escapeHtml(name)}</option>`).join("")}</select><select name="employeeId"><option value="">Person (optional)</option>${employees.map(e=>`<option value="${escapeHtml(e.id)}" ${issue.assignedEmployeeId===e.id?"selected":""}>${escapeHtml(employeeDisplayName(e))}</option>`).join("")}</select><button class="small secondary" type="submit">Save</button></form></details>`;
}

function issueCard(state, issue) {
  const observation = observationById(state, issue.primaryObservationId), type = eventTypeById(issue.eventTypeId), equipment = equipmentById(issue.equipmentId), area = areaById(issue.areaId), next = nextIssueStatus(issue), severity = String(issue.severityId || "INFO").toLowerCase(), context = equipment?.code || area?.name || type?.label || "Operational action";
  return `<div class="action-card ${severity}"><div class="action-head"><div><span class="severity-chip ${severity}">${escapeHtml(issue.severityId)}</span><strong>${escapeHtml(issue.title || type?.label || "Operational action")}</strong></div><span class="status-pill">${escapeHtml(String(issue.currentStatus || "OPEN").replaceAll("_", " "))}</span></div><p>${escapeHtml(observation?.narrative || "Action raised from a shift observation.")}</p><div class="action-meta"><span>${escapeHtml(context)}</span><span>${escapeHtml(issue.assignedEmployeeId || issue.assignedTeamId || issue.ownerRole || "Unassigned")}</span><span>Target ${formatTime(issue.targetAt)}</span></div>${assignmentControls(state,issue)}${next ? `<button class="small secondary" data-issue-transition="${escapeHtml(issue.issueId)}">${escapeHtml(transitionLabel(next))}</button>` : ""}</div>`;
}

function controlExceptionCard(item) {
  const area = areaById(item.areaId), configured = criticalControlById(item.controlId);
  return `<div class="control-exception"><div><div class="attention-label">${escapeHtml(configured?.hazardLabel || item.hazard)}</div><strong>${escapeHtml(configured?.label || item.control)}</strong><p>${escapeHtml(item.note || "Verification exception requires attention.")}</p></div><div class="control-meta">${escapeHtml(area?.name || "Mine area")} · ${escapeHtml(item.owner || "Supervisor")}</div></div>`;
}

function recurringPatterns(state){
  const groups=new Map();
  for(const o of state.observations||[]){
    const key=`${o.eventTypeId}|${o.equipmentId||""}|${o.workContextId||""}`;
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);
  }
  return [...groups.values()].filter(items=>items.length>=2).sort((a,b)=>b.length-a.length||new Date(b.at(-1)?.reportedAt||0)-new Date(a.at(-1)?.reportedAt||0));
}

function weakSignalSection(state){
  const signals=currentShiftObservations(state).filter(o=>!o.issueId&&["HIGH","CRITICAL"].includes(o.severityId)&&!["REVIEWED","DISMISSED"].includes(o.signalStatus));
  const recurring=recurringPatterns(state);
  if(!signals.length&&!recurring.length)return"";
  return `<section class="card section-block"><div class="section-title"><div><div class="eyebrow">Weak & recurring signals</div><h3>Patterns worth a second look</h3></div><span class="badge">${signals.length} unreviewed · ${recurring.length} repeated</span></div>
    ${recurring.length?`<div class="signal-pattern-list">${recurring.slice(0,5).map(items=>{const latest=items.at(-1),shifts=new Set(items.map(o=>o.shiftInstanceId));return `<div class="signal-pattern-row"><div><strong>${escapeHtml(eventTypeById(latest.eventTypeId)?.label||latest.eventTypeId)}</strong><span>${escapeHtml(equipmentById(latest.equipmentId)?.code||workContextName(state,latest.workContextId)||areaById(latest.areaId)?.name||"Operational context")}</span></div><div><strong>${items.length} reports</strong><span>across ${shifts.size} shift${shifts.size===1?"":"s"}</span></div></div>`;}).join("")}</div>`:""}
    ${signals.length?`<details class="compact-disclosure"><summary><div><strong>Unreviewed high-potential observations</strong><span>${signals.length} current-shift signal${signals.length===1?"":"s"}</span></div><span class="chevron">›</span></summary><div class="action-list">${signals.map(o=>`<div class="action-card ${String(o.severityId).toLowerCase()}"><div class="action-head"><div><span class="severity-chip ${String(o.severityId).toLowerCase()}">${escapeHtml(o.severityId)}</span><strong>${escapeHtml(eventTypeById(o.eventTypeId)?.label||o.eventTypeId)}</strong></div><span class="status-pill">Signal</span></div><p>${escapeHtml(o.narrative)}</p><div class="action-meta"><span>${escapeHtml(areaById(o.areaId)?.name||o.areaId)}</span><span>${escapeHtml(processStageName(state,o.processStageId))}</span></div><button class="small secondary" data-signal-review="${escapeHtml(o.observationId)}">Mark reviewed</button></div>`).join("")}</div></details>`:""}
  </section>`;
}

function handoverContinuitySection(state,outstandingEmployees){
  const shiftId=currentShift(state)?.shiftInstanceId;
  const unack=(state.handoverDeliveries||[]).filter(h=>h.targetShiftInstanceId===shiftId&&!h.acknowledgedAt);
  const total=outstandingEmployees.length+unack.length;
  return `<section class="card section-block"><div class="section-title"><div><div class="eyebrow">Handover continuity</div><h3>Was knowledge produced and received?</h3></div><span class="badge ${total?"outstanding":""}">${outstandingEmployees.length} reports outstanding · ${unack.length} unacknowledged</span></div>
    ${!total?`<div class="status-box success">Required handovers are complete and incoming handovers are acknowledged.</div>`:""}
    ${outstandingEmployees.length?`<details class="compact-disclosure"><summary><div><strong>Outgoing reports</strong><span>${outstandingEmployees.length} outstanding</span></div><span class="chevron">›</span></summary><div class="handover-list">${outstandingEmployees.map(employee=>`<div class="handover-row"><div><strong>${escapeHtml(employeeDisplayName(employee))}</strong><span>${escapeHtml(reportingRoleLabel(employee.reportingRole))} · ${escapeHtml(employeeAreaName(employee))}</span></div><span class="status-pill warning">Outstanding</span></div>`).join("")}</div><details class="exception-panel"><summary>Authorise clock-off exception</summary><p class="muted">Use only when the required handover cannot reasonably be completed. The obligation remains in the audit record.</p><div class="override-form"><label>Employee<select id="overrideEmployee"><option value="">Choose employee</option>${outstandingEmployees.map(employee=>`<option value="${escapeHtml(employee.id)}">${escapeHtml(employeeDisplayName(employee))} · ${escapeHtml(reportingRoleLabel(employee.reportingRole))}</option>`).join("")}</select></label><label>Approver employee number<input id="overrideApprover" placeholder="Supervisor employee number" /></label><label class="full">Reason<textarea id="overrideReason" placeholder="Reason for exception"></textarea></label><div class="full"><button id="overrideButton" class="warning">Authorise exception</button></div><div id="overrideStatus" class="full"></div></div></details></details>`:""}
    ${unack.length?`<details class="compact-disclosure"><summary><div><strong>Incoming acknowledgements</strong><span>${unack.length} awaiting receipt</span></div><span class="chevron">›</span></summary><div class="handover-list">${unack.map(h=>`<div class="handover-row"><div><strong>${escapeHtml(h.title||"Handover")}</strong><span>${escapeHtml(h.summary||"")} · ${escapeHtml(h.targetTeamName||h.targetTeamId||h.targetAreaId||"Receiving team")}</span></div><span class="status-pill warning">Delivered</span></div>`).join("")}</div></details>`:""}
  </section>`;
}

export function renderDashboard(state) {
  const host = document.getElementById("managerDashboard"); if (!host) return;
  const shift=currentShift(state), performance = currentShiftPerformance(state), employees = reportingEmployees(state), outstandingEmployees = employees.filter(employee => reportingStatus(state, employee.id) === "outstanding"), issues = openIssues(state), delays = [...(state.delayEvents || [])].filter(d=>!d.shiftInstanceId||d.shiftInstanceId===shift?.shiftInstanceId).sort((a, b) => Number(b.minutes) - Number(a.minutes)), controls = (state.controlVerifications || []).filter(c=>!c.shiftInstanceId||c.shiftInstanceId===shift?.shiftInstanceId), controlExceptions = controls.filter(item => item.status !== "PASS");

  const attention = [];
  if (controlExceptions.length) attention.push(attentionCard("Safety control",`${controlExceptions.length} critical-control exception${controlExceptions.length === 1 ? "" : "s"}`,controlExceptions[0].note || "Verification requires manager attention.","risk"));
  if (performance.shortfallTonnes > 0) attention.push(attentionCard("Production",`${performance.shortfallTonnes} t below plan`,`${performance.delayMinutes || 0} delay minutes recorded; ${delays[0]?.label || "constraint review"} is the largest current loss.`,performance.planAttainmentPct < 90 ? "risk" : "watch"));
  if (performance.outstandingHandovers > 0) attention.push(attentionCard("Handover",`${performance.outstandingHandovers} handover${performance.outstandingHandovers === 1 ? "" : "s"} outstanding`,"Clock-off remains blocked until the required handover is completed or an authorised exception is recorded.","watch"));

  const hasPerformanceData=Boolean(performance.plannedTonnes||performance.equipmentAvailabilityPct||controls.length||delays.length);
  host.innerHTML = `
    <div class="context-line">${escapeHtml(shift?.shiftName||"Shift")} · ${escapeHtml(shift?.label||shift?.businessDate||"")} · ${escapeHtml(shift?.timezone||"")}</div>
    ${hasPerformanceData?`<div class="status-box neutral demo-data-note"><strong>Prototype metric source:</strong> production, availability, delay and critical-control figures are seeded integration placeholders. MineMind-native handovers, observations and actions are state-driven.</div>`:""}
    <div class="pulse-grid">
      ${pulseCard("Critical controls",`${performance.criticalControlConformancePct}%`,`${controls.length - controlExceptions.length} of ${controls.length} verified`,toneFor(performance.criticalControlConformancePct, 98, 95))}
      ${pulseCard("Production",`${performance.planAttainmentPct}%`,`${performance.actualTonnes || 0} / ${performance.plannedTonnes || 0} t`,toneFor(performance.planAttainmentPct, 95, 90))}
      ${pulseCard("Availability",`${performance.equipmentAvailabilityPct || 0}%`,`${performance.delayMinutes || 0} delay min`,toneFor(Number(performance.equipmentAvailabilityPct || 0), 90, 85))}
      ${pulseCard("Handover",`${performance.handoverCompliancePct}%`,`${performance.completeHandovers} of ${performance.requiredHandovers} complete`,toneFor(performance.handoverCompliancePct, 100, 90))}
    </div>
    ${attention.length ? `<section class="section-block"><div class="section-title"><div><div class="eyebrow">Requires attention</div><h3>Manager focus</h3></div></div><div class="attention-grid">${attention.join("")}</div></section>` : `<div class="status-box success">No immediate management exceptions are active.</div>`}
    <div class="manager-two-column section-block">
      <section class="card"><div class="section-title"><h3>Shift losses</h3><span class="muted">${performance.delayMinutes || 0} min total</span></div><div class="loss-list">${delays.map(item => {const area = areaById(item.areaId), equipment = equipmentById(item.equipmentId);return `<div class="loss-row"><div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(equipment?.code || area?.name || item.timeClass || "Operational delay")}</span></div><div class="loss-impact"><strong>${Number(item.minutes || 0)} min</strong><span>≈ ${Number(item.estimatedTonnesImpact || 0)} t</span></div></div>`;}).join("") || `<p class="muted">No material shift losses recorded.</p>`}</div></section>
      <section class="card"><div class="section-title"><h3>Open actions</h3><span class="muted">${issues.length}</span></div><div class="action-list">${issues.length ? issues.map(issue => issueCard(state, issue)).join("") : `<p class="muted">No open actions.</p>`}</div></section>
    </div>
    ${controlExceptions.length ? `<section class="card section-block"><div class="section-title"><h3>Critical-control exceptions</h3><span class="muted">Integrated / configured controls</span></div><div class="control-list">${controlExceptions.map(controlExceptionCard).join("")}</div></section>` : ""}
    ${weakSignalSection(state)}
    ${handoverContinuitySection(state,outstandingEmployees)}
    <section class="card section-block"><div class="section-title"><div><div class="eyebrow">Reports</div><h3>Daily Shift Handover Print Pack</h3></div><button class="secondary" data-print-pack>Open print pack</button></div><p class="muted">Exception-led output from current MineMind state. Raw entries remain in the application.</p></section>
  `;
}

export function bindDashboardActions({ getState, setState, onStateChange }) {
  const host = document.getElementById("managerDashboard"); if (!host) return;
  host.addEventListener("click", event => {
    const transitionButton = event.target.closest("[data-issue-transition]");
    if (transitionButton) {
      const state = getState(), issue = (state.issues || []).find(item => item.issueId === transitionButton.dataset.issueTransition), next = nextIssueStatus(issue); let reason = "", evidence = "";
      if (next === "CLOSED") { reason = window.prompt("Record what was done / why this action can be closed:", "") || ""; if (!reason.trim()) return; evidence = window.prompt("Optional evidence / verification note:", "") || ""; }
      const result = transitionIssue(state, transitionButton.dataset.issueTransition, { reason, evidence, actorId:"ROLE-MINE-MANAGER" }); if (result.ok) { setState(state); onStateChange(); } else if (result.message) window.alert(result.message); return;
    }
    if (event.target?.id !== "overrideButton") return;
    const employeeId = document.getElementById("overrideEmployee")?.value || "", approverEmployeeNumber = document.getElementById("overrideApprover")?.value.trim() || "", reason = document.getElementById("overrideReason")?.value.trim() || "", statusHost = document.getElementById("overrideStatus");
    if (!employeeId || !approverEmployeeNumber || !reason) { statusHost.innerHTML = `<div class="status-box warning">Employee, approver and reason are required.</div>`; return; }
    const state = getState(), obligation = obligationFor(state, employeeId); if (!obligation) { statusHost.innerHTML = `<div class="status-box warning">No handover obligation exists for this employee and shift.</div>`; return; }
    const approver = findEmployeeByNumber(state, approverEmployeeNumber); if (!approver || approver.reportingRole !== "SUPERVISOR") { statusHost.innerHTML = `<div class="status-box warning">The approver must be an identified supervisor.</div>`; return; }
    if (approver.id === employeeId) { statusHost.innerHTML = `<div class="status-box warning">An employee cannot authorise their own exception.</div>`; return; }
    const approvedAt = new Date().toISOString(), shiftId=currentShift(state)?.shiftInstanceId;
    state.overrides.push({overrideId:`OVR-${Date.now()}`,obligationId:obligation.obligationId,employeeId,shiftInstanceId:shiftId,approverEmployeeId:approver.id,approverEmployeeNumber,reason,approvedAt});
    state.auditTrail.push({type:"REPORTING_OVERRIDE",obligationId:obligation.obligationId,employeeId,shiftInstanceId:shiftId,approverEmployeeId:approver.id,approverEmployeeNumber,reason,at:approvedAt}); setState(state); onStateChange();
  });
}
