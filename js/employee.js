import { APP_CONFIG } from "./config.js";
import { authenticateEmployee, attendanceFor, obligationFor, submissionFor, reportingStatus, employeeAssignedIssues, employeeQuickCaptures, observationById } from "./domain.js";
import { employeeDisplayName, employeeAreaName, employeeDepartmentName, reportingRoleLabel } from "./employeeMaster.js";
import { renderReportForm, readReportAnswers, bindReportConditionalFields } from "./reporting.js";
import { bindObservationComposer } from "./observation.js";
import { createSubmissionArtifacts, createQuickCaptureArtifacts } from "./records.js";
import { AREAS, EQUIPMENT, eventTypesForRole, eventTypeById } from "./masterData.js";
import { assignmentFor, incomingHandoversFor, processStageName, workContextName } from "./operationalModel.js";
import { transitionIssue, nextIssueStatus, transitionLabel } from "./issueLifecycle.js";
import { supervisorComposerHtml, renderMessageBoards } from "./communications.js";

function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
function formatTime(v){if(!v)return"—";return new Date(v).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});}
function areaBy(id){return AREAS.find(x=>x.id===id)?.name||id||"Unknown area";}

function quickCaptureHtml(state,employee){
  const a=assignmentFor(state,employee.id),events=eventTypesForRole(employee.reportingRole),contexts=(state.workContexts||[]).filter(x=>x.active!==false&&(!a?.areaId||x.areaId===a.areaId));
  return `<details class="compact-disclosure quick-capture"><summary><div><strong>+ Quick Capture</strong><span>Preserve something before it is forgotten</span></div><span class="chevron">›</span></summary>
    <form class="quick-capture-form" data-quick-capture="${esc(employee.id)}">
      <div class="quick-core-fields">
        <label class="full">What did you notice?<textarea name="narrative" required rows="3" placeholder="Short, factual observation"></textarea></label>
        <label>Type<select name="eventTypeId" required><option value="">Choose</option>${events.map(x=>`<option value="${esc(x.id)}">${esc(x.label)}</option>`).join("")}</select></label>
        <label>Importance<select name="severityId"><option value="INFO">Routine</option><option value="MEDIUM">Watch</option><option value="HIGH">Important</option><option value="CRITICAL">Critical</option></select></label>
        <label>Needs managed action?<select name="actionRequired"><option value="no">No</option><option value="yes">Yes</option></select></label>
      </div>
      <details class="inline-disclosure"><summary>Change context / equipment</summary><div class="admin-form">
        <label>Area<select name="areaId">${AREAS.filter(x=>x.active!==false).map(x=>`<option value="${esc(x.id)}" ${x.id===(a?.areaId||employee.areaId)?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>
        <label>Process context<select name="processStageId"><option value="">Use shift context</option>${(state.processStages||[]).filter(x=>x.active!==false).sort((x,y)=>x.order-y.order).map(x=>`<option value="${esc(x.id)}" ${x.id===a?.processStageId?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>
        <label>Work context<select name="workContextId"><option value="">Use shift context</option>${contexts.map(x=>`<option value="${esc(x.id)}" ${x.id===a?.workContextId?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>
        <label>Equipment<select name="equipmentId"><option value="">None</option>${EQUIPMENT.filter(x=>x.active!==false).map(x=>`<option value="${esc(x.id)}">${esc(x.code)} · ${esc(x.name)}</option>`).join("")}</select></label>
        <label>Approx. time<input type="time" name="observedTime" /></label>
      </div></details>
      <div class="form-actions compact-actions"><button class="primary" type="submit">Capture</button></div><div data-quick-status></div>
    </form></details>`;
}

function incomingHtml(state,employee){
  const items=incomingHandoversFor(state,employee.id);if(!items.length)return"";
  return `<section class="card compact-card incoming-handover"><div class="section-title"><div><div class="eyebrow">Incoming handover</div><h3>${items.length} item${items.length===1?"":"s"} for your shift</h3></div><span class="badge ${items.some(x=>!x.acknowledgedAt)?"outstanding":""}">${items.filter(x=>!x.acknowledgedAt).length} unacknowledged</span></div><div class="handover-list">${items.map(h=>{
    const carried=(h.carriedObservationIds||[]).map(id=>observationById(state,id)).filter(Boolean);
    return `<div class="handover-row handover-row-expanded"><div><strong>${esc(h.title)}</strong><span>${esc(h.summary)}</span>${carried.length?`<div class="handover-carried-items">${carried.map(o=>`<small>• ${esc(eventTypeById(o.eventTypeId)?.label||"Observation")}: ${esc(o.narrative)}</small>`).join("")}</div>`:""}</div>${h.acknowledgedAt?`<span class="status-pill complete">Acknowledged</span>`:`<button class="small secondary" data-handover-ack="${esc(h.deliveryId)}">Acknowledge</button>`}</div>`;
  }).join("")}</div></section>`;
}

function myActionsHtml(state,employee){
  const actions=employeeAssignedIssues(state,employee.id);if(!actions.length)return"";
  return `<section class="card compact-card my-actions"><div class="section-title"><div><div class="eyebrow">Accountability</div><h3>My Actions</h3></div><span class="badge outstanding">${actions.length} open</span></div><div class="action-list">${actions.map(issue=>{
    const observation=observationById(state,issue.primaryObservationId),next=nextIssueStatus(issue);
    return `<div class="action-card ${String(issue.severityId||"INFO").toLowerCase()}"><div class="action-head"><div><span class="severity-chip ${String(issue.severityId||"INFO").toLowerCase()}">${esc(issue.severityId)}</span><strong>${esc(issue.title)}</strong></div><span class="status-pill">${esc(String(issue.currentStatus).replaceAll("_"," "))}</span></div><p>${esc(observation?.narrative||"Assigned operational action")}</p><div class="action-meta"><span>${esc(areaBy(issue.areaId))}</span><span>Target ${esc(formatTime(issue.targetAt))}</span></div>${next?`<button class="small secondary" data-my-action-transition="${esc(issue.issueId)}">${esc(transitionLabel(next))}</button>`:""}</div>`;
  }).join("")}</div></section>`;
}

export function bindEmployeeExperience({getState,setState,onStateChange}){
  const loginCard=document.getElementById("employeeLoginCard"),workspace=document.getElementById("employeeWorkspace"),employeeNumber=document.getElementById("employeeNumber"),employeePin=document.getElementById("employeePin"),loginButton=document.getElementById("employeeLoginButton"),loginStatus=document.getElementById("employeeLoginStatus");
  let observationComposer=null;let activeEmployee=null;const capture={channel:APP_CONFIG.defaultCaptureChannel,capturePointId:APP_CONFIG.defaultCapturePointId};
  function showStatus(msg,tone="danger"){loginStatus.innerHTML=`<div class="status-box ${tone}">${esc(msg)}</div>`;}
  function renderEmployeeWorkspace(employee){
    activeEmployee=employee;
    const state=getState(),attendance=attendanceFor(state,employee.id),obligation=obligationFor(state,employee.id),submission=submissionFor(state,employee.id),status=reportingStatus(state,employee.id),a=assignmentFor(state,employee.id),quickCaptures=employeeQuickCaptures(state,employee.id);
    renderMessageBoards(state,employee);
    const identity=`<div class="card employee-head"><div class="identity-block"><div class="eyebrow">${esc(a?.teamName||employeeAreaName(employee))}</div><h3>${esc(employeeDisplayName(employee))}</h3><div class="muted">${esc(employee.employeeNumber)} · ${esc(reportingRoleLabel(employee.reportingRole))} · ${esc(employeeDepartmentName(employee))}</div><div class="badges"><span class="badge">${attendance?.clockedIn?`Clocked in ${formatTime(attendance.clockInAt)}`:"No T&A record"}</span><span class="badge ${status}">${status==="complete"?"Handover complete":status==="excused"?"Exception authorised":status==="not_required"?"No handover assigned":"Handover required"}</span></div></div><div class="clockoff-block"><div class="muted">Shift context</div><div class="status-box ${a?"success":"warning"}">${esc(a?areaBy(a.areaId):"No area assignment")}<br><small>${esc(a?(a.teamName||a.teamId):"Contact supervisor")}</small></div></div></div>`;
    const core=`${identity}${incomingHtml(state,employee)}${myActionsHtml(state,employee)}${quickCaptureHtml(state,employee)}${supervisorComposerHtml(state,employee)}`;
    if(!obligation){workspace.innerHTML=`${core}<div class="card"><div class="status-box warning">No handover is assigned for this shift. Incoming handovers and assigned actions remain available.</div><button id="employeeSignOutButton" class="secondary">Sign out</button></div>`;}
    else {
      const template=(state.reportingTemplates||[]).find(t=>t.roleCode===employee.reportingRole);
      const report=template?.active===false?`<div class="card"><div class="status-box warning">This reporting template is inactive. Contact System Administration.</div><button id="employeeSignOutButton" class="secondary">Sign out</button></div>`:status==="complete"?`<div class="card completion-card"><div class="eyebrow">Handover complete</div><h3>Shift report recorded</h3><p class="muted">Submitted at ${new Date(submission.completedAt).toLocaleString()}. The handover is routed to the receiving shift/team.</p><button id="employeeSignOutButton" class="secondary">Sign out</button></div>`:renderReportForm(employee,submission,{quickCaptures});
      workspace.innerHTML=`${core}${report}`;
    }
    workspace.classList.remove("hidden");loginCard.classList.add("hidden");document.getElementById("employeeSignOutButton")?.addEventListener("click",signOut);
    const form=document.getElementById("shiftReportForm");if(form){bindReportConditionalFields(form);observationComposer=bindObservationComposer(form,employee);form.addEventListener("submit",e=>submitReport(e,employee));}
  }
  function signOut(){activeEmployee=null;observationComposer=null;workspace.classList.add("hidden");workspace.innerHTML="";loginCard.classList.remove("hidden");employeePin.value="";renderMessageBoards(getState(),null);}
  function login(){const employee=authenticateEmployee(getState(),employeeNumber.value,employeePin.value);if(!employee){showStatus("Employee number or PIN is incorrect, or the employee is inactive.");return;}loginStatus.innerHTML="";renderEmployeeWorkspace(employee);}
  function submitReport(event,employee){
    event.preventDefault();
    const answerResult=readReportAnswers(event.currentTarget,employee.reportingRole),observationResult=observationComposer?.read()||{declared:"",observations:[],missing:["Observation declaration"]},formStatus=document.getElementById("reportFormStatus"),missing=[...answerResult.missing,...observationResult.missing];
    if(answerResult.requiresObservation&&observationResult.declared!=="yes")missing.push("A reported abnormal condition requires an observation");
    if(missing.length){formStatus.innerHTML=`<div class="status-box warning">Complete the required items before submitting.<br><small>${missing.map(esc).join(" · ")}</small></div>`;return;}
    const state=getState(),obligation=obligationFor(state,employee.id);
    try{
      const {submission,checkFacts,observations,issues,handoverDelivery}=createSubmissionArtifacts(state,employee,obligation,answerResult.answers,observationResult,capture,answerResult.carryObservationIds);
      state.submissions=state.submissions.filter(x=>x.obligationId!==obligation.obligationId);state.submissions.push(submission);state.checkFacts.push(...checkFacts);state.observations.push(...observations);state.issues.push(...issues);state.handoverDeliveries=Array.isArray(state.handoverDeliveries)?state.handoverDeliveries:[];state.handoverDeliveries.push(handoverDelivery);
      state.auditTrail.push({type:"SHIFT_REPORT_SUBMITTED",employeeId:employee.id,shiftInstanceId:obligation.shiftInstanceId,obligationId:obligation.obligationId,submissionId:submission.submissionId,handoverDeliveryId:handoverDelivery.deliveryId,targetShiftInstanceId:handoverDelivery.targetShiftInstanceId,targetTeamId:handoverDelivery.targetTeamId,at:submission.completedAt,provenance:submission.provenance});
      setState(state);onStateChange();renderEmployeeWorkspace(employee);
    }catch(error){formStatus.innerHTML=`<div class="status-box warning">${esc(error?.message||"The report could not be recorded.")}</div>`;}
  }
  workspace.addEventListener("click",e=>{
    const ack=e.target.closest("[data-handover-ack]");
    if(ack&&activeEmployee){const state=getState(),h=(state.handoverDeliveries||[]).find(x=>x.deliveryId===ack.dataset.handoverAck);if(!h)return;const at=new Date().toISOString();h.viewedAt=h.viewedAt||at;h.acknowledgedAt=at;h.acknowledgedByEmployeeId=activeEmployee.id;h.status="ACKNOWLEDGED";state.auditTrail.push({type:"HANDOVER_ACKNOWLEDGED",deliveryId:h.deliveryId,employeeId:activeEmployee.id,at});setState(state);onStateChange();renderEmployeeWorkspace(activeEmployee);return;}
    const action=e.target.closest("[data-my-action-transition]");
    if(action&&activeEmployee){const state=getState(),issue=(state.issues||[]).find(i=>i.issueId===action.dataset.myActionTransition);if(!issue||issue.assignedEmployeeId!==activeEmployee.id)return;const next=nextIssueStatus(issue);let reason="",evidence="";if(next==="CLOSED"){reason=window.prompt("What was done / why can this action be closed?","")||"";if(!reason.trim())return;evidence=window.prompt("Optional verification / evidence note:","")||"";}const result=transitionIssue(state,issue.issueId,{actorId:activeEmployee.id,reason,evidence});if(result.ok){setState(state);onStateChange();renderEmployeeWorkspace(activeEmployee);}else if(result.message)window.alert(result.message);}
  });
  workspace.addEventListener("submit",e=>{
    const form=e.target.closest("[data-quick-capture]");if(!form||!activeEmployee)return;e.preventDefault();
    const fd=new FormData(form),draft={areaId:String(fd.get("areaId")||""),processStageId:String(fd.get("processStageId")||"")||null,workContextId:String(fd.get("workContextId")||"")||null,eventTypeId:String(fd.get("eventTypeId")||""),severityId:String(fd.get("severityId")||"INFO"),equipmentId:String(fd.get("equipmentId")||"")||null,observedTime:String(fd.get("observedTime")||"")||null,actionRequired:String(fd.get("actionRequired")||"no"),narrative:String(fd.get("narrative")||"").trim()};
    const host=form.querySelector("[data-quick-status]");if(!draft.eventTypeId||!draft.narrative){host.innerHTML='<div class="status-box warning">Type and observation are required.</div>';return;}
    try{const state=getState(),{observation,issue}=createQuickCaptureArtifacts(state,activeEmployee,draft,capture);state.observations.push(observation);if(issue)state.issues.push(issue);state.auditTrail.push({type:"QUICK_CAPTURE_RECORDED",observationId:observation.observationId,issueId:issue?.issueId||null,employeeId:activeEmployee.id,at:observation.reportedAt});setState(state);onStateChange();renderEmployeeWorkspace(activeEmployee);}catch(error){host.innerHTML=`<div class="status-box warning">${esc(error?.message||"Capture failed.")}</div>`;}
  });
  loginButton.addEventListener("click",login);employeePin.addEventListener("keydown",e=>{if(e.key==="Enter")login();});
  return{reset(){activeEmployee=null;observationComposer=null;workspace.innerHTML="";workspace.classList.add("hidden");loginCard.classList.remove("hidden");employeeNumber.value="";employeePin.value="";loginStatus.innerHTML="";renderMessageBoards(getState(),null);},refresh(){if(activeEmployee)renderEmployeeWorkspace(activeEmployee);}};
}
