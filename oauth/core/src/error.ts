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

// See https://tools.ietf.org/html/rfc6749#section-5.2

export type ErrorCode =
  | "invalid_request"
  | "invalid_client"
  | "invalid_grant"
  | "invalid_scope"
  | "unauthorized_client";

export interface ErrorResponse {
  readonly error: ErrorCode;
  readonly error_description?: string;
  readonly error_uri?: string;
}

export class ClientError extends Error {
  name = "ClientError";

  constructor(message: string) {
    super(message);
  }
}

export class OAuthError extends Error {
  name = "OAuthError";

  constructor(message: string) {
    super(`OAuth error: ${message}`);
  }
}
