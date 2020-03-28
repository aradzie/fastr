import { Headers, MimeType } from "@webfx-http/headers";
import { URL, URLSearchParams } from "url";
import { compose } from "./middleware";
import type {
  Adapter,
  HttpRequest,
  HttpResponse,
  Middleware,
  NameValueEntries,
} from "./types";

// TODO Use mixins?
export class RequestBuilder {
  private _headers: Headers = Headers.from({});
  private readonly _accept: (MimeType | string)[] = [];
  private readonly _middleware: Middleware[] = [];

  constructor(
    readonly adapter: Adapter,
    readonly method: string,
    readonly url: URL | string,
  ) {}

  use(middleware: Middleware): this {
    this._middleware.push(middleware);
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

  // TODO
  // header(name: string, value: unknown): this;
  // header(params: Map<string, unknown>): this;
  // header(entries: NameValueEntries): this;
  // header(values: Record<string, unknown>): this;

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

  send(): Promise<HttpResponse> {
    throw new Error("Not implemented");
  }

  sendForm(body: any): Promise<HttpResponse> {
    throw new Error("Not implemented");
  }

  sendJson(body: any): Promise<HttpResponse> {
    throw new Error("Not implemented");
  }

  /**
   * Calls the adapter using the collected list of middleware.
   */
  call(request: HttpRequest): Promise<HttpResponse> {
    return compose(this._middleware)(this.adapter)(request);
  }
}
