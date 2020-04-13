import { Accept, Headers, MimeType, multiEntries } from "@webfx-http/headers";
import { mergeSearchParams } from "@webfx-http/url";
import { EventEmitter } from "events";
import { guessContentType, toFormData } from "./body";
import { EV_DOWNLOAD_PROGRESS, EV_UPLOAD_PROGRESS } from "./events";
import type {
  Adapter,
  BodyDataType,
  BuildableRequest,
  DownloadProgressEvent,
  HttpRequest,
  HttpRequestOptions,
  HttpResponse,
  Middleware,
  NameValueEntries,
  UploadProgressEvent,
} from "./types";

export class RequestBuilder {
  readonly adapter: Adapter;
  readonly method: string;
  readonly url: string;
  private readonly _eventEmitter = new EventEmitter();
  private readonly _query = new URLSearchParams();
  private readonly _headers = Headers.builder();
  private readonly _accept: (MimeType | string)[] = [];
  private readonly _options: HttpRequestOptions = {};

  constructor(adapter: Adapter, method: string, url: URL | string) {
    this.adapter = adapter;
    this.method = method.toUpperCase();
    this.url = String(url);
  }

  /**
   * Adds a listener to be notified of upload progress.
   */
  on(
    event: typeof EV_UPLOAD_PROGRESS,
    listener: (event: UploadProgressEvent) => void,
  ): this;
  /**
   * Adds a listener to be notified of download progress.
   */
  on(
    event: typeof EV_DOWNLOAD_PROGRESS,
    listener: (event: DownloadProgressEvent) => void,
  ): this;
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
        for (const [name, value] of arg0) {
          this._headers.append(name, value);
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

  options(options: HttpRequestOptions): this {
    Object.assign(this._options, options);
    return this;
  }

  timeout(timeout: number): this {
    this.options({ timeout });
    return this;
  }

  /**
   * Sends an HTTP request without body.
   */
  send(): Promise<HttpResponse>;
  /**
   * Sends an HTTP request with the given body.
   *
   * @param body The body to send.
   * @param contentType The content type to use.
   *                    The default value is `text/plain`.
   */
  send(body: string, contentType?: string): Promise<HttpResponse>;
  /**
   * Sends an HTTP request with the given body.
   *
   * @param body The body to send.
   * @param contentType The content type to use.
   *                    The default value is `application/octet-stream`
   *                    or is taken from the blob argument.
   */
  send(
    body: Blob | ArrayBuffer | ArrayBufferView,
    contentType?: string,
  ): Promise<HttpResponse>;
  /**
   * Sends an HTTP request with the given JSON body.
   *
   * @param body The body to send.
   * @param contentType The content type to use.
   *                    The default value is `application/json`.
   */
  send(body: unknown, contentType?: string): Promise<HttpResponse>;

  send(
    body: string | Blob | ArrayBuffer | ArrayBufferView | unknown | null = null,
    contentType: string | null = null,
  ): Promise<HttpResponse> {
    let request;
    if (body == null) {
      request = this._makeRequest(null, null);
    } else {
      request = this._makeRequest(...guessContentType(body, contentType));
    }
    return this._send(request);
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
    return this._send(this._makeRequest(...toFormData(body)));
  }

  private _makeRequest(
    body: BodyDataType | null,
    contentType: string | null = null,
  ): HttpRequest {
    const url = mergeSearchParams(this.url, this._query);
    if (body != null && contentType != null) {
      this._headers.contentType(contentType);
    }
    if (this._accept.length > 0) {
      this._headers.accept(new Accept(this._accept));
    }
    const headers = this._headers.build();
    return {
      method: this.method,
      url,
      headers,
      body,
      eventEmitter: this._eventEmitter,
      options: this._options,
    };
  }

  private _send(request: HttpRequest): Promise<HttpResponse> {
    return this.adapter(request);
  }

  /**
   * Appends request builder methods to the given adapter.
   * @param adapter An adapter to extend with the builder methods.
   * @readonly An adapter extended with the builder methods.
   */
  static extend(adapter: Adapter): BuildableRequest {
    const request: BuildableRequest = (
      request: HttpRequest,
    ): Promise<HttpResponse> => adapter(request);
    request.use = (middleware: Middleware): BuildableRequest =>
      RequestBuilder.extend(middleware(adapter));
    request.method = (method: string, url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, method, url);
    request.get = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "GET", url);
    request.head = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "HEAD", url);
    request.post = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "POST", url);
    request.put = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "PUT", url);
    request.patch = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "PATCH", url);
    request.delete = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "DELETE", url);
    return request;
  }
}
