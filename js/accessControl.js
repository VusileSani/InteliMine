export const AUTHORITY_TIERS = Object.freeze({
  OPERATIONS: 10,
  ELEVATED_OPERATIONS: 20,
  MANAGEMENT: 30,
  SYSTEM_ADMIN: 80,
  PLATFORM_GOVERNANCE: 100
});

export const DEFAULT_ROLE_PRESETS = Object.freeze([
  {
    id: "ops_access",
    tier: "OPERATIONS",
    label: "Operations Access",
    description: "Capture assigned operational information and view relevant handovers and actions.",
    defaultScope: "OWN_AREA",
    assignableBy: ["SYSTEM_ADMIN", "PLATFORM_GOVERNANCE"],
    permissions: ["capture_shift", "capture_safety", "capture_equipment", "view_handover", "update_own_actions"],
    active: true,
    protected: false
  },
  {
    id: "elevated_ops",
    tier: "ELEVATED_OPERATIONS",
    label: "Elevated Operations Access",
    description: "Coordinate operational information, review handovers and assign actions within scope.",
    defaultScope: "OWN_AREA",
    assignableBy: ["SYSTEM_ADMIN", "PLATFORM_GOVERNANCE"],
    permissions: ["capture_shift", "capture_safety", "capture_equipment", "view_handover", "review_handover", "assign_actions", "view_area_reports"],
    active: true,
    protected: false
  },
  {
    id: "management_access",
    tier: "MANAGEMENT",
    label: "Management Access",
    description: "View broader operational dashboards, reports, trends and cross-area actions within scope.",
    defaultScope: "OPERATION",
    assignableBy: ["SYSTEM_ADMIN", "PLATFORM_GOVERNANCE"],
    permissions: ["view_handover", "review_handover", "assign_actions", "close_actions", "view_area_reports", "view_operation_reports", "export_reports"],
    active: true,
    protected: false
  },
  {
    id: "system_admin",
    tier: "SYSTEM_ADMIN",
    label: "System Administrator",
    description: "Administer people, operational role assignments, master data and routine MineMind configuration.",
    defaultScope: "OPERATION",
    assignableBy: ["PLATFORM_GOVERNANCE"],
    permissions: ["manage_employees", "assign_operational_roles", "manage_master_data", "manage_forms", "manage_operational_status", "view_admin_audit"],
    active: true,
    protected: true
  },
  {
    id: "platform_governance",
    tier: "PLATFORM_GOVERNANCE",
    label: "Platform Governance",
    description: "Control MineMind administrative authority, protected access labels and privileged audit history.",
    defaultScope: "PLATFORM",
    assignableBy: ["PLATFORM_GOVERNANCE"],
    permissions: ["grant_admin", "revoke_admin", "grant_governance", "revoke_governance", "configure_role_presets", "view_privileged_audit", "manage_high_risk_settings"],
    active: true,
    protected: true
  }
]);

export const ACCESS_SCOPES = Object.freeze({
  OWN_AREA: "Own area",
  DEPARTMENT: "Department",
  OPERATION: "Entire operation",
  PLATFORM: "Platform"
});

export function normalizeAccessModel(state) {
  if (!Array.isArray(state.rolePresets) || !state.rolePresets.length) {
    state.rolePresets = JSON.parse(JSON.stringify(DEFAULT_ROLE_PRESETS));
  }
  (state.employees || []).forEach(employee => {
    if (!employee.applicationRoleId) {
      employee.applicationRoleId = employee.reportingRole === "SUPERVISOR" ? "elevated_ops" : "ops_access";
    }
    if (!employee.accessScope) employee.accessScope = "OWN_AREA";
  });
  if (!Array.isArray(state.platformAuthorities)) {
    state.platformAuthorities = [
      {
        id: "auth_platform_owner",
        employeeId: "platform_owner",
        displayName: "MineMind Platform Owner",
        rolePresetId: "platform_governance",
        status: "ACTIVE",
        grantedBy: "SYSTEM_BOOTSTRAP",
        grantedAt: new Date().toISOString(),
        reason: "Bootstrap authority"
      }
    ];
  }
  return state;
}

export function rolePresetById(state, id) {
  return (state.rolePresets || []).find(role => role.id === id) || null;
}

export function roleLabel(state, id) {
  return rolePresetById(state, id)?.label || id || "Not assigned";
}

export function employeeAccessSummary(state, employee) {
  const role = rolePresetById(state, employee?.applicationRoleId);
  if (!role) return "No MineMind application role assigned.";
  const scope = ACCESS_SCOPES[employee?.accessScope || role.defaultScope] || employee?.accessScope || role.defaultScope;
  return `${role.description} Scope: ${scope}.`;
}

export function operationalRolePresets(state) {
  return (state.rolePresets || []).filter(role => role.active !== false && !role.protected);
}

export function privilegedRolePresets(state) {
  return (state.rolePresets || []).filter(role => role.protected);
}

export function canAssignRole(actorTier, role) {
  return Boolean(role && (role.assignableBy || []).includes(actorTier));
}

export function activeGovernors(state) {
  return (state.platformAuthorities || []).filter(a => a.status === "ACTIVE" && a.rolePresetId === "platform_governance");
}

export function effectivePermissions(state, employee) {
  const role = rolePresetById(state, employee?.applicationRoleId);
  const base = new Set(role?.permissions || []);
  (employee?.additionalPermissions || []).forEach(permission => base.add(permission));
  (employee?.revokedPermissions || []).forEach(permission => base.delete(permission));
  return [...base];
}
