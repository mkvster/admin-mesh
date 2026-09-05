import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { NumericFilterEditor } from './numeric-filter-editor';

describe('NumericFilterEditor', () => {
  let fixture: ComponentFixture<NumericFilterEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NumericFilterEditor] }).compileComponents();
    fixture = TestBed.createComponent(NumericFilterEditor);
  });

  it('parses a single numeric value', () => {
    fixture.componentRef.setInput('operator', 'equals');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '42';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe(42);
  });

  it('renders two fields and preserves a numeric range', () => {
    fixture.componentRef.setInput('operator', 'between');
    fixture.componentRef.setInput('value', [10, 20]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(2);
    expect((fixture.nativeElement.querySelectorAll('input')[0] as HTMLInputElement).value).toBe(
      '10',
    );
  });
});
