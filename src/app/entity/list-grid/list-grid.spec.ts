import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ListGrid } from './list-grid';

describe('ListGrid', () => {
  let component: ListGrid;
  let fixture: ComponentFixture<ListGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(ListGrid);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('metadata', { fields: [], columns: [] });
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('totalCount', 0);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
