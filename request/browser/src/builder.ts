import { Accept, Headers, MimeType } from "@webfx-http/headers";
import { EventEmitter } from "events";
import { compose } from "./middleware";
import type {
  Adapter,
  DownloadProgressEvent,
  HttpRequest,
  HttpResponse,
  Middleware,
  NameValueEntries,
  UploadProgressEvent,
} from "./types";

// TODO Use mixins?
export class RequestBuilder {
  private readonly _eventEmitter = new EventEmitter();
  private _headers: Headers = Headers.of({});
  private readonly _accept: (MimeType | string)[] = [];
  private readonly _middleware: Middleware[] = [];

  constructor(
    readonly adapter: Adapter,
    readonly method: string,
    readonly url: URL | string,
  ) {}

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
  query(entries: NameValueEntries): this;
  query(values: Record<string, unknown>): this;
  query(...args: unknown[]): this {
    const update = new URLSearchParams();

    const { length } = args;
    const [arg0, arg1] = args;

    if (length === 2 && typeof arg0 === "string" && arg1 != null) {
      // query(name: string, value: unknown): this;
      update.append(name, String(arg1));
      return this;
    }

    if (length === 1) {
      if (arg0 instanceof URLSearchParams) {
        // query(params: URLSearchParams): this;
        for (const [name, value] of arg0) {
          update.append(name, value);
        }
        return this;
      }

      if (arg0 instanceof Map) {
        // query(params: Map<string, unknown>): this;
        for (const [name, value] of arg0) {
          update.append(name, value);
        }
        return this;
      }

      if (Array.isArray(arg0)) {
        // query(entries: NameValueEntries): this;
        for (const [name, value] of arg0) {
          update.append(name, String(value));
        }
        return this;
      }

      if (typeof arg0 === "object" && arg0 != null) {
        // query(values: Record<string, unknown>): this;
        for (const [name, value] of Object.entries(arg0)) {
          update.append(name, String(value));
        }
        return this;
      }
    }

    throw new TypeError();
  }

  /**
   * Appends a new HTTP header with the given name and value.
   * @param name Header name.
   * @param value Header value.
   */
  header(name: string, value: unknown): this {
    this._headers = this._headers
      .toBuilder()
      .append(name, String(value))
      .build();
    return this;
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
    return this.call({
      method: this.method,
      url: this.url,
      headers: this.makeHeaders(),
    });
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
    contentType?: string,
  ): Promise<HttpResponse> {
    return this.call(this.makeRequest(body, contentType));
  }

  makeRequest(
    body: string | Blob | ArrayBuffer | ArrayBufferView,
    contentType?: string,
  ): HttpRequest {
    // TODO Mime type from blob.
    return {
      method: this.method,
      url: this.url,
      headers: this.makeHeaders(
        contentType ?? typeof body === "string"
          ? "text/plain"
          : "application/octet-stream",
      ),
      body,
    };
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
    body: URLSearchParams | NameValueEntries | Record<string, unknown>,
  ): Promise<HttpResponse>;

  sendForm(
    body:
      | FormData
      | URLSearchParams
      | NameValueEntries
      | Record<string, unknown>,
  ): Promise<HttpResponse> {
    return this.call(this.makeFormRequest(body));
  }

  makeFormRequest(
    body:
      | FormData
      | URLSearchParams
      | NameValueEntries
      | Record<string, unknown>,
  ): HttpRequest {
    const formData = RequestBuilder.toFormData(body);
    return {
      method: this.method,
      url: this.url,
      headers: this.makeHeaders(
        formData instanceof FormData
          ? "multipart/form-data"
          : "application/x-www-form-urlencoded",
      ),
      body: formData,
    };
  }

  /**
   * Sends an HTTP request with the given form body.
   *
   * The `Content-Type` header will be set to `application/json`.
   */
  sendJson(body: unknown, contentType?: string): Promise<HttpResponse> {
    return this.call(this.makeJsonRequest(contentType, body));
  }

  makeJsonRequest(contentType: string | undefined, body: any): HttpRequest {
    return {
      method: this.method,
      url: this.url,
      headers: this.makeHeaders(contentType ?? "application/json"),
      body: RequestBuilder.serializeJson(body),
    };
  }

  /**
   * Calls the adapter using the collected list of middleware.
   */
  call(request: HttpRequest): Promise<HttpResponse> {
    return compose(this._middleware)(this.adapter)(request);
  }

  makeHeaders(contentType?: string): Headers {
    let headers = this._headers;
    if (headers.contentType() == null && contentType != null) {
      headers = headers.toBuilder().contentType(contentType).build();
    }
    if (this._accept.length > 0) {
      headers = headers.toBuilder().accept(new Accept(this._accept)).build();
    }
    return headers;
  }

  static toFormData(
    body:
      | FormData
      | URLSearchParams
      | NameValueEntries
      | Record<string, unknown>,
  ): FormData | URLSearchParams {
    if (body instanceof FormData) {
      return body;
    }
    if (body instanceof URLSearchParams) {
      return body;
    }
    let init;
    if (Array.isArray(body)) {
      init = stringifyValues(body);
    } else {
      init = stringifyValues(Object.entries(body));
    }
    return new URLSearchParams(init);
  }

  static serializeJson(body: unknown): string {
    return JSON.stringify(body);
  }
}

function stringifyValues(entries: NameValueEntries): string[][] {
  return entries.map(([name, value]) => [name, String(value)]);
}
