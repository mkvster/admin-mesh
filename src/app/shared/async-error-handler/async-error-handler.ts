import { ErrorHandler, Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AsyncErrorHandler {
  private readonly errorHandler = inject(ErrorHandler);

  run<T>(operation: Promise<T>, context: string): void {
    void operation.catch((error: unknown) => {
      console.error(context, error);
      this.errorHandler.handleError(error);
    });
  }
}
