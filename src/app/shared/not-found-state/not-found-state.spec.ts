import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { NotFoundState } from './not-found-state';

describe('NotFoundState', () => {
  it('renders the title, message, and home link', async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundState],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture: ComponentFixture<NotFoundState> = TestBed.createComponent(NotFoundState);
    fixture.componentRef.setInput('title', 'Missing page');
    fixture.componentRef.setInput('message', 'Nothing here');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Missing page');
    expect(fixture.nativeElement.textContent).toContain('Nothing here');
    expect(fixture.nativeElement.querySelector('a[routerLink="/"]')).toBeTruthy();
  });
});
