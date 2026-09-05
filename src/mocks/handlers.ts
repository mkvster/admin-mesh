import { createCategoryHandlers } from './categories/handlers';
import { createCustomerHandlers } from './customers/handlers';
import { createInvoiceHandlers } from './invoices/handlers';
import { createNavigationHandlers } from './navigation/handlers';
import { createPaymentHandlers } from './payments/handlers';
import { createProductHandlers } from './products/handlers';
import { createTestHandlers } from './tests/handlers';

export const createHandlers = (baseUrl: string) => [
  ...createNavigationHandlers(baseUrl),
  ...createCustomerHandlers(baseUrl),
  ...createProductHandlers(baseUrl),
  ...createCategoryHandlers(baseUrl),
  ...createInvoiceHandlers(baseUrl),
  ...createPaymentHandlers(baseUrl),
  ...createTestHandlers(baseUrl),
];
