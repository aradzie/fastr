import type { Headers, MimeType } from "@webfx-http/headers";

export interface Adapter {
  (request: HttpRequest): Promise<HttpResponse>;
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
   * The mode for how redirects are handled.
   */
  readonly redirect?: "manual" | "follow" | "error";
}

export interface HttpRequestBody {
  /**
   * Sets value of the `Content-Type` header.
   */
  readonly type?: MimeType | string | null;
  /**
   * The actual body data to send.
   */
  readonly data: BodyDataType;
}

export type BodyDataType =
  | string
  | URLSearchParams
  | FormData
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
