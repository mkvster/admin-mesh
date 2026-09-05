import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { payments } from './data';
import { invoices } from '../invoices/data';
import { applyListQuery } from '../shared/apply-list-query';

export const createPaymentHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/payments/metadata`, async () => {
    await delay(1500);

    return HttpResponse.json({
      title: 'Payments',
      singularTitle: 'Payment',
      idField: 'paymentId',
      permissions: { create: true, edit: true, delete: true },
      views: { list: 'main', form: 'edit' },
    });
  }),
  http.get(`${apiBaseUrl}/entities/payments/lists/main/metadata`, async () => {
    await delay(500);

    return HttpResponse.json({
      fields: [
        { name: 'paymentId', label: 'ID', type: 'integer' },
        {
          name: 'invoiceId',
          label: 'Invoice',
          type: 'reference',
          reference: { resource: 'invoices', listId: 'main', displayField: 'invoiceNumber' },
        },
        { name: 'paymentDate', label: 'Payment Date', type: 'datetime' },
        { name: 'amount', label: 'Amount', type: 'decimal' },
        {
          name: 'method',
          label: 'Method',
          type: 'enum',
          values: [
            { value: 'card', label: 'Card' },
            { value: 'ach', label: 'ACH' },
            { value: 'check', label: 'Check' },
            { value: 'cash', label: 'Cash' },
          ],
        },
        {
          name: 'status',
          label: 'Status',
          type: 'enum',
          values: [
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
            { value: 'failed', label: 'Failed' },
            { value: 'refunded', label: 'Refunded' },
          ],
        },
        { name: 'reference', label: 'Reference', type: 'string' },
      ],
      columns: [
        { field: 'paymentId', sizeType: 'width', size: 80 },
        {
          field: 'invoiceId',
          sizeType: 'width',
          size: 150,
          display: { type: 'reference', valueField: 'invoiceNumber' },
        },
        { field: 'paymentDate', sizeType: 'width', size: 180 },
        { field: 'amount', sizeType: 'width', size: 120 },
        {
          field: 'method',
          sizeType: 'width',
          size: 110,
          display: { type: 'enum', style: 'label' },
        },
        {
          field: 'status',
          sizeType: 'width',
          size: 120,
          display: { type: 'enum', style: 'label' },
        },
        { field: 'reference', sizeType: 'width', size: 140 },
      ],
    });
  }),
  http.post(`${apiBaseUrl}/entities/payments/lists/main/query`, async ({ request }) => {
    await delay(700);
    const query = (await request.json()) as ListQuery;
    const invoiceById = new Map(invoices.map((invoice) => [invoice.invoiceId, invoice]));
    const rows = payments.map((payment) => ({
      ...payment,
      invoiceNumber: invoiceById.get(payment.invoiceId)?.invoiceNumber,
    }));

    return HttpResponse.json(applyListQuery(rows, query));
  }),
];
