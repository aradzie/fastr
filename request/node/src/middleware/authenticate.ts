import { Headers } from "@webfx-http/headers";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";

/**
 * Returns a new middleware which sets the `Authorization` header in requests
 * to the given value.
 *
 * Throws `TypeError` if the request URL does not use the HTTPS scheme.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
 *
 * @param header The `Authorization` header value.
 */
export function authenticate(header: string): Middleware {
  return (adapter: Adapter): Adapter => {
    return (request: HttpRequest): Promise<HttpResponse> => {
      if (!request.url.startsWith("https://")) {
        throw new TypeError("Must use HTTPS to sent authorization headers.");
      }
      return adapter({
        ...request,
        headers: Headers.from(request.headers ?? {})
          .toBuilder()
          .set("Authorization", header)
          .build(),
      });
    };
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
