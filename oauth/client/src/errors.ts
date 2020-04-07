import type { ErrorResponse } from "./types";

/*
Google:

{ error: 'invalid_client',
  error_description: 'The OAuth client was not found.' }

Facebook:

{ error:
   { message: 'Error validating application. Invalid application ID.',
     type: 'OAuthException',
     code: 101 } }
*/

export class OAuthError<TRaw = {}> extends Error {
  readonly name = "OAuthError";
  readonly code: string;
  readonly raw: TRaw;

  constructor(code: string, message: string, raw: TRaw) {
    super(`OAuth error: ${message}`);
    this.code = code;
    this.raw = raw;
  }

  static from(response: ErrorResponse): OAuthError<ErrorResponse> {
    const {
      error: code = "invalid_request",
      error_description: message = "Unknown error",
    } = response;
    return new OAuthError<ErrorResponse>(code, message, response);
  }
}
