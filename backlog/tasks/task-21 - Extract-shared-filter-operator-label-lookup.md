---
id: TASK-21
title: Extract shared filter operator label lookup
status: Done
assignee: []
created_date: '2026-09-22 15:41'
updated_date: '2026-09-22 16:28'
labels: []
milestone: s-003
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
operatorLabel() and filter-value formatting are duplicated near-identically between list-grid.ts (column filter summary) and filter-dialog.ts (operator select). Extract a shared operator-label map/function into filter-serialization.ts or a new filter-labels.ts, used by both.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A single shared operatorLabel function exists and is exported from a filtering util module
- [x] #2 list-grid.ts and filter-dialog.ts both use the shared function instead of local switch statements
- [x] #3 No behavior change; existing tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Export the shared operator label lookup from the filtering utility. 2. Replace local operator label implementations in the grid and dialog. 3. Run formatting, tests, and production build.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Shared operator label lookup is exported and used by the grid and filter dialog. Verification passed: 92 tests and production build.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Extracted the shared filter operator label lookup and verified it with the full test suite (92 tests), production build, Prettier check, and git diff validation.
<!-- SECTION:FINAL_SUMMARY:END -->
