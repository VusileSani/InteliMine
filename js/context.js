import { APP_CONFIG } from "./config.js";
import { operationById, departmentById, areaById } from "./masterData.js";
import { employeeDisplayName } from "./employeeMaster.js";
import { assignmentFor, currentShift, processStageById, workContextById } from "./operationalModel.js";

export function versionEnvelope() {
  return {
    dataContractVersion:APP_CONFIG.dataContractVersion,
    reportSchemaVersion:APP_CONFIG.reportSchemaVersion,
    eventTaxonomyVersion:APP_CONFIG.eventTaxonomyVersion,
    masterDataVersion:APP_CONFIG.masterDataVersion,
    processModelVersion:APP_CONFIG.processModelVersion
  };
}

export function snapshotEmployeeContext(employee, state = null, shiftInstanceId = null) {
  const resolvedShiftId=shiftInstanceId || (state ? currentShift(state)?.shiftInstanceId : null) || APP_CONFIG.shiftInstanceId;
  const assignment=state?assignmentFor(state,employee.id,resolvedShiftId):null;
  const assignedAreaId=assignment?.areaId||employee.areaId;
  return {
    employeeId:employee.id, employeeNumber:employee.employeeNumber, employeeName:employeeDisplayName(employee), jobTitle:employee.jobTitle,
    reportingRoleId:employee.reportingRole, departmentId:employee.departmentId, departmentName:departmentById(employee.departmentId)?.name||employee.departmentId,
    areaId:employee.areaId, areaName:areaById(employee.areaId)?.name||employee.areaId,
    operationId:employee.operationId, operationName:operationById(employee.operationId)?.name||employee.operationId,
    supervisorEmployeeNo:employee.supervisorEmployeeNo||null, shiftGroup:employee.shiftGroup||null, workLocation:employee.workLocation||null,
    employeeMasterEffectiveFrom:employee.effectiveFrom||null, employeeMasterLastUpdatedAt:employee.lastUpdatedAt||null,
    assignmentId:assignment?.assignmentId||null, assignedAreaId, assignedAreaName:areaById(assignedAreaId)?.name||assignedAreaId,
    processStageId:assignment?.processStageId||null, processStageName:state?processStageById(state,assignment?.processStageId)?.name||null:null,
    workContextId:assignment?.workContextId||null, workContextName:state?workContextById(state,assignment?.workContextId)?.name||null:null,
    teamId:assignment?.teamId||null, teamName:assignment?.teamName||null, capturedAt:new Date().toISOString()
  };
}

export function captureProvenance({ channel=APP_CONFIG.defaultCaptureChannel, capturePointId=APP_CONFIG.defaultCapturePointId }={}) {
  return { captureChannel:channel, capturePointId:capturePointId||null, sourceSystem:"MINEMIND", sourceRecordId:null, importBatchId:null, clientCapturedAt:new Date().toISOString(), serverReceivedAt:null };
}
