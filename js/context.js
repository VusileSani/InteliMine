import { APP_CONFIG } from "./config.js";
import { operationById, departmentById, areaById } from "./masterData.js";
import { employeeDisplayName } from "./employeeMaster.js";

export function versionEnvelope() {
  return {
    dataContractVersion: APP_CONFIG.dataContractVersion,
    reportSchemaVersion: APP_CONFIG.reportSchemaVersion,
    eventTaxonomyVersion: APP_CONFIG.eventTaxonomyVersion,
    masterDataVersion: APP_CONFIG.masterDataVersion
  };
}

export function snapshotEmployeeContext(employee) {
  return {
    employeeId: employee.id,
    employeeNumber: employee.employeeNumber,
    employeeName: employeeDisplayName(employee),
    jobTitle: employee.jobTitle,
    reportingRoleId: employee.reportingRole,
    departmentId: employee.departmentId,
    departmentName: departmentById(employee.departmentId)?.name || employee.departmentId,
    areaId: employee.areaId,
    areaName: areaById(employee.areaId)?.name || employee.areaId,
    operationId: employee.operationId,
    operationName: operationById(employee.operationId)?.name || employee.operationId,
    supervisorEmployeeNo: employee.supervisorEmployeeNo || null,
    shiftGroup: employee.shiftGroup || null,
    workLocation: employee.workLocation || null,
    employeeMasterEffectiveFrom: employee.effectiveFrom || null,
    employeeMasterLastUpdatedAt: employee.lastUpdatedAt || null,
    capturedAt: new Date().toISOString()
  };
}

export function captureProvenance({ channel = APP_CONFIG.defaultCaptureChannel, capturePointId = APP_CONFIG.defaultCapturePointId } = {}) {
  return {
    captureChannel: channel,
    capturePointId: capturePointId || null,
    sourceSystem: "INTELIMINE",
    sourceRecordId: null,
    importBatchId: null,
    clientCapturedAt: new Date().toISOString(),
    serverReceivedAt: null
  };
}
