import { ApplicationError, ErrorBody } from "@webfx-http/error";
import { Headers } from "@webfx-http/headers";
import { statusCodes } from "@webfx-http/status";
import { HttpResponse } from "@webfx/browser-request";

export interface Template {
  readonly url?: string;
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?: Headers | Record<string, string>;
}

export class FakeHttpResponse implements HttpResponse {
  /**
   * Creates and returns a new empty response.
   */
  static empty(headers?: Headers | Record<string, string>): FakeHttpResponse {
    return new FakeHttpResponse(
      {
        status: 204,
        statusText: "No Content",
        url: "http://localhost/",
        headers: headers ?? {},
      },
      Promise.resolve(new Blob()),
    );
  }

  /**
   * Creates and returns a new error response.
   *
   * @param message Error message.
   * @param url URL of the response.
   * @param status HTTP status code.
   * @param statusText HTTP status text.
   * @param headers HTTP headers.
   */
  static error(
    message: string,
    {
      status = 400,
      statusText = statusTextOf(status),
      url = "http://localhost/",
      headers = {},
    }: Template = {},
  ): HttpResponse {
    const body: ErrorBody = { error: { message } };
    const blob = new Blob([JSON.stringify(body)], {
      type: String(ApplicationError.MIME_TYPE),
    });
    return new FakeHttpResponse(
      {
        url,
        status,
        statusText,
        headers,
      },
      Promise.resolve(blob),
    );
  }

  /**
   * Creates and returns a new binary response.
   *
   * @param arrayBuffer The buffer to provide in the response.
   * @param url URL of the response.
   * @param status HTTP status code.
   * @param statusText HTTP status text.
   * @param headers HTTP headers.
   * @param contentType HTTP content type.
   */
  static binary(
    arrayBuffer: ArrayBufferLike | ArrayBufferView,
    {
      status = 200,
      statusText = statusTextOf(status),
      url = "http://localhost/",
      headers = {},
    }: Template = {},
  ): HttpResponse {
    const blob = new Blob([arrayBuffer], {
      type: String("application/octet-stream"), // TODO
    });
    return new FakeHttpResponse(
      {
        url,
        status,
        statusText,
        headers,
      },
      Promise.resolve(blob),
    );
  }

  /**
   * Creates and returns a new text response.
   *
   * @param text The text String to provide in the response.
   * @param url URL of the response.
   * @param status HTTP status code.
   * @param statusText HTTP status text.
   * @param headers HTTP headers.
   * @param contentType HTTP content type.
   */
  static text(
    text: string,
    {
      status = 200,
      statusText = statusTextOf(status),
      url = "http://localhost/",
      headers = {},
    }: Template = {},
  ): HttpResponse {
    const blob = new Blob([text], {
      type: String("application/octet-stream"), // TODO
    });
    return new FakeHttpResponse(
      {
        status,
        statusText,
        url,
        headers,
      },
      Promise.resolve(blob),
    );
  }

  /**
   * Creates and returns a new JSON response.
   *
   * @param json The JSON object to provide in the response.
   * @param url URL of the response.
   * @param status HTTP status code.
   * @param statusText HTTP status text.
   * @param headers HTTP headers.
   * @param contentType HTTP content type.
   */
  static json(
    json: any,
    {
      status = 200,
      statusText = statusTextOf(status),
      url = "http://localhost/",
      headers = {},
    }: Template = {},
  ): HttpResponse {
    const blob = new Blob([JSON.stringify(json)], {
      type: String("application/octet-stream"), // TODO
    });
    return new FakeHttpResponse(
      {
        status,
        statusText,
        url,
        headers,
      },
      Promise.resolve(blob),
    );
  }

  readonly url: string;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly body: Promise<any>;

  constructor(
    {
      status,
      statusText,
      url,
      headers,
    }: {
      status: number;
      statusText: string;
      url: string;
      headers: Headers | Record<string, string | readonly string[]>;
    },
    body: Promise<any>,
  ) {
    // headers["Content-Type"] = String(contentType);

    this.ok = true;
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.headers = convertHeaders(headers);
    this.body = body;
  }

  blob(): Promise<Blob> {
    return this.body;
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this.body;
  }

  text(): Promise<string> {
    return this.body;
  }

  formData(): Promise<FormData> {
    throw new Error("Method not implemented."); // TODO Implement.
  }

  json<T = unknown>(reviver?: (key: any, value: any) => any): Promise<T> {
    return this.body;
  }

  abort(): void {
    //
  }
}

function statusTextOf(statusCode: number): string {
  return statusCodes[statusCode] ?? "Unknown";
}

function convertHeaders(
  headers: Headers | Record<string, string | readonly string[]>,
): Headers {
  if (headers instanceof Headers) {
    return headers;
  }
  const builder = Headers.builder();
  for (const [name, value] of Object.entries(headers)) {
    builder.set(name, value);
  }
  return builder.build();
}
