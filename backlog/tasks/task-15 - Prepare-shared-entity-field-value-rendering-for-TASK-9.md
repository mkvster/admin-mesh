---
id: TASK-15
title: Prepare shared entity field value rendering for TASK-9
status: Done
assignee: []
created_date: '2026-09-06 22:33'
updated_date: '2026-09-06 23:54'
labels:
  - refactor
milestone: s-002
dependencies: []
references:
  - backlog/tasks/task-9 - Add-read-only-entity-details-view-from-form-metada.md
documentation:
  - docs/AdminApiProtocol.md
priority: high
type: chore
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Prepare the shared metadata-driven field renderer for TASK-9 by refactoring the existing ListGridCell into reusable EntityFieldValue and using it directly from ListGrid. Preserve current list behavior, rename ListField to FieldMetadata and ListColumnDisplay to FieldDisplay, and keep ListColumn for table-specific sizing, sorting, and filtering. This task does not implement EntityPreview, preview dialogs, entity loading, form metadata loading, or editable forms.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The existing ListGrid uses EntityFieldValue directly; ListGridCell is no longer used.
- [x] #2 ListField is replaced by FieldMetadata throughout the affected application code and tests.
- [x] #3 ListColumnDisplay is replaced by FieldDisplay throughout the affected application code and tests.
- [x] #4 List rendering preserves the existing behavior for string, numeric, boolean, enum, reference, empty, and raw-value fallback cases.
- [x] #5 The shared value renderer accepts field metadata, a value, and field display configuration without depending on table-only column sizing, sorting, or filtering properties.
- [x] #6 The existing unit tests are updated or extended and pass with the refactored component.
- [x] #7 No preview dialog, entity loading, form metadata loading, or editable form behavior is introduced by this task.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Rename ListField to FieldMetadata and ListColumnDisplay to FieldDisplay while keeping ListColumn table-specific. 2. Extract ListGridCell into reusable EntityFieldValue with field, value, display, and row inputs, preserving all current rendering fallbacks. 3. Update ListGrid and affected filters/tests to use the renamed types and EntityFieldValue directly. 4. Run formatting, unit tests, and production build.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented EntityFieldValue as the shared metadata-driven renderer, updated ListGrid and filtering code to use FieldMetadata/FieldDisplay, removed ListGridCell, and added renderer/ListGrid coverage. Verified with formatting check, 47 Vitest tests, and production build.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Extracted the reusable EntityFieldValue renderer, updated ListGrid to use it directly, renamed ListField/ListColumnDisplay to FieldMetadata/FieldDisplay, and removed ListGridCell while preserving value rendering fallbacks. Verified by npm run verify: Prettier check, production build, and 47 Vitest tests passed.
<!-- SECTION:FINAL_SUMMARY:END -->
