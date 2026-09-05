import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenav } from '@angular/material/sidenav';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { Navigation } from './navigation';
import { NavigationApi } from '../navigation-api';

describe('Navigation', () => {
  let component: Navigation;
  let fixture: ComponentFixture<Navigation>;
  let sidenav: { mode: 'over' | 'side'; close: Mock<() => Promise<void>> };

  beforeEach(async () => {
    sidenav = {
      mode: 'over',
      close: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [Navigation],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        {
          provide: NavigationApi,
          useValue: {
            getNavigation: () =>
              of({
                sections: [
                  {
                    id: 'section-1',
                    title: 'Section 1',
                    nodes: [
                      {
                        id: 'node-1',
                        title: 'Node 1',
                        type: 'item',
                        config: {},
                      },
                      {
                        id: 'node-2',
                        title: 'Node 2',
                        type: 'item',
                        config: {},
                      },
                    ],
                  },
                ],
              }),
          },
        },
        {
          provide: MatSidenav,
          useValue: sidenav,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navigation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps only one node active at a time', async () => {
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button.mat-mdc-list-item');

    buttons[0].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(buttons[0].classList.contains('is-active')).toBe(true);
    expect(buttons[1].classList.contains('is-active')).toBe(false);

    buttons[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(buttons[0].classList.contains('is-active')).toBe(false);
    expect(buttons[1].classList.contains('is-active')).toBe(true);
  });

  it('closes the sidenav after selecting a node on mobile', async () => {
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button.mat-mdc-list-item');

    buttons[0].click();
    await fixture.whenStable();

    expect(sidenav.close).toHaveBeenCalled();
  });
});
