import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { invoices } from './data';
import { customers } from '../customers/data';
import { applyListQuery } from '../shared/apply-list-query';
import { removeMockEntity } from '../shared/remove-mock-entity';
import { randomMockDelay } from '../shared/random-mock-delay';

export const createInvoiceHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/invoices/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      title: 'Invoices',
      singularTitle: 'Invoice',
      idField: 'invoiceId',
      fields: [
        { name: 'invoiceId', label: 'ID', type: 'integer' },
        { name: 'invoiceNumber', label: 'Invoice Number', type: 'string' },
        {
          name: 'customerId',
          label: 'Customer',
          type: 'reference',
          reference: { resource: 'customers', listId: 'main', displayField: 'email' },
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
            { value: 'cancelled', label: 'Cancelled' },
          ],
        },
        { name: 'total', label: 'Total', type: 'decimal' },
        { name: 'paidAmount', label: 'Paid Amount', type: 'decimal' },
      ],
      permissions: { create: true, edit: true, delete: true },
      views: { list: 'main', form: 'edit' },
    });
  }),
  http.get(`${apiBaseUrl}/entities/invoices/lists/main/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      columns: [
        { field: 'invoiceId', sizeType: 'width', size: 50 },
        { field: 'invoiceNumber', sizeType: 'width', size: 100 },
        {
          field: 'customerId',
          sizeType: 'width',
          size: 250,
          display: { type: 'reference', valueField: 'customerDisplayName' },
        },
        { field: 'issueDate', sizeType: 'width', size: 120 },
        { field: 'dueDate', sizeType: 'width', size: 120 },
        { field: 'status', sizeType: 'width', size: 120 },
        { field: 'total', sizeType: 'width', size: 120 },
        { field: 'paidAmount', sizeType: 'width', size: 120 },
      ],
    });
  }),
  http.post(`${apiBaseUrl}/entities/invoices/lists/main/query`, async ({ request }) => {
    await delay(randomMockDelay());
    const query = (await request.json()) as ListQuery;
    const customerById = new Map(customers.map((customer) => [customer.customerId, customer]));
    const rows = invoices.map((invoice) => ({
      ...invoice,
      customerDisplayName: formatCustomerDisplayName(customerById.get(invoice.customerId)),
    }));

    return HttpResponse.json(applyListQuery(rows, query));
  }),
  http.delete(`${apiBaseUrl}/entities/invoices/:id`, async ({ params }) => {
    const removed = removeMockEntity(invoices, 'invoiceId', String(params['id']));
    return removed
      ? new HttpResponse(null, { status: 204 })
      : new HttpResponse(null, { status: 404 });
  }),
];

function formatCustomerDisplayName(
  customer: (typeof customers)[number] | undefined,
): string | undefined {
  return customer ? `${customer.firstName} ${customer.lastName} (${customer.email})` : undefined;
}
