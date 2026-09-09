# MineMind Shift Instance & Assignment Contract — v2.7

A shift definition (for example Night Shift) is not the same as a particular worked shift. MineMind stores specific shift instances in governed state.

## Shift instance
Required fields:
- `shiftInstanceId`
- `shiftId`
- `shiftName`
- `businessDate`
- `operationId`
- `timezone` / UTC offset
- `startsAtLocal` / `endsAtLocal`
- `startsAtUtc` / `endsAtUtc`
- `status`

Historical facts must carry their own `shiftInstanceId`; they must not inherit the currently active shift when read later.

## Actual shift assignment
Employee master data describes who the person normally is. A shift assignment describes what the person was actually assigned to for a specific shift:
- `assignmentId`
- `shiftInstanceId`
- `employeeId`
- `operationId`
- `areaId`
- `processStageId`
- `workContextId`
- `teamId` / team name
- `assignedAt`
- active state

This separation is required for accurate handover routing, message scope, analytics and historical accountability.
