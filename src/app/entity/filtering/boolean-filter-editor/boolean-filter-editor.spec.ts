import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BooleanFilterEditor } from './boolean-filter-editor';

describe('BooleanFilterEditor', () => {
  let fixture: ComponentFixture<BooleanFilterEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BooleanFilterEditor] }).compileComponents();
    fixture = TestBed.createComponent(BooleanFilterEditor);
    fixture.detectChanges();
  });

  it('renders a boolean select with its accessible label', () => {
    expect(fixture.nativeElement.querySelector('mat-select')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Value');
  });
});
