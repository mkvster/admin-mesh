import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('renders the supplied error message', async () => {
    await TestBed.configureTestingModule({ imports: [ErrorState] }).compileComponents();
    const fixture: ComponentFixture<ErrorState> = TestBed.createComponent(ErrorState);
    fixture.componentRef.setInput('message', 'Request failed');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Request failed');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });
});
