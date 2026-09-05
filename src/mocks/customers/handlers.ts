import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { customers } from './data';
import { applyListQuery } from '../shared/apply-list-query';

export const createCustomerHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/customers/metadata`, async () => {
    await delay(1500);

    return HttpResponse.json({
      title: 'Customers',
      singularTitle: 'Customer',
      idField: 'customerId',
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
  http.get(`${apiBaseUrl}/entities/customers/lists/main/metadata`, async () => {
    await delay(500);

    return HttpResponse.json({
      fields: [
        {
          name: 'customerId',
          label: 'ID',
          type: 'integer',
        },
        {
          name: 'firstName',
          label: 'First Name',
          type: 'string',
        },
        {
          name: 'lastName',
          label: 'Last Name',
          type: 'string',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'string',
        },
        {
          name: 'enabled',
          label: 'Enabled',
          type: 'boolean',
        },
      ],
      columns: [
        { field: 'customerId', sizeType: 'width', size: 80 },
        { field: 'firstName', sizeType: 'flex', size: 1 },
        { field: 'lastName', sizeType: 'flex', size: 1 },
        { field: 'email', sizeType: 'flex', size: 2 },
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
  http.post(`${apiBaseUrl}/entities/customers/lists/main/query`, async ({ request }) => {
    await delay(700);

    const query = (await request.json()) as ListQuery;
    return HttpResponse.json(applyListQuery(customers, query));
  }),
];
