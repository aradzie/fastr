import type { Headers } from "@webfx-http/headers";
import type { EventEmitter } from "events";
import type { RequestBuilder } from "./builder";

/**
 * Adapter is a function which takes a request and returns a response promise.
 */
export interface Adapter {
  (request: HttpRequest): Promise<HttpResponse>;
}

/**
 * Middleware is a function which intercepts the execution of an adapter.
 */
export interface Middleware {
  (request: HttpRequest, adapter: Adapter): Promise<HttpResponse>;
}

export interface BuildableRequest extends Adapter {
  /**
   * Returns a new instance which uses the specified middleware.
   * The middleware will be applied only to the returned object.
   *
   * Every next added middleware wrap the previous one. They handle requests
   * in the reverse order, and responses in the direct order.
   *
   * If the middleware were added like this:
   *
   * ```
   * request.use(A).use(B).get(...).send();
   * ```
   *
   * Then the control flow is like this:
   *
   * ```
   *            +---------------------------------+
   *            | B  +-----------------------+    |
   *            |    | A  +-------------+    |    |
   * request  ----------> |             |    |    |
   *            |    |    |   adapter   |    |    |
   * response <---------- |             |    |    |
   *            |    |    +-------------+    |    |
   *            |    +-----------------------+    |
   *            +---------------------------------+
   * ```
   */
  use: (middleware: Middleware) => BuildableRequest;
  /**
   * Sends HTTP request using the given HTTP method.
   * @param method The HTTP method to use for the request.
   * @param url A URL of the resource to request.
   */
  method: (method: string, url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `GET` method.
   * @param url A URL of the resource to request.
   */
  get: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `HEAD` method.
   * @param url A URL of the resource to request.
   */
  head: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `POST` method.
   * @param url A URL of the resource to request.
   */
  post: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `PUT` method.
   * @param url A URL of the resource to request.
   */
  put: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `PATCH` method.
   * @param url A URL of the resource to request.
   */
  patch: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `DELETE` method.
   * @param url A URL of the resource to request.
   */
  delete: (url: URL | string) => RequestBuilder;
}

export interface HttpRequest {
  /**
   * The URL of a resource to request.
   */
  readonly url: string;
  /**
   * The HTTP method to use for a request.
   */
  readonly method: string;
  /**
   * The request headers.
   */
  readonly headers?: Headers | null;
  /**
   * The request body.
   */
  readonly body?: BodyDataType | null;
  /**
   * The event emitter to be notified of request or response events.
   */
  readonly eventEmitter?: EventEmitter | null;
  /**
   * Any additional request options.
   */
  readonly options?: HttpRequestOptions | null;
}

export interface HttpRequestOptions {
  /**
   * When set to a non-zero value will cause fetching to terminate after
   * the given time in milliseconds has passed.
   */
  readonly timeout?: number;
  /**
   * A string indicating how the request will interact with the browser's cache
   * to set request's cache.
   */
  readonly cache?: RequestCache;
  /**
   * A string indicating whether credentials will be sent with the request
   * always, never, or only when sent to a same-origin URL. Sets request's
   * credentials.
   */
  readonly credentials?: RequestCredentials;
  /**
   * The mode for how redirects are handled.
   */
  readonly redirect?: RequestRedirect;
}

export type BodyDataType =
  | string
  | Blob
  | ArrayBuffer
  | ArrayBufferView
  | FormData
  | URLSearchParams;

/**
 * Represents response of a web request, if completed and parsed successfully.
 */
export interface HttpResponse {
  /**
   * Contains value indicating whether the response was successful (status in
   * the range 200-299) or not.
   */
  readonly ok: boolean;
  /**
   * Response status code.
   */
  readonly status: number;
  /**
   * Response status text.
   */
  readonly statusText: string;
  /**
   * Response URL after all redirects, if any, or the original URL.
   */
  readonly url: string;
  /**
   * The bag of all response headers.
   */
  readonly headers: Headers;

  /**
   * Response body.
   */
  blob(): Promise<Blob>;

  /**
   * Response body as ArrayBuffer.
   */
  arrayBuffer(): Promise<ArrayBuffer>;

  /**
   * Response body as string.
   */
  text(): Promise<string>;

  /**
   * Response body as form data.
   */
  formData(): Promise<FormData>;

  /**
   * Response body parsed from JSON string.
   */
  json<T = unknown>(): Promise<T>;

  /**
   * Discards response body.
   */
  abort(): void;
}

export interface UploadProgressEvent {
  readonly type: "upload";
  readonly loaded: number;
  readonly total: number | null;
}

export interface DownloadProgressEvent {
  readonly type: "download";
  readonly loaded: number;
  readonly total: number | null;
}

export type NameValueEntries = readonly (readonly [string, unknown])[];
