# Capture Provenance Contract

Operational facts should identify how they entered InteliMine.

Core provenance fields:
- captureChannel: KIOSK, MOBILE, TABLET or future controlled channel
- capturePointId
- sourceSystem
- sourceRecordId where relevant
- importBatchId where relevant
- clientCapturedAt
- serverReceivedAt in production

Provenance supports data-quality analysis, auditability and troubleshooting without changing the business meaning of the fact.
