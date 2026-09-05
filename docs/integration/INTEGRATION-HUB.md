# Integration Hub

The Integration Hub isolates external source systems from InteliMine's canonical model.

Preferred ingestion lifecycle:

RECEIVED → VALIDATED → APPLIED
                ↘ REJECTED / QUARANTINED

No source-system record should silently change canonical operational data before validation and mapping succeed.

The hub is vendor neutral. HR/ERP, T&A, roster, asset and middleware sources can use different adapters while InteliMine continues to consume the same canonical contracts.
