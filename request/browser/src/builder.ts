import {
  Accept,
  Headers,
  HeadersBuilder,
  MimeType,
  multiEntries,
} from "@webfx-http/headers";
import { EventEmitter } from "events";
import { compose } from "./middleware";
import type {
  Adapter,
  BodyDataType,
  DownloadProgressEvent,
  HttpRequest,
  HttpResponse,
  Middleware,
  NameValueEntries,
  UploadProgressEvent,
} from "./types";
import { mergeSearchParams } from "./url";

export class RequestBuilder {
  readonly adapter: Adapter;
  readonly method: string;
  readonly url: string;
  private readonly _middleware: Middleware[] = [];
  private readonly _eventEmitter = new EventEmitter();
  private readonly _query = new URLSearchParams();
  private readonly _headers: HeadersBuilder = Headers.builder();
  private readonly _accept: (MimeType | string)[] = [];

  constructor(adapter: Adapter, method: string, url: URL | string) {
    this.adapter = adapter;
    this.method = method.toUpperCase();
    this.url = String(url);
  }

  /**
   * Apply the given middleware to a request.
   *
   * TODO Middleware order.
   */
  use(middleware: Middleware): this {
    this._middleware.push(middleware);
    return this;
  }

  on(event: "upload", listener: (event: UploadProgressEvent) => void): this;
  on(event: "download", listener: (event: DownloadProgressEvent) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    this._eventEmitter.on(event, listener);
    return this;
  }

  query(name: string, value: unknown): this;
  query(params: URLSearchParams): this;
  query(params: Map<string, unknown>): this;
  query(values: Record<string, unknown>): this;
  query(entries: NameValueEntries): this;
  query(...args: unknown[]): this {
    const { length } = args;
    const [arg0, arg1] = args;

    if (length === 2 && typeof arg0 === "string" && arg1 != null) {
      // query(name: string, value: unknown): this;
      this._query.append(arg0, String(arg1));
      return this;
    }

    if (length === 1) {
      if (arg0 instanceof URLSearchParams) {
        // query(params: URLSearchParams): this;
        for (const [name, value] of arg0) {
          this._query.append(name, String(value));
        }
        return this;
      }

      // query(params: Map<string, unknown>): this;
      // query(values: Record<string, unknown>): this;
      // query(entries: NameValueEntries): this;
      for (const [name, value] of multiEntries(arg0 as Map<string, unknown>)) {
        this._query.append(name, String(value));
      }
      return this;
    }

    throw new TypeError();
  }

  header(name: string, value: unknown): this;
  header(headers: Headers): this;
  header(headers: Map<string, unknown>): this;
  header(headers: Record<string, unknown>): this;
  header(headers: NameValueEntries): this;
  header(...args: any[]): this {
    const { length } = args;
    const [arg0, arg1] = args;

    if (length === 2 && typeof arg0 === "string" && arg1 != null) {
      // header(name: string, value: unknown): this;
      this._headers.append(arg0, String(arg1));
      return this;
    }

    if (length === 1) {
      if (arg0 instanceof Headers) {
        // header(headers: Headers): this;
        for (const { name, value } of arg0.entries()) {
          this._headers.append(name, String(value));
        }
        return this;
      }

      // header(headers: Map<string, unknown>): this;
      // header(headers: Record<string, unknown>): this;
      // header(headers: NameValueEntries): this;
      for (const [name, value] of multiEntries(arg0 as Map<string, unknown>)) {
        this._headers.append(name, String(value));
      }
      return this;
    }

    throw new TypeError();
  }

  /**
   * Appends the given value to the `Accept` HTTP header.
   * @param type New mime type to append.
   */
  accept(type: MimeType | string): this {
    this._accept.push(type);
    return this;
  }

  /**
   * Sends an HTTP request without body.
   */
  send(): Promise<HttpResponse> {
    return this._call(this._makeRequest(null));
  }

  /**
   * Sends an HTTP request with the given body.
   *
   * @param body The body to send.
   * @param contentType The content type to use.
   *                    The default value is `text/plain`.
   */
  sendBody(body: string, contentType?: string): Promise<HttpResponse>;

  /**
   * Sends an HTTP request with the given body.
   *
   * @param body The body to send.
   * @param contentType The content type to use.
   *                    The default value is `application/octet-stream`.
   */
  sendBody(
    body: Blob | ArrayBuffer | ArrayBufferView,
    contentType?: string,
  ): Promise<HttpResponse>;

  sendBody(
    body: string | Blob | ArrayBuffer | ArrayBufferView,
    contentType = guessContentType(body),
  ): Promise<HttpResponse> {
    return this._call(this._makeRequest(body, contentType));
  }

  /**
   * Sends an HTTP request with the given form body.
   *
   * The `Content-Type` header will be set to `multipart/form-data`.
   */
  sendForm(body: FormData): Promise<HttpResponse>;

  /**
   * Sends an HTTP request with the given form body.
   *
   * The `Content-Type` header will be set
   * to `application/x-www-form-urlencoded`.
   */
  sendForm(
    body:
      | URLSearchParams
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries,
  ): Promise<HttpResponse>;

  sendForm(
    body:
      | FormData
      | URLSearchParams
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries,
  ): Promise<HttpResponse> {
    const [formData, contentType] = toFormData(body);
    return this._call(this._makeRequest(formData, contentType));
  }

  /**
   * Sends an HTTP request with the given form body.
   *
   * The `Content-Type` header will be set to `application/json`.
   */
  sendJson(
    body: unknown,
    contentType = "application/json",
  ): Promise<HttpResponse> {
    return this._call(this._makeRequest(JSON.stringify(body), contentType));
  }

  private _makeRequest(
    body: BodyDataType | null,
    contentType: string | null = null,
  ): HttpRequest {
    const url = mergeSearchParams(this.url, this._query);
    if (contentType != null) {
      this._headers.contentType(contentType);
    }
    if (this._accept.length > 0) {
      this._headers.accept(new Accept(this._accept));
    }
    const headers = this._headers.build();
    return { method: this.method, url, headers, body };
  }

  private _call(request: HttpRequest): Promise<HttpResponse> {
    return compose(this._middleware)(this.adapter)(request);
  }
}

function toFormData(
  body:
    | FormData
    | URLSearchParams
    | Map<string, unknown>
    | Record<string, unknown>
    | NameValueEntries,
): [FormData | URLSearchParams, string] {
  if (body instanceof FormData) {
    return [body, "multipart/form-data"];
  }
  if (!(body instanceof URLSearchParams)) {
    body = new URLSearchParams([...multiEntries(body as Map<string, unknown>)]);
  }
  return [body, "application/x-www-form-urlencoded"];
}

function guessContentType(body: any): string {
  if (typeof body === "string") {
    return "text/plain";
  }
  if (body instanceof FormData) {
    return "multipart/form-data";
  }
  if (body instanceof URLSearchParams) {
    return "application/x-www-form-urlencoded";
  }
  let type;
  if (body instanceof Blob && (type = body.type)) {
    return type;
  }
  // Blob
  // ArrayBuffer
  // ArrayBufferView
  return "application/octet-stream";
}
