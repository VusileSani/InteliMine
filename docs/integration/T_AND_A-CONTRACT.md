# InteliMine Time & Attendance Decision Contract — V1.1

## Boundary
The external Time & Attendance platform owns clocking. InteliMine owns the employee's reporting-completion decision.

The T&A system asks whether a specific employee may clock off for a specific shift. It does not need to understand reporting forms, equipment, hazards, or operational observations.

## Conceptual request
```json
{
  "employeeNumber": "105310",
  "shiftId": "NS-20260905"
}
```

## Conceptual response
```json
{
  "employeeNumber": "105310",
  "shiftId": "NS-20260905",
  "reportingRequired": true,
  "reportingStatus": "COMPLETE",
  "completedAt": "2026-09-05T18:47:00+02:00",
  "override": null,
  "clockOffAllowed": true,
  "reason": "Required shift report is complete."
}
```

## Allowed reporting states
- `COMPLETE` — required reporting obligation was submitted and validated.
- `OUTSTANDING` — required reporting obligation has not been completed.
- `EXCUSED` — a supervisor-authorised exception permits clock-off while preserving the unresolved reporting history.

## Safety rule
A network, kiosk, or integration failure must not create an uncontrolled payroll or physical-exit failure. A supervisor override path must remain available and auditable.

## Production requirements
The real endpoint must be authenticated, authorised, auditable, idempotent for status reads, and versioned. The exact transport (REST API, middleware, SAP integration service, message bus, or other approved enterprise mechanism) is an adapter decision and must not change InteliMine's core reporting model.
