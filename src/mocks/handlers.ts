import { delay, http, HttpResponse } from 'msw';

export const createHandlers = (apiBaseUrl: string) => [
  // Navigation API
  http.get(`${apiBaseUrl}/navigation`, () => {
    return HttpResponse.json({
      sections: [
        {
          id: 'sales',
          title: 'Sales',
          nodes: [
            {
              id: 'customers',
              title: 'Customers',
              type: 'rest-entity',
              icon: {
                name: 'people',
                color: '#2f80ed'
              },
              config: {
                resource: 'customers'
              }
            },
            {
              id: 'products',
              title: 'Products',
              type: 'rest-entity',
              icon: {
                name: 'inventory_2',
                color: '#7b61ff'
              },
              config: {
                resource: 'products'
              }
            },
            {
              id: 'categories',
              title: 'Categories',
              type: 'rest-entity',
              icon: {
                name: 'category',
                color: '#27ae60'
              },
              config: {
                resource: 'categories'
              }
            }
          ]
        },
        {
          id: 'accounting',
          title: 'Accounting',
          nodes: [
            {
              id: 'invoices',
              title: 'Invoices',
              type: 'rest-entity',
              icon: {
                name: 'receipt_long',
                color: '#f2994a'
              },
              config: {
                resource: 'invoices'
              }
            },
            {
              id: 'test',
              title: 'Test Very Long Title That Should Be Properly Processed and Displayed in the Navigation UI',
              type: 'rest-entity',
              config: {
                resource: 'tests'
              }
            },            
            {
              id: 'payments',
              title: 'Payments',
              type: 'rest-entity',
              icon: {
                name: 'payments',
                color: '#eb5757'
              },
              config: {
                resource: 'payments'
              }
            }
          ]
        }
      ]
    });
  }),
  
  // Сustomers Metadata API - with simulated delay 1500ms
  http.get(`${apiBaseUrl}/entities/customers/metadata`, async () => {
    await delay(1500);

    return HttpResponse.json({
      title: 'Customers',
      singularTitle: 'Customer',
      idField: 'customerId',

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

  // Tests Metadata API - with simulated delay 1500ms
  http.get(`${apiBaseUrl}/entities/tests/metadata`, async () => {
    await delay(1500);

    return HttpResponse.json({
      title: 'Tests',
      singularTitle: 'Test',
      idField: 'testId',

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

  // Customers List 'main' Metadata API - with simulated delay 500ms
  http.get(`${apiBaseUrl}/entities/customers/lists/main/metadata`, async () => {
      await delay(500);

      return HttpResponse.json({
        fields: [
          {
            name: 'customerId',
            label: 'ID',
            type: 'integer'
          },
          {
            name: 'firstName',
            label: 'First Name',
            type: 'string'
          },
          {
            name: 'lastName',
            label: 'Last Name',
            type: 'string'
          },
          {
            name: 'email',
            label: 'Email',
            type: 'string'
          },
          {
            name: 'isActive',
            label: 'IsActive',
            type: 'boolean'
          }
        ],

        columns: [
          { field: 'customerId', sizeType: 'width', size: 80 },
          { field: 'firstName', sizeType: 'flex', size: 1 },
          { field: 'lastName', sizeType: 'flex', size: 1 },
          { field: 'email', sizeType: 'flex', size: 2 },
          { 
            field: 'isActive', 
            sizeType: 'width', 
            size: 120, 
            display: { 
              type: 'boolean', 
              style: 'checkbox' 
            } 
          }
        ]
      });
    }
  ),

  // Customers List 'main' Query API 
  http.post(`${apiBaseUrl}/entities/customers/lists/main/query`, async ({ request }) => {
      await delay(700);

      const query = await request.json();

      console.log('Customers list query:', query);

      return HttpResponse.json({
        items: [
          {
            customerId: 1,
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            isActive: true
          },
          {
            customerId: 2,
            firstName: 'Mary',
            lastName: 'Johnson',
            email: 'mary.johnson@example.com',
            isActive: true
          },
          {
            customerId: 3,
            firstName: 'Robert',
            lastName: 'Brown',
            email: 'robert.brown@example.com',
            isActive: false
          },
          {
            customerId: 4,
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily.davis@example.com',
            isActive: true
          },
          {
            customerId: 5,
            firstName: 'Michael',
            lastName: 'Miller',
            email: 'michael.miller@example.com',
            isActive: false
          },
          {
            customerId: 6,
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah.wilson@example.com',
            isActive: true
          },
          {
            customerId: 7,
            firstName: 'David',
            lastName: 'Moore',
            email: 'david.moore@example.com',
            isActive: true
          },
          {
            customerId: 8,
            firstName: 'Jessica',
            lastName: 'Taylor',
            email: 'jessica.taylor@example.com',
            isActive: false
          },
          {
            customerId: 9,
            firstName: 'Daniel',
            lastName: 'Anderson',
            email: 'daniel.anderson@example.com',
            isActive: true
          },
          {
            customerId: 10,
            firstName: 'Sophia',
            lastName: 'Thomas',
            email: 'sophia.thomas@example.com',
            isActive: true
          },
          {
            customerId: 11,
            firstName: 'Matthew',
            lastName: 'Jackson',
            email: 'matthew.jackson@example.com',
            isActive: false
          },
          {
            customerId: 12,
            firstName: 'Olivia',
            lastName: 'White',
            email: 'olivia.white@example.com',
            isActive: true
          },
          {
            customerId: 13,
            firstName: 'James',
            lastName: 'Harris',
            email: 'james.harris@example.com',
            isActive: true
          },
          {
            customerId: 14,
            firstName: 'Ava',
            lastName: 'Martin',
            email: 'ava.martin@example.com',
            isActive: false
          },
          {
            customerId: 15,
            firstName: 'Benjamin',
            lastName: 'Thompson',
            email: 'benjamin.thompson@example.com',
            isActive: true
          },
          {
            customerId: 16,
            firstName: 'Mia',
            lastName: 'Garcia',
            email: 'mia.garcia@example.com',
            isActive: true
          },
          {
            customerId: 17,
            firstName: 'Ethan',
            lastName: 'Martinez',
            email: 'ethan.martinez@example.com',
            isActive: false
          },
          {
            customerId: 18,
            firstName: 'Isabella',
            lastName: 'Robinson',
            email: 'isabella.robinson@example.com',
            isActive: true
          },
          {
            customerId: 19,
            firstName: 'Alexander',
            lastName: 'Clark',
            email: 'alexander.clark@example.com',
            isActive: true
          },
          {
            customerId: 20,
            firstName: 'Charlotte',
            lastName: 'Rodriguez',
            email: 'charlotte.rodriguez@example.com',
            isActive: false
          },
          {
            customerId: 21,
            firstName: 'Henry',
            lastName: 'Lewis',
            email: 'henry.lewis@example.com',
            isActive: true
          },
          {
            customerId: 22,
            firstName: 'Amelia',
            lastName: 'Lee',
            email: 'amelia.lee@example.com',
            isActive: true
          },
          {
            customerId: 23,
            firstName: 'William',
            lastName: 'Walker',
            email: 'william.walker@example.com',
            isActive: false
          },
          {
            customerId: 24,
            firstName: 'Harper',
            lastName: 'Hall',
            email: 'harper.hall@example.com',
            isActive: true
          },
          {
            customerId: 25,
            firstName: 'Lucas',
            lastName: 'Allen',
            email: 'lucas.allen@example.com',
            isActive: true
          }
        ],
        totalCount: 25
      });
    }
  ),

  // Tests List 'main' Metadata API - with simulated delay 500ms
  http.get(`${apiBaseUrl}/entities/tests/lists/main/metadata`, async () => {
      await delay(500);

      return HttpResponse.json({
        fields: [
          {
            name: 'testId',
            label: 'ID',
            type: 'integer'
          },
          {
            name: 'name',
            label: 'Name',
            type: 'string'
          },
          {
            name: 'status',
            label: 'Status',
            type: 'enum',
            values: [
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
              { value: 'archived', label: 'Archived' }
            ]
          }
        ],

        columns: [
          { field: 'testId', sizeType: 'width', size: 80 },
          { field: 'name', sizeType: 'flex', size: 1 },
          { field: 'status', sizeType: 'width', size: 200, display: { type: 'enum', style: 'label' } }
        ]
      });
    }
  ),
  
  // Tests List 'main' Query API
  http.post(`${apiBaseUrl}/entities/tests/lists/main/query`, async ({ request }) => {
      await delay(700);

      const query = await request.json();

      console.log('Tests list query:', query);

      return HttpResponse.json({
        items: [
          {
            testId: 1,
            name: 'Smoke Test',
            status: 'active'
          },
          {
            testId: 2,
            name: 'Regression Test',
            status: 'draft'
          },
          {
            testId: 3,
            name: 'Integration Test',
            status: 'active'
          },
          {
            testId: 4,
            name: 'Acceptance Test',
            status: 'archived'
          },
          {
            testId: 5,
            name: 'E2E Test',
            status: 'active'
          }
        ],
        totalCount: 5
      });
    }
  )
];
