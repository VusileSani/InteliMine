# InteliMine Employee Master Contract — V1.1

## Purpose
InteliMine consumes one canonical employee model. SAP, another HR platform, CSV, middleware, or an API may use different field names; the Integration Hub is responsible for translating source data into this contract.

## Core rule
HR owns the employee's official master data. InteliMine owns the mapping from that master data to reporting obligations.

An official `jobTitle` is therefore preserved separately from `reportingRole`.

## Fields
| Field | Requirement | Purpose |
| --- | --- | --- |
| employeeNumber | Required | Stable enterprise employee identifier. |
| firstName | Required | First name. |
| lastName | Required | Surname. |
| jobTitle | Required | Official source-system job title. |
| reportingRole | Required / mapped | InteliMine role code used to select the reporting schema. |
| department | Required | Department / function. |
| section | Required | Operational section or area. |
| operation | Required | Mine / operating site. |
| supervisorEmployeeNo | Recommended | Direct supervisor where available. |
| employmentStatus | Required | `ACTIVE` or `INACTIVE`. |
| shiftGroup | Recommended | Roster / shift group. |
| workLocation | Optional | Normal work location. |
| badgeId | Optional | Badge/card identifier. |
| mobileNumber | Optional | Mobile contact. |
| email | Optional | Enterprise email. |
| sourceSystem | Required | Data source, for example `SAP`. |
| sourceRecordId | Recommended | Source-system record identifier. |
| effectiveFrom | Required | Effective start date. |
| effectiveTo | Optional | Effective end date. |
| lastUpdatedAt | Required | Last master-data update timestamp. |

## Reconciliation rules
1. `employeeNumber` is the primary business identity for integration matching unless the customer contract specifies a different stable key.
2. Re-importing an existing employee updates current master data; it does not create a new person.
3. If a source employee becomes inactive, InteliMine sets `employmentStatus=INACTIVE` and stops creating future obligations. Historical reports, observations, overrides, and audit records remain intact.
4. Unmapped source job titles are not silently guessed. They enter an integration exception queue until a reporting-role mapping is approved.
5. Source data is retained as source truth where useful, especially `jobTitle`, while `reportingRole` represents InteliMine's business interpretation.

## Reporting roles in V1.1
- `FITTER`
- `ELECTRICIAN`
- `SAFETY_OFFICER`
- `SUPERVISOR`
- `OPERATOR`

See `data/employee-master-template.csv` and `data/role-mapping-template.csv` for machine-readable examples.
