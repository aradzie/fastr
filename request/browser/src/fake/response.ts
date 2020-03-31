import { Headers } from "@webfx-http/headers";
import { isSuccess, statusCodes } from "@webfx-http/status";
import type {
  Adapter,
  BodyDataType,
  HttpRequest,
  HttpResponse,
} from "../types";

// TODO Body type.

export interface ResponseInit {
  readonly url?: string;
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?:
    | Headers
    | Map<string, string>
    | Record<string, string>
    | NameValueEntries;
  readonly body?: Promise<BodyDataType> | null;
}

export interface Tmp {
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?:
    | Headers
    | Map<string, string>
    | Record<string, string>
    | NameValueEntries;
}

export class FakeHttpResponse implements HttpResponse {
  /**
   * Returns an adapter which, when called, will throw the given error.
   * @param error An error to throw.
   */
  static throwError(error: Error): Adapter {
    return async () => {
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
   */
  static body(
    body: BodyDataType,
    { status = 200, statusText = statusTextOf(status), headers }: Tmp = {},
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
   */
  static jsonBody(
    json: unknown,
    { status = 200, statusText = statusTextOf(status), headers }: Tmp = {},
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
   */
  static emptyBody({
    status = 204,
    statusText = statusTextOf(status),
    headers,
  }: Tmp = {}): Adapter {
    return ({ url }: HttpRequest): Promise<HttpResponse> =>
      Promise.resolve(
        new FakeHttpResponse({
          url,
          status,
          statusText,
          headers,
          body: Promise.resolve(new Blob()),
        }),
      );
  }

  readonly url: string;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly body: Promise<Blob>;
  bodyUsed = false;
  aborted = false;

  constructor({
    url = "http://fake/",
    status = 200,
    statusText = statusTextOf(status),
    headers = Headers.from({}),
    body = null,
  }: ResponseInit) {
    // TODO headers["Content-Type"] = String(contentType);

    this.url = url;
    this.ok = isSuccess(status);
    this.status = status;
    this.statusText = statusText;
    this.headers = Headers.from(headers);
    this.body = Promise.resolve(new Blob(["todo update me"])); // TODO
  }

  async blob(): Promise<Blob> {
    if (this.aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }
    if (this.bodyUsed) {
      throw new TypeError("Body has already been consumed.");
    }
    return this.body;
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return (await this.blob()).arrayBuffer();
  }

  async text(): Promise<string> {
    return (await this.blob()).text();
  }

  formData(): Promise<FormData> {
    throw new DOMException("NOT_SUPPORTED_ERR", "NotSupportedError");
  }

  async json<T = unknown>(): Promise<T> {
    return JSON.parse(await (await this.blob()).text());
  }

  abort(): void {
    this.aborted = true;
  }
}

function toBlob(body: BodyDataType, contentType: string | null = null): Blob {
  return new Blob(["body"], {
    type: contentType ?? "application/octet-stream",
  });
}

function statusTextOf(statusCode: number): string {
  return statusCodes[statusCode] ?? "Unknown";
}

declare type NameValueEntries = readonly (readonly [string, unknown])[];
