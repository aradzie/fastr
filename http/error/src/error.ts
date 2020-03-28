import {
  HttpStatus,
  isClientError,
  isServerError,
  statusCodes,
} from "@webfx-http/status";

export class HttpError extends Error {
  readonly expose: boolean;

  constructor(public readonly status: number, message?: string) {
    super(message ?? statusCodes[status] ?? `${status}`);
    this.name = this.constructor.name;
    const clientError = isClientError(status);
    const serverError = isServerError(status);
    if (!clientError && !serverError) {
      throw new Error(`Invalid HTTP status ${status}`);
    }
    this.expose = clientError;
    const fn = Error.captureStackTrace;
    if (typeof fn === "function") {
      fn(this, this.constructor); // TODO Investigate.
    }
  }
}

export class ClientError extends HttpError {
  constructor(status: number, message?: string) {
    super(status, message);
  }
}

export class ServerError extends HttpError {
  constructor(status: number, message?: string) {
    super(status, message);
  }
}

export class BadRequestError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}

export class UnauthorizedError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}

export class PaymentRequiredError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.PAYMENT_REQUIRED, message);
  }
}

export class ForbiddenError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.FORBIDDEN, message);
  }
}

export class NotFoundError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.NOT_FOUND, message);
  }
}

export class MethodNotAllowedError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.METHOD_NOT_ALLOWED, message);
  }
}

export class NotAcceptableError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.NOT_ACCEPTABLE, message);
  }
}

export class RequestTimeoutError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.REQUEST_TIMEOUT, message);
  }
}

export class LengthRequiredError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.LENGTH_REQUIRED, message);
  }
}

export class PayloadTooLargeError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.PAYLOAD_TOO_LARGE, message);
  }
}

export class UnsupportedMediaTypeError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, message);
  }
}

export class UpgradeRequiredError extends ClientError {
  constructor(message?: string) {
    super(HttpStatus.UPGRADE_REQUIRED, message);
  }
}

export class InternalServerError extends ServerError {
  constructor(message?: string) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}

export class NotImplementedError extends ServerError {
  constructor(message?: string) {
    super(HttpStatus.NOT_IMPLEMENTED, message);
  }
}

export class BadGatewayError extends ServerError {
  constructor(message?: string) {
    super(HttpStatus.BAD_GATEWAY, message);
  }
}

export class ServiceUnavailableError extends ServerError {
  constructor(message?: string) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message);
  }
}
