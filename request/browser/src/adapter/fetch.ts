import { Headers as HttpHeaders } from "@webfx-http/headers";
import { RequestAbortedError } from "@webfx/request-error";
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
  return handleErrors(() => fetchImpl(request));
}

async function fetchImpl(request: HttpRequest): Promise<HttpResponse> {
  const { url, method, headers, body, cache, credentials, redirect } = request;
  const controller = new AbortController();
  const { signal } = controller;

  const req = new Request(url, {
    method,
    headers: new Headers(headers?.toJSON()),
    body,
    cache,
    credentials,
    redirect,
    signal,
  });

  const res = await fetch(req);

  function checkAborted(): void {
    if (controller.signal.aborted) {
      throw new RequestAbortedError("Request aborted");
    }
  }

  return new (class FetchHttpResponse implements HttpResponse {
    readonly ok = res.ok;
    readonly status = res.status;
    readonly statusText = res.statusText;
    readonly url = res.url;
    readonly headers = HttpHeaders.from([...res.headers]);

    async blob(): Promise<Blob> {
      checkAborted();
      return handleErrors(() => res.blob());
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
      checkAborted();
      return handleErrors(() => res.arrayBuffer());
    }

    async text(): Promise<string> {
      checkAborted();
      return handleErrors(() => res.text());
    }

    async formData(): Promise<FormData> {
      checkAborted();
      return handleErrors(() => res.formData());
    }

    async json<T = unknown>(): Promise<T> {
      checkAborted();
      return JSON.parse(await handleErrors(() => res.text()));
    }

    abort(): void {
      controller.abort();
    }
  })();
}

async function handleErrors<T>(action: () => T): Promise<T> {
  try {
    return await action();
  } catch (ex) {
    // See https://fetch.spec.whatwg.org/#fetch-method
    if (ex.name === "AbortError") {
      throw new RequestAbortedError("Request aborted");
    }
    throw ex;
  }
}
