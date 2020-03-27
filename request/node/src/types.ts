import type { Body } from "@webfx-http/body";
import type { Headers, MimeType } from "@webfx-http/headers";
import type { Readable } from "stream";
import type { URL, URLSearchParams } from "url";
import type { AnyAgent } from "./agent";
import type { Json } from "./body/json";
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

export interface HasMiddleware {
  readonly middleware?: readonly Middleware[];
}

export interface Instance {
  (request: HttpRequest & HasMiddleware): Promise<HttpResponse>;
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

export interface HttpRequestOptions {
  readonly timeout?: number;
  readonly agent?: AnyAgent | ((url: URL) => AnyAgent);
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
  readonly body?: BodyDataType | HttpRequestBody | null;
  /**
   * Any additional request options.
   */
  readonly options?: HttpRequestOptions;
}

export interface HttpRequestBody {
  /**
   * Sets value of the `Content-Type` header.
   */
  readonly type?: MimeType | string | null;
  /**
   * Whether to apply gzip encoding to the body
   * and set value of the `Content-Encoding` header.
   */
  readonly compressible?: boolean;
  /**
   * The actual body data to send.
   */
  readonly data: BodyDataType;
}

export type BodyDataType =
  | string
  | Json
  | URLSearchParams
  | Buffer
  | ArrayBuffer
  | ArrayBufferView
  | Readable;

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
   * Response URL after all redirections, if any, or the original URL.
   */
  readonly url: string;
  /**
   * The map of all response HTTP headers.
   */
  readonly headers: Headers;
  /**
   * Response body.
   */
  readonly body: Body;

  /**
   * Discards response body, closes the incoming body stream.
   *
   * This method can be called, for example, when the received response is not
   * of the expected MIME type. In such a situation the client may discards the
   * body and throw an error.
   */
  abort(): void;
}
