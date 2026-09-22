import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { StringValueInput } from './string-value-input';

describe('StringValueInput', () => {
  let fixture: ComponentFixture<StringValueInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StringValueInput] }).compileComponents();
    fixture = TestBed.createComponent(StringValueInput);
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();
  });

  it('emits edited text and applies the optional length limit', () => {
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    fixture.componentRef.setInput('maxLength', 20);
    fixture.detectChanges();
    input.value = 'person@example.com';
    input.dispatchEvent(new Event('input'));

    expect(input.maxLength).toBe(20);
    expect(emitted).toEqual(['person@example.com']);
  });

  it('shows a character counter only when requested', () => {
    fixture.componentRef.setInput('value', 'abc');
    fixture.componentRef.setInput('maxLength', 10);
    fixture.componentRef.setInput('showCounter', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('3 / 10');
  });
});
