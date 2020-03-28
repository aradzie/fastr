import {
  HttpStatus,
  isClientError,
  isServerError,
  statusCodes,
} from "@webfx-http/status";

export class HttpError extends Error {
  name = "HttpError";
  readonly expose: boolean;

  constructor(public readonly status: number, message?: string) {
    super(message ?? statusCodes[status] ?? `${status}`);
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
  name = "ClientError";

  constructor(status: number, message?: string) {
    super(status, message);
  }
}

export class ServerError extends HttpError {
  name = "ServerError";

  constructor(status: number, message?: string) {
    super(status, message);
  }
}

export class BadRequestError extends ClientError {
  readonly name = "BadRequestError";

  constructor(message?: string) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}

export class UnauthorizedError extends ClientError {
  readonly name = "UnauthorizedError";

  constructor(message?: string) {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}

export class PaymentRequiredError extends ClientError {
  readonly name = "PaymentRequiredError";

  constructor(message?: string) {
    super(HttpStatus.PAYMENT_REQUIRED, message);
  }
}

export class ForbiddenError extends ClientError {
  readonly name = "ForbiddenError";

  constructor(message?: string) {
    super(HttpStatus.FORBIDDEN, message);
  }
}

export class NotFoundError extends ClientError {
  readonly name = "NotFoundError";

  constructor(message?: string) {
    super(HttpStatus.NOT_FOUND, message);
  }
}

export class MethodNotAllowedError extends ClientError {
  readonly name = "MethodNotAllowedError";

  constructor(message?: string) {
    super(HttpStatus.METHOD_NOT_ALLOWED, message);
  }
}

export class NotAcceptableError extends ClientError {
  readonly name = "NotAcceptableError";

  constructor(message?: string) {
    super(HttpStatus.NOT_ACCEPTABLE, message);
  }
}

export class RequestTimeoutError extends ClientError {
  readonly name = "RequestTimeoutError";

  constructor(message?: string) {
    super(HttpStatus.REQUEST_TIMEOUT, message);
  }
}

export class LengthRequiredError extends ClientError {
  readonly name = "LengthRequiredError";

  constructor(message?: string) {
    super(HttpStatus.LENGTH_REQUIRED, message);
  }
}

export class PayloadTooLargeError extends ClientError {
  readonly name = "PayloadTooLargeError";

  constructor(message?: string) {
    super(HttpStatus.PAYLOAD_TOO_LARGE, message);
  }
}

export class UnsupportedMediaTypeError extends ClientError {
  readonly name = "UnsupportedMediaTypeError";

  constructor(message?: string) {
    super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, message);
  }
}

export class UpgradeRequiredError extends ClientError {
  readonly name = "UpgradeRequiredError";

  constructor(message?: string) {
    super(HttpStatus.UPGRADE_REQUIRED, message);
  }
}

export class InternalServerError extends ServerError {
  readonly name = "InternalServerError";

  constructor(message?: string) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}

export class NotImplementedError extends ServerError {
  readonly name = "NotImplementedError";

  constructor(message?: string) {
    super(HttpStatus.NOT_IMPLEMENTED, message);
  }
}

export class BadGatewayError extends ServerError {
  readonly name = "BadGatewayError";

  constructor(message?: string) {
    super(HttpStatus.BAD_GATEWAY, message);
  }
}

export class ServiceUnavailableError extends ServerError {
  readonly name = "ServiceUnavailableError";

  constructor(message?: string) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message);
  }
}
