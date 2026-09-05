import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { categories } from './data';
import { applyListQuery } from '../shared/apply-list-query';

export const createCategoryHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/categories/metadata`, async () => {
    await delay(1500);

    return HttpResponse.json({
      title: 'Categories',
      singularTitle: 'Category',
      idField: 'categoryId',
      permissions: {
        create: true,
        edit: true,
        delete: true,
      },
      views: {
        list: 'main',
        form: 'edit',
      },
    });
  }),
  http.get(`${apiBaseUrl}/entities/categories/lists/main/metadata`, async () => {
    await delay(500);

    return HttpResponse.json({
      fields: [
        {
          name: 'categoryId',
          label: 'ID',
          type: 'integer',
        },
        {
          name: 'name',
          label: 'Name',
          type: 'string',
        },
        {
          name: 'slug',
          label: 'Slug',
          type: 'string',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'string',
        },
        {
          name: 'enabled',
          label: 'Enabled',
          type: 'boolean',
        },
      ],
      columns: [
        { field: 'categoryId', sizeType: 'width', size: 80 },
        { field: 'name', sizeType: 'flex', size: 1 },
        { field: 'slug', sizeType: 'width', size: 160 },
        { field: 'description', sizeType: 'flex', size: 2 },
        {
          field: 'enabled',
          sizeType: 'width',
          size: 120,
          display: {
            type: 'boolean',
            style: 'checkbox',
          },
        },
      ],
    });
  }),
  http.post(`${apiBaseUrl}/entities/categories/lists/main/query`, async ({ request }) => {
    await delay(700);

    const query = (await request.json()) as ListQuery;
    return HttpResponse.json(applyListQuery(categories, query));
  }),
];
