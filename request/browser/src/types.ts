import type { Headers } from "@webfx-http/headers";
import type { RequestBuilder } from "./builder";

/**
 * Adapter is a function which takes a request and returns a response promise.
 */
export interface Adapter {
  (request: HttpRequest): Promise<HttpResponse>;
}

/**
 * Middleware is a function which takes one adapter and returns another.
 *
 * The returned adapter must call the original adapter.
 */
export interface Middleware {
  (adapter: Adapter): Adapter;
}

export interface Instance extends Adapter {
  /**
   * Sends HTTP request using the given HTTP method.
   * @param method The HTTP method to use for the request.
   * @param url A URL of the resource to request.
   * @param body A body to send.
   */
  method: (method: string, url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `GET` method.
   * @param url A URL of the resource to request.
   */
  get: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `POST` method.
   * @param url A URL of the resource to request.
   * @param body A body to send.
   */
  post: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `PUT` method.
   * @param url A URL of the resource to request.
   * @param body A body to send.
   */
  put: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `PATCH` method.
   * @param url A URL of the resource to request.
   * @param body A body to send.
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
   * The HTTP method to use for request.
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
  | FormData
  | URLSearchParams
  | Blob
  | ArrayBuffer
  | ArrayBufferView;

/**
 * Represents response of a web request, if completed and parsed successfully.
 */
export interface HttpResponse {
  /**
   * Contains value indicating whether the response was successful (status in the range 200-299) or not.
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
   * Response URL after all redirections.
   */
  readonly url: string;
  /**
   * Bag of all response HTTP headers, keys are lower-cased.
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
