import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  EntityMetadata,
  FilterItem,
  ListMetadata,
  ListQueryResult,
  ListSort,
} from '../entity-types';
import {
  ListGrid,
  ListGridRowAction,
  ListPageChange,
  ListSortChange,
} from '../list-grid/list-grid';

export interface EntityListContentData {
  readonly resource: string;
  readonly metadata: EntityMetadata;
  readonly listMetadata: ListMetadata;
  readonly data: ListQueryResult;
  readonly page: number;
  readonly pageSize: number;
  readonly sort: ListSort[];
  readonly filters: FilterItem[];
}

@Component({
  selector: 'app-entity-list-content',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, ListGrid],
  templateUrl: './entity-list-content.html',
  styleUrl: './entity-list-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityListContent {
  readonly data = input.required<EntityListContentData>();
  readonly isLoading = input(false);
  readonly deletionError = input<string | null>(null);
  readonly locateMessage = input<string | null>(null);
  readonly highlightedId = input<string | number | null>(null);

  readonly pageChange = output<ListPageChange>();
  readonly sortChange = output<ListSortChange>();
  readonly rowAction = output<ListGridRowAction>();
  readonly openFilters = output<void>();
  readonly clearFilters = output<void>();
  readonly findSavedRecord = output<void>();
  readonly dismissLocateMessage = output<void>();
  readonly gridElement = output<HTMLElement>();

  private readonly listGrid = viewChild(ListGrid, { read: ElementRef });

  constructor() {
    effect(() => {
      const grid = this.listGrid();
      if (grid) this.gridElement.emit(grid.nativeElement);
    });
  }
}
