import { RequestRedirectError } from "@webfx/request-error";
import { URL } from "url";
import { isStreamBody } from "../body/send";
import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";
import { toURL } from "../util";

export interface FollowRedirectOptions {
  /**
   * The mode for how redirects are handled.
   */
  readonly redirect?: "manual" | "follow" | "error";
  /**
   * The number of redirects to follow before throwing error.
   * Zero to not follow redirects.
   */
  readonly follow?: number;
}

/**
 * Returns a new middleware which checks the response status and follows
 * redirect responses in necessary.
 * @param expectedType The MIME type to expect in the responses.
 */
export function followRedirects({
  redirect = "follow",
  follow = 3,
}: FollowRedirectOptions = {}): Middleware {
  if (redirect === "manual") {
    follow = 0;
  } else if (follow === 0) {
    redirect = "manual";
  }
  return (adapter: Adapter): Adapter => {
    return async (request: HttpRequest): Promise<HttpResponse> => {
      // TODO Cache stream body.
      if (isStreamBody(request.body ?? null)) {
        throw new TypeError("Cannot follow with stream bodies");
      }

      // The current url to visit which is updated after each redirect response.
      let url = toURL(request.url);
      // The set of already visited urls for the loop detection purposes.
      const visited = new Set<string>();

      while (true) {
        // Send request with a new url.
        const response = await adapter({
          ...request,
          url,
        });

        // Test if we got a redirect response.
        // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
        const { status } = response;
        if (
          status === 301 ||
          status === 302 ||
          status === 303 ||
          status === 307 ||
          status === 308
        ) {
          switch (redirect) {
            case "manual":
              return response;
            case "error":
              response.abort();
              throw new RequestRedirectError("Redirect response detected");
            case "follow":
            default:
              response.abort();
              followLocation(response);
              if (status === 303) {
                // Update request, change method to GET and delete body.
                const { headers } = request;
                request = {
                  url,
                  method: "GET",
                  headers,
                };
              }
              break;
          }
        } else {
          // Not a redirect response.
          return response;
        }
      }

      function followLocation(response: HttpResponse): void {
        const location = response.headers.get("Location");
        if (location == null) {
          throw new RequestRedirectError("Redirect has no location");
        }
        url = new URL(location, url);
        const str = String(url);
        if (visited.has(str)) {
          throw new RequestRedirectError("Redirect loop detected");
        }
        if (visited.size === follow) {
          throw new RequestRedirectError("Too many redirects");
        }
        visited.add(str);
      }
    };
  };
}
