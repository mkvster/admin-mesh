---
id: TASK-9
title: Add entity preview dialog from metadata-driven view action
status: To Do
assignee: []
created_date: '2026-09-04 13:47'
updated_date: '2026-09-06 23:35'
labels: []
milestone: s-002
dependencies:
  - TASK-15
references:
  - >-
    backlog/tasks/task-15 -
    Prepare-shared-entity-field-value-rendering-for-TASK-9.md
documentation:
  - docs/AdminApiProtocol.md
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a reusable read-only EntityPreview and an EntityPreviewDialog for viewing a selected entity from the list. The list metadata exposes optional row actions, initially supporting a view-form action with an explicit formId. ListGrid renders the action button, and selecting it opens the dialog, which loads the selected form metadata and the entity using that form projection, then renders the read-only result according to the form layout. This task prepares the shared renderer used later by delete confirmation preview. It does not implement editing, create mode, deletion preview, displayProfile adaptation, navigate actions, reference lookup, or relation sections.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 List metadata supports optional row actions with an initial view-form action containing an explicit formId.
- [ ] #2 ListGrid renders the configured view-form action for a row and passes the entity identifier from EntityMetadata.idField.
- [ ] #3 Selecting the view action opens one EntityPreviewDialog immediately and shows a loading state while preview data is loaded.
- [ ] #4 EntityPreview loads form metadata by resource and formId with caching and loads the selected entity with the projection declared by that form.
- [ ] #5 EntityPreview renders the form fields according to layout columns, start, span, and metadata order.
- [ ] #6 Read-only rendering supports string, integer, decimal, boolean, date, datetime, enum, and reference fallback values using the shared EntityFieldValue renderer from TASK-15.
- [ ] #7 The dialog presents loading, missing-entity, and API-error states without silently ignoring errors and can be cancelled or closed without mutation.
- [ ] #8 Automated tests cover view-action rendering, dialog opening, loading, successful preview rendering, projection requests, cancellation, missing entity, and preview-load failure.
- [ ] #9 This task does not add editable controls, save or validation behavior, delete-dialog preview, displayProfile selection, navigate actions, reference lookup, or relation sections.
<!-- AC:END -->
