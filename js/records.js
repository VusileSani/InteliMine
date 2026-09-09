import { APP_CONFIG } from "./config.js";
import { reportSchemaForRole } from "./reportSchemas.js";
import { eventTypeById, equipmentById, areaById } from "./masterData.js";
import { resolveObservedTimestamp } from "./shift.js";
import { snapshotEmployeeContext, versionEnvelope, captureProvenance } from "./context.js";
import { assignmentFor, currentShift, nextShiftAfter, receivingTeamFor } from "./operationalModel.js";

function token(){ if(globalThis.crypto?.randomUUID)return globalThis.crypto.randomUUID().split("-")[0].toUpperCase(); return Math.random().toString(36).slice(2,10).toUpperCase(); }
function answerLabel(field,value){ return field.options?.find(o=>o.value===value)?.label||null; }
function shiftContext(state,shiftInstanceId=null){ const shift=(state.shiftInstances||[]).find(s=>s.shiftInstanceId===shiftInstanceId)||currentShift(state); return { shiftInstanceId:shift?.shiftInstanceId||APP_CONFIG.shiftInstanceId, shiftId:shift?.shiftId||APP_CONFIG.shiftId, shiftBusinessDate:shift?.businessDate||APP_CONFIG.shiftBusinessDate, operationTimezone:shift?.timezone||APP_CONFIG.operationTimezone, shift }; }
function operationalContext(state,employee,shiftInstanceId=null){ const a=assignmentFor(state,employee.id,shiftInstanceId); return { assignmentId:a?.assignmentId||null, operationId:a?.operationId||employee.operationId||APP_CONFIG.operationId, areaId:a?.areaId||employee.areaId||APP_CONFIG.defaultAreaId, processStageId:a?.processStageId||null, workContextId:a?.workContextId||null, teamId:a?.teamId||null, teamName:a?.teamName||null }; }
function subjectFor(field,answers,employee,state,shiftInstanceId){ const analytics=field.analytics||{}; const op=operationalContext(state,employee,shiftInstanceId); const shift=shiftContext(state,shiftInstanceId); if(analytics.subjectFromValue)return{subjectType:analytics.subjectType||"VALUE",subjectId:answers[field.key]||null}; if(analytics.subjectFromAnswer)return{subjectType:analytics.subjectType||"REFERENCE",subjectId:answers[analytics.subjectFromAnswer]||null}; if(analytics.subjectType==="AREA")return{subjectType:"AREA",subjectId:op.areaId}; if(analytics.subjectType==="WORK_CONTEXT")return{subjectType:"WORK_CONTEXT",subjectId:op.workContextId}; return{subjectType:analytics.subjectType||"SHIFT",subjectId:shift.shiftInstanceId}; }

export function createCheckFacts({state,employee,obligation,submissionId,answers,completedAt,provenance}){
  const schema=reportSchemaForRole(employee.reportingRole); const employeeContext=snapshotEmployeeContext(employee,state,obligation.shiftInstanceId); const versions=versionEnvelope();
  return schema.map((field,index)=>{ const value=answers[field.key]??""; const analytics=field.analytics||{}; const subject=subjectFor(field,answers,employee,state,obligation.shiftInstanceId); const isText=["text","textarea"].includes(field.type); return {
    checkId:`CHK-${obligation.shiftId||APP_CONFIG.shiftId}-${employee.employeeNumber}-${token()}-${index+1}`, sourceSubmissionId:submissionId, obligationId:obligation.obligationId, employeeId:employee.id,
    shiftInstanceId:obligation.shiftInstanceId, shiftId:obligation.shiftId, questionKey:field.key, questionLabel:field.label, factType:analytics.factType||"ANSWER",
    valueType:field.type==="choice"?"BOOLEAN_CODE":field.type==="equipment"?"EQUIPMENT":isText?"TEXT":"CODE", valueCode:isText?null:value, valueLabel:isText?null:answerLabel(field,value), valueText:isText?value:null,
    subjectType:subject.subjectType, subjectId:subject.subjectId, abnormalFlag:Array.isArray(analytics.abnormalValues)&&analytics.abnormalValues.includes(value), recordedAt:completedAt, recordedAtUtc:new Date(completedAt).toISOString(), employeeContext, versions, provenance
  }; });
}

function issueTitle(draft){ const type=eventTypeById(draft.eventTypeId); const equipment=equipmentById(draft.equipmentId); const area=areaById(draft.areaId); return `${equipment?.code||area?.name||"Operational issue"} · ${type?.label||draft.eventTypeId}`; }
function issueOwnerRole(draft){ const c=eventTypeById(draft.eventTypeId)?.category; if(["EQUIPMENT","ELECTRICAL"].includes(c))return"Engineering Supervisor"; if(c==="SAFETY")return"Shift Supervisor"; return"Production Supervisor"; }
function issueTargetAt(openedAt,severityId){ const minutes={CRITICAL:15,HIGH:30,MEDIUM:120,LOW:240,INFO:480}[severityId]||120; return new Date(new Date(openedAt).getTime()+minutes*60000).toISOString(); }

function responsibleTeam(state,employee,draft,reporterAssignment,shiftInstanceId){
  const category=eventTypeById(draft.eventTypeId)?.category;
  const assignments=(state.shiftAssignments||[]).filter(a=>a.shiftInstanceId===shiftInstanceId&&a.active!==false);
  if(["EQUIPMENT","ELECTRICAL"].includes(category)){
    const targetArea=draft.areaId||equipmentById(draft.equipmentId)?.areaId||reporterAssignment?.areaId;
    const engineering=assignments.find(a=>{
      const e=(state.employees||[]).find(x=>x.id===a.employeeId);
      return e?.departmentId==="DEPT-ENG"&&a.areaId===targetArea;
    })||assignments.find(a=>{
      const e=(state.employees||[]).find(x=>x.id===a.employeeId);
      return e?.departmentId==="DEPT-ENG";
    });
    if(engineering)return{teamId:engineering.teamId,teamName:engineering.teamName,routingReason:"Engineering-category routing"};
  }
  if(category==="SAFETY"){
    const supervisor=assignments.find(a=>{
      const e=(state.employees||[]).find(x=>x.id===a.employeeId);
      return ["SUPERVISOR","SAFETY_OFFICER"].includes(e?.reportingRole)&&a.areaId===(draft.areaId||reporterAssignment?.areaId);
    });
    if(supervisor)return{teamId:supervisor.teamId,teamName:supervisor.teamName,routingReason:"Area safety/supervision routing"};
  }
  return{teamId:reporterAssignment?.teamId||null,teamName:reporterAssignment?.teamName||null,routingReason:"Reporter operational team"};
}

function observationFromDraft({state,employee,submissionId=null,obligationId=null,draft,reportedAt,capture,sourceType="SHIFT_HANDOVER",shiftInstanceId=null}){
  const shift=shiftContext(state,shiftInstanceId); const asn=operationalContext(state,employee,shift.shiftInstanceId); const areaId=draft.areaId||asn.areaId; const timestamp=resolveObservedTimestamp(draft.observedTime,reportedAt,shift.shift); const actionRequired=draft.actionRequired==="yes"||draft.actionRequired===true; const issueId=actionRequired?`ISS-${shift.shiftId}-${token()}`:null; const observationId=`OBS-${shift.shiftId}-${token()}`; const severityId=draft.severityId||"INFO";
  const observation={ observationId, sourceSubmissionId:submissionId, obligationId, sourceType, employeeId:employee.id, shiftInstanceId:shift.shiftInstanceId, shiftId:shift.shiftId, operationId:asn.operationId, areaId, processStageId:draft.processStageId||asn.processStageId, workContextId:draft.workContextId||asn.workContextId, teamId:asn.teamId, equipmentId:draft.equipmentId||null, eventTypeId:draft.eventTypeId, severityId, actionRequired, signalStatus:actionRequired?"ACTIONED":(["HIGH","CRITICAL"].includes(severityId)?"UNREVIEWED":"ROUTINE"), observedAt:timestamp.observedAt, observedAtUtc:timestamp.observedAtUtc, localObservedDate:timestamp.localObservedDate, localObservedTime:timestamp.localObservedTime, shiftBusinessDate:shift.shiftBusinessDate, operationTimezone:shift.operationTimezone, reportedAt, reportedAtUtc:new Date(reportedAt).toISOString(), narrative:draft.narrative, issueId, employeeContext:snapshotEmployeeContext(employee,state,shift.shiftInstanceId), versions:versionEnvelope(), provenance:captureProvenance(capture) };
  let issue=null;
  if(issueId){
    const reporterAssignment=assignmentFor(state,employee.id,shift.shiftInstanceId);
    const routed=responsibleTeam(state,employee,{...draft,areaId},reporterAssignment,shift.shiftInstanceId);
    issue={ issueId,title:issueTitle({...draft,areaId}),operationId:asn.operationId,shiftInstanceId:shift.shiftInstanceId,areaId,processStageId:observation.processStageId,workContextId:observation.workContextId,equipmentId:draft.equipmentId||null,eventTypeId:draft.eventTypeId,severityId,currentStatus:"OPEN",ownerRole:issueOwnerRole(draft),assignedTeamId:routed.teamId||null,assignedEmployeeId:null,targetAt:issueTargetAt(reportedAt,severityId),openedAt:reportedAt,openedAtUtc:new Date(reportedAt).toISOString(),primaryObservationId:observationId,observationIds:[observationId],assignmentHistory:routed.teamId?[{teamId:routed.teamId,employeeId:null,at:reportedAt,actorId:employee.id,reason:routed.routingReason}]:[],lifecycleHistory:[{status:"OPEN",at:reportedAt,actorId:employee.id,reason:"Created from structured observation"}],versions:versionEnvelope() };
  }
  return {observation,issue};
}

function handoverSummary(submission,carriedObservations){
  const answerSummary=submission.answers?.safetyHandover||submission.answers?.handoverNote||submission.answers?.nextShiftPriority||"Shift handover submitted.";
  if(!carriedObservations.length)return answerSummary;
  const first=carriedObservations[0]?.narrative||"";
  const extra=carriedObservations.length>1?` (+${carriedObservations.length-1} captured item${carriedObservations.length===2?"":"s"})`:"";
  return `${answerSummary}${first&&first!==answerSummary?` · Captured: ${first}${extra}`:""}`;
}

export function createHandoverDelivery(state,employee,submission,{carryObservationIds=[]}={}){
  const sourceAssignment=assignmentFor(state,employee.id,submission.shiftInstanceId);
  const targetShift=nextShiftAfter(state,submission.shiftInstanceId);
  const receiving=targetShift?receivingTeamFor(state,{sourceEmployeeId:employee.id,sourceAssignment,targetShiftInstanceId:targetShift.shiftInstanceId}):{teamId:null,teamName:null,areaId:sourceAssignment?.areaId||employee.areaId};
  const carried=(state.observations||[]).filter(o=>carryObservationIds.includes(o.observationId));
  const severityPool=[submission.answers?.safetyCondition,...carried.map(o=>o.severityId)];
  const severityId=severityPool.includes("CRITICAL")?"CRITICAL":severityPool.includes("HIGH")||severityPool.includes("ATTENTION")?"HIGH":severityPool.includes("MEDIUM")?"MEDIUM":"INFO";
  return {
    deliveryId:`HND-${submission.shiftId}-${token()}`,sourceSubmissionId:submission.submissionId,sourceEmployeeId:employee.id,sourceShiftInstanceId:submission.shiftInstanceId,
    targetShiftInstanceId:targetShift?.shiftInstanceId||null,targetTeamId:receiving.teamId||null,targetTeamName:receiving.teamName||null,targetAreaId:receiving.areaId||sourceAssignment?.areaId||employee.areaId,targetEmployeeId:null,
    title:"Shift handover available",summary:handoverSummary(submission,carried),carriedObservationIds:[...carryObservationIds],severityId,
    processStageId:sourceAssignment?.processStageId||null,workContextId:sourceAssignment?.workContextId||null,areaId:sourceAssignment?.areaId||employee.areaId,
    deliveredAt:submission.completedAt,viewedAt:null,acknowledgedAt:null,acknowledgedByEmployeeId:null,status:targetShift?"DELIVERED":"AWAITING_NEXT_SHIFT"
  };
}

export function createSubmissionArtifacts(state,employee,obligation,answers,observationResult,capture={},carryObservationIds=[]){
  if(!obligation)throw new Error("No reporting obligation exists for this employee and shift.");
  const completedAt=new Date().toISOString(); const submissionId=`SUB-${obligation.shiftId||APP_CONFIG.shiftId}-${employee.employeeNumber}-${token()}`; const provenance=captureProvenance(capture); const checkFacts=createCheckFacts({state,employee,obligation,submissionId,answers,completedAt,provenance}); const observations=[]; const issues=[];
  for(const draft of observationResult.observations||[]){ const {observation,issue}=observationFromDraft({state,employee,submissionId,obligationId:obligation.obligationId,draft,reportedAt:completedAt,capture,sourceType:"SHIFT_HANDOVER",shiftInstanceId:obligation.shiftInstanceId}); observations.push(observation); if(issue)issues.push(issue); }
  const allCarryIds=[...new Set([...(carryObservationIds||[]),...observations.map(o=>o.observationId)])];
  const submission={ submissionId,obligationId:obligation.obligationId,employeeId:employee.id,shiftInstanceId:obligation.shiftInstanceId,shiftId:obligation.shiftId,status:"COMPLETE",completedAt,completedAtUtc:new Date(completedAt).toISOString(),observationDeclared:observationResult.declared==="yes",observationIds:observations.map(x=>x.observationId),issueIds:issues.map(x=>x.issueId),checkFactIds:checkFacts.map(x=>x.checkId),carryObservationIds:allCarryIds,answers,employeeContext:snapshotEmployeeContext(employee,state,obligation.shiftInstanceId),versions:versionEnvelope(),provenance };
  // Formal observations are not in state yet, so include them when composing the delivery summary.
  const tempState={...state,observations:[...(state.observations||[]),...observations]};
  const handoverDelivery=createHandoverDelivery(tempState,employee,submission,{carryObservationIds:allCarryIds});
  for(const o of state.observations||[]) if(allCarryIds.includes(o.observationId)){o.handoverDeliveryId=handoverDelivery.deliveryId;o.handoverCarriedAt=completedAt;}
  for(const o of observations){o.handoverDeliveryId=handoverDelivery.deliveryId;o.handoverCarriedAt=completedAt;}
  return {submission,checkFacts,observations,issues,handoverDelivery};
}

export function createQuickCaptureArtifacts(state,employee,draft,capture={}){ const reportedAt=new Date().toISOString(); const result=observationFromDraft({state,employee,draft,reportedAt,capture,sourceType:"QUICK_CAPTURE",shiftInstanceId:currentShift(state)?.shiftInstanceId}); return {observation:result.observation,issue:result.issue}; }
