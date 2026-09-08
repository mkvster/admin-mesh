---
id: TASK-17
title: Merge entity-level and representation-level field metadata
status: To Do
assignee: []
created_date: '2026-09-08 15:34'
updated_date: '2026-09-08 15:58'
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
type: chore
ordinal: 6750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Entity, list, and form metadata each declare a 'fields' array today, and mock handlers for resources with multiple representations (e.g. payments' list + view form, customers' view + briefview forms) duplicate the same field definitions verbatim across endpoints. Introduce an optional shared 'fields' array on entity metadata and merge it at runtime with each representation's own 'fields', with the representation's definition winning on a name collision. Whether a given field belongs at the entity level or stays local to one list/form is left to whoever authors that resource's metadata; it is not a hard rule (e.g. a form-only computed field like a customer's combined 'name' can legitimately stay local even though it would technically merge fine at entity level). The merge must be implemented once and reused identically for list rendering and for form/preview rendering, since upcoming editable-form work (TASK-10, TASK-11, TASK-12) will also need resolved field metadata. Per project preference, implement the merge as a class-based service rather than a bare utility function.

Separately, list columns (ListColumn) and form layout items (FormLayoutItem) each carry their own optional 'display' (rendering/formatting) config, and for fields shown in both a list and a form (e.g. payments' 'status', 'method', 'invoiceId'), that 'display' config is often duplicated verbatim between the two. Add an optional 'display' property to FieldMetadata as a field-level default; when rendering a column or layout item, its own local 'display' wins if present, otherwise fall back to the resolved field's 'display'. This reuses the same field lookup that list-grid.ts and entity-preview.ts already build (pairing each column/layout item with its resolved FieldMetadata), so no new merge logic is needed for this part — only a fallback at the two rendering call sites.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 docs/AdminApiProtocol.md documents the optional entity-level 'fields' array and its merge rule (representation's field wins by name on collision), and the optional field-level 'display' default on FieldMetadata with its override rule (column/layout-item 'display' wins if present, else the resolved field's 'display' is used)
- [ ] #2 EntityMetadata gains an optional 'fields: FieldMetadata[]' property, and FieldMetadata gains an optional 'display: FieldDisplay' property
- [ ] #3 A shared class-based service performs the entity+representation field merge and is used identically for list metadata and form/preview metadata, with no duplicated merge logic; entity-list.ts, entity-preview.ts/entity-preview-dialog.ts (via list-grid and entity-preview rendering) resolve fields through the merged result and fall back to a field's 'display' when its column/layout item does not declare its own
- [ ] #4 Mock metadata for the payments and customers resources is restructured to move field definitions and display config shared across their list and form(s) to entity-level metadata, removing the now-duplicated 'fields' entries and duplicated 'display' blocks from representation handlers, while representation-specific fields/displays stay local
- [ ] #5 Existing unit tests are updated or extended and pass, the production build succeeds, and existing list and preview rendering behavior is unchanged for every entity
<!-- AC:END -->
