import { HttpHeaders } from "@webfx-http/headers";
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
  const { url, method, headers, body, eventEmitter, signal, options } = request;
  const { timeout, cache, credentials, redirect } = options ?? {};

  const controller = new AbortController();
  if (signal != null) {
    if (signal.aborted) {
      controller.abort();
    }
    signal.addEventListener("abort", () => {
      controller.abort();
    });
  }

  if (process.env.NODE_ENV !== "production") {
    if (eventEmitter != null) {
      if (
        eventEmitter.listenerCount(EV_UPLOAD_PROGRESS) > 0 ||
        eventEmitter.listenerCount(EV_DOWNLOAD_PROGRESS) > 0
      ) {
        console.warn("Fetch adapter does not support progress events.");
      }
    }
    if (timeout != null) {
      console.warn("The `timeout` option is ignored by the fetch adapter.");
    }
  }

  const req = new Request(url, {
    method: method ?? "GET",
    headers: headers?.toJSON() as Record<string, string>,
    body: body,
    signal: controller.signal,
    cache: cache ?? undefined,
    credentials: credentials ?? undefined,
    redirect: redirect ?? undefined,
  });

  const res = await fetch(req);

  return new (class FetchHttpResponse implements HttpResponse {
    readonly ok = res.ok;
    readonly status = res.status;
    readonly statusText = res.statusText;
    readonly url = res.url;
    readonly headers = new HttpHeaders([...res.headers]);

    blob(): Promise<Blob> {
      return res.blob();
    }

    arrayBuffer(): Promise<ArrayBuffer> {
      return res.arrayBuffer();
    }

    text(): Promise<string> {
      return res.text();
    }

    formData(): Promise<FormData> {
      return res.formData();
    }

    json<T = unknown>(): Promise<T> {
      return res.json();
    }

    abort(): void {
      controller.abort();
    }

    get bodyUsed(): boolean {
      return res.bodyUsed;
    }
  })();
}
