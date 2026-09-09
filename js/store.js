import {
  INITIAL_REPORTING_OBLIGATIONS,
  INITIAL_SUBMISSIONS,
  INITIAL_CHECK_FACTS,
  INITIAL_OBSERVATIONS,
  INITIAL_ISSUES,
  INITIAL_INTEGRATION_BATCHES,
  EMPLOYEES,
  INITIAL_ATTENDANCE
} from "./seedData.js";
import { APP_CONFIG } from "./config.js";
import { defaultMasterDataSnapshot } from "./masterData.js";
import { normalizeAccessModel } from "./accessControl.js";
import { defaultMessages } from "./communications.js";
import { defaultReportingTemplates, COMMON_SAFETY_FIELDS } from "./reportSchemas.js";
import { defaultOperationalState, normalizeOperationalState, assignmentFor } from "./operationalModel.js";
import { SHIFT_PERFORMANCE_HISTORY, CURRENT_DELAY_EVENTS, CRITICAL_CONTROL_VERIFICATIONS } from "./leadershipData.js";
import { normalizeIssueLifecycle } from "./issueLifecycle.js";

const STORAGE_KEY = "minemind_v2_8_restraint_continuity";
const LEGACY_KEYS = ["minemind_v2_7_operational_intelligence","intelimine_v2_0_leadership_value"];

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function nowIso() { return new Date().toISOString(); }
function versionEnvelope() {
  return {
    dataContractVersion:APP_CONFIG.dataContractVersion,
    reportSchemaVersion:APP_CONFIG.reportSchemaVersion,
    eventTaxonomyVersion:APP_CONFIG.eventTaxonomyVersion,
    masterDataVersion:APP_CONFIG.masterDataVersion,
    processModelVersion:APP_CONFIG.processModelVersion
  };
}

function employeeContextFor(state, employeeId) {
  const employee=(state.employees||[]).find(item=>item.id===employeeId)||{};
  const assignment=assignmentFor(state,employeeId);
  return {
    employeeId:employee.id||employeeId, employeeNumber:employee.employeeNumber||"", employeeName:[employee.firstName,employee.lastName].filter(Boolean).join(" "),
    jobTitle:employee.jobTitle||"", reportingRoleId:employee.reportingRole||"", departmentId:employee.departmentId||"", departmentName:employee.departmentId||"",
    areaId:employee.areaId||"", areaName:employee.areaId||"", operationId:employee.operationId||APP_CONFIG.operationId, operationName:"Mining Operation",
    supervisorEmployeeNo:employee.supervisorEmployeeNo||null, shiftGroup:employee.shiftGroup||null, workLocation:employee.workLocation||null,
    assignmentId:assignment?.assignmentId||null, assignedAreaId:assignment?.areaId||employee.areaId||null, processStageId:assignment?.processStageId||null,
    workContextId:assignment?.workContextId||null, teamId:assignment?.teamId||null, teamName:assignment?.teamName||null, capturedAt:nowIso()
  };
}

function initialState() {
  const operational=defaultOperationalState();
  return normalizeAccessModel({
    schemaVersion:"2.8",
    employees:clone(EMPLOYEES), attendance:clone(INITIAL_ATTENDANCE), masterData:defaultMasterDataSnapshot(),
    obligations:clone(INITIAL_REPORTING_OBLIGATIONS), submissions:clone(INITIAL_SUBMISSIONS), checkFacts:clone(INITIAL_CHECK_FACTS),
    observations:clone(INITIAL_OBSERVATIONS), issues:clone(INITIAL_ISSUES), overrides:[],
    shiftPerformance:clone(SHIFT_PERFORMANCE_HISTORY), delayEvents:clone(CURRENT_DELAY_EVENTS), controlVerifications:clone(CRITICAL_CONTROL_VERIFICATIONS),
    integrationBatches:clone(INITIAL_INTEGRATION_BATCHES), auditTrail:[], rolePresets:[], platformAuthorities:[],
    messages:defaultMessages(), mineIdentity:{ mineName:"Demo Mining Operation", logoDataUrl:"", updatedAt:null },
    reportingTemplates:defaultReportingTemplates(),
    ...operational,
    createdAt:nowIso()
  });
}

function backfillSafetyFacts(state) {
  const existing=new Set((state.checkFacts||[]).map(item=>`${item.sourceSubmissionId}|${item.questionKey}`));
  for (const submission of state.submissions||[]) {
    const employee=(state.employees||[]).find(item=>item.id===submission.employeeId);
    if(!employee) continue;
    const answers=submission.answers||{};
    for (const [index, field] of COMMON_SAFETY_FIELDS.entries()) {
      const value=answers[field.key];
      if(value===undefined || value===null || String(value).trim()==="") continue;
      const identity=`${submission.submissionId}|${field.key}`;
      if(existing.has(identity)) continue;
      const isText=["text","textarea"].includes(field.type);
      const subjectType=field.analytics?.subjectType||"SHIFT";
      const assignment=assignmentFor(state,employee.id,submission.shiftInstanceId);
      state.checkFacts.push({
        checkId:`CHK-MIG-${submission.submissionId}-${field.key}-${index+1}`,
        sourceSubmissionId:submission.submissionId, obligationId:submission.obligationId, employeeId:employee.id,
        shiftInstanceId:submission.shiftInstanceId||APP_CONFIG.shiftInstanceId, shiftId:submission.shiftId||APP_CONFIG.shiftId,
        questionKey:field.key, questionLabel:field.label, factType:field.analytics?.factType||"ANSWER",
        valueType:field.type==="choice"?"BOOLEAN_CODE":isText?"TEXT":"CODE", valueCode:isText?null:value,
        valueLabel:isText?null:(field.options?.find(o=>o.value===value)?.label||null), valueText:isText?String(value):null,
        subjectType, subjectId:subjectType==="SHIFT"?(submission.shiftInstanceId||APP_CONFIG.shiftInstanceId):(assignment?.areaId||employee.areaId||null),
        abnormalFlag:Array.isArray(field.analytics?.abnormalValues)&&field.analytics.abnormalValues.includes(value),
        recordedAt:submission.completedAt||nowIso(), recordedAtUtc:new Date(submission.completedAt||nowIso()).toISOString(),
        employeeContext:submission.employeeContext||employeeContextFor(state,employee.id), versions:versionEnvelope(),
        provenance:submission.provenance||{captureChannel:"MIGRATION",capturePointId:null,sourceSystem:"MINEMIND",sourceRecordId:submission.submissionId,importBatchId:null}
      });
      submission.checkFactIds=Array.isArray(submission.checkFactIds)?submission.checkFactIds:[];
      submission.checkFactIds.push(state.checkFacts[state.checkFacts.length-1].checkId);
      existing.add(identity);
    }
  }
}

function migrateRecords(state) {
  const v=versionEnvelope();
  for (const collection of ["obligations","submissions","checkFacts","observations","issues"]) {
    for (const item of state[collection]||[]) item.versions={...v,...(item.versions||{}),...v};
  }
  for (const observation of state.observations||[]) {
    const employee=(state.employees||[]).find(e=>e.id===observation.employeeId);
    const asn=assignmentFor(state,observation.employeeId,observation.shiftInstanceId||APP_CONFIG.shiftInstanceId);
    observation.operationId=observation.operationId||employee?.operationId||observation.employeeContext?.operationId||APP_CONFIG.operationId;
    observation.areaId=observation.areaId||asn?.areaId||employee?.areaId||APP_CONFIG.defaultAreaId;
    observation.processStageId=observation.processStageId||asn?.processStageId||null;
    observation.workContextId=observation.workContextId||asn?.workContextId||null;
    observation.teamId=observation.teamId||asn?.teamId||null;
    observation.signalStatus=observation.signalStatus||((observation.actionRequired||observation.issueId)?"ACTIONED":(["HIGH","CRITICAL"].includes(observation.severityId)?"UNREVIEWED":"ROUTINE"));
    observation.employeeContext={...(observation.employeeContext||employeeContextFor(state,observation.employeeId)),assignmentId:asn?.assignmentId||observation.employeeContext?.assignmentId||null,assignedAreaId:asn?.areaId||observation.areaId,processStageId:observation.processStageId,workContextId:observation.workContextId,teamId:observation.teamId,teamName:asn?.teamName||observation.employeeContext?.teamName||null};
  }
  for (const issue of state.issues||[]) {
    normalizeIssueLifecycle(issue);
    const obs=(state.observations||[]).find(o=>o.observationId===issue.primaryObservationId);
    issue.operationId=issue.operationId||obs?.operationId||APP_CONFIG.operationId;
    issue.shiftInstanceId=issue.shiftInstanceId||obs?.shiftInstanceId||APP_CONFIG.shiftInstanceId;
    issue.processStageId=issue.processStageId||obs?.processStageId||null;
    issue.workContextId=issue.workContextId||obs?.workContextId||null;
    issue.assignedTeamId=issue.assignedTeamId||obs?.teamId||null;
    issue.assignedEmployeeId=issue.assignedEmployeeId||null;
    issue.assignmentHistory=Array.isArray(issue.assignmentHistory)?issue.assignmentHistory:[];
    if(!issue.assignmentHistory.length && issue.assignedTeamId) issue.assignmentHistory.push({teamId:issue.assignedTeamId,employeeId:issue.assignedEmployeeId||null,at:issue.openedAt||nowIso(),actorId:"MIGRATION",reason:"Backfilled from shift assignment"});
    if(issue.ownerRole==="Engineering Supervisor" && issue.assignedTeamId && !String(issue.assignedTeamId).includes("ENG")) {
      const engineering=(state.shiftAssignments||[]).find(a=>a.shiftInstanceId===issue.shiftInstanceId && (state.employees||[]).find(e=>e.id===a.employeeId)?.departmentId==="DEPT-ENG");
      if(engineering){issue.assignedTeamId=engineering.teamId;issue.assignmentHistory.push({teamId:engineering.teamId,employeeId:null,at:nowIso(),actorId:"MIGRATION",reason:"Corrected engineering responsibility routing in v2.8"});}
    }
  }
  for (const item of state.delayEvents||[]) {
    item.shiftInstanceId=item.shiftInstanceId||APP_CONFIG.shiftInstanceId; item.operationId=item.operationId||APP_CONFIG.operationId;
  }
  for (const item of state.controlVerifications||[]) {
    item.shiftInstanceId=item.shiftInstanceId||APP_CONFIG.shiftInstanceId; item.operationId=item.operationId||APP_CONFIG.operationId;
  }
  for (const item of state.shiftPerformance||[]) item.operationId=item.operationId||APP_CONFIG.operationId;
}

function normalizeState(candidate) {
  const base=initialState();
  const source=candidate&&typeof candidate==="object"?candidate:{};
  let state={...base,...source,schemaVersion:"2.8"};
  for (const key of ["employees","attendance","obligations","submissions","checkFacts","observations","issues","overrides","shiftPerformance","delayEvents","controlVerifications","integrationBatches","auditTrail","rolePresets","platformAuthorities","messages","reportingTemplates"]) {
    state[key]=Array.isArray(source[key])?clone(source[key]):clone(base[key]);
  }
  state.masterData=source.masterData&&typeof source.masterData==="object"?clone(source.masterData):clone(base.masterData);
  state.mineIdentity=source.mineIdentity&&typeof source.mineIdentity==="object"?clone(source.mineIdentity):clone(base.mineIdentity);
  delete state.mineIdentity.bannerDataUrl;
  state=normalizeOperationalState(state);
  migrateRecords(state);
  backfillSafetyFacts(state);
  return normalizeAccessModel(state);
}

export function loadState() {
  try {
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw) return normalizeState(JSON.parse(raw));
    for(const key of LEGACY_KEYS){ const legacy=localStorage.getItem(key); if(legacy) return normalizeState(JSON.parse(legacy)); }
    return initialState();
  } catch { return initialState(); }
}
export function saveState(state){ localStorage.setItem(STORAGE_KEY,JSON.stringify(normalizeState(state))); }
export function resetState(){ const state=initialState(); saveState(state); return state; }
export function createFreshStateForTesting(){ return normalizeState(initialState()); }
