import { delay, HttpResponse, http } from 'msw';
import { ListQuery } from '../../app/entity/entity-types';
import { tests } from './data';
import { applyListQuery } from '../shared/apply-list-query';

export const createTestHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/entities/tests/metadata`, async () => {
    await delay(1500);

    return HttpResponse.json({
      title: 'Tests',
      singularTitle: 'Test',
      idField: 'testId',
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
    await delay(500);

    return HttpResponse.json({
      fields: [
        {
          name: 'testId',
          label: 'ID',
          type: 'integer',
        },
        {
          name: 'name',
          label: 'Name',
          type: 'string',
        },
        {
          name: 'status',
          label: 'Status',
          type: 'enum',
          values: [
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
          ],
        },
      ],
      columns: [
        { field: 'testId', sizeType: 'width', size: 80 },
        { field: 'name', sizeType: 'flex', size: 1 },
        {
          field: 'status',
          sizeType: 'width',
          size: 200,
          display: { type: 'enum', style: 'label' },
        },
      ],
    });
  }),
  http.post(`${apiBaseUrl}/entities/tests/lists/main/query`, async ({ request }) => {
    await delay(700);

    const query = (await request.json()) as ListQuery;
    return HttpResponse.json(applyListQuery(tests, query));
  }),
];
