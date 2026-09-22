---
id: TASK-26
title: Deduplicate toolbar action logic between desktop and mobile headers
status: Done
assignee: []
created_date: '2026-09-22 19:02'
updated_date: '2026-09-22 20:36'
labels: []
milestone: s-003
dependencies: []
ordinal: 13750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
layout-header-desktop.html and layout-header-mobile.html duplicate the same filterEditing/canAdd/filterCount branching and per-action icon/label/handler literals for Add filter, Clear filters, Add, and Filter actions. Move the action list and its visibility logic into AdminToolbarState as a shared descriptor list (icon, label, handler per action); have both templates iterate over it, keeping only their distinct wrapper markup (icon-button+tooltip vs menu-item+span).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 AdminToolbarState (or a related util) exposes a single source of truth for the toolbar action list and when each action is shown
- [x] #2 layout-header-desktop.html and layout-header-mobile.html render actions by iterating the shared list instead of duplicating the filterEditing/canAdd/filterCount conditionals
- [x] #3 No behavior change; existing tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extend AdminToolbarState with a computed shared descriptor list for the visible toolbar actions, including labels, icons, handlers, and filter icon state. 2. Inject the shared state into desktop and mobile headers and replace duplicated conditionals with iteration over the descriptor list while preserving wrapper-specific markup and CSS hooks. 3. Update layout bindings/types as needed, add focused state coverage, and run formatting, build, and unit tests.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

<!-- SECTION:FINAL_SUMMARY:END -->
