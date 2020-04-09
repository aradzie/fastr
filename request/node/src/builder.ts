import { Accept, Headers, MimeType, multiEntries } from "@webfx-http/headers";
import { mergeSearchParams } from "@webfx-http/url";
import { EventEmitter } from "events";
import { EV_DOWNLOAD_PROGRESS, EV_UPLOAD_PROGRESS } from "./events";
import type {
  Adapter,
  AnyAgent,
  BodyDataType,
  BuildableRequest,
  DownloadProgressEvent,
  HttpRequest,
  HttpRequestBody,
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

  options(options: HttpRequestOptions): this {
    Object.assign(this._options, options);
    return this;
  }

  timeout(timeout: number): this {
    this.options({ timeout });
    return this;
  }

  agent(agent: AnyAgent | ((url: string) => AnyAgent)): this {
    this.options({ agent });
    return this;
  }

  send(
    body: any = null,
    contentType: string | null = guessContentType(body),
  ): Promise<HttpResponse> {
    return this._call(this._makeRequest(body, contentType));
  }

  sendJson(
    body: any,
    contentType: string | null = "application/json",
  ): Promise<HttpResponse> {
    return this.send(JSON.stringify(body), contentType);
  }

  private _makeRequest(
    body: BodyDataType | HttpRequestBody | null,
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
    return {
      method: this.method,
      url,
      headers,
      body,
      options: this._options,
    };
  }

  private _call(request: HttpRequest): Promise<HttpResponse> {
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

function guessContentType(body: any): string | null {
  if (typeof body === "string") {
    return "text/plain";
  }
  if (body instanceof URLSearchParams) {
    return "application/x-www-form-urlencoded";
  }
  if (
    Buffer.isBuffer(body) ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return "application/octet-stream";
  }
  return null;
}
