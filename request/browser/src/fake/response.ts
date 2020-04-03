import { Headers } from "@webfx-http/headers";
import { isSuccess, statusCodes } from "@webfx-http/status";
import type {
  Adapter,
  BodyDataType,
  HttpRequest,
  HttpResponse,
} from "../types";

export interface ResponseInit {
  readonly url?: string;
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?:
    | Headers
    | Map<string, string>
    | Record<string, string>
    | NameValueEntries;
  readonly body?: Promise<Blob> | null;
  readonly onBodyResolve?: () => void;
}

export interface BodyMethodInit {
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?:
    | Headers
    | Map<string, string>
    | Record<string, string>
    | NameValueEntries;
  readonly onBodyResolve?: () => void;
}

export class FakeHttpResponse implements HttpResponse {
  /**
   * Returns an adapter which, when called, will throw the given error.
   * @param error An error to throw.
   */
  static throwError(error: Error): Adapter {
    return async (): Promise<HttpResponse> => {
      throw error;
    };
  }

  /**
   * Returns an adapter which, when called, will return the given body.
   * @param body A body to return in the HTTP response.
   * @param status HTTP response status code. The default is 200 `OK`.
   * @param statusText HTTP response status text. If not provided will be
   *                   inferred from the code automatically.
   * @param headers HTTP headers to send with the response.
   * @param onBodyResolve A callback which will be called after a resolved body
   *                      promise is returned.
   */
  static withBody(
    body: BodyDataType, // TODO or Promise<BodyDataType>
    {
      status = 200,
      statusText = statusTextOf(status),
      headers,
      onBodyResolve,
    }: BodyMethodInit = {},
  ): Adapter {
    const blob = toBlob(body);
    return ({ url }: HttpRequest): Promise<HttpResponse> =>
      Promise.resolve(
        new FakeHttpResponse({
          url,
          status,
          statusText,
          headers,
          body: Promise.resolve(blob),
          onBodyResolve,
        }),
      );
  }

  /**
   * Returns an adapter which, when called, will return the given JSON body.
   * @param json A JSON body to return in the HTTP response.
   * @param status HTTP response status code. The default is 200 `OK`.
   * @param statusText HTTP response status text. If not provided will be
   *                   inferred from the code automatically.
   * @param headers HTTP headers to send with the response.
   * @param onBodyResolve A callback which will be called after a resolved body
   *                      promise is returned.
   */
  static withJsonBody(
    json: unknown, // TODO or Promise<BodyDataType>
    {
      status = 200,
      statusText = statusTextOf(status),
      headers,
      onBodyResolve,
    }: BodyMethodInit = {},
  ): Adapter {
    const blob = toBlob(JSON.stringify(json), "application/json");
    return ({ url }: HttpRequest): Promise<HttpResponse> =>
      Promise.resolve(
        new FakeHttpResponse({
          url,
          status,
          statusText,
          headers,
          body: Promise.resolve(blob),
          onBodyResolve,
        }),
      );
  }

  /**
   * Returns an adapter which, when called, will return a HTTP response with
   * empty body.
   * @param status HTTP response status code. The default is 204 `No Content`.
   * @param statusText HTTP response status text. If not provided will be
   *                   inferred from the code automatically.
   * @param headers HTTP headers to send with the response.
   * @param onBodyResolve A callback which will be called after a resolved body
   *                      promise is returned.
   */
  static withEmptyBody({
    status = 204,
    statusText = statusTextOf(status),
    headers,
    onBodyResolve,
  }: BodyMethodInit = {}): Adapter {
    return ({ url }: HttpRequest): Promise<HttpResponse> =>
      Promise.resolve(
        new FakeHttpResponse({
          url,
          status,
          statusText,
          headers,
          body: Promise.resolve(new Blob()),
          onBodyResolve,
        }),
      );
  }

  readonly url: string;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly body: Promise<Blob>;
  readonly onBodyResolve: () => void;
  bodyUsed = false;
  aborted = false;

  constructor({
    url = "http://fake/",
    status = 200,
    statusText = statusTextOf(status),
    headers = Headers.from({}),
    body = null,
    onBodyResolve = noop,
  }: ResponseInit) {
    // TODO Set `Content-Type` header.

    this.url = url;
    this.ok = isSuccess(status);
    this.status = status;
    this.statusText = statusText;
    this.headers = Headers.from(headers);
    this.body = body ?? Promise.resolve(new Blob());
    this.onBodyResolve = onBodyResolve;
  }

  private _readBlob(): Promise<Blob> {
    if (this.aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }
    if (this.bodyUsed) {
      throw new TypeError("Body has already been consumed.");
    }
    return this.body;
  }

  async blob(): Promise<Blob> {
    const result = await this._readBlob();
    return resolveBody(result, this.onBodyResolve);
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const result = (await this._readBlob()).arrayBuffer();
    return resolveBody(result, this.onBodyResolve);
  }

  async text(): Promise<string> {
    const result = (await this._readBlob()).text();
    return resolveBody(result, this.onBodyResolve);
  }

  async formData(): Promise<FormData> {
    throw new DOMException("NOT_SUPPORTED_ERR", "NotSupportedError");
  }

  async json<T = unknown>(): Promise<T> {
    const result = JSON.parse(await (await this._readBlob()).text());
    return resolveBody(result, this.onBodyResolve);
  }

  abort(): void {
    this.aborted = true;
  }
}

function toBlob(body: BodyDataType, contentType: string | null = null): Blob {
  if (typeof body === "string") {
    return new Blob([body], { type: contentType ?? "text/plain" });
  }

  if (body instanceof Blob) {
    return body;
  }

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return new Blob([body], {
      type: contentType ?? "application/octet-stream",
    });
  }

  if (body instanceof FormData) {
    throw new TypeError("FormData body is not supported");
  }

  if (body instanceof URLSearchParams) {
    throw new TypeError("URLSearchParams body is not supported");
  }

  throw new TypeError("Unsupported body type");
}

function resolveBody<T>(result: T, callback: () => void): T {
  setTimeout(callback);
  return result;
}

function noop(): void {
  //
}

function statusTextOf(statusCode: number): string {
  return statusCodes[statusCode] ?? "Unknown";
}

declare type NameValueEntries = readonly (readonly [string, unknown])[];
