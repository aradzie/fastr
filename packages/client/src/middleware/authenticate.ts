import { HttpHeaders } from "../headers.js";
import {
  type Adapter,
  type HttpRequest,
  type HttpResponse,
  type Middleware,
} from "../types.js";

/**
 * Returns a new middleware which sets the `Authorization` header in requests
 * to the given value.
 *
 * Throws `TypeError` if the request URL does not use the HTTPS scheme.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
 *
 * @param header The `Authorization` header value.
 */
export function authenticate(header: string): Middleware {
  return (request: HttpRequest, adapter: Adapter): Promise<HttpResponse> => {
    if (!request.url.startsWith("https://")) {
      throw new TypeError("Must use HTTPS to sent authorization headers.");
    }
    return adapter({
      ...request,
      headers: new HttpHeaders(request.headers).set("Authorization", header),
    });
  };
}

/**
 * Returns a new middleware which sets the `Authorization: Basic ...` header
 * in requests.
 *
 * @param username A username.
 * @param password A password.
 */
authenticate.basic = (username: string, password: string): Middleware => {
  if (username === "") {
    throw new TypeError("Empty username.");
  }
  if (password === "") {
    throw new TypeError("Empty password.");
  }
  if (username.includes(":")) {
    throw new TypeError("Username cannot contain a colon.");
  }
  const value = Buffer.from(`${username}:${password}`).toString("base64");
  return authenticate(`Basic ${value}`);
};

/**
 * Returns a new middleware which sets the `Authorization: Bearer ...` header
 * in requests.
 *
 * @param token A token.
 */
authenticate.bearer = (token: string): Middleware => {
  if (token === "") {
    throw new TypeError("Empty token.");
  }
  return authenticate(`Bearer ${token}`);
};
