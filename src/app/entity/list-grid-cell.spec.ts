import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListGridCell } from './list-grid-cell';

describe('ListGridCell', () => {
  let component: ListGridCell;
  let fixture: ComponentFixture<ListGridCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListGridCell],
    }).compileComponents();

    fixture = TestBed.createComponent(ListGridCell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
