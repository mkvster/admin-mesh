import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { invoices } from './data';
import { applyListQuery } from '../shared/apply-list-query';

export const createInvoiceHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/invoices/metadata`, async () => {
    await delay(1500);

    return HttpResponse.json({
      title: 'Invoices',
      singularTitle: 'Invoice',
      idField: 'invoiceId',
      permissions: { create: true, edit: true, delete: true },
      views: { list: 'main', form: 'edit' }
    });
  }),
  http.get(`${apiBaseUrl}/entities/invoices/lists/main/metadata`, async () => {
    await delay(500);

    return HttpResponse.json({
      fields: [
        { name: 'invoiceId', label: 'ID', type: 'integer' },
        { name: 'invoiceNumber', label: 'Invoice Number', type: 'string' },
        {
          name: 'customerId',
          label: 'Customer',
          type: 'reference',
          reference: { resource: 'customers', listId: 'main', displayField: 'email' }
        },
        { name: 'issueDate', label: 'Issue Date', type: 'date' },
        { name: 'dueDate', label: 'Due Date', type: 'date' },
        {
          name: 'status',
          label: 'Status',
          type: 'enum',
          values: [
            { value: 'draft', label: 'Draft' },
            { value: 'open', label: 'Open' },
            { value: 'paid', label: 'Paid' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'cancelled', label: 'Cancelled' }
          ]
        },
        { name: 'total', label: 'Total', type: 'decimal' },
        { name: 'paidAmount', label: 'Paid Amount', type: 'decimal' }
      ],
      columns: [
        { field: 'invoiceId', sizeType: 'width', size: 80 },
        { field: 'invoiceNumber', sizeType: 'width', size: 150 },
        { field: 'customerId', sizeType: 'width', size: 140 },
        { field: 'issueDate', sizeType: 'width', size: 120 },
        { field: 'dueDate', sizeType: 'width', size: 120 },
        { field: 'status', sizeType: 'width', size: 120, display: { type: 'enum', style: 'label' } },
        { field: 'total', sizeType: 'width', size: 120 },
        { field: 'paidAmount', sizeType: 'width', size: 120 }
      ]
    });
  }),
  http.post(`${apiBaseUrl}/entities/invoices/lists/main/query`, async ({ request }) => {
    await delay(700);
    const query = await request.json() as ListQuery;
    return HttpResponse.json(applyListQuery(invoices, query));
  })
];
