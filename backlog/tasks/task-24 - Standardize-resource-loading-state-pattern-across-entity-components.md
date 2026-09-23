---
id: TASK-24
title: Standardize resource-loading state pattern across entity components
status: Done
assignee: []
created_date: '2026-09-22 15:41'
updated_date: '2026-09-23 01:02'
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
- [x] #1 A shared loading-state helper/operator exists for combining metadata+data sources into a loading/loaded/error signal
- [x] #2 EntityList, EntityForm, EntityPreview, ReferenceLookupView use the shared helper
- [x] #3 Error handling behavior is consistent and documented (which errors surface as error state vs rethrow)
- [x] #4 No behavior change beyond consistency fixes; existing tests pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add shared entity resource-load-state operator with configurable expected-error predicate, optional error observer, loading/loaded/error states, and preserved causes. 2. Adopt it in EntityList, EntityForm, EntityPreview, and ReferenceLookupView. EntityList keeps the original boundary: HttpErrorResponse is logged and surfaced as error-state; non-HTTP errors are rethrown. The other entity resource views preserve their existing user-facing error-state behavior. 3. Keep EntityPreview to one helper boundary per resource request, preserve metadata-backed skeleton loading, repeated id reloads, and 404 -> missing mapping. 4. Run formatting, production build, and Vitest verification.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented shared resource-load-state operator and adopted it in all four entity components. Resource pipeline failures now consistently surface as error state with the original cause; EntityPreview preserves 404 as missing and metadata-backed skeleton loading. Added resource-load-state unit coverage. Validation passed: npm run verify (format check, production build, 34 test files, 96 tests) and git diff --check.

Follow-up correction applied after review: EntityList now restores non-HTTP rethrow and console.error logging through explicit helper options. EntityPreview now uses one withResourceLoadState call per request inside switchMap, with one centralized 404 classification; subsequent id changes continue to reload after an error. Validation passed: npm run verify (format check, production build, 34 test files, 97 tests) and git diff --check.
<!-- SECTION:NOTES:END -->

## Comments

<!-- COMMENTS:BEGIN -->
author: @codex
created: 2026-09-22 21:21
---
Follow-up correction: preserve EntityList's non-HTTP rethrow and error logging, and simplify EntityPreview to one shared load-state boundary.
---
<!-- COMMENTS:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented and corrected TASK-24. The shared resource-load-state operator now supports explicit expected-error policy and logging. EntityList preserves HttpErrorResponse handling/logging and rethrows programming errors; EntityForm and ReferenceLookupView retain user-facing error states; EntityPreview uses one per-request helper boundary with preserved skeleton, reload, and 404 behavior. Verified with npm run verify: formatting, production build, and 97 tests passed.
<!-- SECTION:FINAL_SUMMARY:END -->
