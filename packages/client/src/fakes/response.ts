import {
  Body,
  type BodyDataType,
  type BodyInit,
  Payload,
  Streamable,
} from "@fastr/body";
import { FakeIncomingMessage } from "@fastr/fake-http";
import { type NameValueEntries } from "@fastr/headers";
import { isSuccess, statusMessage } from "@fastr/status";
import { Readable } from "stream";
import { HttpHeaders } from "../headers.js";
import { type Adapter, type HttpRequest, type HttpResponse } from "../types.js";

export type FakeResponseInit = {
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly headers: NameValueEntries;
  readonly body: BodyDataType;
};

export class FakeResponse implements HttpResponse {
  static of(
    body: BodyDataType,
    init: Partial<Omit<FakeResponseInit, "body">> = {},
  ): Adapter {
    return async ({ url }: HttpRequest): Promise<HttpResponse> => {
      return new FakeResponse({ url, ...init, body });
    };
  }

  static from(init: Partial<FakeResponseInit> = {}): Adapter {
    return async ({ url }: HttpRequest): Promise<HttpResponse> => {
      return new FakeResponse({ url, ...init });
    };
  }

  static redirect(status: number, location: string): Adapter {
    return async ({ url }: HttpRequest): Promise<HttpResponse> => {
      return new FakeResponse({
        url,
        status,
        headers: { location },
        body: `see ${location}`,
      });
    };
  }

  static notFound(init: Partial<FakeResponseInit> = {}): Adapter {
    return async ({ url }: HttpRequest): Promise<HttpResponse> => {
      return new FakeResponse({
        url,
        status: 404,
        body: "not found",
        ...init,
      });
    };
  }

  /**
   * Returns an adapter which, when called, will throw the given error.
   * @param error An error to throw.
   */
  static throwError(error: Error): Adapter {
    return async (): Promise<HttpResponse> => {
      throw error;
    };
  }

  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly headers: HttpHeaders;
  readonly body: Body;
  aborted = false;

  constructor(init: Partial<FakeResponseInit> = {}) {
    const headers = new HttpHeaders(init.headers ?? null);
    const payload = new Payload(init.body ?? null, headers);
    if (payload.type != null) {
      headers.set("Content-Type", payload.type);
    }
    if (payload.length != null) {
      headers.set("Content-Length", payload.length);
    }
    const {
      url = "http://fake/",
      status = 200,
      statusText = statusMessage(status),
    } = init;
    this.ok = isSuccess(status);
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.headers = headers;
    this.body = Body.from(
      new FakeIncomingMessage(toBuffer(payload.body), {
        headers: headers.toJSON(),
      }),
    );
  }

  abort(): void {
    this.aborted = true;
  }

  get [Symbol.toStringTag](): string {
    return "FakeResponse";
  }
}

function toBuffer(body: BodyInit | null): Buffer | null {
  if (body == null) {
    return null;
  }
  if (typeof body === "string") {
    return Buffer.from(body);
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (body instanceof Readable) {
    throw new TypeError(
      `Unsupported body type ${Object.prototype.toString.call(body)}`,
    );
  }
  if (body instanceof Streamable) {
    throw new TypeError(
      `Unsupported body type ${Object.prototype.toString.call(body)}`,
    );
  }
  throw new TypeError(
    `Invalid body type ${Object.prototype.toString.call(body)}`,
  );
}
