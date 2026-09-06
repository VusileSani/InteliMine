# InteliMine Employee Master Contract

## Purpose
InteliMine consumes one canonical employee model. SAP, another HR platform, CSV, middleware, or an API may use different field names; the Integration Hub translates source data into this contract.

## Core rule
HR owns official employee master data. InteliMine owns the mapping from that master data to reporting obligations and analytical dimensions.

Official `jobTitle` is preserved separately from `reportingRole`. Organisational labels are resolved through stable canonical IDs so analytics do not fragment when names change.

## Required canonical fields
| Field | Requirement | Purpose |
| --- | --- | --- |
| employeeNumber | Required | Stable enterprise employee identifier. |
| firstName | Required | First name. |
| lastName | Required | Surname. |
| jobTitle | Required | Official source-system job title. |
| reportingRole | Required / mapped | InteliMine role code used to select reporting obligations. |
| departmentId | Required | Canonical department dimension key. |
| areaId | Required | Canonical operational area / section dimension key. |
| operationId | Required | Canonical mine / operating-site dimension key. |
| supervisorEmployeeNo | Recommended | Direct supervisor where available. |
| employmentStatus | Required | `ACTIVE` or `INACTIVE`. |
| shiftGroup | Recommended | Roster / shift group. |
| workLocation | Optional | Source-system work-location description. |
| badgeId | Optional | Badge/card identifier. |
| mobileNumber | Optional | Mobile contact. |
| email | Optional | Enterprise email. |
| sourceSystem | Required | Data source, for example `SAP`. |
| sourceRecordId | Recommended | Source-system record identifier. |
| effectiveFrom | Required | Effective start date. |
| effectiveTo | Optional | Effective end date. |
| lastUpdatedAt | Required | Last master-data update timestamp. |

## Reconciliation rules
1. `employeeNumber` is the primary business identity for integration matching unless a customer contract defines another stable key.
2. Re-importing an existing employee updates current master data; it does not create a new historical person.
3. Inactive employees stop receiving future obligations. Historical reports, observations, lifecycle events, overrides and audit records remain intact.
4. Unmapped source job titles are never silently guessed.
5. Canonical `operationId`, `departmentId` and `areaId` values must resolve before an employee record is operationally ready.

See `data/employee-master-template.csv` and `data/role-mapping-template.csv`.
