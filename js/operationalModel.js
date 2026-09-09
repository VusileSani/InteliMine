import { APP_CONFIG } from "./config.js";

function clone(value) { return JSON.parse(JSON.stringify(value)); }

// Mining-domain sophistication remains metadata beneath the POC interface.
// These stages add analytical meaning to observations without becoming a workflow engine.
export const DEFAULT_PROCESS_STAGES = Object.freeze([
  { id:"STAGE-DRILLING", code:"DRILLING", name:"Drilling", order:10, active:true },
  { id:"STAGE-CHARGING", code:"CHARGING", name:"Charging", order:20, active:true },
  { id:"STAGE-CLEARANCE", code:"CLEARANCE", name:"Clearance", order:30, active:true },
  { id:"STAGE-BLASTING", code:"BLASTING", name:"Blasting", order:40, active:true },
  { id:"STAGE-REENTRY", code:"RE_ENTRY", name:"Re-entry", order:50, active:true },
  { id:"STAGE-CLEANING", code:"CLEANING", name:"Cleaning / mucking", order:60, active:true },
  { id:"STAGE-HAULAGE", code:"HAULAGE", name:"Haulage", order:70, active:true },
  { id:"STAGE-PLANT-FEED", code:"PLANT_FEED", name:"Plant feed", order:80, active:true },
  { id:"STAGE-MILLING", code:"MILLING", name:"Milling", order:90, active:true },
  { id:"STAGE-FLOTATION", code:"FLOTATION", name:"Flotation", order:100, active:true },
  { id:"STAGE-RECOVERY", code:"RECOVERY", name:"Recovery", order:110, active:true }
]);

export const DEFAULT_WORK_CONTEXTS = Object.freeze([
  { id:"WC-PANEL-B", code:"PANEL-B", name:"Panel B face", type:"FACE_PANEL", areaId:"AREA-PANEL-B", active:true },
  { id:"WC-PANEL-B-ROUND-01", code:"PB-R01", name:"Panel B blast round 01", type:"BLAST_ROUND", areaId:"AREA-PANEL-B", active:true },
  { id:"WC-SEC3-HAUL", code:"SEC3-HAUL", name:"Section 3 haul route", type:"HAUL_ROUTE", areaId:"AREA-SEC3", active:true },
  { id:"WC-CRUSHER-2", code:"CR2", name:"Crusher 2 / feed point", type:"PLANT_FEED_POINT", areaId:"AREA-SEC3", active:true },
  { id:"WC-MILL-1", code:"MILL-1", name:"Mill circuit 1", type:"MILL_CIRCUIT", areaId:"AREA-SEC3", active:true },
  { id:"WC-FLOT-1", code:"FLOT-1", name:"Flotation circuit 1", type:"FLOTATION_CIRCUIT", areaId:"AREA-SEC3", active:true },
  { id:"WC-RECOVERY-1", code:"REC-1", name:"Recovery / downstream process", type:"RECOVERY_UNIT", areaId:"AREA-SEC3", active:true }
]);

export const DEFAULT_SHIFT_INSTANCES = Object.freeze([
  { shiftInstanceId:"SHIFT-DS-20260902", shiftId:"DS-20260902", shiftName:"Day Shift", label:"02 Sep · Day", businessDate:"2026-09-02", operationId:APP_CONFIG.operationId, timezone:APP_CONFIG.operationTimezone, utcOffset:APP_CONFIG.operationUtcOffset, startsAtLocal:"2026-09-02T06:00:00+02:00", endsAtLocal:"2026-09-02T18:00:00+02:00", startsAtUtc:"2026-09-02T04:00:00.000Z", endsAtUtc:"2026-09-02T16:00:00.000Z", status:"CLOSED" },
  { shiftInstanceId:"SHIFT-NS-20260902", shiftId:"NS-20260902", shiftName:"Night Shift", label:"02 Sep · Night", businessDate:"2026-09-02", operationId:APP_CONFIG.operationId, timezone:APP_CONFIG.operationTimezone, utcOffset:APP_CONFIG.operationUtcOffset, startsAtLocal:"2026-09-02T18:00:00+02:00", endsAtLocal:"2026-09-03T06:00:00+02:00", startsAtUtc:"2026-09-02T16:00:00.000Z", endsAtUtc:"2026-09-03T04:00:00.000Z", status:"CLOSED" },
  { shiftInstanceId:"SHIFT-DS-20260903", shiftId:"DS-20260903", shiftName:"Day Shift", label:"03 Sep · Day", businessDate:"2026-09-03", operationId:APP_CONFIG.operationId, timezone:APP_CONFIG.operationTimezone, utcOffset:APP_CONFIG.operationUtcOffset, startsAtLocal:"2026-09-03T06:00:00+02:00", endsAtLocal:"2026-09-03T18:00:00+02:00", startsAtUtc:"2026-09-03T04:00:00.000Z", endsAtUtc:"2026-09-03T16:00:00.000Z", status:"CLOSED" },
  { shiftInstanceId:"SHIFT-NS-20260903", shiftId:"NS-20260903", shiftName:"Night Shift", label:"03 Sep · Night", businessDate:"2026-09-03", operationId:APP_CONFIG.operationId, timezone:APP_CONFIG.operationTimezone, utcOffset:APP_CONFIG.operationUtcOffset, startsAtLocal:"2026-09-03T18:00:00+02:00", endsAtLocal:"2026-09-04T06:00:00+02:00", startsAtUtc:"2026-09-03T16:00:00.000Z", endsAtUtc:"2026-09-04T04:00:00.000Z", status:"CLOSED" },
  { shiftInstanceId:"SHIFT-DS-20260904", shiftId:"DS-20260904", shiftName:"Day Shift", label:"04 Sep · Day", businessDate:"2026-09-04", operationId:APP_CONFIG.operationId, timezone:APP_CONFIG.operationTimezone, utcOffset:APP_CONFIG.operationUtcOffset, startsAtLocal:"2026-09-04T06:00:00+02:00", endsAtLocal:"2026-09-04T18:00:00+02:00", startsAtUtc:"2026-09-04T04:00:00.000Z", endsAtUtc:"2026-09-04T16:00:00.000Z", status:"CLOSED" },
  { shiftInstanceId:"SHIFT-NS-20260904", shiftId:"NS-20260904", shiftName:"Night Shift", label:"04 Sep · Night", businessDate:"2026-09-04", operationId:APP_CONFIG.operationId, timezone:APP_CONFIG.operationTimezone, utcOffset:APP_CONFIG.operationUtcOffset, startsAtLocal:"2026-09-04T18:00:00+02:00", endsAtLocal:"2026-09-05T06:00:00+02:00", startsAtUtc:"2026-09-04T16:00:00.000Z", endsAtUtc:"2026-09-05T04:00:00.000Z", status:"CLOSED" },
  { shiftInstanceId:"SHIFT-DS-20260905", shiftId:"DS-20260905", shiftName:"Day Shift", label:"05 Sep · Day", businessDate:"2026-09-05", operationId:APP_CONFIG.operationId, timezone:APP_CONFIG.operationTimezone, utcOffset:APP_CONFIG.operationUtcOffset, startsAtLocal:"2026-09-05T06:00:00+02:00", endsAtLocal:"2026-09-05T18:00:00+02:00", startsAtUtc:"2026-09-05T04:00:00.000Z", endsAtUtc:"2026-09-05T16:00:00.000Z", status:"CLOSED" },
  { shiftInstanceId:APP_CONFIG.shiftInstanceId, shiftId:APP_CONFIG.shiftId, shiftName:APP_CONFIG.shiftName, label:"05 Sep · Night", businessDate:APP_CONFIG.shiftBusinessDate, operationId:APP_CONFIG.operationId, timezone:APP_CONFIG.operationTimezone, utcOffset:APP_CONFIG.operationUtcOffset, startsAtLocal:APP_CONFIG.shiftStartLocal, endsAtLocal:APP_CONFIG.shiftEndLocal, startsAtUtc:new Date(APP_CONFIG.shiftStartLocal).toISOString(), endsAtUtc:new Date(APP_CONFIG.shiftEndLocal).toISOString(), status:"ACTIVE" },
  { shiftInstanceId:"SHIFT-DS-20260906", shiftId:"DS-20260906", shiftName:"Day Shift", label:"06 Sep · Day", businessDate:"2026-09-06", operationId:APP_CONFIG.operationId, timezone:APP_CONFIG.operationTimezone, utcOffset:APP_CONFIG.operationUtcOffset, startsAtLocal:"2026-09-06T06:00:00+02:00", endsAtLocal:"2026-09-06T18:00:00+02:00", startsAtUtc:"2026-09-06T04:00:00.000Z", endsAtUtc:"2026-09-06T16:00:00.000Z", status:"PLANNED" }
]);

export const DEFAULT_SHIFT_ASSIGNMENTS = Object.freeze([
  { assignmentId:"ASN-104782-NS0509", shiftInstanceId:APP_CONFIG.shiftInstanceId, employeeId:"emp_104782", operationId:APP_CONFIG.operationId, areaId:"AREA-CONVEYOR", processStageId:"STAGE-HAULAGE", workContextId:"WC-SEC3-HAUL", teamId:"TEAM-ENG-B", teamName:"Engineering B", assignedAt:"2026-09-05T17:50:00+02:00", active:true },
  { assignmentId:"ASN-105310-NS0509", shiftInstanceId:APP_CONFIG.shiftInstanceId, employeeId:"emp_105310", operationId:APP_CONFIG.operationId, areaId:"AREA-SEC3", processStageId:"STAGE-HAULAGE", workContextId:"WC-SEC3-HAUL", teamId:"TEAM-ENG-B", teamName:"Engineering B", assignedAt:"2026-09-05T17:50:00+02:00", active:true },
  { assignmentId:"ASN-106004-NS0509", shiftInstanceId:APP_CONFIG.shiftInstanceId, employeeId:"emp_106004", operationId:APP_CONFIG.operationId, areaId:"AREA-PANEL-B", processStageId:"STAGE-CLEARANCE", workContextId:"WC-PANEL-B-ROUND-01", teamId:"TEAM-SEC3-B", teamName:"Section 3 B", assignedAt:"2026-09-05T17:50:00+02:00", active:true },
  { assignmentId:"ASN-107199-NS0509", shiftInstanceId:APP_CONFIG.shiftInstanceId, employeeId:"emp_107199", operationId:APP_CONFIG.operationId, areaId:"AREA-SEC3", processStageId:"STAGE-CLEARANCE", workContextId:"WC-PANEL-B-ROUND-01", teamId:"TEAM-SEC3-B", teamName:"Section 3 B", assignedAt:"2026-09-05T17:45:00+02:00", active:true },
  { assignmentId:"ASN-108022-NS0509", shiftInstanceId:APP_CONFIG.shiftInstanceId, employeeId:"emp_108022", operationId:APP_CONFIG.operationId, areaId:"AREA-PANEL-B", processStageId:"STAGE-DRILLING", workContextId:"WC-PANEL-B", teamId:"TEAM-SEC3-B", teamName:"Section 3 B", assignedAt:"2026-09-05T17:55:00+02:00", active:true },
  // Planned receiving-shift assignments exist only so the POC can demonstrate real cross-shift routing.
  { assignmentId:"ASN-104782-DS0609", shiftInstanceId:"SHIFT-DS-20260906", employeeId:"emp_104782", operationId:APP_CONFIG.operationId, areaId:"AREA-CONVEYOR", processStageId:"STAGE-HAULAGE", workContextId:"WC-SEC3-HAUL", teamId:"TEAM-ENG-A", teamName:"Engineering A", assignedAt:"2026-09-06T05:45:00+02:00", active:true },
  { assignmentId:"ASN-105310-DS0609", shiftInstanceId:"SHIFT-DS-20260906", employeeId:"emp_105310", operationId:APP_CONFIG.operationId, areaId:"AREA-SEC3", processStageId:"STAGE-HAULAGE", workContextId:"WC-SEC3-HAUL", teamId:"TEAM-ENG-A", teamName:"Engineering A", assignedAt:"2026-09-06T05:45:00+02:00", active:true },
  { assignmentId:"ASN-106004-DS0609", shiftInstanceId:"SHIFT-DS-20260906", employeeId:"emp_106004", operationId:APP_CONFIG.operationId, areaId:"AREA-PANEL-B", processStageId:"STAGE-REENTRY", workContextId:"WC-PANEL-B-ROUND-01", teamId:"TEAM-SEC3-A", teamName:"Section 3 A", assignedAt:"2026-09-06T05:45:00+02:00", active:true },
  { assignmentId:"ASN-107199-DS0609", shiftInstanceId:"SHIFT-DS-20260906", employeeId:"emp_107199", operationId:APP_CONFIG.operationId, areaId:"AREA-SEC3", processStageId:"STAGE-REENTRY", workContextId:"WC-PANEL-B-ROUND-01", teamId:"TEAM-SEC3-A", teamName:"Section 3 A", assignedAt:"2026-09-06T05:45:00+02:00", active:true },
  { assignmentId:"ASN-108022-DS0609", shiftInstanceId:"SHIFT-DS-20260906", employeeId:"emp_108022", operationId:APP_CONFIG.operationId, areaId:"AREA-PANEL-B", processStageId:"STAGE-DRILLING", workContextId:"WC-PANEL-B", teamId:"TEAM-SEC3-A", teamName:"Section 3 A", assignedAt:"2026-09-06T05:45:00+02:00", active:true }
]);

export const DEFAULT_HANDOVER_DELIVERIES = Object.freeze([
  {
    deliveryId:"HND-IN-SEC3-001", sourceSubmissionId:"SUB-PREV-SEC3-001", sourceEmployeeId:"emp_107199", sourceShiftInstanceId:"SHIFT-DS-20260905",
    targetShiftInstanceId:APP_CONFIG.shiftInstanceId, targetTeamId:"TEAM-SEC3-B", targetAreaId:"AREA-PANEL-B", targetEmployeeId:null,
    title:"Panel B access restriction carried forward", summary:"Loose-rock re-inspection is required before the restriction may be cleared.", carriedObservationIds:[],
    severityId:"HIGH", processStageId:"STAGE-REENTRY", workContextId:"WC-PANEL-B-ROUND-01", areaId:"AREA-PANEL-B",
    deliveredAt:"2026-09-05T17:52:00+02:00", viewedAt:null, acknowledgedAt:null, acknowledgedByEmployeeId:null, status:"DELIVERED"
  }
]);

export const DEFAULT_OPERATIONAL_STATUS = Object.freeze({
  production:{ level:"ATTENTION", reason:"Crusher 2 downtime affecting planned tonnes.", updatedAt:"2026-09-07T13:40:00+02:00", updatedBy:"System Administrator" },
  safety:{ level:"GOOD", reason:"No current mine-wide critical safety condition.", updatedAt:"2026-09-07T13:42:00+02:00", updatedBy:"System Administrator" }
});

export const DEFAULT_OPERATIONAL_STATUS_HISTORY = Object.freeze([
  { statusEventId:"STS-PROD-001", statusType:"production", level:"ATTENTION", reason:"Crusher 2 downtime affecting planned tonnes.", at:"2026-09-07T13:40:00+02:00", actor:"System Administrator" },
  { statusEventId:"STS-SAFE-001", statusType:"safety", level:"GOOD", reason:"No current mine-wide critical safety condition.", at:"2026-09-07T13:42:00+02:00", actor:"System Administrator" }
]);

export function defaultOperationalState() {
  return {
    activeShiftInstanceId:APP_CONFIG.shiftInstanceId,
    shiftInstances:clone(DEFAULT_SHIFT_INSTANCES),
    shiftAssignments:clone(DEFAULT_SHIFT_ASSIGNMENTS),
    processStages:clone(DEFAULT_PROCESS_STAGES),
    workContexts:clone(DEFAULT_WORK_CONTEXTS),
    handoverDeliveries:clone(DEFAULT_HANDOVER_DELIVERIES),
    operationalStatus:clone(DEFAULT_OPERATIONAL_STATUS),
    operationalStatusHistory:clone(DEFAULT_OPERATIONAL_STATUS_HISTORY),
    // v2.7 prototypes may still contain these legacy collections after migration.
    // They are intentionally not part of the v2.8 POC interface or analytical contract.
    readinessWorkflows:[],
    materialUnits:[],
    materialMovements:[]
  };
}

export function shiftById(state, id) { return (state.shiftInstances || []).find(item => item.shiftInstanceId === id) || null; }

export function currentShift(state) {
  const shifts=state.shiftInstances||[];
  const explicit=shiftById(state,state.activeShiftInstanceId);
  if(explicit) return explicit;
  const active=shifts.find(item=>item.status==="ACTIVE");
  if(active) return active;
  return [...shifts].sort((a,b)=>new Date(b.startsAtUtc||b.startsAtLocal||0)-new Date(a.startsAtUtc||a.startsAtLocal||0))[0] || DEFAULT_SHIFT_INSTANCES[0];
}

export function nextShiftAfter(state, sourceShiftInstanceId) {
  const source=shiftById(state,sourceShiftInstanceId);
  if(!source) return null;
  const end=Date.parse(source.endsAtUtc||source.endsAtLocal||"");
  return [...(state.shiftInstances||[])]
    .filter(item=>item.shiftInstanceId!==sourceShiftInstanceId && Date.parse(item.startsAtUtc||item.startsAtLocal||"")>=end)
    .sort((a,b)=>Date.parse(a.startsAtUtc||a.startsAtLocal||"")-Date.parse(b.startsAtUtc||b.startsAtLocal||""))[0] || null;
}

export function activateShift(state, shiftInstanceId, actor="System Administrator") {
  const target=shiftById(state,shiftInstanceId);
  if(!target) return {ok:false,message:"Shift instance not found."};
  const previous=currentShift(state);
  for(const item of state.shiftInstances||[]) if(item.status==="ACTIVE" && item.shiftInstanceId!==shiftInstanceId) item.status="CLOSED";
  target.status="ACTIVE";
  state.activeShiftInstanceId=target.shiftInstanceId;
  const at=new Date().toISOString();
  state.auditTrail=Array.isArray(state.auditTrail)?state.auditTrail:[];
  state.auditTrail.push({type:"ACTIVE_SHIFT_CHANGED",fromShiftInstanceId:previous?.shiftInstanceId||null,toShiftInstanceId:target.shiftInstanceId,actor,at});
  return {ok:true,shift:target};
}

export function assignmentFor(state, employeeId, shiftInstanceId = null) {
  const targetShiftId=shiftInstanceId || currentShift(state)?.shiftInstanceId;
  return (state.shiftAssignments || []).find(item => item.employeeId === employeeId && item.shiftInstanceId === targetShiftId && item.active !== false) || null;
}
export function processStageById(state, id) { return (state.processStages || []).find(item => item.id === id) || null; }
export function workContextById(state, id) { return (state.workContexts || []).find(item => item.id === id) || null; }
export function workContextsForArea(state, areaId) { return (state.workContexts || []).filter(item => item.active !== false && (!areaId || item.areaId === areaId)); }
export function processStageName(state, id) { return processStageById(state,id)?.name || id || "Unassigned stage"; }
export function workContextName(state, id) { return workContextById(state,id)?.name || id || "Unassigned context"; }
export function teamMembers(state, teamId, shiftInstanceId = null) {
  const targetShiftId=shiftInstanceId || currentShift(state)?.shiftInstanceId;
  const ids = new Set((state.shiftAssignments || []).filter(item => item.shiftInstanceId===targetShiftId && item.teamId===teamId && item.active!==false).map(item=>item.employeeId));
  return (state.employees || []).filter(item => ids.has(item.id));
}

export function receivingTeamFor(state,{sourceEmployeeId,sourceAssignment,targetShiftInstanceId}){
  const targetAssignments=(state.shiftAssignments||[]).filter(a=>a.shiftInstanceId===targetShiftInstanceId&&a.active!==false);
  if(!targetAssignments.length) return {teamId:sourceAssignment?.teamId||null,teamName:sourceAssignment?.teamName||null,areaId:sourceAssignment?.areaId||null};
  const sourceEmployee=(state.employees||[]).find(e=>e.id===sourceEmployeeId);
  const sameDepartment=targetAssignments.find(a=>{
    const employee=(state.employees||[]).find(e=>e.id===a.employeeId);
    return employee?.departmentId && employee.departmentId===sourceEmployee?.departmentId && a.areaId===sourceAssignment?.areaId;
  }) || targetAssignments.find(a=>{
    const employee=(state.employees||[]).find(e=>e.id===a.employeeId);
    return employee?.departmentId && employee.departmentId===sourceEmployee?.departmentId;
  });
  const sameArea=targetAssignments.find(a=>a.areaId===sourceAssignment?.areaId);
  const resolved=sameDepartment||sameArea||targetAssignments.find(a=>a.teamId===sourceAssignment?.teamId)||null;
  return {teamId:resolved?.teamId||sourceAssignment?.teamId||null,teamName:resolved?.teamName||sourceAssignment?.teamName||null,areaId:resolved?.areaId||sourceAssignment?.areaId||null};
}

export function incomingHandoversFor(state, employeeId) {
  const shift=currentShift(state);
  const assignment = assignmentFor(state, employeeId,shift?.shiftInstanceId);
  return (state.handoverDeliveries || []).filter(item => {
    if (item.targetShiftInstanceId && item.targetShiftInstanceId !== shift?.shiftInstanceId) return false;
    if (item.targetEmployeeId) return item.targetEmployeeId === employeeId;
    if(item.sourceEmployeeId===employeeId) return false;
    if(assignment?.teamId && item.targetTeamId===assignment.teamId) return true;
    return Boolean(assignment?.areaId && item.targetAreaId && item.targetAreaId===assignment.areaId);
  }).sort((a,b)=>new Date(b.deliveredAt)-new Date(a.deliveredAt));
}

export function normalizeOperationalState(state) {
  const defaults = defaultOperationalState();
  for (const [key, value] of Object.entries(defaults)) {
    if (Array.isArray(value)) state[key] = Array.isArray(state[key]) ? state[key] : clone(value);
    else if(typeof value==="string") state[key]=state[key]||value;
    else state[key] = state[key] && typeof state[key] === "object" ? state[key] : clone(value);
  }
  if(!shiftById(state,state.activeShiftInstanceId)) state.activeShiftInstanceId=(state.shiftInstances||[]).find(s=>s.status==="ACTIVE")?.shiftInstanceId||APP_CONFIG.shiftInstanceId;
  return state;
}
