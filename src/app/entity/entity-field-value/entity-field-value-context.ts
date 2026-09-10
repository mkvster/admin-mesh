import { InjectionToken } from '@angular/core';

export const ENTITY_FIELD_VALUE_IN_POPUP = new InjectionToken<boolean>(
  'ENTITY_FIELD_VALUE_IN_POPUP',
  { factory: () => false },
);
