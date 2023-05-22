import { ContentType, type MediaType } from "@fastr/headers";
import { isSuccess } from "@fastr/status";
import { type EventEmitter } from "events";
import { EV_DOWNLOAD_PROGRESS, EV_UPLOAD_PROGRESS } from "../events.js";
import {
  type DownloadProgressEvent,
  type HttpRequest,
  type HttpResponse,
  type UploadProgressEvent,
} from "../types.js";
import { parseHeaders } from "./headers.js"; // Automatically install the necessary polyfills.
import "./polyfills.js";

/**
 * An adapter which is implemented using the XMLHttpRequest API.
 *
 * @see https://xhr.spec.whatwg.org/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 */
export async function xhrAdapter(request: HttpRequest): Promise<HttpResponse> {
  const { url, method, headers, body, eventEmitter, signal, options } = request;
  const { timeout, cache, credentials, redirect } = options ?? {};

  if (signal != null && signal.aborted) {
    throw new DOMException("Request aborted", "AbortError");
  }

  const methodUc = (method ?? "GET").toUpperCase();
  switch (methodUc) {
    case "HEAD":
    case "GET":
      if (body != null) {
        throw new TypeError("HEAD or GET Request cannot have a body.");
      }
      break;
  }

  const xhr = new XMLHttpRequest();
  xhr.open(methodUc, url, true);
  xhr.responseType = "blob";
  for (const [name, value] of headers ?? []) {
    // In the browser env header values are always strings.
    xhr.setRequestHeader(name, value as string);
  }
  if (signal != null) {
    signal.addEventListener("abort", () => {
      xhr.abort();
    });
  }
  if (timeout != null) {
    xhr.timeout = timeout;
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
  if (eventEmitter != null) {
    addEventListeners(xhr, eventEmitter);
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

xhrAdapter.parseMultipartFormData = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contentType: MediaType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  blob: Blob,
): Promise<FormData> => {
  throw new Error(
    process.env.NODE_ENV !== "production"
      ? "Implement your own 'multipart/form-data' parser."
      : undefined,
  );
};

function makeResponse(xhr: XMLHttpRequest, body: Promise<Blob>): HttpResponse {
  const { status, statusText, responseURL: url } = xhr;
  const headers = parseHeaders(xhr.getAllResponseHeaders());
  const ok = isSuccess(status);
  let bodyUsed = false;

  return new (class XhrHttpResponse implements HttpResponse {
    ok = ok;
    status = status;
    statusText = statusText;
    url = url;
    headers = headers;

    blob(): Promise<Blob> {
      return readBody();
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
      return await (await readBody()).arrayBuffer();
    }

    async text(): Promise<string> {
      return await (await readBody()).text();
    }

    async formData(): Promise<FormData> {
      const body = await readBody();
      const { type } = ContentType.get(headers) ?? ContentType.generic;
      switch (type.essence) {
        case "application/x-www-form-urlencoded":
          return parseUrlEncodedFormData(await body.text());
        case "multipart/form-data":
          return xhrAdapter.parseMultipartFormData(type, body);
        default:
          throw new TypeError(`Invalid content type ${type}`);
      }
    }

    async json<T = unknown>(): Promise<T> {
      return JSON.parse(await (await readBody()).text()) as T;
    }

    abort(): void {
      xhr.abort();
    }

    get bodyUsed(): boolean {
      return bodyUsed;
    }
  })();

  function readBody(): Promise<Blob> {
    if (bodyUsed) {
      throw new TypeError("Body has already been consumed.");
    }
    bodyUsed = true;
    return body;
  }
}

function addEventListeners(
  xhr: XMLHttpRequest,
  eventEmitter: EventEmitter,
): void {
  xhr.upload.addEventListener("progress", (event: ProgressEvent): void => {
    eventEmitter.emit(EV_UPLOAD_PROGRESS, {
      type: "upload",
      loaded: event.loaded,
      total: event.lengthComputable ? event.total : null,
    } as UploadProgressEvent);
  });
  xhr.addEventListener("progress", (event: ProgressEvent): void => {
    eventEmitter.emit(EV_DOWNLOAD_PROGRESS, {
      type: "download",
      loaded: event.loaded,
      total: event.lengthComputable ? event.total : null,
    } as DownloadProgressEvent);
  });
}

function parseUrlEncodedFormData(input: string): FormData {
  const formData = new FormData();
  for (const [name, value] of new URLSearchParams(input)) {
    formData.append(name, value);
  }
  return formData;
}
