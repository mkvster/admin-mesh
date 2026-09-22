---
id: TASK-19
title: Move list filtering from modal to node host view
type: feature
status: Done
assignee: []
created_date: '2026-09-21 16:02'
updated_date: '2026-09-21 19:30'
labels: []
milestone: s-003
dependencies:
  - TASK-12
priority: medium
ordinal: 2333.333333333333
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the list filter modal with a regular view hosted in the node host, following the existing entity add/edit experience. This gives filter conditions room to open the reference lookup UI and lets reference fields use the same reusable foreign-key control in both entity editing and filtering. TASK-12 already calls for a reusable reference selector, while reference filtering remains out of scope there.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Opening filter editing displays the filter view in the node host instead of a modal popup.
- [x] #2 Users can configure, apply, and cancel filter changes through the node-host view without losing the currently applied filters when they cancel.
- [x] #3 Existing supported filter types and their behavior remain available in the new view.
- [x] #4 When filter mode opens, the final breadcrumb item shows a filter icon and the label 'Filter', following the Add view pattern.
- [x] #5 The filter header contains the 'Add filter' action as a plus icon followed by the clear-filter icon; both actions are positioned in the header beside the title.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Replace the filter dialog with an inline filter mode in the entity list node host, keeping edits as a draft until Apply. 2. Add the Filter breadcrumb and header actions for Add filter and Clear filters, plus Apply/Cancel controls. 3. Preserve current filter types, URL serialization, and cancel behavior. 4. Leave shared reference selection to TASK-12; complete that integration after TASK-12 delivers the reusable editor.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented the inline node-host filter mode, draft Apply/Cancel behavior, Filter breadcrumb, and header Add filter/Clear filters actions for desktop and mobile. Production build passes. Shared reference-value editing remains pending TASK-12, recorded as a dependency.

Adjusted filter-view field and validation spacing to match entity edit form padding; aligned Cancel and Apply to the lower right using the same action layout.

Updated filter actions: list-view Filter opens the editor directly; the clear icon in either the list toolbar or filter mode immediately removes active filters and exits filter mode. The filter-mode clear action no longer edits only the draft.

For mobile layouts, moved all contextual actions from the toolbar into the overflow menu: Add and Filter in list mode, Add filter and Clear filters in filter mode. Build passes.

Updated stale AdminLayout mobile overflow-menu expectations for direct Filter navigation, filter-editor actions in the overflow menu, and the separate Theme divider. Full suite passes: 33 test files, 90 tests.
<!-- SECTION:NOTES:END -->
