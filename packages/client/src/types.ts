import { type Agent as HttpAgent } from "node:http";
import { type Agent as HttpsAgent } from "node:https";
import { type SecureContextOptions } from "node:tls";
import { type Body, type BodyInit } from "@fastr/body";
import { type EventEmitter } from "events"; // eslint-disable-line n/prefer-node-protocol
import { type RequestBuilder } from "./builder.js";
import { type HttpHeaders } from "./headers.js";

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
  GET: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `HEAD` method.
   * @param url A URL of the resource to request.
   */
  HEAD: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `POST` method.
   * @param url A URL of the resource to request.
   */
  POST: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `PUT` method.
   * @param url A URL of the resource to request.
   */
  PUT: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `PATCH` method.
   * @param url A URL of the resource to request.
   */
  PATCH: (url: URL | string) => RequestBuilder;
  /**
   * Sends HTTP request using the `DELETE` method.
   * @param url A URL of the resource to request.
   */
  DELETE: (url: URL | string) => RequestBuilder;
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
  readonly headers?: HttpHeaders | null;
  /**
   * The request body.
   */
  readonly body?: BodyInit | null;
  /**
   * The event emitter to be notified of request or response events.
   */
  readonly eventEmitter?: EventEmitter | null;
  /**
   * Any additional request options.
   */
  readonly options?: HttpRequestOptions | null;
}

export interface HttpRequestOptions extends SecureContextOptions {
  readonly timeout?: number;
  readonly agent?: AnyAgent | ((url: string) => AnyAgent);
  readonly rejectUnauthorized?: boolean;
}

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
  readonly headers: HttpHeaders;
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

export type AnyAgent = HttpAgent | HttpsAgent | boolean;
