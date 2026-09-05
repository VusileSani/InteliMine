# Reporting Obligation Contract

A reporting obligation is the analytical and operational denominator for compulsory reporting.

It is created because the employee was identified as present for a particular shift instance. It is not inferred from the current list of active employees.

Required fields:
- obligationId
- shiftInstanceId
- shiftId
- employeeId
- reportingRequired
- createdAt
- createdFrom
- sourceAttendanceId or roster source
- dueBy
- frozen employee context
- version envelope

Completion and override are separate records/states; they do not alter why the obligation existed.
