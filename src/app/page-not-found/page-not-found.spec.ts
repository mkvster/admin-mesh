import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { PageNotFound } from './page-not-found';

describe('PageNotFound', () => {
  it('renders the not-found state', async () => {
    await TestBed.configureTestingModule({
      imports: [PageNotFound],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture: ComponentFixture<PageNotFound> = TestBed.createComponent(PageNotFound);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-not-found-state')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Page not found');
  });
});
