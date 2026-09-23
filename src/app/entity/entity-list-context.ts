import { Location } from '@angular/common';
import { Injectable } from '@angular/core';

interface EntityListContext {
  returnUrl: string;
  scrollTop: number;
}

@Injectable({ providedIn: 'root' })
export class EntityListContextStore {
  private readonly contexts = new Map<string, EntityListContext>();

  readToken(location: Location): string | undefined {
    const state = (location.getState() ?? {}) as { entityListContextToken?: unknown };
    return typeof state.entityListContextToken === 'string'
      ? state.entityListContextToken
      : undefined;
  }

  remember(key: string, context: EntityListContext): void {
    this.contexts.set(key, context);
  }

  take(key: string): EntityListContext | undefined {
    const context = this.contexts.get(key);
    this.contexts.delete(key);
    return context;
  }

  peek(key: string): EntityListContext | undefined {
    return this.contexts.get(key);
  }
}
