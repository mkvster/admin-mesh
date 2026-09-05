import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DateValueInput } from './date-value-input';

describe('DateValueInput', () => {
  let fixture: ComponentFixture<DateValueInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DateValueInput] }).compileComponents();
    fixture = TestBed.createComponent(DateValueInput);
    fixture.componentRef.setInput('label', 'Value');
    fixture.detectChanges();
  });

  it('renders the supplied label', () => {
    expect(fixture.nativeElement.textContent).toContain('Value');
  });

  it('emits valid dates from the value input', () => {
    const emitted: Date[] = [];
    fixture.componentInstance.dateChange.subscribe((date) => emitted.push(date));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '2026-09-04';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    expect(emitted.length).toBeGreaterThan(0);
  });
});
