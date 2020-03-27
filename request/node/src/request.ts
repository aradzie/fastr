import { URL } from "url";
import { requestAdapter } from "./adapter";
import { compose } from "./middleware";
import type {
  Adapter,
  HasMiddleware,
  HttpRequest,
  HttpRequestBody,
  HttpResponse,
  Instance,
} from "./types";

let currentAdapter: Adapter = requestAdapter;

export const request: Instance = (
  request: HttpRequest & HasMiddleware,
): Promise<HttpResponse> => {
  const { middleware = [], ...rest } = request;
  return compose(middleware)(currentAdapter)(rest);
};

request.method = (
  method: string,
  url: URL | string,
  body?: HttpRequestBody,
): Promise<HttpResponse> => request({ method, url, body });

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

request.delete = (url: URL | string): Promise<HttpResponse> =>
  request({ method: "DELETE", url });

/**
 * Returns the current adapter.
 */
export function adapter(): Adapter;

/**
 * Returns the current adapter and replaces it with the given one.
 */
export function adapter(newAdapter: Adapter): Adapter;

export function adapter(newAdapter?: Adapter): Adapter {
  const result = currentAdapter;
  if (newAdapter != null) {
    currentAdapter = newAdapter;
  }
  return result;
}
