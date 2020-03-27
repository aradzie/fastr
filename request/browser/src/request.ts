import { xhrAdapter } from "./adapter/xhr";
import { RequestBuilder } from "./builder";
import type { Adapter, HttpRequest, HttpResponse, Instance } from "./types";

let currentAdapter: Adapter = xhrAdapter;

export const request: Instance = (
  request: HttpRequest,
): Promise<HttpResponse> => currentAdapter(request);

request.method = (method: string, url: URL | string): RequestBuilder =>
  new RequestBuilder(request, method, url);

request.get = (url: URL | string): RequestBuilder =>
  new RequestBuilder(request, "GET", url);

request.post = (url: URL | string): RequestBuilder =>
  new RequestBuilder(request, "POST", url);

request.put = (url: URL | string): RequestBuilder =>
  new RequestBuilder(request, "PUT", url);

request.patch = (url: URL | string): RequestBuilder =>
  new RequestBuilder(request, "PATCH", url);

request.delete = (url: URL | string): RequestBuilder =>
  new RequestBuilder(request, "DELETE", url);

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
