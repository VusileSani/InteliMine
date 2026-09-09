import assert from "node:assert/strict";
import { createFreshStateForTesting } from "../js/store.js";
import { APP_CONFIG } from "../js/config.js";
import { analyticsDataQuality } from "../js/analyticsModel.js";
import { COMMON_SAFETY_FIELDS, reportSchemaForRole } from "../js/reportSchemas.js";
import { currentShift, nextShiftAfter, activateShift, incomingHandoversFor } from "../js/operationalModel.js";
import { obligationFor, employeeAssignedIssues } from "../js/domain.js";
import { createQuickCaptureArtifacts, createSubmissionArtifacts } from "../js/records.js";
import { nextIssueStatus, transitionIssue } from "../js/issueLifecycle.js";

const state=createFreshStateForTesting();
assert.equal(state.schemaVersion,"2.8");
assert.equal(APP_CONFIG.dataContractVersion,"1.4");
assert.equal(currentShift(state)?.shiftInstanceId,"SHIFT-NS-20260905");
assert.equal(nextShiftAfter(state,"SHIFT-NS-20260905")?.shiftInstanceId,"SHIFT-DS-20260906");
assert.equal(COMMON_SAFETY_FIELDS.length,2,"Common safety layer must stay compact");
assert.equal(reportSchemaForRole("SAFETY_OFFICER").some(f=>f.key==="safetyCondition"),false,"Safety Officer must not receive duplicate common safety fields");
assert.deepEqual(["OPEN","IN_PROGRESS","CLOSED"],["OPEN",nextIssueStatus({currentStatus:"OPEN"}),nextIssueStatus({currentStatus:"IN_PROGRESS"})]);
assert.equal("readinessRows" in analyticsDataQuality(state),false,"Readiness facts must be outside v2.8 POC contract");
assert.equal("materialRows" in analyticsDataQuality(state),false,"Material lineage must be outside v2.8 POC contract");
assert.equal((state.readinessWorkflows||[]).length,0);
assert.equal((state.materialMovements||[]).length,0);

// Core routing test: an operator's engineering observation routes to engineering, not the reporter's production team.
const operator=state.employees.find(e=>e.id==="emp_108022");
const routed=createQuickCaptureArtifacts(state,operator,{eventTypeId:"EVT-MECH-DEFECT",severityId:"HIGH",equipmentId:"EQ-CV04",actionRequired:"yes",narrative:"Test routing: conveyor mechanical defect"});
state.observations.push(routed.observation); state.issues.push(routed.issue);
assert.equal(routed.issue.assignedTeamId,"TEAM-ENG-B","Engineering issue must route to Engineering B");
assert.notEqual(routed.issue.assignedTeamId,"TEAM-SEC3-B");

// Named assignment must become visible through the My Actions domain query.
routed.issue.assignedEmployeeId="emp_105310";
assert(employeeAssignedIssues(state,"emp_105310").some(i=>i.issueId===routed.issue.issueId));
assert.equal(transitionIssue(state,routed.issue.issueId,{actorId:"emp_105310"}).ok,true);
assert.equal(routed.issue.currentStatus,"IN_PROGRESS");
assert.equal(transitionIssue(state,routed.issue.issueId,{actorId:"emp_105310",reason:"Inspected and repaired for test",evidence:"Test evidence"}).ok,true);
assert.equal(routed.issue.currentStatus,"CLOSED");

// Quick Capture must be carried into the formal handover without retyping, and the delivery must target the next shift/team.
const electrician=state.employees.find(e=>e.id==="emp_105310");
const quick=createQuickCaptureArtifacts(state,electrician,{eventTypeId:"EVT-ELECTRICAL-FAULT",severityId:"MEDIUM",equipmentId:"EQ-CV04",actionRequired:"no",narrative:"Intermittent indication noted; monitor next shift"});
state.observations.push(quick.observation);
const obligation=obligationFor(state,electrician.id);
assert(obligation,"Electrician must have current-shift obligation in seed data");
const answers={equipmentWorkedOnId:"EQ-CV04",restorationStatus:"RESTORED",electricalConcern:"no",outstandingWork:"None",handoverNote:"Monitor indication",safetyCondition:"GOOD",safetyHandover:""};
const artifacts=createSubmissionArtifacts(state,electrician,obligation,answers,{declared:"no",observations:[]},{channel:"KIOSK",capturePointId:"TEST"},[quick.observation.observationId]);
assert.equal(artifacts.handoverDelivery.sourceShiftInstanceId,"SHIFT-NS-20260905");
assert.equal(artifacts.handoverDelivery.targetShiftInstanceId,"SHIFT-DS-20260906");
assert.equal(artifacts.handoverDelivery.targetTeamId,"TEAM-ENG-A");
assert(artifacts.handoverDelivery.carriedObservationIds.includes(quick.observation.observationId));
assert.notEqual(artifacts.handoverDelivery.sourceShiftInstanceId,artifacts.handoverDelivery.targetShiftInstanceId);
state.submissions=state.submissions.filter(s=>s.obligationId!==obligation.obligationId); state.submissions.push(artifacts.submission);
state.checkFacts.push(...artifacts.checkFacts); state.observations.push(...artifacts.observations); state.issues.push(...artifacts.issues); state.handoverDeliveries.push(artifacts.handoverDelivery);

// Active shift is state-backed: activating the receiving shift changes employee handover visibility.
assert.equal(activateShift(state,"SHIFT-DS-20260906","TEST").ok,true);
assert.equal(currentShift(state)?.shiftInstanceId,"SHIFT-DS-20260906");
assert(incomingHandoversFor(state,"emp_104782").some(h=>h.deliveryId===artifacts.handoverDelivery.deliveryId),"Receiving engineering shift must see routed handover");

const quality=analyticsDataQuality(state);
assert.deepEqual(quality.errors,[],`Analytics integrity errors: ${quality.errors.join(" | ")}`);
assert.equal(quality.completeness,100);

// Negative regression: remove a persisted common safety fact and ensure the contract catches it.
const safetySubmission=state.submissions.find(s=>s.answers?.safetyCondition);
if(safetySubmission){
  const idx=state.checkFacts.findIndex(c=>c.sourceSubmissionId===safetySubmission.submissionId&&c.questionKey==="safetyCondition");
  if(idx>=0){
    const removed=state.checkFacts.splice(idx,1)[0];
    const broken=analyticsDataQuality(state);
    assert(broken.errors.some(e=>e.includes("safety answer safetyCondition missing structured fact")));
    state.checkFacts.splice(idx,0,removed);
  }
}

console.log(`PASS · ${quality.totalRows} analytical rows · ${quality.completeness}% contract completeness`);
console.log(`Observations ${quality.observationRows} · checks ${quality.checkRows} · issues ${quality.issueRows} · handovers ${quality.handoverRows}`);
console.log(`Process stages ${(state.processStages||[]).length} · work contexts ${(state.workContexts||[]).length} retained as hidden analytical context`);
