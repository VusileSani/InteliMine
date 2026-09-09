import { areaById, eventTypeById } from "./masterData.js";
import { employeeDisplayName, reportingRoleLabel } from "./employeeMaster.js";
import { openIssues, currentShiftObservations, reportingEmployees, reportingStatus } from "./domain.js";
import { assignIssue } from "./issueLifecycle.js";
import { currentShift, activateShift, assignmentFor, workContextName } from "./operationalModel.js";
import { currentShiftPerformance } from "./leadership.js";

let bindings=null;
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
function fmt(v){if(!v)return"—";try{return new Date(v).toLocaleString([],{dateStyle:"medium",timeStyle:"short"});}catch{return String(v);}}

// v2.8 deliberately has no appended manager operational-intelligence dashboard.
// Mining sequence/context remains underneath the facts instead of becoming another visible workflow.
export function renderOperationalIntelligence(){ }

function adminAssignmentSection(state){
  const shift=currentShift(state),employees=state.employees||[],areas=state.masterData?.areas||[],assignments=(state.shiftAssignments||[]).filter(a=>a.shiftInstanceId===shift?.shiftInstanceId),shifts=[...(state.shiftInstances||[])].sort((a,b)=>new Date(b.startsAtUtc||b.startsAtLocal)-new Date(a.startsAtUtc||a.startsAtLocal));
  return `<section class="card section-block" id="operationalModelAdmin">
    <div class="section-title"><div><div class="eyebrow">Shift context</div><h3>Active shift & team/area assignments</h3><p>Keep this short: who is working, with which team, in which area. Process context is captured underneath operational facts.</p></div><span class="badge">${esc(shift?.shiftName||"")}</span></div>
    <form class="compact-form shift-activation-form" data-active-shift-form>
      <label>Active shift<select name="shiftInstanceId">${shifts.map(s=>`<option value="${esc(s.shiftInstanceId)}" ${s.shiftInstanceId===shift?.shiftInstanceId?"selected":""}>${esc(s.label||s.shiftName)} · ${esc(s.status||"")}</option>`).join("")}</select></label>
      <button class="secondary" type="submit">Set active shift</button>
    </form>
    <details class="compact-disclosure"><summary><div><strong>Assign employee to current shift context</strong><span>${assignments.length} assignment${assignments.length===1?"":"s"}</span></div><span class="chevron">›</span></summary>
      <form class="admin-form" data-shift-assignment-form>
        <label>Employee<select name="employeeId" required><option value="">Choose employee</option>${employees.map(e=>`<option value="${esc(e.id)}">${esc(employeeDisplayName(e))} · ${esc(reportingRoleLabel(e.reportingRole))}</option>`).join("")}</select></label>
        <label>Actual area<select name="areaId" required><option value="">Choose area</option>${areas.filter(a=>a.active!==false).map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join("")}</select></label>
        <label>Team ID<input name="teamId" required placeholder="TEAM-SEC3-A" /></label>
        <label>Team name<input name="teamName" placeholder="Section 3 A" /></label>
        <div class="full"><button class="primary" type="submit">Save shift context</button></div>
      </form>
      <div class="admin-list">${assignments.map(a=>{const e=employees.find(x=>x.id===a.employeeId);return `<div class="admin-row"><div class="admin-row-copy"><strong>${esc(employeeDisplayName(e))}</strong><span>${esc(areaById(a.areaId)?.name||a.areaId)} · ${esc(a.teamName||a.teamId)}</span></div></div>`;}).join("")||`<p class="muted">No shift assignments recorded.</p>`}</div>
    </details>
  </section>`;
}
export function renderOperationalAdmin(state){const host=document.getElementById("adminWorkspace");if(!host)return;host.querySelector("#operationalModelAdmin")?.remove();host.insertAdjacentHTML("beforeend",adminAssignmentSection(state));}

function recurringPatterns(state){
  const groups=new Map();for(const o of state.observations||[]){const key=`${o.eventTypeId}|${o.equipmentId||""}|${o.workContextId||""}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);}return[...groups.values()].filter(items=>items.length>=2).sort((a,b)=>b.length-a.length);
}

function printPack(state){
  const shift=currentShift(state),perf=currentShiftPerformance(state),issues=openIssues(state),unacked=(state.handoverDeliveries||[]).filter(h=>h.targetShiftInstanceId===shift?.shiftInstanceId&&!h.acknowledgedAt),outstanding=reportingEmployees(state).filter(e=>reportingStatus(state,e.id)==="outstanding"),signals=currentShiftObservations(state).filter(o=>!o.issueId&&["HIGH","CRITICAL"].includes(o.severityId)&&o.signalStatus!=="REVIEWED"),recurring=recurringPatterns(state);
  const html=`<!doctype html><html><head><title>MineMind Daily Shift Handover</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#172126}h1,h2{margin:0 0 10px}section{margin:24px 0;border-top:1px solid #bbb;padding-top:16px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left;font-size:12px}.kpi{display:inline-block;margin-right:30px}.muted{color:#666}@media print{button{display:none}}</style></head><body>
    <h1>MineMind · Daily Shift Handover</h1><p>${esc(shift?.label||shift?.businessDate||"Shift")} · generated ${fmt(new Date().toISOString())}</p>
    <section><h2>Management summary</h2><div class="kpi"><strong>${issues.length}</strong><br>Open actions</div><div class="kpi"><strong>${outstanding.length}</strong><br>Reports outstanding</div><div class="kpi"><strong>${unacked.length}</strong><br>Unacknowledged handovers</div>${perf.plannedTonnes?`<div class="kpi"><strong>${perf.planAttainmentPct}%</strong><br>Integrated plan attainment</div>`:""}</section>
    <section><h2>Open actions</h2><table><tr><th>Issue</th><th>Severity</th><th>Owner</th><th>Status</th></tr>${issues.map(i=>`<tr><td>${esc(i.title)}</td><td>${esc(i.severityId)}</td><td>${esc(i.assignedEmployeeId||i.assignedTeamId||i.ownerRole||"Unassigned")}</td><td>${esc(i.currentStatus)}</td></tr>`).join("")||`<tr><td colspan="4">None.</td></tr>`}</table></section>
    <section><h2>Handover gaps</h2>${outstanding.map(e=>`<p><strong>Outstanding:</strong> ${esc(employeeDisplayName(e))} · ${esc(reportingRoleLabel(e.reportingRole))}</p>`).join("")}${unacked.map(h=>`<p><strong>Awaiting acknowledgement:</strong> ${esc(h.title)} · ${esc(h.targetTeamName||h.targetTeamId||h.targetAreaId||"Receiving team")}</p>`).join("")||(!outstanding.length?"<p>None.</p>":"")}</section>
    <section><h2>Weak & recurring signals</h2>${recurring.slice(0,5).map(items=>{const o=items.at(-1);return`<p><strong>Repeated · ${esc(eventTypeById(o.eventTypeId)?.label||o.eventTypeId)}</strong> — ${items.length} reports · ${esc(workContextName(state,o.workContextId))}</p>`;}).join("")}${signals.map(s=>`<p><strong>${esc(s.severityId)} · ${esc(eventTypeById(s.eventTypeId)?.label||s.eventTypeId)}</strong> — ${esc(s.narrative)}</p>`).join("")||(!recurring.length?"<p>None.</p>":"")}</section>
    <p class="muted">Performance metrics, where shown, are integration/demo inputs. MineMind-native handover, observation and action records are state-driven.</p><button onclick="print()">Print</button></body></html>`;
  const win=window.open("","_blank");if(win){win.document.write(html);win.document.close();}
}

export function bindOperationalIntelligence(args){
  bindings=args;
  document.addEventListener("click",e=>{
    const state=bindings.getState();
    const review=e.target.closest("[data-signal-review]");if(review){const o=(state.observations||[]).find(x=>x.observationId===review.dataset.signalReview);if(o){o.signalStatus="REVIEWED";o.signalReviewedAt=new Date().toISOString();state.auditTrail.push({type:"SIGNAL_REVIEWED",observationId:o.observationId,actor:"Mine Manager",at:o.signalReviewedAt});bindings.setState(state);bindings.onStateChange();}return;}
    if(e.target.closest("[data-print-pack]")){printPack(state);return;}
  });
  document.addEventListener("submit",e=>{
    const assign=e.target.closest("[data-issue-assign]");if(assign){e.preventDefault();const state=bindings.getState(),fd=new FormData(assign);let teamId=String(fd.get("teamId")||"")||null;const employeeId=String(fd.get("employeeId")||"")||null;if(employeeId){const employeeAssignment=assignmentFor(state,employeeId);if(teamId&&employeeAssignment?.teamId&&employeeAssignment.teamId!==teamId){window.alert("The selected person is not assigned to that team in the active shift.");return;}teamId=teamId||employeeAssignment?.teamId||null;}assignIssue(state,assign.dataset.issueAssign,{teamId,employeeId,reason:"Manager assignment"});bindings.setState(state);bindings.onStateChange();return;}
    const sf=e.target.closest("[data-shift-assignment-form]");if(sf){e.preventDefault();const state=bindings.getState(),fd=new FormData(sf),employeeId=String(fd.get("employeeId")||""),shift=currentShift(state);let a=(state.shiftAssignments||[]).find(x=>x.employeeId===employeeId&&x.shiftInstanceId===shift.shiftInstanceId);const next={assignmentId:a?.assignmentId||`ASN-${Date.now()}`,shiftInstanceId:shift.shiftInstanceId,employeeId,operationId:shift.operationId,areaId:String(fd.get("areaId")||""),processStageId:a?.processStageId||null,workContextId:a?.workContextId||null,teamId:String(fd.get("teamId")||""),teamName:String(fd.get("teamName")||"").trim()||String(fd.get("teamId")||""),assignedAt:new Date().toISOString(),active:true};if(a)Object.assign(a,next);else state.shiftAssignments.push(next);state.auditTrail.push({type:"SHIFT_ASSIGNMENT_UPDATED",employeeId,shiftInstanceId:shift.shiftInstanceId,actor:"System Administrator",at:next.assignedAt});bindings.setState(state);bindings.onStateChange();sf.reset();return;}
    const active=e.target.closest("[data-active-shift-form]");if(active){e.preventDefault();const state=bindings.getState(),fd=new FormData(active),result=activateShift(state,String(fd.get("shiftInstanceId")||""));if(!result.ok){window.alert(result.message);return;}bindings.setState(state);bindings.onStateChange();return;}
  });
}
