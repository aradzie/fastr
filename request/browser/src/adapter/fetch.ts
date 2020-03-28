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
  try {
    return await fetchImpl(request);
  } catch (ex) {
    handleAborted(ex);
    throw ex;
  }
}

async function fetchImpl(request: HttpRequest): Promise<HttpResponse> {
  const { url, method, headers, body, cache, credentials, redirect } = request;
  const controller = new AbortController();
  const { signal } = controller;

  const req = new Request(String(url), {
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
    readonly headers = HttpHeaders.of([...res.headers]);

    async blob(): Promise<Blob> {
      checkAborted();
      return res.blob();
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
      checkAborted();
      try {
        return await res.arrayBuffer();
      } catch (ex) {
        handleAborted(ex);
        throw ex;
      }
    }

    async text(): Promise<string> {
      checkAborted();
      try {
        return await res.text();
      } catch (ex) {
        handleAborted(ex);
        throw ex;
      }
    }

    async formData(): Promise<FormData> {
      checkAborted();
      try {
        return res.formData();
      } catch (ex) {
        handleAborted(ex);
        throw ex;
      }
    }

    async json<T = unknown>(
      reviver?: (key: any, value: any) => any,
    ): Promise<T> {
      checkAborted();
      let text;
      try {
        text = await res.text();
      } catch (ex) {
        handleAborted(ex);
        throw ex;
      }
      return JSON.parse(text, reviver);
    }

    abort(): void {
      controller.abort();
    }
  })();
}

// See https://fetch.spec.whatwg.org/#fetch-method
function handleAborted(ex: Error): void {
  if (ex.name === "AbortError") {
    throw new RequestAbortedError("Request aborted");
  }
  throw ex;
}
