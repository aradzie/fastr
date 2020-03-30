import { Accept, Headers, MimeType, multiEntries } from "@webfx-http/headers";
import { EventEmitter } from "events";
import { URL, URLSearchParams } from "url";
import { Json } from "./body";
import { EV_DOWNLOAD_PROGRESS, EV_UPLOAD_PROGRESS } from "./events";
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
import { BodyDataType, HttpRequestBody } from "./types";
import { mergeSearchParams } from "./url";

export class RequestBuilder {
  readonly adapter: Adapter;
  readonly method: string;
  readonly url: string;
  private readonly _middleware: Middleware[] = [];
  private readonly _eventEmitter = new EventEmitter();
  private readonly _query = new URLSearchParams();
  private readonly _headers = Headers.builder();
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

  send(body: any = null): Promise<HttpResponse> {
    return this._call(this._makeRequest(body));
  }

  sendJson(body: any): Promise<HttpResponse> {
    return this.send(new Json(body));
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
    };
  }

  private _call(request: HttpRequest): Promise<HttpResponse> {
    return compose(this._middleware)(this.adapter)(request);
  }
}
