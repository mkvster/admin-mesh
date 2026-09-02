---
id: TASK-1
title: ListGrid - Display reference fields using human-readable values
status: Done
assignee:
  - '@codex'
created_date: '2026-09-02 12:42'
updated_date: '2026-09-02 16:36'
labels: []
milestone: s-001
dependencies: []
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Display human-readable reference values from the current list projection. Keep field.reference as shared entity semantics (resource, lookup list, and target displayField); use column.display.valueField for the list-specific returned projection field, such as categoryName, customerEmail, or invoiceNumber. Mock list handlers must derive these values from normalized related-entity data (including Invoice -> Customer and Payment -> Invoice) while returning both the raw ID and display value, with no client-side N+1 lookups. ListGridCell renders the display value with a dedicated future-link CSS class and optional external-link icon; navigation is out of scope. Null, undefined, or empty display values fall back to the raw ID, and an unavailable ID preserves the existing empty-cell behavior.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Reference metadata remains on the field, while list column metadata uses display.valueField to select the display value returned by the list query.
- [ ] #2 Mock list handlers return raw reference IDs and display values derived from normalized related-entity data without client-side N+1 lookups.
- [ ] #3 ListGridCell renders the projection display value with a dedicated future-link CSS class and optional external-link icon, without navigation.
- [ ] #4 Null, undefined, or empty display values fall back to the raw reference ID; if both are unavailable, the cell remains empty.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extend metadata types and ListGridCell rendering for reference display.valueField, fallback, and future-link styling. 2. Update normalized mock entities and list handlers to project related display values. 3. Add focused tests and run project checks.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented reference list rendering, projection fields for invoice/customer and payment/invoice mock queries, and focused ListGridCell tests. Production build passes. Full test runner remains blocked by pre-existing jasmine namespace errors in src/app/navigation/navigation.spec.ts.

Additional verification: npm.cmd run build passes. npm.cmd test -- --watch=false --include=src/app/entity/list-grid-cell.spec.ts still fails before executing tests because navigation.spec.ts references missing jasmine globals; direct Vitest execution is not configured with Angular TestBed initialization/resource resolution. Task remains In Progress pending review of the existing test setup.

Updated Products demo data to use normalized categoryId foreign keys instead of category text. Product list metadata now declares a categories reference and categoryName projection; the mock query joins normalized categories without client-side lookups. Build passes after the change.

Changed Invoice list projection from customerEmail to customerDisplayName, formatted as First Name Last Name (Email), while preserving customerId as the raw reference value. Build passes.
<!-- SECTION:NOTES:END -->
