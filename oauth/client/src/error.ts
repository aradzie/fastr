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
