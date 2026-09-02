import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { products } from './data';
import { applyListQuery } from '../shared/apply-list-query';

export const createProductHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/products/metadata`, async () => {
    await delay(1500);

    return HttpResponse.json({
      title: 'Products',
      singularTitle: 'Product',
      idField: 'productId',
      permissions: {
        create: true,
        edit: true,
        delete: true
      },
      views: {
        list: 'main',
        form: 'edit'
      }
    });
  }),
  http.get(`${apiBaseUrl}/entities/products/lists/main/metadata`, async () => {
    await delay(500);

    return HttpResponse.json({
      fields: [
        {
          name: 'productId',
          label: 'ID',
          type: 'integer'
        },
        {
          name: 'name',
          label: 'Name',
          type: 'string'
        },
        {
          name: 'sku',
          label: 'SKU',
          type: 'string'
        },
        {
          name: 'category',
          label: 'Category',
          type: 'string'
        },
        {
          name: 'price',
          label: 'Price',
          type: 'decimal'
        },
        {
          name: 'stock',
          label: 'Stock',
          type: 'integer'
        },
        {
          name: 'enabled',
          label: 'Enabled',
          type: 'boolean'
        }
      ],
      columns: [
        { field: 'productId', sizeType: 'width', size: 80 },
        { field: 'name', sizeType: 'flex', size: 1 },
        { field: 'sku', sizeType: 'width', size: 120 },
        { field: 'category', sizeType: 'width', size: 140 },
        {
          field: 'price',
          sizeType: 'width',
          size: 120,
          display: {
            type: 'currency',
            currency: 'USD'
          }
        },
        { field: 'stock', sizeType: 'width', size: 100 },
        {
          field: 'enabled',
          sizeType: 'width',
          size: 120,
          display: {
            type: 'boolean',
            style: 'checkbox'
          }
        }
      ]
    });
  }),
  http.post(`${apiBaseUrl}/entities/products/lists/main/query`, async ({ request }) => {
    await delay(700);

    const query = await request.json() as ListQuery;
    return HttpResponse.json(applyListQuery(products, query));
  })
];
