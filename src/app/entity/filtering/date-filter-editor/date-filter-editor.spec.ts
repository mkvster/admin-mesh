import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DateFilterEditor } from './date-filter-editor';

describe('DateFilterEditor', () => {
  let fixture: ComponentFixture<DateFilterEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DateFilterEditor] }).compileComponents();
    fixture = TestBed.createComponent(DateFilterEditor);
  });

  it('renders a relative-period select for inThePast', () => {
    fixture.componentRef.setInput('operator', 'inThePast');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-select')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Period');
  });

  it('renders two date inputs for a between operator', () => {
    fixture.componentRef.setInput('operator', 'between');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-date-value-input')).toHaveLength(2);
  });
});
