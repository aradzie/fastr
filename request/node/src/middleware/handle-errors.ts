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
} from "@webfx-http/error";
import { HttpStatus, isClientError, isServerError } from "@webfx-http/status";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";

/**
 * Returns a new middleware which checks the response status and throws HTTP
 * errors in case of client of server error statuses.
 *
 * By default this request library does not reject the returned promises if
 * the response status is not successful, it lets the callers to manually
 * examine the status and decide what to do with it. In some cases the callers
 * might expect to receive an un-successful response status, for example to
 * check if a page is not found, so this is the right thing to do.
 *
 * This middleware automates error handling and rejects the returned promises
 * with an HTTP error instance if the response status if not successful.
 */
export function handleErrors(): Middleware {
  return (adapter: Adapter): Adapter => {
    return async (request: HttpRequest): Promise<HttpResponse> => {
      const response = await adapter(request);
      const { status, statusText } = response;
      if (isClientError(status)) {
        response.abort();
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
        response.abort();
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
      return response;
    };
  };
}
