import { Accept, type MediaType, multiEntriesOf } from "@fastr/headers";
import { mergeSearchParams } from "@fastr/url";
import { EventEmitter } from "events";
import { guessContentType, toFormData } from "./body/type.js";
import {
  type EV_DOWNLOAD_PROGRESS,
  type EV_UPLOAD_PROGRESS,
} from "./events.js";
import { HttpHeaders } from "./headers.js";
import {
  type Adapter,
  type BodyDataType,
  type BuildableRequest,
  type DownloadProgressEvent,
  type HttpRequest,
  type HttpRequestOptions,
  type HttpResponse,
  type Middleware,
  type NameValueEntries,
  type UploadProgressEvent,
} from "./types.js";

export class RequestBuilder {
  readonly adapter: Adapter;
  readonly method: string;
  readonly url: string;
  private readonly _query = new URLSearchParams();
  private readonly _headers = new HttpHeaders();
  private readonly _accept = new Accept();
  private readonly _eventEmitter = new EventEmitter();
  private _signal: AbortSignal | null = null;
  private readonly _options: HttpRequestOptions = {};

  constructor(adapter: Adapter, method: string, url: URL | string) {
    this.adapter = adapter;
    this.method = method.toUpperCase();
    this.url = String(url);
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
      for (const [name, value] of multiEntriesOf(
        arg0 as Map<string, unknown>,
      )) {
        this._query.append(name, String(value));
      }
      return this;
    }

    throw new TypeError();
  }

  header(name: string, value: unknown): this;
  header(headers: HttpHeaders): this;
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
      if (arg0 instanceof HttpHeaders) {
        // header(headers: HttpHeaders): this;
        for (const [name, value] of arg0) {
          this._headers.append(name, value);
        }
        return this;
      }

      // header(headers: Map<string, unknown>): this;
      // header(headers: Record<string, unknown>): this;
      // header(headers: NameValueEntries): this;
      for (const [name, value] of multiEntriesOf(
        arg0 as Map<string, unknown>,
      )) {
        this._headers.append(name, String(value));
      }
      return this;
    }

    throw new TypeError();
  }

  /**
   * Appends the given value to the `Accept` HTTP header.
   * @param type A new mime type to accept.
   * @param q The quality parameter.
   */
  accept(type: MediaType | string, q = 1): this {
    this._accept.add(type, q);
    return this;
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

  /**
   * Sets the given abort signal.
   */
  signal(signal: AbortSignal): this {
    this._signal = signal;
    return this;
  }

  /**
   * Appends the given options, overwrites any previously set options.
   */
  options(options: HttpRequestOptions): this {
    Object.assign(this._options, options);
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
   * Sends an HTTP request with the given JSON body. The body argument must be
   * either a plain object, array or an object with the `toJSON` method.
   * Anything else, e.g. non-plain objects such as Map, functions, primitives,
   * etc. throw the `TypeError` at runtime.
   *
   * @param body The body to send.
   * @param contentType The content type to use.
   *                    The default value is `application/json`.
   */
  send(body: object, contentType?: string): Promise<HttpResponse>;

  send(
    body: string | Blob | ArrayBuffer | ArrayBufferView | object | null = null,
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
    return this._send(this._makeRequest(toFormData(body)));
  }

  private _makeRequest(
    body: BodyDataType | null,
    contentType: string | null = null,
  ): HttpRequest {
    const url = mergeSearchParams(this.url, this._query);
    if (body != null && contentType != null) {
      this._headers.set("Content-Type", contentType);
    } else {
      this._headers.delete("Content-Type");
    }
    const accept = String(this._accept);
    if (accept !== "") {
      this._headers.set("Accept", accept);
    }
    return {
      method: this.method,
      url,
      headers: this._headers,
      body,
      eventEmitter: this._eventEmitter,
      signal: this._signal,
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
      RequestBuilder.extend((request) => middleware(request, adapter));
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
