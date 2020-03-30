import { Headers as HttpHeaders, MimeType } from "@webfx-http/headers";
import { isSuccess } from "@webfx-http/status";
import { EventEmitter } from "events";
import type {
  DownloadProgressEvent,
  HttpRequest,
  HttpResponse,
  UploadProgressEvent,
} from "../types";
import { polyfillBlobApi } from "./polyfills";

polyfillBlobApi();

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
  xhr.open(method, url, true);
  xhr.responseType = "blob";
  for (const { name, value } of HttpHeaders.from(headers ?? {}).entries()) {
    xhr.setRequestHeader(name, String(value));
  }
  if (cache != null) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("The `cache` option is ignored by the XHR adapter.");
    }
  }
  if (credentials != null) {
    xhr.withCredentials = credentials === "include";
  }
  if (redirect != null) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("The `redirect` option is ignored by the XHR adapter.");
    }
  }
  listen(xhr, new EventEmitter());

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
    };
    xhr.send(body);
  });

  function handleErrors(reject: (reason?: any) => void): void {
    xhr.onerror = (): void => {
      reject(new TypeError("Network error"));
    };
    xhr.onabort = (): void => {
      reject(new DOMException("Request aborted", "AbortError"));
    };
    xhr.ontimeout = (): void => {
      reject(new DOMException("Request timeout", "TimeoutError"));
    };
  }
}

xhrAdapter.parseMultipartFormData = function fakeParseMultipartFormData(
  contentType: MimeType,
  blob: Blob,
): Promise<FormData> {
  throw new Error(
    process.env.NODE_ENV !== "production"
      ? "Implement your own 'multipart/form-data' parser."
      : undefined,
  );
};

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
      return await (await readBody()).arrayBuffer();
    }

    async text(): Promise<string> {
      return await (await readBody()).text();
    }

    async formData(): Promise<FormData> {
      const body = await readBody();
      const contentType =
        headers.contentType() ?? MimeType.APPLICATION_OCTET_STREAM;
      switch (contentType.name) {
        case "application/x-www-form-urlencoded":
          return parseUrlEncodedFormData(await body.text());
        case "multipart/form-data":
          return xhrAdapter.parseMultipartFormData(contentType, body);
        default:
          throw new TypeError(`Invalid content type ${contentType}`);
      }
    }

    async json<T = unknown>(): Promise<T> {
      return JSON.parse(await (await readBody()).text()) as T;
    }

    abort(): void {
      aborted = true;
      xhr.abort();
    }
  })();

  function readBody(): Promise<Blob> {
    if (aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }
    if (bodyUsed) {
      throw new TypeError("Body has already been consumed.");
    }
    bodyUsed = true;
    return body;
  }
}

function listen(xhr: XMLHttpRequest, eventEmitter: EventEmitter): void {
  xhr.upload.onprogress = (event: ProgressEvent): void => {
    const ev: UploadProgressEvent = {
      type: "upload",
      loaded: event.loaded,
      total: event.lengthComputable ? event.total : null,
    };
    eventEmitter.emit(ev.type, ev);
  };
  xhr.onprogress = (event: ProgressEvent): void => {
    const ev: DownloadProgressEvent = {
      type: "download",
      loaded: event.loaded,
      total: event.lengthComputable ? event.total : null,
    };
    eventEmitter.emit(ev.type, ev);
  };
}

function parseUrlEncodedFormData(input: string): FormData {
  const formData = new FormData();
  for (const [name, value] of new URLSearchParams(input)) {
    formData.append(name, value);
  }
  return formData;
}
