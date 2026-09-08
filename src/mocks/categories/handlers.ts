import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { categories } from './data';
import { applyListQuery } from '../shared/apply-list-query';
import { removeMockEntity } from '../shared/remove-mock-entity';
import { randomMockDelay } from '../shared/random-mock-delay';

export const createCategoryHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/categories/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      title: 'Categories',
      singularTitle: 'Category',
      idField: 'categoryId',
      fields: [
        { name: 'categoryId', label: 'ID', type: 'integer' },
        { name: 'name', label: 'Name', type: 'string' },
        { name: 'slug', label: 'Slug', type: 'string' },
        { name: 'description', label: 'Description', type: 'string' },
        {
          name: 'enabled',
          label: 'Enabled',
          type: 'boolean',
          display: { type: 'boolean', style: 'checkbox' },
        },
      ],
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
    await delay(randomMockDelay());

    return HttpResponse.json({
      columns: [
        { field: 'categoryId', sizeType: 'width', size: 80 },
        { field: 'name', sizeType: 'flex', size: 1 },
        { field: 'slug', sizeType: 'width', size: 160 },
        { field: 'description', sizeType: 'flex', size: 2 },
        { field: 'enabled', sizeType: 'width', size: 120 },
      ],
    });
  }),
  http.post(`${apiBaseUrl}/entities/categories/lists/main/query`, async ({ request }) => {
    await delay(randomMockDelay());

    const query = (await request.json()) as ListQuery;
    return HttpResponse.json(applyListQuery(categories, query));
  }),
  http.delete(`${apiBaseUrl}/entities/categories/:id`, async ({ params }) => {
    const removed = removeMockEntity(categories, 'categoryId', String(params['id']));
    return removed
      ? new HttpResponse(null, { status: 204 })
      : new HttpResponse(null, { status: 404 });
  }),
];
