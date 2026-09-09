export interface EntityPermissions {
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface EntityViews {
  list: string;
  form: string;
  deleteForm?: string;
  createForm?: string;
}

export interface EntityMetadata {
  title: string;
  singularTitle: string;
  idField: string;
  fields?: FieldMetadata[];
  permissions: EntityPermissions;
  views: EntityViews;
}

export interface FieldMetadata {
  name: string;
  label: string;
  type: string;
  display?: FieldDisplay;
  order?: number;
  values?: { value: string | number; label: string }[];
  reference?: {
    resource: string;
    listId: string;
    displayField: string;
  };
}

export type FieldDisplay =
  | {
      type: 'boolean';
      style: 'icon' | 'checkbox' | 'text';
    }
  | {
      type: 'enum';
      style: 'label' | 'value';
    }
  | {
      type: 'reference';
      valueField: string;
    }
  | {
      type: 'numeric';
      style: 'currency';
      currency: string;
    }
  | {
      type: 'date';
      style: 'short' | 'medium' | 'long' | 'full';
    }
  | {
      type: 'datetime';
      style: 'short' | 'medium' | 'long' | 'full';
    };

export interface ListColumn {
  field: string;
  sizeType?: 'width' | 'flex';
  size?: number;
  disableSorting?: boolean;
  disableFiltering?: boolean;
  display?: FieldDisplay;
}

export interface ListMetadata {
  fields: FieldMetadata[];
  columns: ListColumn[];
  rowActions?: ListRowAction[];
}

export type ListRowAction = {
  type: 'view-form';
  formId: string;
  icon: string;
  iconSet?: string;
  label?: string;
  iconColor?: string;
};

export interface FormLayoutItem {
  field: string;
  start?: number;
  span?: number;
  display?: FieldDisplay;
  hideLabel?: boolean;
  format?: string;
}

export interface FormMetadata {
  fields: FieldMetadata[];
  projection?: string;
  layout?: {
    title?: string;
    columns: number;
    items: FormLayoutItem[];
  };
}

export interface ListSort {
  field: string;
  direction: 'asc' | 'desc';
}

export type FilterOperator =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'notEquals'
  | 'in'
  | 'notIn'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'before'
  | 'after'
  | 'inThePast';

export type RelativePastPeriod = 'hour' | '24hours' | 'week' | 'month' | 'year';

export type FilterValue =
  string | number | boolean | [string | number, string | number] | (string | number)[];

export interface FilterItem {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
}

export interface ListFilter {
  operator: 'and';
  items: FilterItem[];
}

export interface ListQuery {
  page: number;
  pageSize: number;
  sort?: ListSort[];
  filter?: ListFilter;
}

export interface ListQueryResult {
  items: Record<string, unknown>[];
  totalCount: number;
}
