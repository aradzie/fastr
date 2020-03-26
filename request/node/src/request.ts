import { URL } from "url";
import { requestAdapter } from "./adapter";
import { compose } from "./middleware";
import type {
  Adapter,
  HasMiddleware,
  HttpRequest,
  HttpRequestBody,
  HttpResponse,
} from "./types";

let currentAdapter: Adapter = requestAdapter;

export function request(
  request: HttpRequest & HasMiddleware,
): Promise<HttpResponse> {
  const { middleware = [], ...rest } = request;
  return compose(middleware)(currentAdapter)(rest);
}

request.get = (url: URL | string): Promise<HttpResponse> =>
  request({ method: "GET", url });

request.post = (
  url: URL | string,
  body: HttpRequestBody,
): Promise<HttpResponse> => request({ method: "POST", url, body });

request.put = (
  url: URL | string,
  body: HttpRequestBody,
): Promise<HttpResponse> => request({ method: "PUT", url, body });

request.patch = (
  url: URL | string,
  body: HttpRequestBody,
): Promise<HttpResponse> => request({ method: "PATCH", url, body });

request.del = (url: URL | string): Promise<HttpResponse> =>
  request({ method: "DELETE", url });

/**
 * Returns the current adapter.
 */
function adapter(): Adapter;

/**
 * Returns the current adapter and replaces it with the given one.
 */
function adapter(newAdapter: Adapter): Adapter;

function adapter(newAdapter?: Adapter): Adapter {
  const lastAdapter = currentAdapter;
  if (newAdapter != null) {
    currentAdapter = newAdapter;
  }
  return lastAdapter;
}

request.adapter = adapter;
