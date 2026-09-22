import { delay, HttpResponse, http } from 'msw';
import { EntityLocateRequest, ListQuery } from '../../app/entity/entity-types';
import { invoices } from './data';
import { customers } from '../customers/data';
import { applyListQuery } from '../shared/apply-list-query';
import { removeMockEntity } from '../shared/remove-mock-entity';
import { randomMockDelay } from '../shared/random-mock-delay';
import { locateMockEntity } from '../shared/locate-mock-entity';

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
          display: { type: 'reference', valueField: 'customerDisplayName' },
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
        {
          name: 'total',
          label: 'Total',
          type: 'decimal',
          display: { type: 'numeric', style: 'currency', currency: 'USD' },
        },
        {
          name: 'paidAmount',
          label: 'Paid Amount',
          type: 'decimal',
          display: { type: 'numeric', style: 'currency', currency: 'USD' },
        },
      ],
      permissions: { create: true, edit: true, delete: true },
      views: { list: 'main', form: 'invoiceBriefView', deleteForm: 'invoiceBriefView' },
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
          display: {
            type: 'reference',
            valueField: 'customerDisplayName',
            previewForm: 'compactCustomerView',
          },
        },
        { field: 'issueDate', sizeType: 'width', size: 120 },
        { field: 'dueDate', sizeType: 'width', size: 120 },
        { field: 'status', sizeType: 'width', size: 120 },
        { field: 'total', sizeType: 'width', size: 120 },
        { field: 'paidAmount', sizeType: 'width', size: 120 },
      ],
    });
  }),
  http.get(`${apiBaseUrl}/entities/invoices/forms/invoiceBriefView/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      projection: 'delete',
      layout: {
        columns: 2,
        items: [
          { field: 'invoiceNumber', format: 'jumbo' },
          { field: 'status', hideLabel: true },
          {
            field: 'customerId',
            span: 2,
            display: { type: 'reference', valueField: 'customerDisplayName' },
          },
          { field: 'issueDate' },
          { field: 'dueDate' },
          { field: 'total' },
          { field: 'paidAmount' },
        ],
      },
    });
  }),
  http.get(`${apiBaseUrl}/entities/invoices/:id`, async ({ params }) => {
    await delay(randomMockDelay());
    const invoice = invoices.find((item) => String(item.invoiceId) === String(params['id']));
    if (!invoice) {
      return new HttpResponse(null, { status: 404 });
    }

    const customer = customers.find((item) => item.customerId === invoice.customerId);
    return HttpResponse.json({
      ...invoice,
      customerDisplayName: formatCustomerDisplayName(customer),
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
  http.post(`${apiBaseUrl}/entities/invoices/lists/main/locate`, async ({ request }) => {
    const locateRequest = (await request.json()) as EntityLocateRequest;
    return HttpResponse.json(locateMockEntity(invoices, 'invoiceId', locateRequest));
  }),
  http.patch(`${apiBaseUrl}/entities/invoices/:id`, async ({ params, request }) => {
    const invoice = invoices.find((item) => String(item.invoiceId) === String(params['id']));
    if (!invoice) return new HttpResponse(null, { status: 404 });
    Object.assign(invoice, (await request.json()) as Record<string, unknown>);
    return HttpResponse.json(invoice);
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
