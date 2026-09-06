---
id: TASK-15
title: Prepare shared entity field value rendering for TASK-9
type: chore
status: In Progress
assignee: []
created_date: '2026-09-06 22:33'
updated_date: '2026-09-06 23:47'
labels:
  - refactor
milestone: s-002
dependencies: []
references:
  - backlog/tasks/task-9 - Add-read-only-entity-details-view-from-form-metada.md
documentation:
  - docs/AdminApiProtocol.md
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Prepare the shared metadata-driven field renderer for TASK-9 by refactoring the existing ListGridCell into reusable EntityFieldValue and using it directly from ListGrid. Preserve current list behavior, rename ListField to FieldMetadata and ListColumnDisplay to FieldDisplay, and keep ListColumn for table-specific sizing, sorting, and filtering. This task does not implement EntityPreview, preview dialogs, entity loading, form metadata loading, or editable forms.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The existing ListGrid uses EntityFieldValue directly; ListGridCell is no longer used.
- [ ] #2 ListField is replaced by FieldMetadata throughout the affected application code and tests.
- [ ] #3 ListColumnDisplay is replaced by FieldDisplay throughout the affected application code and tests.
- [ ] #4 List rendering preserves the existing behavior for string, numeric, boolean, enum, reference, empty, and raw-value fallback cases.
- [ ] #5 The shared value renderer accepts field metadata, a value, and field display configuration without depending on table-only column sizing, sorting, or filtering properties.
- [ ] #6 The existing unit tests are updated or extended and pass with the refactored component.
- [ ] #7 No preview dialog, entity loading, form metadata loading, or editable form behavior is introduced by this task.
<!-- AC:END -->
