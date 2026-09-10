---
id: TASK-18
title: Add navigation to referenced entity via reference field click (redirect)
status: To Do
assignee: []
created_date: '2026-09-09 16:31'
updated_date: '2026-09-10 23:16'
labels: []
milestone: s-010
dependencies:
  - TASK-13
ordinal: 6750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add optional `redirect: <formId>` to reference display metadata.

* `redirect` absent - no change (current behavior).
* `redirect` present - reference value gets link styling and clicking navigates to the referenced entity's detail page, rendered via the named form.
* Inside a modal/overlay context (the DI signal from TASK-13) - always plain text, `redirect` is ignored.

Depends on a routable, non-modal entity detail page (own URL, replaces the list area) - check whether it exists yet; if not, build a minimal version as part of this task.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 FieldDisplay for type reference supports an optional redirect string naming a form id for the referenced entity's detail view
- [ ] #2 When redirect is set and the field renders outside any modal/overlay context, the value is styled as a link and clicking it navigates to the referenced entity's detail page rendered with the specified form
- [ ] #3 When redirect is set but the field renders inside a modal dialog or popup/overlay context (delete confirmation, preview dialog, hover preview), there is no link styling and no click navigation
- [ ] #4 Reference fields without redirect configured are unaffected by this change
- [ ] #5 Navigating to the detail view does not strand the user - there is a way back to the originating list/view
<!-- AC:END -->
