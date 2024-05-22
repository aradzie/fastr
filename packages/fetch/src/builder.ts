import {
  Accept,
  type MediaType,
  multiEntriesOf,
  type NameValueEntries,
} from "@fastr/headers";
import { mergeSearchParams } from "@fastr/url";
import { EventEmitter } from "events"; // eslint-disable-line n/prefer-node-protocol
import { guessContentType, toFormData } from "./body/type.js";
import {
  type EV_DOWNLOAD_PROGRESS,
  type EV_UPLOAD_PROGRESS,
} from "./events.js";
import {
  type Adapter,
  type BodyDataType,
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
  readonly #headers = new Headers();
  readonly #eventEmitter = new EventEmitter();
  #signal: AbortSignal | null = null;
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
   * Appends the given value to the `Accept` HTTP header.
   * @param type A new mime type to accept.
   * @param q The quality parameter.
   */
  accept(type: MediaType | string, q = 1): this {
    const accept = Accept.get(this.#headers) ?? new Accept();
    accept.add(type, q);
    this.#headers.set("Accept", String(accept));
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

  /**
   * Sets the given abort signal.
   */
  signal(signal: AbortSignal): this {
    this.#signal = signal;
    return this;
  }

  /**
   * Appends the given options, overwrites any previously set options.
   */
  options(options: HttpRequestOptions): this {
    Object.assign(this.#options, options);
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
    body: BodyDataType | null = null,
    contentType: string | null = null,
  ): Promise<HttpResponse> {
    let request;
    if (body == null) {
      request = this.#makeRequest(null, null);
    } else {
      request = this.#makeRequest(...guessContentType(body, contentType));
    }
    return this.#send(request);
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
  sendForm(body: URLSearchParams | NameValueEntries): Promise<HttpResponse>;

  sendForm(
    body: FormData | URLSearchParams | NameValueEntries,
  ): Promise<HttpResponse> {
    return this.#send(this.#makeRequest(toFormData(body)));
  }

  #makeRequest(
    body: BodyInit | null,
    contentType: string | null = null,
  ): HttpRequest {
    const url = mergeSearchParams(this.url, this.#query);
    if (body != null && contentType != null) {
      this.#headers.set("Content-Type", contentType);
    } else {
      this.#headers.delete("Content-Type");
    }
    return {
      method: this.method,
      url,
      headers: this.#headers,
      body,
      eventEmitter: this.#eventEmitter,
      signal: this.#signal,
      options: this.#options,
    };
  }

  #send(request: HttpRequest): Promise<HttpResponse> {
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
