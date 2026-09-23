---
id: TASK-27
title: Refactor entity list controls with shared EntityListQueryController
type: task
status: Done
assignee: []
created_date: '2026-09-22 21:04'
updated_date: '2026-09-23 02:14'
labels:
  - refactor
  - entity
  - list
milestone: s-003
dependencies: []
references:
  - >-
    backlog/tasks/task-24 -
    Standardize-resource-loading-state-pattern-across-entity-components.md
priority: medium
ordinal: 14750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reduce the size and responsibility of EntityList while improving ReferenceLookupView through a shared query-and-list-state abstraction. The shared layer should cover list query state, loading list data, and common page/sort/filter transitions, while leaving query persistence to each control: URL navigation for EntityList and local signal state for ReferenceLookupView. Keep CRUD, form navigation, and reference selection behavior specific to their owning controls. Coordinate with TASK-24, which separately standardizes loading-state handling.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A reusable EntityListQueryController is extracted for the common list-query and list-loading behavior used by EntityList and ReferenceLookupView.
- [x] #2 EntityList uses the shared controller while preserving query-parameter synchronization, legacy sort links, page normalization, filtering, sorting, and pagination behavior.
- [x] #3 ReferenceLookupView uses the shared controller while preserving local query state, initial-selection location, single/multiple selection, filtering, sorting, and pagination behavior.
- [x] #4 The shared abstraction does not take ownership of control-specific behavior such as CRUD/form navigation, toolbar-specific add actions, or reference selection.
- [x] #5 Unit and component tests cover the shared query behavior and both controls continue to pass the project verification checks.
- [x] #6 EntityListRouteQueryAdapter owns URL query parsing/serialization, navigation, legacy sort compatibility, and paging normalization without taking ownership of CRUD or selection behavior.
- [x] #7 EntityListSavedRecordController owns saved-record location, list context/scroll restoration, highlighting, and locate notification lifecycle.
- [x] #8 EntityListContent owns list-grid presentation, empty/loading states, and list-level notifications while EntityList remains the orchestration container.
- [x] #9 EntityList no longer owns the reusable deletion workflow; a shared EntityDeletionController handles confirmation, delete execution, progress, and errors while remaining independent of list refresh or edit-view navigation.
- [x] #10 DeleteConfirmationDialog remains usable from both list and future edit-view/toolbar actions without taking a dependency on EntityList.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

<!-- SECTION:NOTES:END -->
