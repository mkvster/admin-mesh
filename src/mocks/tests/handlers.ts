import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { tests } from './data';
import { applyListQuery } from '../shared/apply-list-query';
import { removeMockEntity } from '../shared/remove-mock-entity';
import { randomMockDelay } from '../shared/random-mock-delay';

export const createTestHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/tests/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      title: 'Tests',
      singularTitle: 'Test',
      idField: 'testId',
      fields: [
        { name: 'testId', label: 'ID', type: 'integer' },
        { name: 'name', label: 'Name', type: 'string' },
        {
          name: 'status',
          label: 'Status',
          type: 'enum',
          display: { type: 'enum', style: 'value' },
          values: [
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
          ],
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
      },
    });
  }),
  http.get(`${apiBaseUrl}/entities/tests/lists/main/metadata`, async () => {
    await delay(randomMockDelay());

    return HttpResponse.json({
      columns: [
        { field: 'testId', sizeType: 'width', size: 80 },
        { field: 'name', sizeType: 'flex', size: 1 },
        { field: 'status', sizeType: 'width', size: 200 },
      ],
    });
  }),
  http.post(`${apiBaseUrl}/entities/tests/lists/main/query`, async ({ request }) => {
    await delay(randomMockDelay());

    const query = (await request.json()) as ListQuery;
    return HttpResponse.json(applyListQuery(tests, query));
  }),
  http.delete(`${apiBaseUrl}/entities/tests/:id`, async ({ params }) => {
    const removed = removeMockEntity(tests, 'testId', String(params['id']));
    return removed
      ? new HttpResponse(null, { status: 204 })
      : new HttpResponse(null, { status: 404 });
  }),
];
