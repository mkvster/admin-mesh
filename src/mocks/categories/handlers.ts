import { delay, HttpResponse, http } from 'msw';
import { EntityLocateRequest, ListQuery } from '../../app/entity/entity-types';
import { categories } from './data';
import { applyListQuery } from '../shared/apply-list-query';
import { removeMockEntity } from '../shared/remove-mock-entity';
import { randomMockDelay } from '../shared/random-mock-delay';
import { locateMockEntity } from '../shared/locate-mock-entity';

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
        form: 'briefCategoryView',
        deleteForm: 'briefCategoryView',
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
  http.get(`${apiBaseUrl}/entities/categories/forms/briefCategoryView/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      projection: 'briefCategoryView',
      layout: {
        columns: 2,
        items: [
          { field: 'name', format: 'jumbo' },
          { field: 'enabled', hideLabel: true },
          { field: 'slug', span: 2 },
          { field: 'description', span: 2 },
        ],
      },
    });
  }),
  http.get(`${apiBaseUrl}/entities/categories/:id`, async ({ params }) => {
    await delay(randomMockDelay());
    const category = categories.find((item) => String(item.categoryId) === String(params['id']));
    return category ? HttpResponse.json(category) : new HttpResponse(null, { status: 404 });
  }),
  http.post(`${apiBaseUrl}/entities/categories/lists/main/query`, async ({ request }) => {
    await delay(randomMockDelay());

    const query = (await request.json()) as ListQuery;
    return HttpResponse.json(applyListQuery(categories, query));
  }),
  http.post(`${apiBaseUrl}/entities/categories/lists/main/locate`, async ({ request }) => {
    const locateRequest = (await request.json()) as EntityLocateRequest;
    return HttpResponse.json(locateMockEntity(categories, 'categoryId', locateRequest));
  }),
  http.post(`${apiBaseUrl}/entities/categories`, async ({ request }) => {
    const value = (await request.json()) as Record<string, unknown>;
    const categoryId = Math.max(...categories.map((item) => item.categoryId)) + 1;
    const { categoryId: _clientProvidedId, ...attributes } = value;
    const category = { categoryId, ...attributes } as (typeof categories)[number];
    categories.push(category);
    return HttpResponse.json(category, { status: 201 });
  }),
  http.patch(`${apiBaseUrl}/entities/categories/:id`, async ({ params, request }) => {
    const category = categories.find((item) => String(item.categoryId) === String(params['id']));
    if (!category) return new HttpResponse(null, { status: 404 });
    Object.assign(category, (await request.json()) as Record<string, unknown>);
    return HttpResponse.json(category);
  }),
  http.delete(`${apiBaseUrl}/entities/categories/:id`, async ({ params }) => {
    const removed = removeMockEntity(categories, 'categoryId', String(params['id']));
    return removed
      ? new HttpResponse(null, { status: 204 })
      : new HttpResponse(null, { status: 404 });
  }),
];
