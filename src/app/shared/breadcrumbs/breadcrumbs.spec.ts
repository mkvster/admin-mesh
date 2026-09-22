import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Breadcrumbs, type BreadcrumbItem } from './breadcrumbs';

describe('Breadcrumbs', () => {
  let fixture: ComponentFixture<Breadcrumbs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Breadcrumbs],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Breadcrumbs);
  });

  it('renders all crumbs with shared styling and separators', () => {
    const items: BreadcrumbItem[] = [
      { text: 'Home', icon: { name: 'home' }, active: false, route: '/' },
      { text: 'Sales', active: false },
      {
        text: 'Customers',
        icon: { name: 'people', color: 'blue' },
        active: true,
        route: '/node/sales/customers',
      },
      { text: '1', active: true },
    ];
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const crumbs = fixture.nativeElement.querySelectorAll('.breadcrumb-item');
    expect(crumbs).toHaveLength(4);
    expect(fixture.nativeElement.querySelectorAll('.separator')).toHaveLength(3);
    expect(crumbs[0].classList.contains('active')).toBe(false);
    expect(crumbs[2].classList.contains('active')).toBe(true);
    expect(crumbs[3].textContent.trim()).toBe('1');
    expect(crumbs[0].classList.contains('mat-mdc-button')).toBe(true);
    expect(crumbs[2].classList.contains('mat-mdc-button')).toBe(true);
    expect(crumbs[1].className).toContain('breadcrumb-item');
    expect(crumbs[2].querySelector('mat-icon')?.getAttribute('style')).toContain('blue');
  });

  it('uses the route by default and lets a crumb override navigation', () => {
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const onNavigate = vi.fn();
    fixture.componentRef.setInput('items', [
      { text: 'Home', active: false, route: '/' },
      { text: 'Customers', active: true, route: '/node/sales/customers', onNavigate },
    ] satisfies BreadcrumbItem[]);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a.breadcrumb-item');
    (links[0] as HTMLAnchorElement).click();
    expect(navigateByUrl).toHaveBeenCalledWith('/');

    (links[1] as HTMLAnchorElement).click();
    expect(onNavigate).toHaveBeenCalledOnce();
    expect(navigateByUrl).toHaveBeenCalledTimes(1);
  });
});
