import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { Root } from './root';
import { NavigationState } from '../navigation/navigation-state';

describe('Root', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Root],
      providers: [
        provideRouter([]),
        {
          provide: NavigationState,
          useValue: {
            navigation: signal({ sections: [] }),
            navigationState: signal({ status: 'loaded', data: { sections: [] } }),
            selected: signal(null),
            clear: () => undefined,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(Root);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the admin layout', async () => {
    const fixture = TestBed.createComponent(Root);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-admin-layout')).toBeTruthy();
  });
});
