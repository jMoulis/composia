import type { ErrorObject } from 'ajv';

export interface CustomExecutionErrorOptions {
  message: string;
  context?: string;
  errors: ErrorObject[];
  [key: string]: any;
}

export class CustomExecutionError extends Error {
  context?: string;
  [key: string]: any;

  constructor(options: CustomExecutionErrorOptions) {
    super(options.message);
    this.name = 'CustomExecutionError';
    this.context = options.context;

    // Assign any additional properties
    Object.keys(options).forEach((key) => {
      if (key !== 'message' && key !== 'context') {
        this[key] = options[key];
      }
    });

    // Maintains proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomExecutionError);
    }
  }
}