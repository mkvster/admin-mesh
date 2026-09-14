---
id: TASK-10
title: Add basic entity create and edit forms
status: Done
assignee: []
created_date: '2026-09-04 13:54'
updated_date: '2026-09-10 23:53'
labels: []
milestone: s-003
dependencies:
  - TASK-9
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the first phase of editable entity forms for `rest-entity` nodes.

This task extends the existing read-only entity details infrastructure. It must not replace the read-only view. The same form metadata and layout should continue to support a dedicated view mode, while edit mode renders editable controls only for the field types covered by this phase.

### Supported editable field types

Phase 1 should support editing:

* `string`
* `integer`
* `decimal`
* `boolean`

Use appropriate Angular Material controls:

* string → text input
* integer / decimal → numeric input
* boolean → checkbox or switch, following existing UI conventions

### Unsupported field types

Fields not covered by Phase 1 must still be displayed in edit mode.

For now they should either:

* use the existing read-only field renderer; or
* display a clear placeholder indicating that editing for that field type is not yet supported.

Prefer the read-only representation when possible so the entity remains understandable while editing.

This includes, for example:

* `date`
* `datetime`
* `enum`
* `reference`

Future editing phases will replace these read-only/placeholder renderers with editable controls.

### Reuse existing layout

Reuse the same form metadata and layout implementation used by the read-only entity details view.

Do not create a separate edit-specific layout system.

The architecture should support:

`view | edit | create`

with shared field placement and type-specific rendering.

### Edit mode

Provide an explicit way to switch from entity view mode into edit mode.

Edit mode should:

* load the same entity data and form metadata;
* render editable controls for supported field types;
* keep unsupported types visible but non-editable;
* respect `readOnlyOnUpdate`;
* preserve the metadata-defined field layout.

### Form state

Create Angular form state for editable fields.

Support:

* initial values from the loaded entity;
* dirty/pristine state;
* basic type-safe value conversion for integer, decimal, and boolean fields.

### Save and Cancel

Edit mode should provide:

* `Save`
* `Cancel`

`Cancel` returns to the read-only view without saving changes.

`Save` sends the current entity representation using:

`PATCH /entities/{resource}/{id}?projection={projection}`

Use the projection defined by the form metadata when present.

### Payload behavior

The update payload should follow the existing AdminMesh protocol decision:

* submit the current form projection;
* include read-only values when present;
* do not assume that only changed fields are accepted;
* let the backend remain authoritative about writable fields.

### After successful save

After a successful update:

* return to the read-only entity view;
* show the updated values;
* refresh affected list data when necessary;
* do not unnecessarily reload cached entity metadata or form metadata.

### Validation

For Phase 1, support validation already described by field metadata where applicable to supported field types.

At minimum:

* `required`
* string pattern validation where defined

Invalid forms must not be submitted.

### Mock API

Extend the mock API to support:

`PATCH /entities/{resource}/{id}`

The mock should update the in-memory entity data so subsequent reads and list queries reflect the saved changes.

### Architecture

Keep type-specific edit controls isolated from the general form layout.

Prefer reusable components such as:

* form/details layout
* read-only field renderer
* string editor
* numeric editor
* boolean editor

Future phases should be able to add new field editors without changing the overall form layout or edit workflow.

### Out of scope

* date editing
* datetime editing
* enum editing
* reference editing
* create mode
* relation editing
* optimistic updates
* autosave
* print/PDF behavior
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Supported field types render appropriate editable controls; other field types remain visible and read-only.
- [x] #2 Edit mode is hosted by NodeHost at the entity URL and replaces the List Grid area rather than opening over it in a modal.
- [x] #3 Create mode temporarily replaces the List Grid area with the form and supports reference selection without nesting the main form in a modal.
- [x] #4 Shared metadata and layout support view, edit, and create modes.
- [x] #5 Save, Cancel, validation, payload projection, mock persistence, and post-save refresh behave as specified.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extend entity metadata and API with shared form metadata, PATCH persistence, and create support. 2. Add a reusable entity form/layout with supported editors, read-only fallback fields, validation, projection payloads, and save/cancel flows. 3. Integrate view, edit, and create states into NodeHost and EntityList so forms replace the list area and refresh after writes. 4. Add focused tests and run formatting, unit tests, and production build.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented and verified with prettier format check, npm run build, and npm test -- --watch=false (29 files, 69 tests passed). Added inline edit/create flow, shared metadata layout, supported field controls, reference select loading, PATCH/POST mock persistence, validation, cache invalidation, and list refresh.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented TASK-10: added metadata-driven entity form support for view/edit/create flows, string/integer/decimal/boolean editors, create-mode reference selection, validation, projection-aware PATCH/POST requests, mock persistence, inline NodeHost list replacement, cancel/save flows, list refresh, and preview cache invalidation. Verified with format check, production build, and 69 passing Vitest tests.
<!-- SECTION:FINAL_SUMMARY:END -->
