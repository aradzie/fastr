import type { HttpRequest } from "../types.js";
import type { RequestMatcher } from "./types.js";

// TODO Match query params.

/**
 * Returns a new matcher which checks the given HTTP method and URL in requests.
 * The wildcard value `"*"` can be used to match any method or URL.
 */
export function match(method: string, url: string | RegExp): RequestMatcher {
  const matchMethod = (request: HttpRequest): boolean => {
    if (method === "*") {
      return true;
    } else {
      return method.toUpperCase() === (request.method ?? "GET").toUpperCase();
    }
  };

  const matchUrl = (request: HttpRequest): boolean => {
    if (url === "*") {
      return true;
    } else {
      if (typeof url === "string") {
        return url === request.url;
      } else {
        return url.test(request.url);
      }
    }
  };

  const matcher = (request: HttpRequest): boolean => {
    return matchMethod(request) && matchUrl(request);
  };

  const name = `request matcher for method "${method}" and url "${url}"`;
  Object.defineProperty(matcher, "name", {
    value: name,
  });
  Object.defineProperty(matcher, "toString", {
    value: function (this: RequestMatcher): string {
      return name;
    },
  });

  return matcher;
}

/**
 * Returns a new matcher which only succeeds if all the specified matchers
 * also succeed.
 */
match.all = (...matchers: readonly RequestMatcher[]): RequestMatcher => {
  const all = [...matchers];
  return (request: HttpRequest): boolean => {
    return all.every((m) => m(request));
  };
};
