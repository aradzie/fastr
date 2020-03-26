import { URL } from "url";
import { xhrAdapter } from "./adapter/xhr";
import type {
  Adapter,
  HttpRequest,
  HttpRequestBody,
  HttpResponse,
} from "./types";

let currentAdapter: Adapter = xhrAdapter;

export function request(request: HttpRequest): Promise<HttpResponse> {
  return currentAdapter(request);
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
