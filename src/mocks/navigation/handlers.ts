import { HttpResponse, http } from 'msw';

export const createNavigationHandlers = (apiBaseUrl: string) => [
  http.get(`${apiBaseUrl}/navigation`, () =>
    HttpResponse.json({
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
    })
  )
];
