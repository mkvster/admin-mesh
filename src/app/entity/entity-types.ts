export interface EntityPermissions {
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface EntityViews {
  list: string;
  form: string;
  createForm?: string;
}

export interface EntityMetadata {
  title: string;
  singularTitle: string;
  idField: string;
  permissions: EntityPermissions;
  views: EntityViews;
}

export interface ListField {
  name: string;
  label: string;
  type: string;
  values?: { value: string | number; label: string }[];
}

export type ListColumnDisplay =
  | {
      type: 'boolean';
      style: 'icon' | 'checkbox' | 'text';
    }
  | {
      type: 'enum';
      style: 'label' | 'value';
    };

export interface ListColumn {
  field: string;
  sizeType?: 'width' | 'flex';
  size?: number;
  disableSorting?: boolean;
  disableFiltering?: boolean;
  display?: ListColumnDisplay;
}

export interface ListMetadata {
  fields: ListField[];
  columns: ListColumn[];
}

export interface ListQuery {
  page: number;
  pageSize: number;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
}

export interface ListQueryResult {
  items: Record<string, unknown>[];
  totalCount: number;
}
