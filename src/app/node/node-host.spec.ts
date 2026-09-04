import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { NodeHost } from './node-host';
import { NavigationState } from '../navigation/navigation-state';

describe('NodeHost', () => {
  let component: NodeHost;
  let fixture: ComponentFixture<NodeHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeHost],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(
              convertToParamMap({
                sectionId: 'accounting',
                nodeId: 'test',
              }),
            ),
          },
        },
        {
          provide: NavigationState,
          useValue: {
            navigation: () => ({ sections: [] }),
            selectByIds: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NodeHost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
