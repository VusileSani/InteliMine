# MineMind Integration Hub

The integration boundary isolates external source systems from MineMind's canonical operational model.

Preferred ingestion lifecycle:

`RECEIVED → VALIDATED → APPLIED`

with validation failures routed to `REJECTED` or `QUARANTINED` rather than silently changing canonical operational data.

The boundary is vendor-neutral. HR/ERP, time-and-attendance, roster, asset, mine-planning, plant and middleware systems may use different adapters while MineMind consumes stable canonical contracts for employees, shifts, assignments, areas, assets and operational facts.

Production integrations should be idempotent, preserve source record/batch provenance, validate mappings before applying writes, and avoid using display labels as stable keys.
