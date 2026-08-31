import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
