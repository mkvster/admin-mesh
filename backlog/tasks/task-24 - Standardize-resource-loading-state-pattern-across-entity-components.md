---
id: TASK-24
title: Standardize resource-loading state pattern across entity components
status: To Do
assignee: []
created_date: '2026-09-22 15:41'
labels: []
milestone: s-003
dependencies: []
ordinal: 11750
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
EntityList, EntityForm, EntityPreview, and ReferenceLookupView each hand-roll their own loading/loaded/error tagged-union state with toSignal+combineLatest+catchError+startWith, with inconsistent error handling (some check HttpErrorResponse specifically, others swallow all errors, EntityPreview also special-cases 404). Introduce a shared helper/operator to standardize this pattern and its error handling, then adopt it in these components.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A shared loading-state helper/operator exists for combining metadata+data sources into a loading/loaded/error signal
- [ ] #2 EntityList, EntityForm, EntityPreview, ReferenceLookupView use the shared helper
- [ ] #3 Error handling behavior is consistent and documented (which errors surface as error state vs rethrow)
- [ ] #4 No behavior change beyond consistency fixes; existing tests pass
<!-- AC:END -->
