export class ApiError extends Error {
  code: string;
  status: number;
  isOperational: boolean;

  constructor(
    code: string,
    status: number,
    message: string | undefined,
    isOperational = true,
    stack: string = '',
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.isOperational = isOperational;

    if (stack !== '') {
      this.stack = stack;
    } else Error.captureStackTrace(this, this.constructor);
  }
}
