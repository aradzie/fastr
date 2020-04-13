import { Headers as HttpHeaders } from "@webfx-http/headers";
import { EV_DOWNLOAD_PROGRESS, EV_UPLOAD_PROGRESS } from "../events";
import type { HttpRequest, HttpResponse } from "../types";

/**
 * An adapter which is implemented using the fetch API.
 *
 * See https://fetch.spec.whatwg.org/
 * See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */
export async function fetchAdapter(
  request: HttpRequest,
): Promise<HttpResponse> {
  const { url, method, headers, body, eventEmitter, options } = request;
  const { timeout, cache, credentials, redirect } = options ?? {};

  if (process.env.NODE_ENV !== "production") {
    if (eventEmitter != null) {
      if (
        eventEmitter.listenerCount(EV_UPLOAD_PROGRESS) > 0 ||
        eventEmitter.listenerCount(EV_DOWNLOAD_PROGRESS) > 0
      ) {
        console.error("Fetch adapter does not support events");
      }
    }
    if (timeout != null) {
      console.warn("The `timeout` option is ignored by the fetch adapter.");
    }
  }

  const controller = new AbortController();
  const { signal } = controller;

  const req = new Request(url, {
    method,
    headers: toHeaders(headers),
    body,
    cache,
    credentials,
    redirect,
    signal,
  });

  const res = await fetch(req);

  return new (class FetchHttpResponse implements HttpResponse {
    readonly ok = res.ok;
    readonly status = res.status;
    readonly statusText = res.statusText;
    readonly url = res.url;
    readonly headers = new HttpHeaders([...res.headers]);

    async blob(): Promise<Blob> {
      return res.blob();
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
      return res.arrayBuffer();
    }

    async text(): Promise<string> {
      return res.text();
    }

    async formData(): Promise<FormData> {
      return res.formData();
    }

    async json<T = unknown>(): Promise<T> {
      return res.json();
    }

    abort(): void {
      controller.abort();
    }
  })();
}

function toHeaders(headers: HttpHeaders | null = null): Headers {
  const result = new Headers();
  if (headers != null)
    for (const [name, value] of headers) {
      if (Array.isArray(value)) {
        for (const item of value) {
          result.append(name, item);
        }
      } else {
        result.append(name, value);
      }
    }
  return result;
}
