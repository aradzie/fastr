import { HttpStatus, isClientError, isServerError } from "@webfx-http/status";
import {
  BadGatewayError,
  BadRequestError,
  ClientError,
  ForbiddenError,
  InternalServerError,
  LengthRequiredError,
  MethodNotAllowedError,
  NotAcceptableError,
  NotFoundError,
  NotImplementedError,
  PayloadTooLargeError,
  PaymentRequiredError,
  RequestTimeoutError,
  ServerError,
  ServiceUnavailableError,
  UnauthorizedError,
  UnsupportedMediaTypeError,
  UpgradeRequiredError,
} from "./error";

export function throwError(status: number, statusText?: string): void {
  if (isClientError(status)) {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        throw new BadRequestError(statusText);
      case HttpStatus.UNAUTHORIZED:
        throw new UnauthorizedError(statusText);
      case HttpStatus.PAYMENT_REQUIRED:
        throw new PaymentRequiredError(statusText);
      case HttpStatus.FORBIDDEN:
        throw new ForbiddenError(statusText);
      case HttpStatus.NOT_FOUND:
        throw new NotFoundError(statusText);
      case HttpStatus.METHOD_NOT_ALLOWED:
        throw new MethodNotAllowedError(statusText);
      case HttpStatus.NOT_ACCEPTABLE:
        throw new NotAcceptableError(statusText);
      case HttpStatus.REQUEST_TIMEOUT:
        throw new RequestTimeoutError(statusText);
      case HttpStatus.LENGTH_REQUIRED:
        throw new LengthRequiredError(statusText);
      case HttpStatus.PAYLOAD_TOO_LARGE:
        throw new PayloadTooLargeError(statusText);
      case HttpStatus.UNSUPPORTED_MEDIA_TYPE:
        throw new UnsupportedMediaTypeError(statusText);
      case HttpStatus.UPGRADE_REQUIRED:
        throw new UpgradeRequiredError(statusText);
      default:
        throw new ClientError(status, statusText);
    }
  }

  if (isServerError(status)) {
    switch (status) {
      case HttpStatus.INTERNAL_SERVER_ERROR:
        throw new InternalServerError(statusText);
      case HttpStatus.NOT_IMPLEMENTED:
        throw new NotImplementedError(statusText);
      case HttpStatus.BAD_GATEWAY:
        throw new BadGatewayError(statusText);
      case HttpStatus.SERVICE_UNAVAILABLE:
        throw new ServiceUnavailableError(statusText);
      default:
        throw new ServerError(status, statusText);
    }
  }
}
