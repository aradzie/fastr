import { Headers as HttpHeaders } from "@webfx-http/headers";
import type { HttpRequest, HttpResponse } from "../types";

export async function fetchAdapter(
  request: HttpRequest,
): Promise<HttpResponse> {
  const { url, method, headers, body, redirect } = request;
  const controller = new AbortController();
  const { signal } = controller;

  const req = new Request(String(url), {
    method,
    headers: new Headers(headers?.toJSON()),
    body: null,
    redirect,
    signal,
  });
  const res = await fetch(req);

  function checkAborted(): void {
    if (controller.signal.aborted) {
      throw new Error("Request aborted");
    }
  }

  return new (class FetchHttpResponse implements HttpResponse {
    readonly ok = res.ok;
    readonly status = res.status;
    readonly statusText = res.statusText;
    readonly url = res.url;
    readonly headers = convertHeaders(res);

    blob(): Promise<Blob> {
      checkAborted();
      return res.blob();
    }

    arrayBuffer(): Promise<ArrayBuffer> {
      checkAborted();
      return res.arrayBuffer();
    }

    text(): Promise<string> {
      checkAborted();
      return res.text();
    }

    async json<T = unknown>(
      reviver?: (key: any, value: any) => any,
    ): Promise<T> {
      checkAborted();
      return JSON.parse(await res.text(), reviver);
    }

    abort(): void {
      controller.abort();
    }
  })();
}

function convertHeaders(res: Response): HttpHeaders {
  const builder = HttpHeaders.builder();
  res.headers.forEach((value, name) => {
    builder.append(name, value);
  });
  return builder.build();
}
