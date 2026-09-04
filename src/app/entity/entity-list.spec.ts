import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { EntityList } from './entity-list';
import { EntityApi } from './entity-api';
import { EntityMetadataStore } from './entity-metadata-store';
import { ListMetadataStore } from './list-metadata-store';

describe('EntityList', () => {
  let component: EntityList;
  let fixture: ComponentFixture<EntityList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityList],
      providers: [
        {
          provide: EntityApi,
          useValue: { queryList: () => of({ items: [], totalCount: 0 }) },
        },
        {
          provide: EntityMetadataStore,
          useValue: {
            get: () =>
              of({
                title: 'Customers',
                singularTitle: 'Customer',
                idField: 'id',
                permissions: { create: false, edit: false, delete: false },
                views: { list: 'default', form: 'default' },
              }),
          },
        },
        {
          provide: ListMetadataStore,
          useValue: { get: () => of({ fields: [], columns: [] }) },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: MatDialog, useValue: { open: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('resource', 'customers');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
