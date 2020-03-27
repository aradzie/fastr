import type { Headers } from "@webfx-http/headers";
import type { RequestBuilder } from "./builder";

export interface Adapter {
  (request: HttpRequest): Promise<HttpResponse>;
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
  readonly url: URL | string;
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

export type NameValueEntries = readonly (readonly [string, unknown])[];

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
  json<T = unknown>(reviver?: (key: any, value: any) => any): Promise<T>;

  /**
   * Discards response body.
   */
  abort(): void;
}

/**
 * Listens for progress made while doing some work.
 */
export interface ProgressListener {
  /**
   * Listens for the work start event.
   */
  start(): void;

  /**
   * Listens for the work progress event.
   * @param total The total amount of work to perform.
   * @param current The amount of work completed so far.
   */
  step(total: number, current: number): void;

  /**
   * Listens for the work stop event.
   */
  stop(): void;
}
