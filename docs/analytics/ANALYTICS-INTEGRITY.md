# Analytics Integrity

InteliMine follows four integrity rules:

1. **No denominator loss.** Normal conditions are retained as structured check facts.
2. **Observation is not workflow.** An observation is immutable; an issue owns changing status.
3. **History cannot be rewritten by current master data.** Facts retain the employee/role/org context valid at capture time.
4. **Meaning is versioned.** A future change to a report question or event taxonomy cannot silently change what an old record meant.

These rules are intended to keep the operational dataset useful for downstream analytics years after capture.
