import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { StringFilterEditor } from './string-filter-editor';

describe('StringFilterEditor', () => {
  let fixture: ComponentFixture<StringFilterEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StringFilterEditor] }).compileComponents();
    fixture = TestBed.createComponent(StringFilterEditor);
    fixture.componentRef.setInput('operator', 'contains');
    fixture.detectChanges();
  });

  it('renders the operator label and updates its model from input', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(fixture.nativeElement.textContent).toContain('Contains');
    input.value = 'admin';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('admin');
  });
});
