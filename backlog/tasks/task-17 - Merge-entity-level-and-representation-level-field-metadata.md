---
id: TASK-17
title: Merge entity-level and representation-level field metadata
status: Done
assignee: []
created_date: '2026-09-08 15:34'
updated_date: '2026-09-08 20:30'
labels:
  - refactor
milestone: s-002
dependencies: []
references:
  - >-
    backlog/tasks/task-10 -
    Add-basic-entity-editing-for-string-numeric-and-bo.md
  - >-
    backlog/tasks/task-11 -
    Add-date-datetime-and-enum-editing-to-entity-forms.md
  - backlog/tasks/task-12 - Add-reference-field-editing-with-lookup-selection.md
documentation:
  - docs/AdminApiProtocol.md
priority: high
type: chore
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Requirements

### Field metadata

- Add optional `EntityMetadata.fields: FieldMetadata[]`.
- Resolve entity-level and representation-level fields through one shared class-based service.
- The service must only merge the two field arrays; metadata loading remains in existing stores/components.
- A representation-level field replaces an entity-level field with the same `name` entirely, without property-level merging.
- An overriding field keeps the entity-level position unless it defines `order?: number`.
- A new representation-level field is appended unless it defines `order?: number`.
- Use the resolved fields for list rendering and form/preview rendering.
- Load entity metadata for form/preview rendering through `EntityMetadataStore`.

### Display defaults

- Add optional `FieldMetadata.display: FieldDisplay`.
- Use `ListColumn.display` or `FormLayoutItem.display` when it is not `undefined`.
- Otherwise use the resolved field's `display`.
- Keep columns and form layout items representation-specific.

### Mock metadata

- Move shared field definitions and display defaults for payments and customers to entity metadata.
- Keep representation-specific fields and display overrides local to their representations.

### Verification

- Update or add unit tests.
- Ensure existing list and preview rendering behavior remains unchanged.
- Ensure the production build succeeds.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 docs/AdminApiProtocol.md documents the optional entity-level 'fields' array and its merge rule (the representation's field replaces the entity-level field in its entirety on a name collision, with the merged ordering rules), and the optional field-level 'display' default on FieldMetadata with its override rule (column/layout-item 'display' wins when it is not undefined, else the resolved field's 'display' is used)
- [x] #2 EntityMetadata gains an optional 'fields: FieldMetadata[]' property, and FieldMetadata gains optional 'display: FieldDisplay' and 'order?: number' properties
- [x] #3 A shared class-based service performs the entity+representation field merge and is used identically for list metadata and form/preview metadata, with no duplicated merge logic; entity-list.ts and EntityPreview (including when rendered inside entity-preview-dialog.ts, via list-grid and entity-preview rendering) resolve fields through the merged result and fall back to a field's 'display' when its column/layout item does not declare a local display (that is, when the local display is undefined)
- [x] #4 Mock metadata for the payments and customers resources is restructured to move field definitions and display config shared across their list and form(s) to entity-level metadata, removing the now-duplicated 'fields' entries and duplicated 'display' blocks from representation handlers, while representation-specific fields/displays stay local
- [x] #5 Existing unit tests are updated or extended and pass, the production build succeeds, and existing list and preview rendering behavior is unchanged for every entity
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add optional entity-level fields and FieldMetadata display/order types; implement a shared injectable field metadata resolver with replacement and ordering rules. 2. Resolve list fields in EntityList and form/preview fields in EntityPreview using EntityMetadataStore, preserving representation-specific columns/layout items. 3. Apply local display when defined, otherwise resolved field display, and restructure payments/customers mock metadata. 4. Add focused resolver and rendering tests, update protocol documentation, run formatting, unit tests, and production build.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Validation: FieldMetadataResolver tests cover replacement, stable positioning, and explicit ordering. npm test passed (27 files, 62 tests); format check and production build passed.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented entity-level and representation-level field metadata resolution with shared FieldMetadataResolver, replacement/order rules, entity metadata loading for lists and previews, and field display fallback. Restructured payments/customers mocks and added resolver/rendering tests. Verified with tests, format check, and production build.
<!-- SECTION:FINAL_SUMMARY:END -->
