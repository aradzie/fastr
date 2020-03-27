import { Headers as HttpHeaders } from "@webfx-http/headers";
import { isSuccess } from "@webfx-http/status";
import {
  RequestAbortedError,
  RequestNetworkError,
  RequestTimeoutError,
} from "@webfx/request-error";
import type { HttpRequest, HttpResponse } from "../types";

/**
 * An adapter which is implemented using the XMLHttpRequest API.
 *
 * See https://xhr.spec.whatwg.org/
 * See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 */
export function xhrAdapter(request: HttpRequest): Promise<HttpResponse> {
  const { url, method, headers, body, cache, credentials, redirect } = request;

  switch (method.toUpperCase()) {
    case "HEAD":
    case "GET":
      if (body != null) {
        throw new TypeError("HEAD or GET Request cannot have a body.");
      }
      break;
  }

  const xhr = new XMLHttpRequest();
  xhr.open(method, String(url), true);
  xhr.responseType = "blob";

  xhr.upload.onprogress = (event: ProgressEvent): void => {
    // TODO Send event.
  };
  xhr.onprogress = (event: ProgressEvent): void => {
    // TODO Send event.
  };

  for (const { name, value } of HttpHeaders.of(headers ?? []).entries()) {
    xhr.setRequestHeader(name, String(value));
  }

  if (cache != null) {
    // Not implemented.
  }
  if (credentials != null) {
    xhr.withCredentials = credentials === "include";
  }
  if (redirect != null) {
    // Not implemented.
  }

  return new Promise<HttpResponse>((resolve, reject) => {
    handleErrors(reject);
    xhr.onreadystatechange = (): void => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        const body = new Promise<Blob>((resolve, reject) => {
          handleErrors(reject);
          xhr.onload = (): void => {
            resolve(xhr.response as Blob);
          };
        });
        resolve(makeResponse(xhr, body));
      }
      if (xhr.readyState === XMLHttpRequest.DONE) {
        // TODO Send event.
      }
    };

    xhr.send(body);
  });

  function handleErrors(reject: (reason?: any) => void): void {
    xhr.onerror = (): void => {
      reject(new RequestNetworkError("Network error"));
    };
    xhr.onabort = (): void => {
      reject(new RequestAbortedError("Request aborted"));
    };
    xhr.ontimeout = (): void => {
      reject(new RequestTimeoutError("Request timeout"));
    };
  }
}

function makeResponse(xhr: XMLHttpRequest, body: Promise<Blob>): HttpResponse {
  const { status, statusText, responseURL: url } = xhr;
  const headers = HttpHeaders.parse(xhr.getAllResponseHeaders());
  const ok = isSuccess(status);
  let aborted = false;
  let bodyUsed = false;

  return new (class XhrHttpResponse implements HttpResponse {
    ok = ok;
    status = status;
    statusText = statusText;
    url = url;
    headers = headers;

    async blob(): Promise<Blob> {
      return await readBody();
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
      return await readArrayBuffer();
    }

    async text(): Promise<string> {
      return await readText();
    }

    async formData(): Promise<FormData> {
      throw new Error("Not implemented"); // TODO Implement.
    }

    async json<T = unknown>(
      reviver?: (key: any, value: any) => any,
    ): Promise<T> {
      return JSON.parse(await readText(), reviver) as T;
    }

    abort(): void {
      aborted = true;
      xhr.abort();
    }
  })();

  function readBody(): Promise<Blob> {
    if (aborted) {
      throw new RequestAbortedError("Request aborted");
    }
    if (bodyUsed) {
      throw new Error("Body has already been consumed");
    }
    bodyUsed = true;
    return body;
  }

  async function readArrayBuffer(): Promise<ArrayBuffer> {
    return readBlobAsArrayBuffer(await readBody());
  }

  async function readText(): Promise<string> {
    return readBlobAsText(await readBody());
  }
}

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  const reader = new FileReader();
  const promise = promisifyFileReader<ArrayBuffer>(reader);
  reader.readAsArrayBuffer(blob);
  return promise;
}

function readBlobAsText(blob: Blob): Promise<string> {
  const reader = new FileReader();
  const promise = promisifyFileReader<string>(reader);
  reader.readAsText(blob);
  return promise;
}

function promisifyFileReader<T extends string | ArrayBuffer>(
  reader: FileReader,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    reader.onerror = (): void => {
      reject(reader.error);
    };
    reader.onload = (): void => {
      resolve(reader.result as T);
    };
  });
}
