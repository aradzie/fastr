import { type BodyDataType, Payload, type Streamable } from "@fastr/body";
import {
  Accept,
  type MediaType,
  multiEntriesOf,
  type NameValueEntries,
} from "@fastr/headers";
import { mergeSearchParams } from "@fastr/url";
import { EventEmitter } from "events";
import { type Readable } from "stream";
import {
  type EV_DOWNLOAD_PROGRESS,
  type EV_UPLOAD_PROGRESS,
} from "./events.js";
import { HttpHeaders } from "./headers.js";
import {
  type Adapter,
  type AnyAgent,
  type BuildableRequest,
  type DownloadProgressEvent,
  type HttpRequest,
  type HttpRequestOptions,
  type HttpResponse,
  type Middleware,
  type UploadProgressEvent,
} from "./types.js";

export class RequestBuilder {
  readonly #adapter: Adapter;
  readonly #method: string;
  readonly #url: string;
  readonly #query = new URLSearchParams();
  readonly #headers = new HttpHeaders();
  readonly #eventEmitter = new EventEmitter();
  readonly #options: HttpRequestOptions = {};

  constructor(adapter: Adapter, method: string, url: URL | string) {
    this.#adapter = adapter;
    this.#method = method.toUpperCase();
    this.#url = String(url);
  }

  get adapter(): Adapter {
    return this.#adapter;
  }

  get method(): string {
    return this.#method;
  }

  get url(): string {
    return this.#url;
  }

  query(name: string, value: unknown): this;
  query(entries: NameValueEntries): this;
  query(...args: any[]): this {
    const { length } = args;
    const [arg0, arg1] = args;

    if (length === 2 && typeof arg0 === "string") {
      this.#query.append(arg0, String(arg1));
      return this;
    }

    if (length === 1) {
      for (const [name, value] of multiEntriesOf(arg0)) {
        this.#query.append(name, value);
      }
      return this;
    }

    throw new TypeError();
  }

  header(name: string, value: unknown): this;
  header(entries: NameValueEntries): this;
  header(...args: any[]): this {
    const { length } = args;
    const [arg0, arg1] = args;

    if (length === 2 && typeof arg0 === "string") {
      this.#headers.append(arg0, String(arg1));
      return this;
    }

    if (length === 1) {
      for (const [name, value] of multiEntriesOf(arg0)) {
        this.#headers.append(name, value);
      }
      return this;
    }

    throw new TypeError();
  }

  /**
   * Sets the given value in the `Content-Type` HTTP header.
   * @param type A request body mime type.
   */
  type(type: MediaType | string): this {
    this.#headers.set("Content-Type", type);
    return this;
  }

  /**
   * Appends the given value in the `Accept` HTTP header.
   * @param type A new mime type to accept.
   * @param q The quality parameter.
   */
  accept(type: MediaType | string, q = 1): this {
    const accept = Accept.get(this.#headers) ?? new Accept();
    accept.add(type, q);
    this.#headers.set("Accept", accept);
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
    this.#eventEmitter.on(event, listener);
    return this;
  }

  options(options: HttpRequestOptions): this {
    Object.assign(this.#options, options);
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

  /**
   * Sends an HTTP request without body.
   */
  send(): Promise<HttpResponse>;
  /**
   * Sends an HTTP request with the given body.
   *
   * The default content type is `text/plain`.
   *
   * @param body The body to send.
   */
  send(body: string): Promise<HttpResponse>;
  /**
   * Sends an HTTP request with the given body.
   *
   * The default content type is `application/octet-stream`.
   *
   * @param body The body to send.
   */
  send(body: Buffer): Promise<HttpResponse>;
  /**
   * Sends an HTTP request with the given body.
   *
   * The default content type is `application/octet-stream`.
   *
   * @param body The body to send.
   */
  send(body: ArrayBufferView): Promise<HttpResponse>;
  /**
   * Sends an HTTP request with the given body.
   *
   * The default content type is `application/octet-stream`.
   *
   * @param body The body to send.
   */
  send(body: Readable): Promise<HttpResponse>;
  /**
   * Sends an HTTP request with the given body.
   *
   * The default content type is `application/octet-stream`.
   *
   * @param body The body to send.
   */
  send(body: Streamable): Promise<HttpResponse>;
  /**
   * Sends an HTTP request with the given body.
   *
   * The default content type is `application/x-www-form-urlencoded`.
   *
   * @param body The body to send.
   */
  send(body: URLSearchParams): Promise<HttpResponse>;
  /**
   * Sends an HTTP request with the given JSON body. The body argument must be
   * either a plain object, array or an object with the `toJSON` method.
   * Anything else, e.g. non-plain objects such as Map, functions, primitives,
   * etc. throw the `TypeError` at runtime.
   *
   * @param body The body to send.
   */
  send(body: object): Promise<HttpResponse>;

  send(body: BodyDataType | null = null): Promise<HttpResponse> {
    return this.#send(this.#makeRequest(new Payload(body, this.#headers)));
  }

  #makeRequest(payload: Payload): HttpRequest {
    const url = mergeSearchParams(this.url, this.#query);
    const { body, type, length } = payload;
    if (body != null) {
      if (type != null) {
        this.#headers.set("Content-Type", type);
      }
      if (length != null) {
        this.#headers.set("Content-Length", length);
      }
    }
    return {
      method: this.method,
      url,
      headers: this.#headers,
      body,
      eventEmitter: this.#eventEmitter,
      options: this.#options,
    };
  }

  #send(request: HttpRequest): Promise<HttpResponse> {
    return this.#adapter(request);
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
    request.GET = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "GET", url);
    request.HEAD = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "HEAD", url);
    request.POST = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "POST", url);
    request.PUT = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "PUT", url);
    request.PATCH = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "PATCH", url);
    request.DELETE = (url: URL | string): RequestBuilder =>
      new RequestBuilder(adapter, "DELETE", url);
    return request;
  }
}
