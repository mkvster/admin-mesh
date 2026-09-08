import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { payments } from './data';
import { invoices } from '../invoices/data';
import { applyListQuery } from '../shared/apply-list-query';
import { removeMockEntity } from '../shared/remove-mock-entity';
import { randomMockDelay } from '../shared/random-mock-delay';

export const createPaymentHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/payments/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      title: 'Payments',
      singularTitle: 'Payment',
      idField: 'paymentId',
      fields: [
        { name: 'paymentId', label: 'ID', type: 'integer' },
        {
          name: 'invoiceId',
          label: 'Invoice',
          type: 'reference',
          display: { type: 'reference', valueField: 'invoiceNumber' },
          reference: { resource: 'invoices', listId: 'main', displayField: 'invoiceNumber' },
        },
        { name: 'paymentDate', label: 'Payment Date', type: 'datetime' },
        {
          name: 'amount',
          label: 'Amount',
          type: 'decimal',
          display: { type: 'numeric', style: 'currency', currency: 'USD' },
        },
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
      permissions: { create: true, edit: true, delete: true },
      views: { list: 'main', form: 'edit' },
    });
  }),
  http.get(`${apiBaseUrl}/entities/payments/lists/main/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      columns: [
        { field: 'paymentId', sizeType: 'width', size: 80 },
        { field: 'invoiceId', sizeType: 'width', size: 150 },
        {
          field: 'paymentDate',
          sizeType: 'width',
          size: 180,
          display: { type: 'datetime', style: 'medium' },
        },
        { field: 'amount', sizeType: 'width', size: 120 },
        { field: 'method', sizeType: 'width', size: 110 },
        { field: 'status', sizeType: 'width', size: 120 },
        { field: 'reference', sizeType: 'width', size: 140 },
      ],
      rowActions: [
        {
          type: 'view-form',
          formId: 'view',
          label: 'View Payment',
          icon: 'receipt',
          iconColor: '#1565c0',
        },
      ],
    });
  }),
  http.get(`${apiBaseUrl}/entities/payments/forms/view/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      projection: 'view',
      layout: {
        columns: 2,
        items: [
          { field: 'amount', format: 'jumbo' },
          { field: 'status', hideLabel: true },
          { field: 'reference', span: 2 },
          { field: 'invoiceId', span: 2 },
          { field: 'paymentDate', span: 2 },
          { field: 'method', span: 2 },
        ],
      },
    });
  }),
  http.get(`${apiBaseUrl}/entities/payments/:id`, async ({ params }) => {
    await delay(randomMockDelay());
    const payment = payments.find((item) => String(item.paymentId) === String(params['id']));
    if (!payment) {
      return new HttpResponse(null, { status: 404 });
    }

    const invoice = invoices.find((item) => item.invoiceId === payment.invoiceId);
    return HttpResponse.json({
      paymentId: payment.paymentId,
      invoiceId: payment.invoiceId,
      invoiceNumber: invoice?.invoiceNumber,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      reference: payment.reference,
    });
  }),
  http.post(`${apiBaseUrl}/entities/payments/lists/main/query`, async ({ request }) => {
    await delay(randomMockDelay());
    const query = (await request.json()) as ListQuery;
    const invoiceById = new Map(invoices.map((invoice) => [invoice.invoiceId, invoice]));
    const rows = payments.map((payment) => ({
      ...payment,
      invoiceNumber: invoiceById.get(payment.invoiceId)?.invoiceNumber,
    }));

    return HttpResponse.json(applyListQuery(rows, query));
  }),
  http.delete(`${apiBaseUrl}/entities/payments/:id`, async ({ params }) => {
    const removed = removeMockEntity(payments, 'paymentId', String(params['id']));
    return removed
      ? new HttpResponse(null, { status: 204 })
      : new HttpResponse(null, { status: 404 });
  }),
];
