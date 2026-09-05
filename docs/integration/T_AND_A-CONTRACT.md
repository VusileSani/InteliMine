# Time & Attendance Integration Contract

## Boundary
The T&A system owns attendance/clocking. InteliMine owns reporting obligations and reporting-completion status.

## Clock-in side
A confirmed clock-in or roster-presence record creates an explicit InteliMine reporting obligation:
- obligationId
- shiftInstanceId
- employeeId
- reportingRequired
- sourceAttendanceId
- createdAt
- dueBy

## Clock-off check
Input:
- employeeNumber
- shiftInstanceId (or a resolvable current shift)

Output:
- reportingObligationId
- reportingRequired
- reportingStatus
- completedAt
- override details when present
- clockOffAllowed
- decisionCode
- reason

## Fail-safe
If T&A shows an employee clocked in but InteliMine has no corresponding obligation, normal clock-off should not silently pass. The integration should return an explicit exception requiring authorised operational handling.
