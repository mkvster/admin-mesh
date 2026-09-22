import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { products } from './data';
import { categories } from '../categories/data';
import { applyListQuery } from '../shared/apply-list-query';
import { removeMockEntity } from '../shared/remove-mock-entity';
import { randomMockDelay } from '../shared/random-mock-delay';

export const createProductHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/products/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      title: 'Products',
      singularTitle: 'Product',
      idField: 'productId',
      fields: [
        { name: 'productId', label: 'ID', type: 'integer' },
        { name: 'name', label: 'Name', type: 'string' },
        { name: 'sku', label: 'SKU', type: 'string' },
        {
          name: 'categoryId',
          label: 'Category',
          type: 'reference',
          display: { type: 'reference', valueField: 'categoryName' },
          reference: { resource: 'categories', listId: 'main', displayField: 'name' },
        },
        {
          name: 'price',
          label: 'Price',
          type: 'decimal',
          display: { type: 'numeric', style: 'currency', currency: 'USD' },
        },
        { name: 'stock', label: 'Stock', type: 'integer' },
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
        deleteForm: 'delete',
      },
    });
  }),
  http.get(`${apiBaseUrl}/entities/products/lists/main/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      columns: [
        { field: 'productId', sizeType: 'width', size: 80 },
        { field: 'name', sizeType: 'flex', size: 1 },
        { field: 'sku', sizeType: 'width', size: 120 },
        {
          field: 'categoryId',
          sizeType: 'width',
          size: 140,
          display: {
            type: 'reference',
            valueField: 'categoryName',
            previewForm: 'briefCategoryView',
          },
        },
        { field: 'price', sizeType: 'width', size: 120 },
        { field: 'stock', sizeType: 'width', size: 100 },
        { field: 'enabled', sizeType: 'width', size: 120 },
      ],
    });
  }),
  http.get(`${apiBaseUrl}/entities/products/forms/delete/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      projection: 'delete',
      layout: {
        columns: 2,
        items: [
          { field: 'name', format: 'jumbo' },
          { field: 'enabled', hideLabel: true },
          { field: 'sku' },
          {
            field: 'categoryId',
            display: { type: 'reference', valueField: 'categoryName' },
          },
          { field: 'price' },
          { field: 'stock' },
        ],
      },
    });
  }),
  http.get(`${apiBaseUrl}/entities/products/forms/edit/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      projection: 'edit',
      layout: {
        columns: 2,
        items: [
          { field: 'name' },
          { field: 'sku' },
          { field: 'categoryId' },
          { field: 'price' },
          { field: 'stock' },
          { field: 'enabled' },
        ],
      },
    });
  }),
  http.get(`${apiBaseUrl}/entities/products/:id`, async ({ params }) => {
    await delay(randomMockDelay());
    const product = products.find((item) => String(item.productId) === String(params['id']));
    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      ...product,
      categoryName: categories.find((category) => category.categoryId === product.categoryId)?.name,
    });
  }),
  http.patch(`${apiBaseUrl}/entities/products/:id`, async ({ params, request }) => {
    const product = products.find((item) => String(item.productId) === String(params['id']));
    if (!product) return new HttpResponse(null, { status: 404 });
    Object.assign(product, (await request.json()) as Record<string, unknown>);
    return HttpResponse.json({
      ...product,
      categoryName: categories.find((category) => category.categoryId === product.categoryId)?.name,
    });
  }),
  http.post(`${apiBaseUrl}/entities/products/lists/main/query`, async ({ request }) => {
    await delay(randomMockDelay());

    const query = (await request.json()) as ListQuery;
    const categoryById = new Map(categories.map((category) => [category.categoryId, category]));
    const rows = products.map((product) => ({
      ...product,
      categoryName: categoryById.get(product.categoryId)?.name,
    }));

    return HttpResponse.json(applyListQuery(rows, query));
  }),
  http.post(`${apiBaseUrl}/entities/products`, async ({ request }) => {
    await delay(randomMockDelay());

    const payload = (await request.json()) as Record<string, unknown>;
    const productId = Math.max(...products.map((product) => product.productId)) + 1;
    const { productId: _clientProvidedId, ...attributes } = payload;
    const product = { ...attributes, productId } as (typeof products)[number];
    products.push(product);

    return HttpResponse.json(product, { status: 201 });
  }),
  http.delete(`${apiBaseUrl}/entities/products/:id`, async ({ params }) => {
    const removed = removeMockEntity(products, 'productId', String(params['id']));
    return removed
      ? new HttpResponse(null, { status: 204 })
      : new HttpResponse(null, { status: 404 });
  }),
];
