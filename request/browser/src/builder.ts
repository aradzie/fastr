import { Accept, Headers, MimeType } from "@webfx-http/headers";
import type {
  Adapter,
  HttpRequest,
  HttpResponse,
  NameValueEntries,
} from "./types";

export class RequestBuilder {
  private _headers: Headers = Headers.of({});
  private readonly _accept: (MimeType | string)[] = [];

  constructor(
    readonly adapter: Adapter,
    readonly method: string,
    readonly url: URL | string,
  ) {}

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
    return this.adapter({
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
    return this.adapter(this.makeRequest(body, contentType));
  }

  makeRequest(
    body: string | Blob | ArrayBuffer | ArrayBufferView,
    contentType?: string,
  ): HttpRequest {
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
    return this.adapter(this.makeFormRequest(body));
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
    return this.adapter(this.makeJsonRequest(contentType, body));
  }

  makeJsonRequest(contentType: string | undefined, body: any): HttpRequest {
    return {
      method: this.method,
      url: this.url,
      headers: this.makeHeaders(contentType ?? "application/json"),
      body: RequestBuilder.serializeJson(body),
    };
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
