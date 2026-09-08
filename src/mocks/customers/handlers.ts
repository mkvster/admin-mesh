import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { customers } from './data';
import { applyListQuery } from '../shared/apply-list-query';
import { removeMockEntity } from '../shared/remove-mock-entity';

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
      rowActions: [
        {
          type: 'view-form',
          formId: 'briefview',
          label: 'Name',
          icon: 'visibility',
          iconSet: 'material-icons-outlined',
          iconColor: 'rgb(29, 212, 38)',
        },
        {
          type: 'view-form',
          formId: 'view',
          label: 'Details',
          icon: 'person',
          iconSet: 'material-icons-outlined',
          iconColor: '#1565c0',
        },
      ],
    });
  }),
  http.get(`${apiBaseUrl}/entities/customers/forms/view/metadata`, async () => {
    await delay(400);

    return HttpResponse.json({
      projection: 'view',
      fields: [
        { name: 'name', label: 'Name', type: 'string' },
        { name: 'email', label: 'Email', type: 'string' },
        { name: 'enabled', label: 'Enabled', type: 'boolean' },
      ],
      layout: {
        columns: 2,
        items: [
          { field: 'name', format: 'jumbo' },
          { field: 'enabled', display: { type: 'boolean', style: 'icon' }, format: 'jumbo' },
          { field: 'email', span: 2 },
        ],
      },
    });
  }),
  http.get(`${apiBaseUrl}/entities/customers/forms/briefview/metadata`, async () => {
    await delay(400);

    return HttpResponse.json({
      projection: 'view',
      fields: [
        { name: 'name', label: 'Name', type: 'string' },
        { name: 'email', label: 'Email', type: 'string' },
      ],
      layout: {
        columns: 1,
        items: [{ field: 'name', format: 'jumbo' }, { field: 'email' }],
      },
    });
  }),
  http.get(`${apiBaseUrl}/entities/customers/:id`, async ({ params }) => {
    await delay(500);
    const customer = customers.find((item) => String(item.customerId) === String(params['id']));
    return customer
      ? HttpResponse.json({
          customerId: customer.customerId,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          enabled: customer.enabled,
        })
      : new HttpResponse(null, { status: 404 });
  }),
  http.post(`${apiBaseUrl}/entities/customers/lists/main/query`, async ({ request }) => {
    await delay(700);

    const query = (await request.json()) as ListQuery;
    return HttpResponse.json(applyListQuery(customers, query));
  }),
  http.delete(`${apiBaseUrl}/entities/customers/:id`, async ({ params }) => {
    const removed = removeMockEntity(customers, 'customerId', String(params['id']));
    return removed
      ? new HttpResponse(null, { status: 204 })
      : new HttpResponse(null, { status: 404 });
  }),
];
