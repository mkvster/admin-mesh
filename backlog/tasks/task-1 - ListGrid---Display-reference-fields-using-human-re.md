---
id: TASK-1
title: ListGrid - Display reference fields using human-readable values
status: Done
assignee:
  - '@codex'
created_date: '2026-09-02 12:42'
updated_date: '2026-09-04 02:44'
labels: []
milestone: s-001
dependencies: []
priority: high
ordinal: 1500
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Display human-readable reference values from the current list projection. Keep field.reference as shared entity semantics (resource, lookup list, and target displayField); use column.display.valueField for the list-specific returned projection field, such as categoryName, customerEmail, or invoiceNumber. Mock list handlers must derive these values from normalized related-entity data (including Invoice -> Customer and Payment -> Invoice) while returning both the raw ID and display value, with no client-side N+1 lookups. ListGridCell renders the display value with a dedicated future-link CSS class and optional external-link icon; navigation is out of scope. Null, undefined, or empty display values fall back to the raw ID, and an unavailable ID preserves the existing empty-cell behavior.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Reference metadata remains on the field, while list column metadata uses display.valueField to select the display value returned by the list query.
- [x] #2 Mock list handlers return raw reference IDs and display values derived from normalized related-entity data without client-side N+1 lookups.
- [x] #3 ListGridCell renders the projection display value with a dedicated future-link CSS class and optional external-link icon, without navigation.
- [x] #4 Null, undefined, or empty display values fall back to the raw reference ID; if both are unavailable, the cell remains empty.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extend metadata types and ListGridCell rendering for reference display.valueField, fallback, and future-link styling. 2. Update normalized mock entities and list handlers to project related display values. 3. Add focused tests and run project checks.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Keep shared reference semantics in field.reference and list-specific projection names in column.display.valueField. Mock handlers join normalized related entities server-side; ListGridCell renders the projection with raw-ID fallback and no client-side N+1 lookups.
<!-- SECTION:NOTES:END -->
