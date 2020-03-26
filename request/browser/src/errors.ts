import { ApplicationError, ErrorBody } from "@webfx-http/error";
import { HttpResponse } from "./types";

export class RequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestError";
  }
}

export class ResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResponseError";
  }
}

/**
 * Rejects promise if the response has a failed HTTP status.
 * Attempts to extract error message from JSON error response, if any.
 */
export async function checkStatus(
  response: HttpResponse,
): Promise<HttpResponse> {
  if (
    String(response.headers.contentType()) == String(ApplicationError.MIME_TYPE)
  ) {
    let message = "Unknown error";
    const body = await response.json<ErrorBody>();
    if (ApplicationError.isErrorBody(body)) {
      message = body.error.message;
    }
    throw new ResponseError(message);
  }
  if (!response.ok) {
    throw new ResponseError(response.statusText);
  }
  return response;
}
