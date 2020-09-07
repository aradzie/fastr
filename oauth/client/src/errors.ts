import type { ErrorResponse } from "./types.js";

export class OAuthError<TRaw = {}> extends Error {
  constructor(message: string, readonly code: string, readonly raw: TRaw) {
    super(message);
  }

  get name(): string {
    return "OAuthError";
  }

  get [Symbol.toStringTag](): string {
    return "OAuthError";
  }

  static from(response: ErrorResponse): OAuthError<ErrorResponse> {
    const {
      error: code = "invalid_request",
      error_description: message = "Unknown error",
    } = response;
    return new OAuthError<ErrorResponse>(message, code, response);
  }
}
