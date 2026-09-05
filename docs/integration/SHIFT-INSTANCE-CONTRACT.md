# Shift Instance Contract

A shift definition (for example Night Shift) is not the same as a particular worked shift.

A shift instance contains:
- shiftInstanceId
- shiftId / shift definition
- businessDate
- operationId
- timezone
- startsAtLocal / endsAtLocal
- startsAtUtc / endsAtUtc

Observation clock times must resolve within the shift instance, including after-midnight times on overnight shifts.
