import { isClientError, isServerError, statusMessage } from "@fastr/status";

const cache = new Map<number, { new (): HttpError }>();

export type HttpErrorOptions = ErrorOptions & {
  readonly expose?: boolean | null;
  readonly description?: string | null;
};

export class HttpError extends Error {
  declare readonly status: number;
  declare readonly expose: boolean;
  declare readonly description: string | null;

  constructor(status: number, message?: string, options?: HttpErrorOptions) {
    super(message ?? statusMessage(status), options);
    assertValidErrorStatusCode(status);
    const expose = options?.expose ?? isClientError(status);
    const description = options?.description ?? null;
    Object.defineProperty(this, "name", {
      value: `HttpError [${status}]`,
    });
    Object.defineProperty(this, "status", {
      value: status,
    });
    Object.defineProperty(this, "expose", {
      value: expose,
    });
    Object.defineProperty(this, "description", {
      value: description,
    });
  }

  get [Symbol.toStringTag](): string {
    return "HttpError";
  }
}

/**
 * Creates new error constructor with the given options.
 * @param status HTTP status code.
 */
export function createError(status: number): {
  new (message?: string, options?: HttpErrorOptions): HttpError;
} {
  assertValidErrorStatusCode(status);
  let ctor = cache.get(status);
  if (ctor == null) {
    ctor = class extends HttpError {
      constructor(message?: string, options?: HttpErrorOptions) {
        super(status, message, options);
      }
    };
    cache.set(status, ctor);
  }
  return ctor;
}

export const BadRequestError = createError(400);
export const UnauthorizedError = createError(401);
export const PaymentRequiredError = createError(402);
export const ForbiddenError = createError(403);
export const NotFoundError = createError(404);
export const MethodNotAllowedError = createError(405);
export const NotAcceptableError = createError(406);
export const RequestTimeoutError = createError(408);
export const LengthRequiredError = createError(411);
export const PayloadTooLargeError = createError(413);
export const UnsupportedMediaTypeError = createError(415);
export const UpgradeRequiredError = createError(426);
export const InternalServerError = createError(500);
export const NotImplementedError = createError(501);
export const BadGatewayError = createError(502);
export const ServiceUnavailableError = createError(503);

function assertValidErrorStatusCode(status: number): void {
  if (!isClientError(status) && !isServerError(status)) {
    throw new TypeError(`Invalid HTTP error status code ${status}.`);
  }
}
