---
id: TASK-23
title: Extract shared hover-preview timer logic
status: Done
assignee:
  - '@mkvster'
created_date: '2026-09-22 15:41'
updated_date: '2026-09-22 16:42'
labels: []
milestone: s-003
dependencies: []
ordinal: 10750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The 250ms open / 120ms close hover-intent timer logic for reference preview overlays is duplicated independently in list-grid.ts and reference-value-input.ts (hoverTimer/closeTimer/clearHoverTimer/clearCloseTimer/scheduleClose/clearTimers). Extract into a reusable helper (directive or injectable) and use it in both components.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A single reusable hover-intent timer helper exists
- [x] #2 list-grid.ts and reference-value-input.ts both use the shared helper instead of duplicated timer fields/methods
- [x] #3 No behavior change; existing tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

<!-- SECTION:FINAL_SUMMARY:END -->
