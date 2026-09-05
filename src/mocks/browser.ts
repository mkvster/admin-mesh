import { setupWorker } from 'msw/browser';
import { createHandlers } from './handlers';

export const createWorker = (apiBaseUrl: string) => setupWorker(...createHandlers(apiBaseUrl));
