import { Body } from "@webfx-http/body";
import { Headers } from "@webfx-http/headers";
import { isSuccess, statusCodes } from "@webfx-http/status";
import type { IncomingHttpHeaders } from "http";
import { Readable } from "stream";
import type {
  Adapter,
  HttpRequest,
  HttpResponse,
  NameValueEntries,
} from "../types";

export type BodyData = string | Buffer | Error;

export type ResponseInit = {
  readonly url?: string;
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?:
    | Headers
    | Map<string, unknown>
    | Record<string, unknown>
    | NameValueEntries;
  readonly bodyData?: BodyData;
};

/**
 * Creates an adapter which responds with request description. The generated
 * response body is a JSON object whose properties are copies of request
 * properties.
 */
export function reflect(): Adapter {
  let calls = 0;
  return async (request: HttpRequest): Promise<HttpResponse> => {
    calls += 1;
    const { url, method, headers, body, options } = request;
    return new FakeResponse({
      url: request.url,
      headers: { "Content-Type": "application/json" },
      bodyData: JSON.stringify({
        url,
        method,
        headers: headers?.toJSON() ?? {},
        body: body != null ? String(body) : null,
        options: options ?? null,
        calls,
      }),
    });
  };
}

export function fakeResponse(init?: ResponseInit): Adapter {
  return async (request: HttpRequest): Promise<HttpResponse> => {
    return new FakeResponse({
      ...init,
      url: request.url,
    });
  };
}

export function fakeOkResponse(init?: ResponseInit): Adapter {
  return async (request: HttpRequest): Promise<HttpResponse> =>
    new FakeResponse({
      ...init,
      url: request.url,
      status: 200,
    });
}

export function fakeRedirectResponse(
  status: number,
  location: string,
): Adapter {
  return async (request: HttpRequest): Promise<HttpResponse> =>
    new FakeResponse({
      url: request.url,
      status,
      headers: {
        location: location,
      },
      bodyData: `see ${location}`,
    });
}

export function fakeNotFoundResponse(init?: ResponseInit): Adapter {
  return async (request: HttpRequest): Promise<HttpResponse> =>
    new FakeResponse({
      ...init,
      url: request.url,
      status: 404,
      bodyData: "not found",
    });
}

export class FakeResponse implements HttpResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly headers: Headers;
  readonly body: Body;
  aborted = false;

  constructor({
    url = "http://somewhere/",
    status = 200,
    statusText = statusTextOf(status),
    headers = { "Content-Type": "text/plain" },
    bodyData = "data",
  }: ResponseInit = {}) {
    this.ok = isSuccess(status);
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.headers = new Headers(headers);
    this.body = Body.from(new FakeIncomingMessage(bodyData));
  }

  abort(): void {
    this.aborted = true;
  }

  get [Symbol.toStringTag](): string {
    return "FakeResponse";
  }
}

export class FakeIncomingMessage extends Readable {
  readonly headers: IncomingHttpHeaders;

  constructor(data: BodyData, headers: IncomingHttpHeaders = {}) {
    super();
    if (data instanceof Error) {
      this.emit("error", data);
    } else {
      this.push(Buffer.from(data));
      this.push(null);
    }
    this.headers = {
      ...headers,
    };
  }

  get [Symbol.toStringTag](): string {
    return "FakeIncomingMessage";
  }
}

export function statusTextOf(statusCode: number): string {
  return statusCodes[statusCode] ?? `Status ${statusCode}`;
}
