import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminLayout } from './admin-layout';
import { NavigationState } from '../../navigation/navigation-state';
import { AdminToolbarState } from './admin-toolbar-state';

@Component({ standalone: true, template: '' })
class RouteStub {}

describe('AdminLayout', () => {
  let component: AdminLayout;
  let fixture: ComponentFixture<AdminLayout>;
  let breakpointState: BehaviorSubject<BreakpointState>;

  beforeEach(async () => {
    breakpointState = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });

    await TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [
        provideRouter([]),
        {
          provide: BreakpointObserver,
          useValue: { observe: () => breakpointState.asObservable() },
        },
        {
          provide: NavigationState,
          useValue: {
            navigation: signal({ sections: [] }),
            navigationState: signal({ status: 'loaded', data: { sections: [] } }),
            selected: signal(null),
            select: () => undefined,
            clear: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    document.body.classList.remove('dark-theme');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows Home as current on the home page and links the current node to its list', () => {
    fixture.detectChanges();

    const homeLink = fixture.nativeElement.querySelector(
      'app-breadcrumbs a.breadcrumb-item',
    ) as HTMLAnchorElement;
    expect(homeLink.getAttribute('aria-current')).toBe('page');
    expect(homeLink.classList.contains('active')).toBe(true);

    TestBed.inject(NavigationState).selected.set({
      section: { id: 'sales', title: 'Sales', nodes: [] },
      node: {
        id: 'customers',
        title: 'Customers',
        type: 'rest-entity',
        config: { resource: 'customers' },
      },
    });
    fixture.detectChanges();

    const crumbs = fixture.nativeElement.querySelectorAll(
      'app-breadcrumbs .breadcrumb-item',
    ) as NodeListOf<HTMLElement>;
    const currentPage = crumbs[2] as HTMLAnchorElement;
    expect(homeLink.classList.contains('active')).toBe(false);
    expect(currentPage.getAttribute('href')).toBe('/node/sales/customers');
    expect(currentPage.classList.contains('mat-mdc-button')).toBe(true);
    expect(homeLink.classList.contains('mat-mdc-button')).toBe(true);
    expect(currentPage.getAttribute('aria-current')).toBe('page');
    expect(currentPage.textContent?.trim()).toBe('Customers');

    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    currentPage.click();
    expect(navigateByUrl).toHaveBeenCalledWith('/node/sales/customers');
  });

  it('adds an active plus crumb in create mode, with a shorter mobile trail', async () => {
    TestBed.inject(NavigationState).selected.set({
      section: { id: 'sales', title: 'Sales', nodes: [] },
      node: {
        id: 'customers',
        title: 'Customers',
        type: 'rest-entity',
        config: { resource: 'customers' },
      },
    });
    const router = TestBed.inject(Router);
    router.resetConfig([{ path: '**', component: RouteStub }]);
    await router.navigateByUrl('/node/sales/customers?entityMode=create');
    fixture.detectChanges();

    const layout = component as unknown as {
      breadcrumbs: (
        mobile: boolean,
      ) => { text: string; active: boolean; icon?: { name: string } }[];
    };
    const desktopCrumbs = layout.breadcrumbs(false);
    expect(desktopCrumbs.map(({ text }) => text)).toEqual(['Home', 'Sales', 'Customers', 'Add']);
    expect(desktopCrumbs[2].active).toBe(false);
    expect(desktopCrumbs[3]).toMatchObject({
      text: 'Add',
      active: true,
      icon: { name: 'add' },
    });

    expect(layout.breadcrumbs(true).map(({ text }) => text)).toEqual(['Customers', 'Add']);
  });

  it('shows the next theme in the icon and label', () => {
    fixture.detectChanges();
    const themeButton = fixture.nativeElement.querySelector('.theme-toggle') as HTMLButtonElement;

    expect(themeButton.getAttribute('aria-label')).toBe('Dark theme');
    expect(themeButton.querySelector('mat-icon')?.textContent?.trim()).toBe('dark_mode');

    themeButton.click();
    fixture.detectChanges();
    expect(themeButton.getAttribute('aria-label')).toBe('Light theme');
    expect(themeButton.querySelector('mat-icon')?.textContent?.trim()).toBe('light_mode');
    expect(document.body.classList.contains('dark-theme')).toBe(true);

    themeButton.click();
    fixture.detectChanges();
    expect(themeButton.getAttribute('aria-label')).toBe('Dark theme');
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  it('uses flat icon buttons for add, filter, and theme actions on desktop', () => {
    TestBed.inject(AdminToolbarState).setActions({
      addLabel: 'Add Customer',
      canAdd: true,
      filterCount: 0,
      add: () => undefined,
      editFilters: () => undefined,
      clearFilters: () => undefined,
    });
    fixture.detectChanges();

    for (const selector of ['.add-action', '.filter-action', '.theme-toggle']) {
      const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
      expect(button.classList.contains('mat-mdc-icon-button')).toBe(true);
      expect(button.classList.contains('mat-mdc-fab')).toBe(false);
    }

    const filterButton = fixture.nativeElement.querySelector('.filter-action') as HTMLButtonElement;
    const filterIcon = filterButton.querySelector('mat-icon') as HTMLElement;
    expect(filterIcon.classList.contains('material-icons-outlined')).toBe(true);
    expect(filterButton.classList.contains('filters-active')).toBe(false);

    TestBed.inject(AdminToolbarState).setActions({
      addLabel: 'Add Customer',
      canAdd: true,
      filterCount: 1,
      add: () => undefined,
      editFilters: () => undefined,
      clearFilters: () => undefined,
    });
    fixture.detectChanges();

    expect(filterIcon.classList.contains('material-icons')).toBe(true);
    expect(filterIcon.classList.contains('material-icons-outlined')).toBe(false);
    expect(filterButton.classList.contains('filters-active')).toBe(false);
  });

  it('moves list actions into the mobile overflow menu', async () => {
    TestBed.inject(AdminToolbarState).setActions({
      addLabel: 'Add Customer',
      canAdd: true,
      filterCount: 1,
      add: () => undefined,
      editFilters: () => undefined,
      clearFilters: () => undefined,
    });
    breakpointState.next({ matches: true, breakpoints: { '(max-width: 768px)': true } });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.add-action')).toBeNull();
    expect(fixture.nativeElement.querySelector('.filter-action')).toBeNull();
    expect(fixture.nativeElement.querySelector('.action-divider')).toBeNull();

    const overflowButton = fixture.nativeElement.querySelector(
      '.overflow-menu-button',
    ) as HTMLButtonElement;
    overflowButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const menu = document.querySelector('.cdk-overlay-container .mat-mdc-menu-panel');
    const menuText = menu?.textContent ?? '';
    expect(menuText).toContain('AdminMesh');
    expect(menuText).toContain('Home');
    expect(menuText).toContain('Add Customer');
    expect(menuText).toContain('Filter');
    expect(menuText).toContain('Dark theme');

    const filterItem = Array.from(menu?.querySelectorAll('button') ?? []).find((button) =>
      button.textContent?.includes('Filter'),
    );
    expect(filterItem?.querySelector('mat-icon')?.textContent?.trim()).toBe('filter_alt');
    expect(filterItem?.querySelector('mat-icon')?.classList.contains('material-icons')).toBe(true);
    filterItem?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.querySelector('.cdk-overlay-container')?.textContent).toContain('Edit filters');
    expect(document.querySelector('.cdk-overlay-container')?.textContent).toContain(
      'Clear filters',
    );
  });
});
