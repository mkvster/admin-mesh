---
id: TASK-21
title: Extract shared filter operator label lookup
status: To Do
assignee: []
created_date: '2026-09-22 15:41'
labels: []
milestone: s-003
dependencies: []
ordinal: 8750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
operatorLabel() and filter-value formatting are duplicated near-identically between list-grid.ts (column filter summary) and filter-dialog.ts (operator select). Extract a shared operator-label map/function into filter-serialization.ts or a new filter-labels.ts, used by both.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A single shared operatorLabel function exists and is exported from a filtering util module
- [ ] #2 list-grid.ts and filter-dialog.ts both use the shared function instead of local switch statements
- [ ] #3 No behavior change; existing tests pass
<!-- AC:END -->
